import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
const colors = { light: "#fafaf7", lightgray: "#dce2dc", gray: "#647369", darkgray: "#34483c", dark: "#142c20", secondary: "#146344", tertiary: "#146344", highlight: "#eaf1e9", textHighlight: "#e5edbd" }
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Electrification Intelligence", pageTitleSuffix: " · EI",
    enableSPA: false, enablePopovers: false, analytics: null, locale: "en-US",
    baseUrl: "rethinksci-gif.github.io/electrification-intelligence-site",
    ignorePatterns: ["**/.*", "**/_*", "**/private/**", "**/data/**", "**/sources/**", "**/snapshots/**", "**/research-rounds/**", "**/review/**", "**/evaluation/**", "**/pilot/**"],
    defaultDateType: "published",
    theme: { fontOrigin: "local", cdnCaching: false, typography: { header: "sans-serif", body: "sans-serif", code: "monospace" }, colors: { lightMode: colors, darkMode: colors } },
  },
  plugins: {
    transformers: [Plugin.ThesisTracker(), Plugin.FrontMatter(), Plugin.CreatedModifiedDate({priority: ["frontmatter"]}), Plugin.ObsidianFlavoredMarkdown(), Plugin.GitHubFlavoredMarkdown(), Plugin.TableOfContents(), Plugin.CrawlLinks({markdownLinkResolution: "relative"}), Plugin.Description()],
    filters: [Plugin.ExplicitPublish()],
    emitters: [Plugin.ComponentResources(), Plugin.ContentPage(), Plugin.ContentIndex({enableSiteMap: true, enableRSS: false}), Plugin.Assets(), Plugin.Static(), Plugin.PublicationFeed()],
  },
}
export default config
