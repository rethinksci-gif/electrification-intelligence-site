"""Research-to-site synchronization plus daily original-source collection and bilingual gates."""
import json
import os
import re
import subprocess
import sys
from datetime import date, timedelta
from html.parser import HTMLParser
from xml.etree import ElementTree
from pathlib import Path
from urllib.parse import urljoin, urlsplit

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from automation.evidence_gate import Model, canonical, digest, fetch, now, verify, write
from automation.source import original

ROOT = Path(__file__).resolve().parents[1]
ANCHOR = date(2026, 10, 12)
FIRST_WINDOW = date(2026, 10, 26)  # Edition 001 (manual, 7 October) precedes the automatic windows.
FULL, COMPACT = 3, 2  # verified developments for a regular edition / a compact edition
COMPACT_AFTER = 5  # days of daily retries for a regular edition before a compact one is allowed
BACKFILL = 2  # most recent closed windows still eligible for publication
PER_SOURCE, MAX_LEADS = 8, 60


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a' and dict(attrs).get('href'):
            self.urls.append(dict(attrs)['href'])


FEED_ITEMS = ('item', '{http://purl.org/rss/1.0/}item', '{http://www.w3.org/2005/Atom}entry')
FEED_LINKS = ('link', '{http://purl.org/rss/1.0/}link')


def feed_links(raw):
    """Item links from RSS 2.0, RSS 1.0/RDF or Atom; the feed only nominates leads, never evidence."""
    root = ElementTree.fromstring(raw)
    urls = []
    for item in (i for tag in FEED_ITEMS for i in root.iter(tag)):
        link = next((item.findtext(tag).strip() for tag in FEED_LINKS if (item.findtext(tag) or '').strip()), None)
        if link is None:
            link = next((l.get('href') for l in item.iter('{http://www.w3.org/2005/Atom}link')
                         if l.get('rel', 'alternate') == 'alternate' and l.get('href')), None)
        if link:
            urls.append(link)
    return urls


def collect(registry, research=None):
    leads, failures = {}, []
    for entry in registry:
        hosts = entry.get('hosts') or [entry['host']]
        try:
            final, raw, _ = fetch(entry['url'])
            if entry.get('format') == 'feed':
                urls = feed_links(raw)
            else:
                links = Links()
                links.feed(raw.decode('utf-8', errors='replace'))
                urls = links.urls
            count = 0
            for link in urls:
                url = urljoin(final, link).split('#')[0].replace('http://', 'https://', 1)
                parts = urlsplit(url)
                if parts.hostname not in hosts or not parts.path.startswith(entry['path']):
                    continue
                if canonical(url) == canonical(entry['url']) or canonical(url) in leads:
                    continue
                leads[canonical(url)] = {'authority':entry['authority'], 'origin':'daily original-source index'}
                count += 1
                if count >= entry.get('limit', PER_SOURCE):
                    break
        except Exception as exc:
            failures.append({'source':entry['url'],'reason':('HTTP '+str(exc.code)) if hasattr(exc,'code') else type(exc).__name__})
    # Import only source references from the research repo, never drafts or asserted verification.
    # All imported evidence is re-fetched and verified before publication.
    research_leads = {}
    if research and research.exists():
        revision = subprocess.check_output(['git','-C',str(research),'rev-parse','HEAD'],text=True).strip()
        allowed = {host:e['authority'] for e in registry for host in (e.get('hosts') or [e['host']])}
        for file in sorted((research/'research-rounds').glob('round-*/acquisition.json')):
            for document in json.loads(file.read_text()):
                url = document.get('url','')
                host = urlsplit(url).hostname
                if document.get('status') == 'acquired' and host in allowed:
                    research_leads.setdefault(canonical(url), {'authority':allowed[host], 'origin':f'research:{revision}:{file.parent.name}'})
    merged = dict(list(research_leads.items())[-8:] + list(leads.items())[:MAX_LEADS])
    return list(merged.items()), failures


def escape(text):
    return re.sub(r'([\\`*_{}\[\]#!|])', r'\\\1', text.replace('\n',' '))


