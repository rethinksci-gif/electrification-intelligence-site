# Electrification Intelligence publication site

This directory is the public publication layer. Quartz reads only `content/`; every Markdown file is explicitly inventoried in `publication-manifest.json` and must carry `publish: true`. Research inputs, source snapshots, review queues, credentials and generated pipeline artifacts remain outside this tree.

Public site: <https://rethinksci-gif.github.io/electrification-intelligence-site/>. English content lives under `/en/`; Simplified Chinese content lives under `/zh/`.

## Local preview

```bash
cd site
npm install
npm run preview
```

The preview is served at `http://localhost:8080/electrification-intelligence-site/`. The build-only command is `npm run build`.

## Checks

`npm run build` validates frontmatter, English/Chinese metadata pairs, quantitative parity in the edition evidence appendices, internal links, anchors, base-path URLs, and private-artifact exclusions. `npm run check` runs the TypeScript check. GitHub Actions also runs the Playwright desktop/mobile suite before deployment.

Future publication sync is intentionally manual: reviewed research output → approved public Markdown → copy into this repository → human review → commit and push → Pages deployment. No cross-repository publishing automation is configured.

Edition 002 remains unpublished because its source file is explicitly marked as a draft with semantic review outstanding. Existing learning notes are scaffolds, so they are described in the Learning section without being published as lessons. No completed Research Sprint was available during this migration.
