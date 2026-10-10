import { i18n } from "../i18n"
import { FullSlug, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    allFiles,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      (fileData.frontmatter?.subtitle ? String(fileData.frontmatter.subtitle) : undefined) ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.svg")

    // Url of current page; matches the canonical directory URL rather than the raw slug
    const pageUrl = (slug: string) => `https://${cfg.baseUrl}/${slug === "index" ? "" : slug.replace(/\/index$/, "/")}`
    const socialUrl = fileData.slug === "404" ? url.toString() : pageUrl(fileData.slug!)
    const f = fileData.frontmatter
    const language = f?.language === "zh" ? "zh" : "en"
    const isArticle = ["analyst-edition", "research-sprint", "learning-module"].includes(String(f?.content_type))
    const isoDate = (value: unknown) => (value ? `${String(value)}T00:00:00Z` : undefined)
    const jsonLd = isArticle
      ? {
          "@context": "https://schema.org",
          "@type": f?.content_type === "analyst-edition" ? "Report" : "Article",
          headline: f?.title,
          description,
          inLanguage: language === "zh" ? "zh-Hans" : "en",
          datePublished: isoDate(f?.date),
          dateModified: isoDate(f?.updated),
          url: socialUrl,
          isPartOf: { "@type": "WebSite", name: cfg.pageTitle, url: `https://${cfg.baseUrl}/` },
          author: { "@type": "Person", name: "rethinksci-gif", url: "https://github.com/rethinksci-gif" },
          license: "https://creativecommons.org/licenses/by/4.0/",
        }
      : undefined

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        <meta property="og:locale" content={language === "zh" ? "zh_CN" : "en_US"} />
        <meta property="og:locale:alternate" content={language === "zh" ? "en_US" : "zh_CN"} />
        {isArticle && <meta property="article:published_time" content={isoDate(f?.date)} />}
        {isArticle && <meta property="article:modified_time" content={isoDate(f?.updated)} />}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />


        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />
        <link rel="canonical" href={`https://${cfg.baseUrl}/${fileData.slug === "index" ? "" : fileData.slug!.replace(/\/index$/, "/")}`} />
        {allFiles.filter(other => other.frontmatter?.translation_key === f?.translation_key).map(other => <link rel="alternate" hrefLang={other.frontmatter?.language === "zh" ? "zh-Hans" : "en"} href={pageUrl(other.slug!)} />)}
        <link rel="alternate" type="application/atom+xml" title={language === "zh" ? "Electrification Intelligence 中文订阅" : "Electrification Intelligence feed"} href={`https://${cfg.baseUrl}/${language}/feed.xml`} />
        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
