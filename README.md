# Electrification Intelligence publication site

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23276948.svg)](https://doi.org/10.5281/zenodo.23276948)

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

`npm run build` validates frontmatter, English/Chinese metadata pairs, quantitative parity in the edition evidence appendices, internal links, anchors, base-path URLs, and private-artifact exclusions. `npm run check` runs the TypeScript check. GitHub Actions also runs the Playwright desktop/mobile suite before deployment. A weekly workflow checks external source links with lychee (`.lychee.toml`) and opens an issue instead of blocking deployment; Dependabot groups GitHub Actions updates.

Each language has an Atom feed (`/en/feed.xml`, `/zh/feed.xml`) listing editions, sprints and learning notes.

Future publication sync is intentionally manual: reviewed research output → approved public Markdown → copy into this repository → human review → commit and push → Pages deployment. No cross-repository publishing automation is configured.

Edition 002 remains unpublished because its source file is explicitly marked as a draft with semantic review outstanding. Existing learning notes are scaffolds, so they are described in the Learning section without being published as lessons. No completed Research Sprint was available during this migration.

## Authoring

Use `node scripts/new-note.mjs learning-module slug "English title" "中文标题"` to create unpublished bilingual drafts. After review, copy complete pages into `content/`, set publication metadata, run `node scripts/inventory.mjs`, then all checks. The new learning-method example does not complete the original learning curriculum. See the repository publishing guide for the full workflow.

## Thesis tracker data

`thesis-tracker.json` is the single source for the six thesis judgments. Pages render it with `<!-- thesis:cards -->` (home), `<!-- thesis:sections -->` (tracker) and `<!-- thesis:table edition-001 -->` (edition dashboard). For a new review, append an assessment with a new `id` and `date` and pin it in the new edition; never edit a published assessment. The home page and tracker follow the latest assessment automatically. `npm run build` rejects missing translations and any number, currency or evidence ID that differs between English and Chinese.

## Citation and licenses

Article content is CC BY 4.0 and the site code is MIT; see `LICENSE.md`. Citation metadata is in `CITATION.cff`. `.zenodo.json` is ready for Zenodo archiving: sign in to zenodo.org with GitHub, enable this repository under GitHub settings, then publish a GitHub Release (for example `v2026.10.0`); each release receives a DOI. The concept DOI [10.5281/zenodo.23276948](https://doi.org/10.5281/zenodo.23276948) always resolves to the latest release and is recorded in `CITATION.cff`; each release also gets its own version DOI.

