import { FullSlug } from "../../util/path"
import { escapeHTML } from "../../util/escape"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { publicPath } from "../../components/Publication"

// Article types that readers subscribe to; section pages and the home page are excluded.
const feedTypes = ["analyst-edition", "research-sprint", "learning-module"]
const titles = { en: "Electrification Intelligence", zh: "Electrification Intelligence 中文版" }
const subtitles = {
  en: "Analyst editions, research sprints and learning notes.",
  zh: "分析师专刊、专题研究与学习笔记。",
}
const iso = (value: unknown) => new Date(`${String(value)}T00:00:00Z`).toISOString()

// One Atom feed per language, so readers do not receive duplicate translated entries.
export const PublicationFeed: QuartzEmitterPlugin = () => ({
  name: "PublicationFeed",
  async *emit(ctx, content) {
    const base = `https://${ctx.cfg.configuration.baseUrl}/`
    for (const language of ["en", "zh"] as const) {
      const entries = content
        .map(([, file]) => file.data)
        .filter((d) => d.frontmatter?.language === language && feedTypes.includes(String(d.frontmatter?.content_type)))
        .sort((a, b) => String(b.frontmatter?.updated).localeCompare(String(a.frontmatter?.updated)))
      const updated = entries.length ? iso(entries[0].frontmatter?.updated) : new Date(0).toISOString()
      const feedUrl = `${base}${language}/feed.xml`
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${language === "zh" ? "zh-Hans" : "en"}">
  <title>${titles[language]}</title>
  <subtitle>${subtitles[language]}</subtitle>
  <id>${feedUrl}</id>
  <link rel="self" type="application/atom+xml" href="${feedUrl}"/>
  <link rel="alternate" type="text/html" href="${base}${language}/"/>
  <updated>${updated}</updated>
  <author><name>rethinksci-gif</name></author>
  <rights>CC BY 4.0</rights>
${entries
  .map((d) => {
    const link = `${base}${publicPath(d.slug!)}`
    const f = d.frontmatter!
    return `  <entry>
    <title>${escapeHTML(String(f.title))}</title>
    <id>${link}</id>
    <link rel="alternate" type="text/html" href="${link}"/>
    <published>${iso(f.date)}</published>
    <updated>${iso(f.updated)}</updated>
    <summary>${escapeHTML(String(f.subtitle ?? d.description ?? ""))}</summary>
  </entry>`
  })
  .join("\n")}
</feed>
`
      yield write({ ctx, content: xml, slug: `${language}/feed` as FullSlug, ext: ".xml" })
    }
  },
})
