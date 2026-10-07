import { QuartzComponent, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"

export const publicPath = (slug: string) => slug === "index" ? "" : slug.replace(/\/index$/, "/")
const zh = (p: QuartzComponentProps) => p.fileData.frontmatter?.language === "zh"
const url = (p: QuartzComponentProps, slug: string) => `${pathToRoot(p.fileData.slug!)}/${publicPath(slug)}`
const labels = {
  en: ["Home", "Latest", "Analyst Editions", "Research Sprints", "Thesis Tracker", "Learning", "Methodology", "About"],
  zh: ["首页", "最新情报", "分析师专刊", "专题研究", "假设追踪", "学习", "研究方法", "关于"],
}
const sections = ["", "latest/", "analyst-editions/", "research-sprints/", "thesis/", "learning/", "methodology/", "about/"]
export const PublicationHeader: QuartzComponent = (p) => {
  const language = zh(p) ? "zh" : "en"
  const key = p.fileData.frontmatter?.translation_key
  return <header class="publication-header">
    <a class="skip-link" href="#publication-content">{zh(p) ? "跳至正文" : "Skip to content"}</a>
    <div class="masthead"><a class="wordmark" href={url(p, `${language}/index`)}><span class="monogram">EI</span><span>Electrification<br/>Intelligence</span></a>
    <div class="language-switch" aria-label={zh(p) ? "语言" : "Language"}>{(["en", "zh"] as const).map((lang, i) => {
      const target = p.allFiles.find(f => f.frontmatter?.translation_key === key && f.frontmatter?.language === lang)
      return <>{i > 0 && <span aria-hidden="true"> | </span>}<a href={url(p, target?.slug ?? `${lang}/index`)} lang={lang === "zh" ? "zh-Hans" : "en"} hrefLang={lang === "zh" ? "zh-Hans" : "en"} aria-current={language === lang ? "page" : undefined}>{lang === "en" ? "EN" : "中文"}</a></>
    })}</div></div>
    <nav aria-label={zh(p) ? "主导航" : "Main navigation"}>{sections.map((section, i) => {
      const slug = `${language}/${section}index`
      const active = i === 0 ? p.fileData.slug === slug : p.fileData.slug?.startsWith(`${language}/${section}`)
      return <a href={url(p, slug)} aria-current={active ? "page" : undefined}>{labels[language][i]}</a>
    })}</nav>
  </header>
}
export const PublicationTitle: QuartzComponent = (p) => {
  const f = p.fileData.frontmatter!
  return <div id="publication-content" class="publication-title" tabIndex={-1}>
    <p class="eyebrow">{f.content_type === "home" ? (zh(p) ? "能源 · 工业 · 材料" : "ENERGY · INDUSTRY · MATERIALS") : (zh(p) ? "研究情报" : "RESEARCH INTELLIGENCE")}{f.edition ? ` / ${f.edition}` : ""}</p>
    <h1>{f.title}</h1><p class="subtitle">{String(f.subtitle ?? "")}</p>
    {f.content_type === "analyst-edition" && <p class="edition-meta"><time dateTime={String(f.date)}>{String(f.date)}</time> · {f.reading_time} {zh(p) ? "分钟阅读" : "min read"} · {zh(p) ? "历史基线分析" : "Historical baseline analysis"}</p>}
  </div>
}
export const PublicationListing: QuartzComponent = (p) => {
  const f = p.fileData.frontmatter!
  const type = f.list_type
  if (!type) return null
  let files = p.allFiles.filter(file => file.frontmatter?.language === f.language && file.frontmatter?.content_type === type)
    .sort((a,b) => String(b.frontmatter?.date).localeCompare(String(a.frontmatter?.date)) || String(b.frontmatter?.edition).localeCompare(String(a.frontmatter?.edition)))
  if (f.latest_only) files = files.slice(0, 1)
  return <div class="edition-grid">{files.map(file => <a class="edition-card" href={url(p,file.slug!)}>
    <div class="eyebrow">{zh(p) ? "分析师专刊" : "ANALYST EDITION"} {file.frontmatter?.edition} · {String(file.frontmatter?.date)}</div>
    <h2>{file.frontmatter?.title}</h2><p>{String(file.frontmatter?.subtitle)}</p>
    <span class="card-meta">{String(file.frontmatter?.main_thesis ?? "")} · {file.frontmatter?.reading_time} {zh(p) ? "分钟阅读" : "min read"} <span aria-hidden="true">↗</span></span>
  </a>)}</div>
}
export const PublicationFooter: QuartzComponent = (p) => <footer class="publication-footer"><strong>Electrification Intelligence</strong><p>{zh(p) ? "区分证据、解读与假设。保留不确定性。" : "Evidence, interpretation and hypothesis. Uncertainty preserved."}</p><a href={url(p, `${zh(p) ? "zh" : "en"}/methodology/index`)}>{zh(p) ? "研究方法与证据标准" : "Methodology & evidence standards"}</a><span class="footer-credit">Quartz · {zh(p) ? "研究截止日期见各篇文章" : "Research cutoffs are stated in each edition"}</span></footer>
