# Claude‑Ready Blueprint — AdCreative.ai Killer (Text‑Only, No Code)

> Goal: Build an app that *outperforms* **AdCreative.ai** on creative quality, performance prediction, policy safety, workflow speed, and enterprise controls. This is a precise, code‑free spec Claude can turn into tickets, API drafts, tests, runbooks, and GTM copy.
>
> Date: 2025‑08‑25 · Replace \[placeholders]. No code in this file.

---

## 0) Positioning & North Star

* **Working Name:** *CreativePilot Pro*
* **One‑liner:** “Performance‑first AI studio for ads and social—predict, generate, and ship creatives that win, with proof.”
* **Primary Users:** Performance marketers, e‑commerce teams, agencies (2–50 accounts), brand managers.
* **North‑Star Metric:** Share of creatives that beat account median by **+20% CTR** or **‑15% CPA** within 14 days at ≥1,000 impressions.
* **Key Differentiators vs. AdCreative.ai:**

  1. **Performance Brain** — model‑based *preflight* scoring tied to *your* account data + continuous back‑testing.
  2. **Experiment Automation** — auto‑design tests, enforce guardrails, promote winners, pause fatigued variants.
  3. **Creative OS** — static, video, carousel, story, and catalog overlays with brand kits + angle taxonomy.
  4. **Compliance Cop** — platform policy linting pre‑publish; regulated vertical packs; instant safe rewrites.
  5. **Enterprise‑grade** — roles/approvals, content credentials (C2PA), rights management, audit & data residency.

---

## 1) Scope (MoSCoW)

**Must (MVP, 8–10 weeks)**

1. **Brand Kit & Assets**: logos, fonts, colors, tone; rights & expiry; auto‑apply across outputs.
2. **Multi‑format Generation**: image, carousel, story, square/portrait; variant batcher (4–12 per angle).
3. **Copy Studio**: headlines/primary text/descriptions with angle library; regulated‑claims rails.
4. **Performance Brain v1**: creative *preflight* score, uncertainty band, and win‑probability vs. control.
5. **Experiment Designer**: A/B templates (budget, duration, min‑sig), holdouts, auto‑promote winners.
6. **Compliance Cop v1**: policy linting for Meta/Google/LinkedIn; safe rewrite suggestions before publish.
7. **Integrations v1**: Meta Ads, Google Ads, LinkedIn Ads; storage (GDrive/S3); Shopify product ingest.
8. **Insights Hub v1**: creative leaderboard, fatigue alerts, angle contribution, blended MER/ROAS.

**Should (Post‑MVP)**

* Video storyboard → text‑to‑video; voiceover; subtitles; catalog overlays with price/%OFF/rating.
* DCO presets (audience × placement × offer); inventory‑aware pausing for e‑commerce.
* C2PA content credentials stamp; creative provenance and tamper‑evidence.

**Could**

* Pinterest/TikTok connectors; MMM hooks; agency billing; white‑label.

**Won’t (for now)**

* Fully autonomous media buying; complex MMM; bespoke on‑prem deployments.

---

## 2) Users, JTBD, Use Cases

**JTBD**: When launching or scaling paid social/search, I need *fast, on‑brand creatives* that are *likely to win*, with *policy safety* and *provable lift*—so I can grow revenue without wasting budget.

**Top Use Cases**

* UC‑1: Launch a new offer → generate 8–16 angle‑tagged variants, preflight score them, deploy top 4 with a 7‑day test.
* UC‑2: Beat fatigue → diagnose best/worst angles, refresh with 6 new variants, enforce frequency caps.
* UC‑3: Catalog sprint → overlay price/USPs/ratings on top sellers; rule‑based product sets by margin/stock.

---

## 3) “Steroid” Features (Differentiation)

1. **Performance Brain**

* Inputs: account metrics (impr/CTR/CVR/CPA), audience/placement, creative features (layout, color, text length, hook type), brand kit.
* Outputs: score 0–100 with uncertainty; win‑prob vs. control; reasons; improvement tips.
* Learning: daily back‑testing; drift detection; per‑vertical priors; human feedback loop.

2. **Experiment Automation**

* Test templates: Creative A/B, geo/time holdout, angle vs. angle; min sample & power checks; guardrails (CPA/MER bands).
* Automation: schedule, budget pacing, promotion rules (e.g., promote if lift ≥+15% CTR & p<0.1 for 48h), auto‑pause losers.

3. **Creative OS**

* Formats: static, video (storyboard → scenes → text‑to‑video), carousel, story/reel; multi‑locale.
* Brand kit enforcement; angle taxonomy (Hook/Benefit/Objection/Social proof/Offer) with variant matrix.
* Catalog overlays: price/%OFF/star rating/USPs; RTL/LTR; shop‑feed rules; safe zones per placement.

4. **Compliance Cop**

* Platform policy linting; risky‑claims detector; regulated packs (health, finance, housing, employment, politics).
* Pre‑publish gate; one‑click safe rewrite; evidence log for approvals.

5. **Enterprise & Safety**

* Roles: Creator/Reviewer/Approver/Publisher; checklist gates.
* **C2PA** provenance; asset rights/expiry; audit log; data residency (EU/US); SSO/SAML.

---

## 4) Non‑Functional Requirements (Quality Bars)

* **Performance:** p95 UI < 300 ms; preflight score < 3 s; batch generation (12 variants) < 60 s.
* **Reliability:** 99.9% SLO; publish idempotency; event loss < 0.5%.
* **Security/Privacy:** SOC2‑ready controls; least‑privilege; hashing for PII; consent propagation.
* **Accessibility:** WCAG 2.2 AA across primary flows.
* **Localization:** EN at launch; FR/DE/ES/pt‑BR by Wk 8; i18n for copy/overlays.

---