def render(verified, end, compact=False):
    output = {}
    for language in ('en','zh'):
        zh = language=='zh'
        meta = {'title':('电气化情报 — ' if zh else 'Electrification Intelligence — ')+str(end),
                'subtitle': ('经原始来源核验的双周动态' + ('（精简版）' if compact else '')) if zh else
                            ('Biweekly developments checked against original sources' + (' (compact edition)' if compact else '')),
                'date':str(date.today()),'edition':str(end),'language':language,'translation_key':'auto-'+str(end),
                'content_type':'analyst-edition','thesis':[],'status':'published','confidence':'source-verified',
                'updated':str(date.today()),'tags':['electrification','materials'],'publish':True,
                'reading_time':max(1, sum(len(c[language]) for item in verified for c in item['claims'])//1000),
                'automated':True,'compact':compact,'coverage_start':str(end-timedelta(days=14)), 'coverage_end_exclusive':str(end)}
        body = [f'Publication identifier: EI-{end}', '',
                '核验仅确认原始来源支持相关表述，不构成独立实验复现。企业声明仍属于企业自报。未据此修改假设置信度。' if zh else
                'Verification establishes source support, not independent replication. Company statements remain self-reported. Thesis confidence is unchanged.', '',
                *(([f'本期为精简版：仅 {len(verified)} 条动态通过原始来源核验，少于常规的 {FULL} 条。为保持双周节奏而发布，未以推测补足。' if zh else
                    f'Compact edition: only {len(verified)} developments passed original-source verification, fewer than the usual {FULL}. '
                    'It is published to keep the biweekly cadence; the gap is not filled with speculation.', '']) if compact else []),
                '## 经核验的动态' if zh else '## Verified developments','']
        for index,item in enumerate(verified,1):
            body += [f'### EI-{index:03d}', '', *[escape(c[language])+'\n' for c in item['claims']],
                     f"[{'原始来源' if zh else 'Original source'}]({item['url']}) · {item['date']}", '']
        body += ['## 证据范围与局限' if zh else '## Evidence scope and limitations','',
                 '仅纳入本期内有明确发布日期、可访问原文且通过语义核验的动态。证据不足的条目被隔离；未用推测填补空缺。' if zh else
                 'Coverage includes only dated developments in this window with accessible original text and passing semantic checks. Insufficient evidence is quarantined; gaps are not filled with speculation.','']
        output[f'content/{language}/analyst-editions/auto-{end}/index.md'] = '---\n'+yaml.safe_dump(meta,sort_keys=False,allow_unicode=True)+'---\n\n'+'\n'.join(body)+'\n'
    return output


def windows(today):
    """Closed fourteen-day windows (by exclusive end date) that may still publish, oldest first."""
    end = ANCHOR + timedelta(days=((today - ANCHOR).days // 14) * 14)
    return [w for w in (end - timedelta(days=14 * i) for i in reversed(range(BACKFILL))) if w >= FIRST_WINDOW]


def edition_numbers(text):
    # Mirrors scripts/validate.mjs: both language pages must carry identical numerals.
    return sorted(re.findall(r'\d+(?:,\d{3})*(?:\.\d+)?', text))


def differ(claims):
    return any(edition_numbers(c.get('en',''))!=edition_numbers(c.get('zh','')) for c in claims)


def run():
    previous_path=Path('automation/status.json')
    previous=json.loads(previous_path.read_text()) if previous_path.exists() else {}
    today=date.today()
    open_windows=[w for w in windows(today) if not Path(f'automation/publications/EI-{w}.json').exists()]
    status={'checked_at':now(),'window':str(windows(today)[-1]) if windows(today) else None,'status':'running',
            'last_publication':previous.get('last_publication'),
            'last_successful_check':previous.get('last_successful_check'),'reasons':[],'windows':{}}
    reports=[]
    try:
        research=Path(os.environ.get('RESEARCH_REPO','automation/runtime/research'))
        leads,failures=collect(json.loads(Path('automation/sources.json').read_text()),research)
        status['collection']={'candidates':len(leads),'failures':failures}
        good={w:[] for w in open_windows}
        seen=set()
        model=Model(limit=60)
        for url,provenance in leads:
            cid='EI-'+digest(url)[:16]
            try:
                source=original(url,provenance['authority'])
                if not source['date_verified']:
                    raise ValueError('original publication date missing or ambiguous')
                published=date.fromisoformat(source['date'])
                target=next((w for w in open_windows if w-timedelta(days=14) <= published < w), None)
                if target is None:
                    reports.append({'id':cid,'status':'REJECTED','source_url':url,'reasons':['outside publication window']})
                    continue
                extracted=model('Extract a decision-useful electrification development: clean power, storage, grids, '
                                'industrial heat, electrified transport or associated materials. A development is a concrete change: '
                                'a decision, approval, measurement, deployment, data release or result. Reject irrelevant '
                                'content, and announcements of visits, meetings, speeches, schedules or open calls that report '
                                'no such change, with {"relevant":false}. Otherwise return {"relevant":true,"claims":['
                                '{"en":"English paraphrase","zh":"Chinese equivalent","quote":"exact original excerpt"}]}. '
                                'Include 2-5 short paragraphs: development, scientific scope/operating conditions, '
                                'industrial/material implications explicitly supported by source, and limitations. '
                                'Every factual detail must be supported by its exact excerpt. Preserve units, dates, '
                                'uncertainty and announced versus operating status. Write every date as YYYY-MM-DD and '
                                'every number with identical Arabic numerals in both languages (no 万/亿, no spelled-out '
                                'numbers), so both languages contain exactly the same numerals. Use plain text, no Markdown. '
                                'Do not invent measurements, conclusions or missing operating conditions.',source)
                if extracted.get('relevant') is not True:
                    reports.append({'id':cid,'status':'REJECTED','source_url':url,'reasons':['irrelevant']})
                    continue
                claims=extracted.get('claims') or []
                if len(claims)<2:
                    raise ValueError('incomplete development')
                candidate={'id':cid,'url':source['url'],'date':source['date'],'bilingual':True,'claims':claims[:5]}
                if differ(candidate['claims']):
                    repaired=model('Rewrite only the "zh" text of each claim so it contains exactly the same numerals as its '
                                   '"en" text: dates as YYYY-MM-DD, numbers as identical Arabic numerals with the same '
                                   'thousands separators and decimals, no 万/亿 and no spelled-out numbers. Keep the meaning, '
                                   '"en" and "quote" unchanged. Return {"claims":[...]} in the same order.',{'claims':candidate['claims']})
                    fixed=[dict(c,zh=r.get('zh','')) for c,r in zip(candidate['claims'],repaired.get('claims') or [])]
                    if len(fixed)!=len(candidate['claims']) or differ(fixed):
                        raise ValueError('bilingual numerals differ')
                    candidate['claims']=fixed
                check=verify(candidate,source,model,seen)
                check['provenance']=provenance
                reports.append(check)
                if check['status']=='VERIFIED':
                    check['window']=str(target)
                    check['eligible_for_window']=True
                    good[target].append(candidate)
                    seen.add(candidate['url'])
            except Exception as exc:
                reports.append({'id':cid,'status':'QUARANTINED','source_url':url,
                                'reasons':[str(exc) if isinstance(exc,ValueError) else 'HTTP '+str(exc.code) if hasattr(exc,'code') else type(exc).__name__]})
        published_any=False
        for end in open_windows:
            verified=good[end]
            compact=FULL>len(verified)>=COMPACT and today>=end+timedelta(days=COMPACT_AFTER)
            if len(verified)<FULL and not compact:
                status['windows'][str(end)]=f'skipped: {len(verified)} verified bilingual developments (regular edition needs {FULL}'+(
                    f', compact edition {COMPACT} from {end+timedelta(days=COMPACT_AFTER)})' if len(verified)>=COMPACT else f', compact edition {COMPACT})')
                continue
            outputs=render(verified,end,compact)
            for filename in outputs:
                if Path(filename).exists():
                    raise ValueError('immutable edition already exists')
            for filename,content in outputs.items():
                p=Path(filename)
                p.parent.mkdir(parents=True,exist_ok=True)
                p.write_text(content)
            urls={c['url'] for c in verified}
            write(f'automation/publications/EI-{end}.json',{'id':f'EI-{end}','compact':compact,
                  'items':[r for r in reports if r['status']=='VERIFIED' and r.get('window')==str(end) and r['source_url'] in urls],
                  'files':{p:digest(text) for p,text in outputs.items()}})
            status['windows'][str(end)]='published compact edition' if compact else 'published'
            status['last_publication']=f'EI-{end}'
            published_any=True
        if published_any:
            write('publication-manifest.json',{'pages':sorted(str(p.relative_to('content')) for p in Path('content').rglob('*.md'))})
            status.update(status='publish')
        elif not open_windows:
            status.update(status='skipped',reasons=['edition already published'])
        else:
            status.update(status='skipped',reasons=['fewer than three verified bilingual developments']+list(status['windows'].values()))
        status['last_successful_check']=now()
    except Exception as exc:
        status.update(status='failed',reasons=[type(exc).__name__+': no content may be committed'])
        raise
    finally:
        write('automation/verification.json',reports)
        write(previous_path,status)
    return status


if __name__=='__main__':
    print(json.dumps(run(),indent=2))
