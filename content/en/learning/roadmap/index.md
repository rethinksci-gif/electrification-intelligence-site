---
title: "A 24-week learning pathway"
subtitle: "From energy data to industrial and materials research."
date: "2026-10-08"
edition: null
language: "en"
translation_key: "learning/roadmap"
content_type: "page"
thesis: []
status: "published"
confidence: "not-assigned"
updated: "2026-10-10"
tags: []
publish: true
---

## Goal and pace

Start with a 24-week first pass at an assumed 4–6 hours per week, around 96–144 hours. The goal is to read research, reproduce small analyses and ask testable questions, not master every energy-engineering field. Weeks are relative to your chosen start; all tasks are planned.

Allow 1 hour for reading, 1 for concepts/units, 1–2 for worked examples and 1–2 for writing/review. At 2–3 hours weekly, spread this over 48 weeks. At 8–10 hours, add replication and counterexamples instead of rushing into large models.

## Entry and prerequisites

Check whether you can distinguish MW/MWh, calculate a weighted mean, read a CSV and explain a chart's geography, period and units. Demonstrate existing Python/pandas skills to skip familiar material, but retain the week 4 reproduction. Beginners start with weeks 1–4. Use a spreadsheet first if coding blocks conceptual progress, then reproduce the same calculation in Python.

Before dispatch, explain variables, objectives and constraints. Before heat pumps, understand power, energy and efficiency. Before materials, distinguish stocks, flows and system boundaries. Repeat an exercise when its gate is unmet rather than advancing by date alone.

**Route: data and units → markets and solar → storage service → industrial heat → grids and end use → materials and industry.**

## Weekly tasks

Resource codes refer to the GitHub entries below. Existing module numbers are retained but reordered by prerequisite. These are project-designed exercises, not a claim that every task exists in an upstream tutorial.

| Week | Topic | Resource | Module / thesis | Checkable outcome |
| --- | --- | --- | --- | --- |
| 1 | Units and boundaries | ESM | 01 / H1 | Make a units, stocks/flows and dates reference |
| 2 | Python and tables | ESM | 01 / H1 | Read a small CSV and distinguish zero from missing |
| 3 | Time series and plotting | ESM | 01 / H1 | Document timezone, units and aggregation in one plot |
| 4 | Data reproduction project | PUDL | 01 / H1 | Reproduce one existing validated observation or explain why not |
| 5 | Markets and dispatch | PSA | 01 / H1 | Draw a three-generator teaching merit order and hand-check dispatch |
| 6 | Single-node market model | ESM | 01 / H1 | Run a small example from tutorial 09 and change demand |
| 7 | Solar output mechanisms | PV | 02 / H1/H2 | Explain a simulated output change from temperature or tilt |
| 8 | Solar value and system cost | COST | 02 / H1/H2 | Calculate generation-weighted capture price and distinguish LCOE |
| 9 | Storage energy balance | PSA | 03 / H2 | Build an hourly charge/discharge/efficiency/state-of-charge table |
| 10 | Storage dispatch | PSA | 03 / H2 | Compare storage/no storage; check power, energy and terminal constraints |
| 11 | Storage service cost | COST | 03 / H2 | Hold service fixed and vary efficiency and utilization |
| 12 | Solar-storage review | ESM | 03 / H2 | Draft a sprint separating scenario outputs from observations |
| 13 | Delivered industrial cost | COST | 05 / H4 | Separate energy, demand and tax charges within one geography |
| 14 | Heat-pump fundamentals | HEAT | 06 / H3/H4 | Draw energy flows and explain temperature lift with a qualified COP example |
| 15 | Industrial heat choices | HEAT | 07 / H4/H6 | Compare heat pump, resistance and storage by temperature and duty |
| 16 | Matched heat-service comparison | ESM | 07 / H4/H6 | Compare useful-heat costs; separate capital and operating costs |
| 17 | Grid and connection | PSA | 04 / H5 | Sketch two nodes, vary a line limit and explain congestion |
| 18 | EVs and flexible demand | ESM | 08 / H3/H5 | Compare fixed/flexible charging with equal mobility energy |
| 19 | Power electronics and components | DRIVE | 09 / H2/H6 | Map conversion stages and losses; control simulation is optional |
| 20 | System-constraint review | EUR | 12 / H4/H5 | Compare two regions on tariffs, connection and supply; avoid unsupported rankings |
| 21 | Material stocks and flows | MAT | 10 / H6 | Draw a mass balance separating additions, replacements and recycling |
| 22 | Components to material properties | MAT | 11 / H6 | Document one component: materials, duty, properties, failure and sources |
| 23 | Capstone investigation | EUR | 12 / H4/H5/H6 | Answer one factory question across service, region, cost, grid, materials and counterevidence |
| 24 | Reproduction and publication review | PUDL | 12 / H4/H5/H6 | Reproduce from instructions; prepare sprint and learning summary; review thesis changes separately |

## Six stage gates

| End of week | Deliverable | Passing condition |
| --- | --- | --- |
| 4 | Traceable data note | Values, units, missingness and calculations agree; source locators recorded |
| 8 | Solar-and-market note | Distinguish generation, capture price and system cost; explain a counterexample |
| 12 | Solar-storage mini-sprint | Balance energy; explain a sensitivity; label scenarios separately from facts |
| 16 | Industrial heat comparison | Same geography and useful heat; specify temperature, utilization and cost boundaries |
| 20 | Grid/end-use constraint map | Distinguish physical limits, price signals and administrative connection processes |
| 24 | Capstone and learning summary | Reproduce from sources, retain counterevidence and trace component/material requirements |

