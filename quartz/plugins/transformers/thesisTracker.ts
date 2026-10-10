import fs from "node:fs"
import path from "node:path"
import { QuartzTransformerPlugin } from "../types"

type Text = { en: string; zh: string }
type Lang = keyof Text
type Thesis = { id: string; title: Text; interpretation: Text; direction: Text; confidence: Text; evidence: Text; limits: Text; change: Text }
type Assessment = { id: string; date: string; theses: Thesis[] }

const fields = ["interpretation", "direction", "confidence", "evidence", "limits", "change"] as const
const labels: Record<Lang, Record<(typeof fields)[number], string>> = {
  en: { interpretation: "Current interpretation", direction: "Status / evidence direction", confidence: "Confidence category", evidence: "Latest meaningful evidence", limits: "Main uncertainty or contrary evidence", change: "What would change the view" },
  zh: { interpretation: "当前解读", direction: "状态／证据方向", confidence: "置信度类别", evidence: "最近有意义的证据", limits: "主要不确定性或反证", change: "什么会改变判断" },
}
const tableHeaders: Record<Lang, string[]> = {
  en: ["Thesis", "Current interpretation", "Evidence direction", "Confidence range", "Main supporting evidence", "Main contradictory or limiting evidence", "What would change the view"],
  zh: ["假设", "当前解读", "证据方向", "置信度类别", "主要支持证据", "主要反证或限制", "什么会改变判断"],
}
const heading = (t: Thesis, l: Lang) => `${t.id} — ${t.title[l]}`

const views = {
  cards: (a: Assessment, l: Lang) =>
    `<div class="thesis-grid">\n${a.theses
      .map((t) => `<div class="thesis-card"><h3>${heading(t, l)}</h3><p>${t.interpretation[l]}</p><p><strong>${l === "zh" ? "置信度：" : "Confidence: "}${t.confidence[l]}</strong></p></div>`)
      .join("\n")}\n</div>`,
  sections: (a: Assessment, l: Lang) =>
    a.theses
      .map((t) => `## ${heading(t, l)}\n\n${fields.map((k) => `**${labels[l][k]}${l === "zh" ? "：" : ":"}** ${t[k][l]}`).join("\n\n")}`)
      .join("\n\n"),
  table: (a: Assessment, l: Lang) =>
    [
      `| ${tableHeaders[l].join(" | ")} |`,
      `| ${tableHeaders[l].map(() => "---").join(" | ")} |`,
      ...a.theses.map((t) => `| **${heading(t, l)}** | ${fields.map((k) => t[k][l]).join(" | ")} |`),
    ].join("\n"),
}

// Renders thesis-tracker.json into Markdown so the home page, tracker and editions share one source.
// Directive: <!-- thesis:cards|sections|table [assessment-id] -->; the latest assessment is the default.
export const ThesisTracker: QuartzTransformerPlugin = () => ({
  name: "ThesisTracker",
  textTransform(ctx, src) {
    if (!src.includes("<!-- thesis:")) return src
    const { assessments } = JSON.parse(fs.readFileSync(path.resolve(ctx.argv.directory, "..", "thesis-tracker.json"), "utf8")) as { assessments: Assessment[] }
    const lang: Lang = /^language:\s*["']?zh/m.test(src) ? "zh" : "en"
    return src.replace(/<!-- thesis:(cards|sections|table)(?: ([\w-]+))? -->/g, (_m, view: keyof typeof views, id?: string) => {
      const assessment = id ? assessments.find((a) => a.id === id) : assessments.at(-1)
      if (!assessment) throw new Error(`Unknown thesis assessment: ${id}`)
      return views[view](assessment, lang)
    })
  },
})
