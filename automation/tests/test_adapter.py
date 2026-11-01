import json
import os
import tempfile
import unittest
from contextlib import ExitStack
from datetime import date
from pathlib import Path
from unittest.mock import patch
from automation import run as adapter
from automation.evidence_gate import CHECKS
from automation.validate import validate

TEXT='The laboratory reported 50 kWh at 200 C under dry conditions. This is an experimental result.'
class Day(date):
    @classmethod
    def today(cls):return cls(2026,10,31)

class AdapterTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.cwd=os.getcwd();os.chdir(self.temp.name)
        Path('automation').mkdir();Path('automation/sources.json').write_text('[]')

    def tearDown(self):
        os.chdir(self.cwd);self.temp.cleanup()

    def pipeline(self,count=3,broken=False,dates=None,today=None):
        def collect(*args):return [(f'https://example.org/{i}',{'authority':'official','origin':'test'}) for i in range(count)],[]
        def original(url,authority):
            if broken and url.endswith('/0'):raise ValueError('broken link')
            when=(dates or {}).get(int(url.rsplit('/',1)[1]),'2026-10-20')
            return {'url':url,'authority':authority,'status':200,'date':when,'date_verified':True,'text':TEXT}
        def model(instruction,data):
            if instruction.startswith('Extract'):
                return {'relevant':True,'claims':[{'en':TEXT,'zh':'实验室在干燥条件下于 200 C 测得 50 kWh；该结果属于实验结果。','quote':TEXT} for _ in range(3)]}
            return {'checks':dict.fromkeys(CHECKS,True),'reasons':[],'citations':[TEXT]}
        stack=ExitStack()
        day=type('Today',(date,),{'today':classmethod(lambda cls:cls.fromisoformat(today))}) if today else Day
        for name,value in [('collect',collect),('original',original),('Model',lambda **kw:model),('date',day)]:
            stack.enter_context(patch.object(adapter,name,value))
        stack.enter_context(patch('automation.evidence_gate.date',day))
        return stack

    def test_bilingual_publication_manifest_and_rerun(self):
        with self.pipeline():
            self.assertEqual(adapter.run()['status'],'publish')
            validate()
            manifest=json.loads(Path('publication-manifest.json').read_text())
            self.assertEqual(len(manifest['pages']),2)
            for page in manifest['pages']:
                self.assertIn("date: '2026-10-31'", Path('content',page).read_text())
            contents={p:Path('content',p).read_bytes() for p in manifest['pages']}
            self.assertEqual(adapter.run()['status'],'skipped')
            self.assertEqual(contents,{p:Path('content',p).read_bytes() for p in manifest['pages']})

    def test_empty_collection(self):
        with self.pipeline(count=0):self.assertEqual(adapter.run()['status'],'skipped')
        self.assertFalse(Path('content').exists())

    def test_quarantine_is_item_level(self):
        with self.pipeline(count=4,broken=True):self.assertEqual(adapter.run()['status'],'publish')
        reports=json.loads(Path('automation/verification.json').read_text())
        self.assertEqual(sum(r['status']=='QUARANTINED' for r in reports),1)

    def test_missing_key(self):
        from automation.evidence_gate import Model
        with self.pipeline(),patch.object(adapter,'Model',Model),patch.dict(os.environ,{},clear=True):
            self.assertEqual(adapter.run()['status'],'skipped')
            self.assertTrue(all(r['status']=='QUARANTINED' for r in json.loads(Path('automation/verification.json').read_text())))

    def test_compact_edition_after_retry_period(self):
        with self.pipeline(count=2):self.assertEqual(adapter.run()['status'],'publish')
        validate()
        page=Path('content/en/analyst-editions/auto-2026-10-26/index.md').read_text()
        self.assertIn('Compact edition: only 2 developments',page)
        self.assertTrue(json.loads(Path('automation/publications/EI-2026-10-26.json').read_text())['compact'])

    def test_compact_edition_waits_for_regular_retries(self):
        with self.pipeline(count=2,today='2026-10-28'):self.assertEqual(adapter.run()['status'],'skipped')
        self.assertFalse(Path('content').exists())

    def test_single_development_never_publishes(self):
        with self.pipeline(count=1):self.assertEqual(adapter.run()['status'],'skipped')

    def test_previous_window_is_backfilled(self):
        dates={0:'2026-10-20',1:'2026-10-21',2:'2026-11-02',3:'2026-11-03',4:'2026-11-04'}
        with self.pipeline(count=5,dates=dates,today='2026-11-10'):
            status=adapter.run()
        self.assertEqual(status['status'],'publish')
        self.assertEqual(status['windows'],{'2026-10-26':'published compact edition','2026-11-09':'published'})
        self.assertEqual(len(json.loads(Path('automation/publications/EI-2026-10-26.json').read_text())['items']),2)
        self.assertEqual(len(json.loads(Path('automation/publications/EI-2026-11-09.json').read_text())['items']),3)
        validate()

    def test_windows_before_first_automatic_window_are_ignored(self):
        self.assertEqual(adapter.windows(date(2026,11,1)),[date(2026,10,26)])
        self.assertEqual(adapter.windows(date(2026,11,24)),[date(2026,11,9),date(2026,11,23)])

    def test_bilingual_numeral_formatting_is_quarantined(self):
        with self.pipeline(count=3):
            original=adapter.Model
            def model(instruction,data):
                result=original()(instruction,data)
                if instruction.startswith('Extract') and data['url'].endswith('/0'):
                    result['claims'][0]['zh']='2026年10月，实验室在 200 C 下测得 50 kWh。'
                return result
            with patch.object(adapter,'Model',lambda **kw:model):adapter.run()
        reports={r['source_url']:r for r in json.loads(Path('automation/verification.json').read_text())}
        self.assertEqual(reports['https://example.org/0']['reasons'],['bilingual numerals differ'])

    def test_feed_links_cover_rss_rdf_and_atom(self):
        rss=b'<rss><channel><item><link>https://a.org/1</link></item></channel></rss>'
        rdf=(b'<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/">'
             b'<item><link>https://a.org/2</link></item></rdf:RDF>')
        atom=(b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><link rel="alternate" href="https://a.org/3"/></entry></feed>')
        self.assertEqual([adapter.feed_links(x) for x in (rss,rdf,atom)],[['https://a.org/1'],['https://a.org/2'],['https://a.org/3']])
