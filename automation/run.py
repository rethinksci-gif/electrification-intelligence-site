"""Research-to-site synchronization plus daily original-source collection and bilingual gates."""
import json
import os
import re
import subprocess
import sys
from datetime import date, timedelta
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from automation.evidence_gate import Model, canonical, digest, fetch, now, verify, write
from automation.source import original

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a' and dict(attrs).get('href'):
            self.urls.append(dict(attrs)['href'])


def collect(registry, research=None):
    leads, failures = {}, []
    for entry in registry:
        try:
            final, raw, _ = fetch(entry['url'])
            links = Links()
            links.feed(raw.decode('utf-8', errors='replace'))
            count = 0
            for link in links.urls:
                url = urljoin(final, link).split('#')[0]
                parts = urlsplit(url)
                if parts.hostname != entry['host'] or not parts.path.startswith(entry['path']):
                    continue
                if canonical(url) == canonical(entry['url']):
                    continue
                leads.setdefault(canonical(url), {'authority':entry['authority'], 'origin':'daily original-source index'})
                count += 1
                if count >= 6:
                    break
        except Exception as exc:
            failures.append({'source':entry['url'],'reason':type(exc).__name__})
    # Import only source references from the research repo, never drafts or asserted verification.
    # All imported evidence is re-fetched and verified before publication.
    research_leads = {}
    if research and research.exists():
        revision = subprocess.check_output(['git','-C',str(research),'rev-parse','HEAD'],text=True).strip()
        allowed = {e['host']:e['authority'] for e in registry}
        for file in sorted((research/'research-rounds').glob('round-*/acquisition.json')):
            for document in json.loads(file.read_text()):
                url = document.get('url','')
                host = urlsplit(url).hostname
                if document.get('status') == 'acquired' and host in allowed:
                    research_leads.setdefault(canonical(url), {'authority':allowed[host], 'origin':f'research:{revision}:{file.parent.name}'})
    merged = dict(list(research_leads.items())[-8:] + list(leads.items())[:16])
    return list(merged.items()), failures


def escape(text):
    return re.sub(r'([\\`*_{}\[\]#!|])', r'\\\1', text.replace('\n',' '))


