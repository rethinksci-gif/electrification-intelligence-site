import { test, expect } from '@playwright/test'
import fs from 'node:fs'
const manifest=JSON.parse(fs.readFileSync(new URL('../publication-manifest.json',import.meta.url),'utf8')) as {pages:string[]}
for(const language of ['en','zh']) {
 test(`${language}: navigation, translation targets and responsive reading`,async({page},testInfo)=>{
  const failures:string[]=[]
  page.on('pageerror',e=>failures.push(e.message))
  page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1')&&r.status()>=400)failures.push(`${r.status()} ${r.url()}`)})
  for(const file of manifest.pages.filter(p=>p.startsWith(language+'/'))) {
   const route=file.replace(/index\.md$/,'')
   await page.goto(route)
   await expect(page.locator('html')).toHaveAttribute('lang',language==='zh'?'zh-Hans':'en')
   await expect(page.locator('h1')).toHaveCount(1)
   await expect(page.locator('nav a')).toHaveCount(8)
   await expect(page.locator('.language-switch')).toBeVisible()
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Horizontal page overflow: ${route}`).toBe(true)
   for(const link of await page.locator('nav a').all()) {
    const target=await link.getAttribute('href')
    expect(new URL(target!,page.url()).pathname).toContain(`/electrification-intelligence-site/${language}/`)
   }
   const other=language==='en'?'zh':'en'
   await page.locator(`.language-switch a[lang="${other==='zh'?'zh-Hans':'en'}"]`).click()
   await expect(page).toHaveURL(new RegExp(`/electrification-intelligence-site/${route.replace(language+'/',other+'/')}$`))
   if(route===`${language}/`) {
     await page.goto(route)
     await page.screenshot({path:`test-results/${testInfo.project.name}-${language}-home.png`,fullPage:true})
     await page.locator('.feature-card').click()
     await expect(page).toHaveURL(new RegExp(`/electrification-intelligence-site/${language}/analyst-editions/001/$`))
   }
  }
  expect(failures).toEqual([])
 })
 test(`${language}: directory article URL and narrow tables`,async({page},testInfo)=>{
  await page.goto(`${language}/analyst-editions/001/`)
  await expect(page.locator('.material-chain')).toBeVisible()
  await expect(page.locator('.callout')).toHaveCount(7)
  if(testInfo.project.name==='mobile') {
   const table=page.locator('.table-container').first()
   expect(await table.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true)
   await table.evaluate(el=>{el.scrollLeft=150})
   expect(await table.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0)
  }
  await page.screenshot({path:`test-results/${testInfo.project.name}-${language}-edition.png`,fullPage:true})
 })
}
test('language entry and navigation work without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false})
 const page=await context.newPage()
  await page.goto('http://127.0.0.1:8080/electrification-intelligence-site/')
 await page.getByRole('link',{name:'阅读中文版 →'}).click()
 await expect(page).toHaveURL(/\/electrification-intelligence-site\/zh\/$/)
 await page.locator('nav a').nth(4).click()
 await expect(page).toHaveURL(/\/electrification-intelligence-site\/zh\/thesis\/$/)
 await page.locator('.language-switch a[lang="en"]').click()
 await expect(page).toHaveURL(/\/electrification-intelligence-site\/en\/thesis\/$/)
 await context.close()
})