## GitHub resources and how to use them

Checked through GitHub API on 2026-10-08; none is archived. Last push indicates repository-wide activity, not tutorial freshness or a successful local run. ESM, PSA and COST form the core; use supplements when needed. HEAT is an older tutorial; MAT/ESM update less frequently. Pin their environments. DRIVE/BATT are optional advanced branches.

| Code / repository | Last push (UTC) | Entry and task |
| --- | --- | --- |
| ESM · [open-energy-transition/data-science-for-esm](https://github.com/open-energy-transition/data-science-for-esm) | 2025-10-22 | [Start here](https://github.com/open-energy-transition/data-science-for-esm/blob/main/data-science-for-esm/01-workshop-python.ipynb): Core: Python, arrays/plots, pandas, PyPSA, expansion and sector coupling; Linopy as needed. |
| PSA · [PyPSA/PyPSA](https://github.com/PyPSA/PyPSA) | 2026-10-08 | [Start here](https://github.com/PyPSA/PyPSA/blob/master/docs/examples/examples.md): System models: select dispatch, storage or sector-coupling examples and explain inputs, constraints and outputs. |
| PV · [pvlib/pvlib-python](https://github.com/pvlib/pvlib-python) | 2026-10-08 | [Start here](https://pvlib-python.readthedocs.io/en/stable/gallery/index.html): Solar supplement: position, temperature and output profiles; full device physics is optional. |
| COST · [PyPSA/technology-data](https://github.com/PyPSA/technology-data) | 2026-10-05 | [Start here](https://github.com/PyPSA/technology-data): Trace efficiency, lifetime, cost units and sources for three technologies; assumptions are not market quotes. |
| HEAT · [oemof/heat-pump-tutorial](https://github.com/oemof/heat-pump-tutorial) | 2024-07-19 | [Start here](https://github.com/oemof/heat-pump-tutorial/blob/main/simple-heat-pump-tespy.ipynb): Start with the simple TESPy heat pump, then part-load and solph; this older workshop needs an environment check. |
| MAT · [IndEcol/ODYM](https://github.com/IndEcol/ODYM) | 2025-09-26 | [Start here](https://github.com/IndEcol/ODYM/blob/master/docs/tutorials/tutorial_1.ipynb): Materials supplement: start with tutorial 1, system boundaries and mass balance; later tutorials are optional. |
| EUR · [PyPSA/pypsa-eur](https://github.com/PyPSA/pypsa-eur) | 2026-10-08 | [Start here](https://github.com/PyPSA/pypsa-eur): Advanced: inspect configuration, sources and limitations; defer full European runs. |
| PUDL · [catalyst-cooperative/pudl](https://github.com/catalyst-cooperative/pudl) | 2026-10-08 | [Start here](https://github.com/catalyst-cooperative/pudl): Data methods: provenance, cleaning and definitions; US data is not a proxy for China or the EU. |
| DRIVE · [Aalto-Electric-Drives/motulator](https://github.com/Aalto-Electric-Drives/motulator) | 2026-10-07 | [Start here](https://github.com/Aalto-Electric-Drives/motulator/tree/main/examples): Optional motor/grid-converter branch requiring circuits and control prerequisites. |
| BATT · [pybamm-team/PyBaMM](https://github.com/pybamm-team/PyBaMM) | 2026-10-08 | [Start here](https://github.com/pybamm-team/PyBaMM): Optional battery-physics branch after system storage; cell results do not establish plant economics. |

## Start with week one

1. Begin with ESM tutorial 01: variables, lists, arithmetic and a small table. Experienced users can focus on data boundaries.
2. Explain MW versus MWh, capacity versus generation, sales versus stock, and observation versus publication dates.
3. Calculate energy for 25 MW operating for 4 hours. Explain why annual output needs operating assumptions. These numbers are teaching assumptions.
4. Select one existing research claim and record source, table/page, geography, period, units and one conclusion it cannot support.
5. Write a short note: what did I confuse, and what evidence is still missing? Pass the units/boundaries check before continuing.

## From learning to publication

Accumulate personal notes weekly. At each stage gate, curate one bilingual Learning article. Weeks 12, 16 and 24 can become Research Sprints; source and semantic review precede any edition. Keep calculations, execution logs and personal progress in the research workspace; publish curated explanations and sources. Exercises never automatically change evidence status or thesis confidence.

## The following half-year and version maintenance

After the first pass, deepen the original twelve modules: months 7–8 reproduce one solar-storage or heat case; months 9–10 deepen grids, power electronics and materials; months 11–12 compare regions and reassess hypotheses. Choose one question at a time. PyBaMM, motulator and full-scale PyPSA-Eur are optional.

Review core releases and breaking changes monthly. Record a commit/tag, environment, input sources and dates when starting an exercise. Avoid changing versions midway. Keep tutorial environments separate from the research environment and follow the selected version's installation instructions. The project has not yet installed or run these tutorials; checked links do not guarantee they run.
