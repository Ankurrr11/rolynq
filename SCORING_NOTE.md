# ankur.hunt Scoring Note

## How Jobs Are Scored

Every job listing is evaluated against my resume using a rule-based keyword matching engine running locally in Python. No paid APIs are used for scoring. The engine scans job titles and descriptions against curated keyword dictionaries mapped to my profile, producing a 0-100 weighted composite score with per-criterion breakdowns.

## Criteria and Weights

**Role Fit (30%)** — Matches job title against three tiers of target role keywords. Tier 1 (80-95): Chief of Staff, EIR, Product Manager, Strategy & Ops, VC roles. Tier 2 (40-65): Operations Manager, Business Development, Analyst. Tier 3 (5-25): Software Engineer, Designer, Support, pure Sales. Falls back to description scanning if title is ambiguous.

**Skill Overlap (25%)** — Checks 10 skill categories (GTM, product, data, AI/ML, pre-sales, strategy, stakeholder management, bizdev, project management, technical tools) against the JD. Also penalizes for anti-skills I don't have: React, Kubernetes, chartered accountancy, etc.

**Industry Alignment (18%)** — Three-tier keyword detection. High: AI, SaaS, B2B, DeepTech, VC, FinTech, consulting, social sector. Medium: e-commerce, gaming, logistics. Low: manufacturing, government, BPO, telecom.

**Growth Signal (15%)** — Detects funding keywords (Series A/B/C, YC, "raised"), startup energy ("zero to one", "founding team"), vs large-company signals ("Fortune 500", "MNC", "public sector").

**Seniority Match (12%)** — Positive: "associate", "analyst", "0-3 years", "entry-level". Negative: "director", "VP", "10+ years". Neutral: "manager", "3-5 years". Lowest weight because seniority mismatches are easy to filter manually.

## What I Excluded

**Location**: Open to relocating anywhere in India. Including it would create false negatives for good roles in cities I'd happily move to.

**Salary**: Unreliably published in Indian job listings. Would penalize startups that don't list comp.

**Company Brand**: Not a proxy for role quality. A 20-person startup nobody has heard of may offer a far better operator opportunity than a brand-name company with a narrow role.

## Where Does the Leena AI EIR Land?

The Leena AI EIR role appears organically in search results when searching for "Entrepreneur in Residence AI startup" (the default search query). It scores in the **top tier** because: EIR is a direct Tier 1 target role (role fit: very high), the description mentions GTM, product thinking, AI/ML, B2B SaaS, strategy (skill overlap: very high), Leena AI is an enterprise AI company (industry: max), it's Series B funded and growing (growth: high), and the role doesn't specify senior requirements (seniority: good fit).
