import fs from 'node:fs'
import path from 'node:path'
const [kind, slug, enTitle, zhTitle] = process.argv.slice(2)
const sections = {'learning-module':'learning','research-sprint':'research-sprints','analyst-edition':'analyst-editions'}
if (!sections[kind] || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? '') || !enTitle || !zhTitle) {
  console.error('Usage: node scripts/new-note.mjs learning-module|research-sprint|analyst-edition slug "English title" "中文标题"')
  process.exit(1)
}
const root = path.resolve(import.meta.dirname, '..', 'drafts', slug)
if (fs.existsSync(root)) throw new Error('Draft already exists; choose a new slug or edit the existing draft.')
fs.mkdirSync(root, {recursive:true})
const date = new Date().toISOString().slice(0,10)
for (const language of ['en','zh']) {
  const meta = {title:language==='en'?enTitle:zhTitle,subtitle:'TODO',date,edition:null,language,translation_key:`${sections[kind]}/${slug}`,content_type:kind,thesis:[],status:'draft',confidence:'not-assigned',updated:date,tags:[],publish:false}
  const headings = language==='en' ? ['Question and scope','Explanation and interpretation','Sources, versions and locators','Example, units and assumptions','Counterevidence and limitations','Manufacturing and materials','Related research and next test'] : ['问题与范围','解释与解读','来源、版本与定位','算例、单位与假设','反证与局限','制造业与材料','关联研究与下一步检验']
  fs.writeFileSync(path.join(root,`${language}.md`),'---\n'+Object.entries(meta).map(([k,v])=>`${k}: ${JSON.stringify(v)}`).join('\n')+'\n---\n\n'+headings.map(h=>`## ${h}\n\nTODO\n`).join('\n'),{flag:'wx'})
}
console.log(`Created bilingual drafts: drafts/${slug}. Review before copying to content/<language>/${sections[kind]}/${slug}/index.md. Drafts are excluded from builds.`)
