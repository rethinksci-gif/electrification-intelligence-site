---
title: "24 周学习计划与路径"
subtitle: "从能源数据走向工业与材料研究。"
date: "2026-10-08"
edition: null
language: "zh"
translation_key: "learning/roadmap"
content_type: "page"
thesis: []
status: "published"
confidence: "not-assigned"
updated: "2026-10-10"
tags: []
publish: true
---

## 目标与节奏

建议先用 24 周完成第一轮，每周暂按 4–6 小时设计，约 96–144 小时。目标是读懂研究、复现小分析、提出可检验的问题；并非在半年内掌握全部能源工程。起始日由你决定，周数是相对周，所有任务当前均为计划。

每周建议：阅读 1 小时、概念与单位整理 1 小时、算例或复现 1–2 小时、写作与复盘 1–2 小时。每周 2–3 小时可拆成 48 周；每周 8–10 小时可增加复现与反例，不必抢跑大模型。

## 起点与先修

先自测：能否区分 MW/MWh、计算加权平均、读 CSV、解释一条图的地区/时间/单位？已掌握 Python 和 pandas 的部分可用成果证明后跳过，但仍完成第 4 周的数据复现。零基础先走第 1–4 周；遇到编程障碍，先用表格手算，再补相同 Python 算例。

进入调度模型前能解释变量、目标和约束；进入热泵前掌握功率、能量与效率；进入材料前能区分存量、流量和系统边界。每个门槛未达到时重复练习，不强行按周晋级。

**主线：数据与单位 → 市场与光伏 → 储能服务 → 工业热 → 电网与终端 → 材料和产业综合。**

## 每周任务

资源代码对应后面的 GitHub 入口。模块编号沿用既有十二模块，学习顺序按先修重新排列。以下练习是为本项目设计的任务，不声称全部是上游原有教程。

| 周 | 主题 | 资源 | 模块 / 假设 | 当周可检查产出 |
| --- | --- | --- | --- | --- |
| 1 | 单位与数据边界 | ESM | 01 / H1 | 做一张 MW/MWh、存量/流量、发布日期/观测期对照表 |
| 2 | Python 与表格 | ESM | 01 / H1 | 读取一份小 CSV，保留缺失值；零与缺失不混用 |
| 3 | 时间序列与绘图 | ESM | 01 / H1 | 处理时区、单位与聚合，绘制可追溯曲线 |
| 4 | 数据复现小项目 | PUDL | 01 / H1 | 复现一项已有已验证观测；注明口径和来源，不能复现则记录原因 |
| 5 | 电力市场与调度 | PSA | 01 / H1 | 用三类假设电源画供给顺序并手算一次调度 |
| 6 | 单节点市场模型 | ESM | 01 / H1 | 复现 09 教程的一个小例子，修改负荷并解释结果 |
| 7 | 光伏出力机制 | PV | 02 / H1/H2 | 解释温度或倾角变化如何影响一条模拟发电曲线 |
| 8 | 光伏价值与系统成本 | COST | 02 / H1/H2 | 算发电加权捕获电价；说明其与 LCOE 的差别 |
| 9 | 储能能量平衡 | PSA | 03 / H2 | 逐时表列出充电、放电、效率与荷电状态 |
| 10 | 储能调度 | PSA | 03 / H2 | 比较无储能与有储能；检查功率、能量与终端约束 |
| 11 | 储能服务成本 | COST | 03 / H2 | 固定同一服务，比较效率与利用率两个敏感性 |
| 12 | 光储阶段复盘 | ESM | 03 / H2 | 整理一篇专题草稿：哪些是情景、哪些有实测证据 |
| 13 | 工业到户成本 | COST | 05 / H4 | 列出能源费、需量费、税费及利用率，保持地区一致 |
| 14 | 热泵原理 | HEAT | 06 / H3/H4 | 画能量流，解释温升；完成一个有条件的 COP 算例 |
| 15 | 工业热技术选择 | HEAT | 07 / H4/H6 | 按温度和工况比较热泵、电阻热、储热，记录数据缺口 |
| 16 | 同等热服务比较 | ESM | 07 / H4/H6 | 完成电热与燃气有用热成本敏感性表，单列资本与运行成本 |
| 17 | 电网与接入 | PSA | 04 / H5 | 画双节点模型，改变线路限额，解释拥塞 |
| 18 | EV 与灵活负荷 | ESM | 08 / H3/H5 | 比较固定与可移动充电时段，保留同等出行能量 |
| 19 | 电力电子与组件 | DRIVE | 09 / H2/H6 | 画转换链与损耗位置；控制仿真仅选修 |
| 20 | 系统约束复盘 | EUR | 12 / H4/H5 | 比较两个地区的电价、接入与供应链；禁止无数据排名 |
| 21 | 材料存量与流量 | MAT | 10 / H6 | 画质量平衡，区分新增需求、替换与回收 |
| 22 | 组件到材料性能 | MAT | 11 / H6 | 选一个组件，记录材料、工况、性能、失效及来源 |
| 23 | 综合研究项目 | EUR | 12 / H4/H5/H6 | 回答一个工厂电气化问题：服务、地区、成本、接入、材料与反证 |
| 24 | 复现与发布复核 | PUDL | 12 / H4/H5/H6 | 他人按说明复现，形成专题及学习摘要；判断变化另行审核 |

## 六个阶段的过关标准

| 周末 | 阶段成果 | 过关条件 |
| --- | --- | --- |
| 4 | 一份可追溯的数据笔记 | 原始值、单位、缺失值和计算一致；明确来源定位 |
| 8 | 光伏与市场短文 | 分清发电量、捕获电价和系统成本；解释一个反例 |
| 12 | 光储服务小专题 | 能量平衡成立；改变假设后能解释输出；不把情景写成事实 |
| 16 | 工业热比较 | 同地区、同有用热服务；列明温度、利用率和费用边界 |
| 20 | 电网与终端约束图 | 分清物理约束、价格信号和行政接入流程 |
| 24 | 综合专题与学习摘要 | 从来源复现，保留反证，逐项连接组件与材料要求 |

