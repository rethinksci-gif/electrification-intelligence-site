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

    def pipeline(self,count=3,broken=False):
        def collect(*args):return [(f'https://example.org/{i}',{'authority':'official','origin':'test'}) for i in range(count)],[]
        def original(url,authority):
            if broken and url.endswith('/0'):raise ValueError('broken link')
            return {'url':url,'authority':authority,'status':200,'date':'2026-10-20','date_verified':True,'text':TEXT}
        def model(instruction,data):
            if instruction.startswith('Extract'):
                return {'relevant':True,'claims':[{'en':TEXT,'zh':'实验室在干燥条件下于 200 C 测得 50 kWh；该结果属于实验结果。','quote':TEXT} for _ in range(3)]}
            return {'checks':dict.fromkeys(CHECKS,True),'reasons':[],'citations':[TEXT]}
        stack=ExitStack()
        for name,value in [('collect',collect),('original',original),('Model',lambda **kw:model),('date',Day)]:
            stack.enter_context(patch.object(adapter,name,value))
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
