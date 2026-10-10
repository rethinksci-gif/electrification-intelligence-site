# 从学习到 Electrification Intelligence 网站

核对日期：2026-10-08。实际已配置的 GitHub Pages 是：
https://rethinksci-gif.github.io/electrification-intelligence-site/

研究仓库用于原始学习、证据与草稿；独立 `electrification-intelligence-site` 仓库用于公开网站。研究仓库的 `site/` 是可复现的发布副本。当前不存在跨仓库自动同步：只推研究笔记不会更新网站。建议公开页面以独立网站仓库为发布目标，双向修改前先检查差异；不要同步整个研究目录。

## 内容放在哪里

| 研究内容 | 网站位置 | 成熟条件 |
| --- | --- | --- |
| learning 中的累计笔记 | Learning | 一个清楚问题、自己的解释、可定位来源、算例和局限 |
| research-sprints 中的专题 | Research Sprints | 范围、方法、支持/反证、产业及材料链、下一步验证 |
| analyst-editions 中的专刊 | Analyst Editions / Latest | 完成语义复核，保留证据状态、截止日期和数量附录 |
| thesis 中的判断 | Thesis Tracker | 明确证据改变了什么，保留反证及改变判断的条件 |
| monthly / quarterly | 专刊或专题 | 形成独立公开文章，不直接公开内部模板 |
| watchlist / signals | 专题问题或已复核文章 | 候选信号先核查，不能自动转成已验证证据 |
| 数据、快照和审阅队列 | 留在研究仓库 | 公开文章引用原始公开来源与定位，构建不复制这些目录 |

## 每次发布的操作

在独立网站仓库根目录运行（也可先在研究仓库的 `site/` 演练）：

```bash
node scripts/new-note.mjs learning-module storage-duration "Understanding storage duration" "理解储能时长"
```

生成 `drafts/storage-duration/en.md` 和 `zh.md`，默认 `publish: false`、`status: draft`。草稿不参与构建。专题使用 `research-sprint`，专刊使用 `analyst-edition`。

1. 填完两种语言中的 TODO。数字、单位、日期、证据状态一致；标明假设算例，不能冒充测量。英文为当前站点的规范版本，中文保持同等限定条件。
2. 人工复核来源、版权/引用范围、数量口径与推断。专刊还要填写 edition 和 reading_time，并按现有专刊格式保留证据附录。模板生成不是语义验证。
3. 把两篇完整文章分别复制到 `content/en/learning/storage-duration/index.md` 和 `content/zh/learning/storage-duration/index.md`，改为 `publish: true`、`status: published`。其他类型使用对应目录；不要整目录复制学习材料。
4. 执行以下检查；草稿、TODO、缺失翻译和坏链接都会阻止构建。

```bash
node scripts/inventory.mjs
npm run check
npm run build
npm run test:browser
```

5. 检查 `git diff`，在独立网站仓库提交对应内容、清单及必要工具修改，推送到分支后开 PR。合并 main 后，由网站自己的 Pages workflow 发布。研究仓库与网站仓库的工作流互不触发。
6. 检查 Actions 成功及线上中英文页面。已发布专刊使用带日期的新修订，原版保留并双向链接。

复核假设判断时，不要改正文：在 `thesis-tracker.json` 末尾追加新的 assessment（新 `id` 与 `date`，中英文字段齐全），并在新专刊中用 `<!-- thesis:table <id> -->` 固定引用。首页与假设追踪页自动显示最新一次评估；已发布的 assessment 不再修改。

网站目录会自动列出对应内容类型。Latest 保持最新专刊的含义，新增学习文章在 Learning 显示。无需手工复制卡片。当前生成内容仅支持经过筛选的 Markdown；图表附件需要先扩展并测试资源白名单。

## 建议节奏

每次学习新增一小节；每周挑选一条可复用理解整理为双语短文；每月把相互关联的笔记发展成一篇专题；每季度重审六项假设。没有新证据时可以不发专刊。尚未启用自动研究、自动语义审阅或定时抓取。

优先完善储能服务、工业用热成本、电网接入与材料规格这四条链。它们能把已有知识连接到 H2/H4/H5/H6 的具体证据缺口。