## GitHub 资源与使用方式

2026-10-08 核对 GitHub API，以下仓库均未归档。最近推送是整个仓库的活动时间，不代表某个教程已更新或已在本机跑通。主线优先使用 ESM、PSA、COST；其他按阶段选读。HEAT 为旧教程，MAT/ESM 更新较慢，固定环境后使用。DRIVE/BATT 是可选进阶。

| 代码 / 仓库 | 最近推送（UTC） | 具体入口与任务 |
| --- | --- | --- |
| ESM · [open-energy-transition/data-science-for-esm](https://github.com/open-energy-transition/data-science-for-esm) | 2025-10-22 | [入口](https://github.com/open-energy-transition/data-science-for-esm/blob/main/data-science-for-esm/01-workshop-python.ipynb)：基础主线：01 Python → 02 NumPy/绘图 → 03 pandas → 09 PyPSA → 10 扩容 → 12 部门耦合；14 Linopy 按需补充。 |
| PSA · [PyPSA/PyPSA](https://github.com/PyPSA/PyPSA) | 2026-10-08 | [入口](https://github.com/PyPSA/PyPSA/blob/master/docs/examples/examples.md)：系统模型主线：选择一个市场调度、储能或部门耦合例子；解释输入、约束和输出。 |
| PV · [pvlib/pvlib-python](https://github.com/pvlib/pvlib-python) | 2026-10-08 | [入口](https://pvlib-python.readthedocs.io/en/stable/gallery/index.html)：光伏补充：太阳位置、温度与发电曲线；不要求先掌握全部组件物理。 |
| COST · [PyPSA/technology-data](https://github.com/PyPSA/technology-data) | 2026-10-05 | [入口](https://github.com/PyPSA/technology-data)：参数来源练习：选三种技术，追踪效率、寿命、成本单位及来源；假设不等于市场报价。 |
| HEAT · [oemof/heat-pump-tutorial](https://github.com/oemof/heat-pump-tutorial) | 2024-07-19 | [入口](https://github.com/oemof/heat-pump-tutorial/blob/main/simple-heat-pump-tespy.ipynb)：先 simple-heat-pump-tespy，再按需读 heat-pump-partload-tespy 和 heat-pump-solph；这是旧版工作坊，先核对环境。 |
| MAT · [IndEcol/ODYM](https://github.com/IndEcol/ODYM) | 2025-09-26 | [入口](https://github.com/IndEcol/ODYM/blob/master/docs/tutorials/tutorial_1.ipynb)：材料补充：先教程 1，画系统边界与质量平衡，再按需阅读后续教程。 |
| EUR · [PyPSA/pypsa-eur](https://github.com/PyPSA/pypsa-eur) | 2026-10-08 | [入口](https://github.com/PyPSA/pypsa-eur)：进阶：读取配置、数据来源与限制；前期不运行全欧洲模型。 |
| PUDL · [catalyst-cooperative/pudl](https://github.com/catalyst-cooperative/pudl) | 2026-10-08 | [入口](https://github.com/catalyst-cooperative/pudl)：数据方法补充：理解来源、清洗与定义；美国数据不直接外推中国或欧盟。 |
| DRIVE · [Aalto-Electric-Drives/motulator](https://github.com/Aalto-Electric-Drives/motulator) | 2026-10-07 | [入口](https://github.com/Aalto-Electric-Drives/motulator/tree/main/examples)：可选分支：电机和并网变流器，需要电路与控制基础；不作为入门阻碍。 |
| BATT · [pybamm-team/PyBaMM](https://github.com/pybamm-team/PyBaMM) | 2026-10-08 | [入口](https://github.com/pybamm-team/PyBaMM)：可选分支：电池物理模型，放在系统储能之后；电芯结果不能直接代表站级经济性。 |

## 第一周现在就做

1. 从 ESM 的 01 教程开始，只练变量、列表、简单运算与读取小表；已有基础可直接整理数据边界。
2. 用自己的话写明：MW 与 MWh、装机与发电、销量与保有量、观测期与发布日期四组区别。
3. 手算“25 MW 连续运行 4 小时”的电量，解释为何缺少运行条件就不能推出全年发电量。数值只作教学假设。
4. 选一条既有研究主张，记录来源、表/页定位、地区、时期、单位和一个不能推出的结论。
5. 写一篇短笔记，回答“我之前混淆了什么？还缺什么证据？”通过单位和边界自测后进入下一周。

## 从学习成果到网站

每周积累个人笔记；达到阶段门槛后选一篇整理成 Learning 双语文章。第 12、16、24 周成果可发展为 Research Sprint；通过来源与语义复核后才进入专刊。原始算例、运行日志和个人进度保留在研究工作区，公开页面只放精选解释与来源。任何练习都不自动更新证据状态或假设置信度。

## 后续半年与版本维护

完成首轮后，按原有十二模块补深度：第 7–8 月复现一个光储或工业热案例；第 9–10 月补电网、电力电子与材料；第 11–12 月做跨地区比较和假设复核。每次只深化一个问题，PyBaMM、motulator、全尺度 PyPSA-Eur 按需选择，不要求全部运行。

每月查看主线仓库 releases 和 breaking changes；开新练习时记录 commit/tag、环境文件、输入来源及日期。进行中的练习不盲目升级。上游教程环境与本项目研究环境分开；安装以选定版本文档为准。本项目尚未安装或运行这些教程，链接核对不等于能够顺利运行。