def render(verified, end):
    output = {}
    for language in ('en','zh'):
        zh = language=='zh'
        meta = {'title':('电气化情报 — ' if zh else 'Electrification Intelligence — ')+str(end),
                'subtitle': '经原始来源核验的双周动态' if zh else 'Biweekly developments checked against original sources',
                'date':str(end),'edition':str(end),'language':language,'translation_key':'auto-'+str(end),
                'content_type':'analyst-edition','thesis':[],'status':'published','confidence':'source-verified',
                'updated':str(end),'tags':['electrification','materials'],'publish':True,
                'reading_time':max(1, sum(len(c[language]) for item in verified for c in item['claims'])//1000),
                'automated':True}
        body = [f'Publication identifier: EI-{end}', '',
                '核验仅确认原始来源支持相关表述，不构成独立实验复现。企业声明仍属于企业自报。未据此修改假设置信度。' if zh else
                'Verification establishes source support, not independent replication. Company statements remain self-reported. Thesis confidence is unchanged.', '',
                '## 经核验的动态' if zh else '## Verified developments','']
        for index,item in enumerate(verified,1):
            body += [f'### EI-{index:03d}', '', *[escape(c[language])+'\n' for c in item['claims']],
                     f"[{'原始来源' if zh else 'Original source'}]({item['url']}) · {item['date']}", '']
        body += ['## 证据范围与局限' if zh else '## Evidence scope and limitations','',
                 '仅纳入本期内有明确发布日期、可访问原文且通过语义核验的动态。证据不足的条目被隔离；未用推测填补空缺。' if zh else
                 'Coverage includes only dated developments in this window with accessible original text and passing semantic checks. Insufficient evidence is quarantined; gaps are not filled with speculation.','']
        output[f'content/{language}/analyst-editions/auto-{end}/index.md'] = '---\n'+yaml.safe_dump(meta,sort_keys=False,allow_unicode=True)+'---\n\n'+'\n'.join(body)+'\n'
    return output


def run():
    previous_path=Path('automation/status.json')
    previous=json.loads(previous_path.read_text()) if previous_path.exists() else {}
    anchor=date(2026,10,12)
    end=anchor+timedelta(days=((date.today()-anchor).days//14)*14)
    start=end-timedelta(days=14)
    status={'checked_at':now(),'window':str(end),'status':'running','last_publication':previous.get('last_publication'),
            'last_successful_check':previous.get('last_successful_check'),'reasons':[]}
    reports=[]
    try:
        research=Path(os.environ.get('RESEARCH_REPO','automation/runtime/research'))
        leads,failures=collect(json.loads(Path('automation/sources.json').read_text()),research)
        status['collection']={'candidates':len(leads),'failures':failures}
        good=[]
        seen=set()
        model=Model(limit=32)
        published=Path(f'automation/publications/EI-{end}.json')
        for url,provenance in leads:
            cid='EI-'+digest(url)[:16]
            try:
                source=original(url,provenance['authority'])
                if not source['date_verified']:
                    raise ValueError('original publication date missing or ambiguous')
                if not start <= date.fromisoformat(source['date']) < date.today():
                    reports.append({'id':cid,'status':'REJECTED','source_url':url,'reasons':['outside publication window']})
                    continue
                if published.exists():
                    reports.append({'id':cid,'status':'REJECTED','source_url':url,'reasons':['edition already published']})
                    continue
                extracted=model('Extract a decision-useful electrification development: clean power, storage, grids, '
                                'industrial heat, electrified transport or associated materials. Reject irrelevant '
                                'content with {"relevant":false}. Otherwise return {"relevant":true,"claims":['
                                '{"en":"English paraphrase","zh":"Chinese equivalent","quote":"exact original excerpt"}]}. '
                                'Include 3-5 short paragraphs: development, scientific scope/operating conditions, '
                                'industrial/material implications explicitly supported by source, and limitations. '
                                'Every factual detail must be supported by its exact excerpt. Preserve units, dates, '
                                'uncertainty and announced versus operating status. Use plain text, no Markdown. '
                                'Do not invent measurements, conclusions or missing operating conditions.',source)
                if extracted.get('relevant') is not True:
                    reports.append({'id':cid,'status':'REJECTED','source_url':url,'reasons':['irrelevant']})
                    continue
                candidate={'id':cid,'url':source['url'],'date':source['date'],'bilingual':True,'claims':extracted['claims']}
                if not 3<=len(candidate['claims'])<=5:
                    raise ValueError('incomplete development')
                check=verify(candidate,source,model,seen)
                check['provenance']=provenance
                reports.append(check)
                if check['status']=='VERIFIED':
                    check['eligible_for_window'] = start <= date.fromisoformat(candidate['date']) < end
                    if check['eligible_for_window']:
                        good.append(candidate)
                    seen.add(candidate['url'])
            except Exception as exc:
                reports.append({'id':cid,'status':'QUARANTINED','source_url':url,
                                'reasons':[str(exc) if isinstance(exc,ValueError) else type(exc).__name__]})
        if published.exists():
            status.update(status='skipped',reasons=['edition already published'])
        elif len(good)<3:
            status.update(status='skipped',reasons=['fewer than three verified bilingual developments'])
        else:
            outputs=render(good,end)
            for filename,content in outputs.items():
                p=Path(filename)
                if p.exists():
                    raise ValueError('immutable edition already exists')
                p.parent.mkdir(parents=True,exist_ok=True)
                p.write_text(content)
            write(published,{'id':f'EI-{end}','items':[r for r in reports if r['status']=='VERIFIED' and r.get('eligible_for_window')],
                             'files':{p:digest(text) for p,text in outputs.items()}})
            write('publication-manifest.json',{'pages':sorted(str(p.relative_to('content')) for p in Path('content').rglob('*.md'))})
            status.update(status='publish',last_publication=f'EI-{end}')
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