## 5) Domain Model (Text‑Only)

* **Workspace** (org, roles, data residency, audit)
* **Brand** (kit, tone, compliance pack, rights)
* **Project** (offer, audience, placements, KPIs)
* **Creative** (format, angle tags, assets, score, status, provenance)
* **Experiment** (design, variants, budgets, guardrails, outcomes)
* **Integration** (ad accounts, storage, shop feeds)
* **Insight** (leaderboard, fatigue, contribution, anomalies)

---

## 6) API Surface (Text‑Only)

* **/auth/connect** — OAuth to Meta/Google/LinkedIn; scopes; token lifetimes.
* **/brand/kit** — CRUD brand assets, rules, tone; rights/expiry.
* **/generate** — request batch (format, angles, locales); returns creative IDs + ETA + cost.
* **/score/preflight** — inputs (creative IDs or files + context) → score, uncertainty, reasons, tips.
* **/experiment** — design templates; schedule; guardrails; promotion rules; status.
* **/publish** — push to platforms; map placements; verify policy pass.
* **/insights** — leaderboards; fatigue; contribution; export.

Each endpoint documented separately with fields, validations, rate limits, errors, idempotency.

---

## 7) Integrations & Data

* **Ads:** Meta Ads, Google Ads, LinkedIn Ads (read KPIs, publish creatives; respect limits).
* **Commerce:** Shopify (products, inventory, price, reviews); rule‑based sets.
* **Storage:** GDrive/Dropbox/S3; signed URLs; retention policy.
* **Telemetry:** platform metrics; creative features (vision/NLP embeddings); consent.

---

## 8) Insights & Measurement

* Creative contribution (Shapley‑style approximation) to clicks/conv.
* Fatigue detector: trend, frequency, reach thresholds; refresh suggestions.
* Angle analytics: which hooks/benefits win by audience/placement.
* Lift: simple holdouts; sequential testing; guardrails; anomaly feed.

---

## 9) Security, Privacy, Compliance

* SSO/SAML, RBAC, audit trails; exportable logs.
* C2PA content credentials on export; watermark option.
* Data minimization; hashed PII; retention (configurable 3–24 months); DSR automation.
* Regulated packs: pre‑approved language banks; prohibited claim lists per region.

---

## 10) Architecture (Text‑Only)

* **FE:** embedded app (Shopify optional) + web; offline cache; error boundaries.
* **BE:** stateless API; workers for generation/scoring/publishing; queue; retries with jitter; DLQs.
* **AI:** LLM for copy; diffusion/video for visuals; performance model (tabular + embeddings) with nightly back‑tests.
* **Data:** OLTP (configs/results); object store (assets); warehouse (analytics) + feature store.
* **Realtime:** webhooks → processors; websocket notifications.

---

## 11) Observability & Ops

* Metrics: latency p50/95/99; error rate; queue depth; variant success rate; fatigue incidents.
* Alerts: publish failures; score service drift; asset rights expiry; policy block spikes.
* Runbooks: disapproval → rewrite; token expiration; drift remediation; failed batch; rights takedown.

---

## 12) Analytics & Experimentation

* Events: generate\_requested/completed; score\_issued; experiment\_started/promoted; publish\_ok/failed.
* Dashboards: win rate; lift over time; angle trends; fatigue by placement.
* Tests: power analysis helper; guardrails; cooldowns; min sample enforcement.

---

## 13) Pricing & Packaging (Proposed)

* **Starter** (€39/mo): 1 workspace; 5 projects; 300 monthly generations; scoring; 2 integrations.
* **Growth** (€149/mo): 3 workspaces; 10 projects; 2,000 generations; experiment automation; policy cop; catalog overlays.
* **Scale** (€499/mo): unlimited projects; video storyboard; C2PA; SSO/SAML; data residency; premium support.
* **Overages**: usage blocks; fixed add‑ons (extra generations, scoring credits).

---

## 14) Roadmap (90 Days)

* **Wk 0–1:** finalize spec; define scoring rubric; risk register.
* **Wk 2–5:** MVP: Brand Kit, Generate (static), Score v1, Experiment Designer, Meta/Google connect, Insights v1.
* **Wk 6–8:** Compliance Cop, LinkedIn, Catalog overlays, Fatigue detector.
* **Wk 9–12:** Video storyboard → text‑to‑video alpha; C2PA export; GA with 10 design partners.

Exit criteria: ≥70% onboarding completion; ≥60% tests reach decision; ≥30% of new creatives beat control.

---

## 15) Risks & Mitigations

* **Platform policy changes** → feature flags; contract tests.
* **Model drift** → nightly back‑tests; shadow evals; rollback.
* **Rights violations** → mandatory rights metadata; expiry alerts; takedown workflow.
* **Regulatory risk** → regional policy packs; human review for regulated verticals.

---

## 16) Claude Prompt Library (Text‑Only)

* “Draft *Performance Brain v1* scoring rubric (features, weights, uncertainty) and back‑testing protocol.”
* “Generate *Experiment Designer* templates with guardrails and promotion rules; map to acceptance criteria.”
* “Write *Compliance Cop* lint rules by platform and regulated vertical; propose safe rewrites.”
* “Propose *Catalog Overlay* themes by vertical; define safe zones per placement.”
* “Create *Runbooks* for publish failure, policy disapproval, token expiry, score drift.”
* “Draft *QA cases* for generation, scoring, experiment, and compliance flows.”

---

## 17) Open Questions

1. Priority verticals (e.g., Apparel, Beauty, Home)?
2. Initial locales and data residency? (EU/US)
3. Default guardrails for CPA/MER by vertical?
4. Which video formats first (UGC, slideshow, animated overlays)?
5. Agency needs at launch (multi‑workspace billing, approvals)?

---

### End of Blueprint
