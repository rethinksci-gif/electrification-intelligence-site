import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import matter from 'gray-matter'
const root = path.resolve(import.meta.dirname, '..')
const content = path.join(root, 'content')
const out = path.join(root, 'public')
const forbidden = /(?:\.env(?:\b|\.)|(?:data|sources|snapshots|research-rounds|review|evaluation|pilot)\/|human_review_queue|evidence_ledger|candidate_evidence|raw[_-](?:llm|response)|DEEPSEEK_API_KEY|sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\/home\/tristan)/i
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => {
    const p = path.join(dir,e.name)
    assert(!e.isSymbolicLink(), `Symlink forbidden: ${p}`)
    return e.isDirectory() ? walk(p) : [p]
  })
}
const files=walk(content)
const manifest=JSON.parse(fs.readFileSync(path.join(root,'publication-manifest.json')))
assert.deepEqual(files.map(f=>path.relative(content,f)).sort(), manifest.pages.toSorted(), 'Only explicitly inventoried publication files are allowed')
const docs=files.map(f=> {
  assert(f.endsWith('.md'),`Only curated Markdown is allowed: ${f}`)
  const raw=fs.readFileSync(f,'utf8')
  assert(!forbidden.test(raw.replace(/https?:\/\/[^\s)"<>]+/g, "")),`Private path or credential pattern in ${f}`)
  const {data,content:body}=matter(raw)
  assert(!/\bTODO\b|<Add |<Define |<Build /i.test(raw), `Unfinished placeholder: ${f}`)
  for(const key of ['title','subtitle','date','edition','language','translation_key','content_type','thesis','status','confidence','updated','tags']) assert(key in data,`Missing ${key}: ${f}`)
  assert(data.publish===true && data.status==='published',`Publication must be explicit: ${f}`)
  assert(['en','zh'].includes(data.language),`Unsupported language: ${f}`)
  if(path.relative(content,f)!=='index.md') assert(path.relative(content,f).startsWith(data.language+'/'),`Language/path mismatch: ${f}`)
  return {file:f, data, body}
})
for(const d of docs.filter(d=>d.data.content_type!=='landing')) {
  const pair=docs.filter(p=>p.data.translation_key===d.data.translation_key)
  assert(pair.length===2 && new Set(pair.map(p=>p.data.language)).size===2,`Translation pair missing/duplicated: ${d.file}`)
  for(const key of ['date','edition','content_type','thesis','status','confidence','updated','tags']) assert.deepEqual(pair[0].data[key],pair[1].data[key],`Translation metadata drift (${key}): ${d.file}`)
}
// The appendix is the quantitative contract: identical IDs, numbers, units and source URLs.
const editions=docs.filter(d=>d.data.content_type==='analyst-edition')
for(const en of editions.filter(d=>d.data.language==='en')) {
 const zh=editions.find(d=>d.data.language==='zh'&&d.data.translation_key===en.data.translation_key)
 const rows=d=>d.body.split('\n').filter(l=>l.startsWith('| EI-'))
 assert.equal(rows(en).length, rows(zh).length,'Evidence rows must match')
 const tokens=s=>(s.match(/EI-[A-Z0-9-]+|https:\/\/[^\s)]+|[+−]?\d+(?:,\d{3})*(?:\.\d+)?%?|MWhth|MWh|GWh|TWh|kWh|€|\$/g)||[]).sort()
 rows(en).forEach((row,i)=>assert.deepEqual(tokens(row),tokens(rows(zh)[i]),`Evidence row ${i+1} translation drift`))
 const numbers=s=>new Set(s.replace(/https?:\/\/[^\s)]+/g,'').replace(/EI-[A-Z0-9–/-]+/g,'').match(/\d+(?:,\d{3})*(?:\.\d+)?/g)||[])
 assert.deepEqual([...numbers(en.body)].sort(),[...numbers(zh.body)].sort(),'Edition numbers must remain identical across languages')
}
// thesis-tracker.json is the single source for thesis judgments; both languages must carry the same facts.
const tracker=JSON.parse(fs.readFileSync(path.join(root,'thesis-tracker.json'),'utf8'))
const assessmentIds=tracker.assessments.map(a=>a.id)
assert.equal(new Set(assessmentIds).size,assessmentIds.length,'Duplicate thesis assessment id')
assert.deepEqual(tracker.assessments.map(a=>a.date),tracker.assessments.map(a=>a.date).toSorted(),'Thesis assessments must be in date order')
const factTokens=s=>(s.match(/EI-[A-Z0-9–-]+|[+−]?\d+(?:,\d{3})*(?:\.\d+)?%?|\$|€/g)||[]).sort()
for(const a of tracker.assessments) {
 assert(/^\d{4}-\d{2}-\d{2}$/.test(a.date),`Invalid assessment date: ${a.id}`)
 assert.deepEqual(a.theses.map(t=>t.id),['H1','H2','H3','H4','H5','H6'],`Assessment must list H1–H6 in order: ${a.id}`)
 for(const t of a.theses) for(const key of ['title','interpretation','direction','confidence','evidence','limits','change']) {
  assert(t[key]?.en?.trim() && t[key]?.zh?.trim(),`Missing ${key} translation: ${a.id} ${t.id}`)
  assert(!/[|\n]/.test(t[key].en+t[key].zh),`Table-breaking character in ${a.id} ${t.id} ${key}`)
  assert.deepEqual(factTokens(t[key].en),factTokens(t[key].zh),`Thesis translation drift: ${a.id} ${t.id} ${key}`)
 }
}
for(const d of docs) for(const m of d.body.matchAll(/<!-- thesis:(\w+)(?: ([\w-]+))? -->/g)) {
 assert(['cards','sections','table'].includes(m[1]),`Unknown thesis view ${m[1]}: ${d.file}`)
 if(m[2]) assert(assessmentIds.includes(m[2]),`Unknown thesis assessment ${m[2]}: ${d.file}`)
 // Published editions must pin their assessment so later reviews cannot rewrite them.
 if(d.data.content_type==='analyst-edition') assert(m[2],`Edition must pin a thesis assessment: ${d.file}`)
}
if(process.argv[2]==='public') {
 const generated=walk(out)
 const expected=new Set(files.map(f=>path.relative(content,f).replace(/\.md$/,'.html')))
 const allowedOutput=new Set([...expected,'index.css','prescript.js','postscript.js','sitemap.xml','static/contentIndex.json','static/icon.svg','en/feed.xml','zh/feed.xml'])
 for(const f of generated) assert(allowedOutput.has(path.relative(out,f)),`Unapproved generated artifact: ${f}`)
 const html=generated.filter(f=>f.endsWith('.html'))
 assert.deepEqual(new Set(html.map(f=>path.relative(out,f))),expected,'Unexpected public HTML page')
 const decode=s=>s.replaceAll('&amp;','&').replaceAll('&#x26;','&')
 for(const f of generated) {
   assert(!/\.(?:csv|jsonl|zip|py|md|map|ya?ml)$/.test(f),`Private/source artifact type: ${f}`)
   if(!/\.(?:html|css|js|json|xml|txt|svg)$/.test(f)) continue
   const text=fs.readFileSync(f,'utf8')
   assert(!forbidden.test(text.replace(/https?:\/\/[^\s)"<>]+/g, "")),`Private path or credential pattern in output: ${f}`)
   if(!f.endsWith('.html')) continue
   assert(!text.includes('<!-- thesis:'),`Unrendered thesis directive: ${f}`)
   const relative=path.relative(out,f)
   const language=relative.startsWith('zh/')?'zh-Hans':'en'
   assert(text.includes(`<html lang="${language}"`),`Document language missing: ${f}`)
   assert(text.includes('class="language-switch"'),`Language switch missing: ${f}`)
   assert(text.includes('rel="canonical" href="https://rethinksci-gif.github.io/electrification-intelligence-site/'),`Wrong canonical base path: ${f}`)
   for(const match of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
     const value=decode(match[1])
     if(/^(https?:|mailto:|data:)/.test(value)) continue
     assert(!value.startsWith('/'),`Root-absolute link breaks project hosting: ${f}: ${value}`)
     const [name,hash]=value.split('#')
     const target=decodeURIComponent(name.split('?')[0])
     let dest=target?path.resolve(path.dirname(f),target):f
     assert(dest===out||dest.startsWith(out+'/'),`Link escapes publication: ${value}`)
     if(fs.existsSync(dest)&&fs.statSync(dest).isDirectory()) dest=path.join(dest,'index.html')
     else if(!fs.existsSync(dest)&&fs.existsSync(dest+'.html')) dest+='.html'
     assert(fs.existsSync(dest),`Broken link: ${relative} -> ${value}`)
     if(hash&&dest.endsWith('.html')) {
       const targetHtml=fs.readFileSync(dest,'utf8')
       assert(targetHtml.includes(`id="${decodeURIComponent(hash)}"`),`Missing anchor: ${relative} -> ${value}`)
     }
   }
   // Each rendered language switch must point to the paired page, not merely the language home.
   const d=docs.find(d=>path.relative(content,d.file).replace(/\.md$/,'.html')===relative)
   if(d.data.content_type!=='landing') {
     const other=docs.find(o=>o.data.translation_key===d.data.translation_key&&o.data.language!==d.data.language)
     const switchMarkup=text.match(/<div class="language-switch"[^>]*>[\s\S]*?<\/div>/)?.[0]??''
     assert(switchMarkup.includes('role="group"'),`Language switch must be an accessible group: ${relative}`)
     assert(switchMarkup.includes('hreflang="en"') && switchMarkup.includes('hreflang="zh-Hans"'),`Language switch targets must declare hreflang: ${relative}`)
     const pairPath=path.relative(content,other.file).replace(/index\.md$/,'')
     assert(switchMarkup.includes(pairPath),`Wrong translation target: ${relative}`)
   }
 }
 console.log(`Validated ${html.length} HTML pages: links, anchors, language pairs, base path and private-artifact exclusions.`)
}
console.log(`Validated ${docs.length} curated Markdown pages and bilingual quantitative parity.`)
