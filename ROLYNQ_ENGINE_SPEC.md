# Rolynq Technical Specification: The 12-Dimension Engine

This document provides the exhaustive mathematical breakdown of the **Rolynq Job Assistant**. It details exactly how every score is calculated, how features interact, and the deterministic logic used to replace "Black Box" AI.

---

## 1. The Global Scoring Formula
The final **Fit Score** is a weighted average of 12 distinct dimensions ($D_1$ to $D_{12}$). 

$$Score_{Final} = \sum_{i=1}^{12} (Dimension\_Value_i \times \frac{Weight_i}{100})$$

The final integer value determines the **Suggested Action**:
- **75+**: 🟢 `Apply Now` (High Probability Match)
- **55-74**: 🔵 `Email Recruiter` (Needs Personal Touch)
- **35-54**: 🟠 `Save for later` (Partial Match)
- **<35**: ⚪ `Skip` (Low Alignment)

---

## 2. Dimension-by-Dimension Calculation

### D1: Keyword Match (Weight: 14%)
- **Formula:** $min(100, (\frac{Overlap\_Count}{40}) \times 100)$
- **Logic:** We extract every unique 4+ letter word from your Resume and the JD. We calculate the mathematical intersection (overlap). 40 unique keyword matches are required for a perfect 100% in this dimension.

### D2: Semantic Match (Weight: 15%)
- **Formula:** $(\frac{Found\_Categories}{Total\_Categories}) \times 100$
- **Logic:** Uses the `SYNONYMS` dictionary. If your resume contains "GTM" and the JD contains "Growth", the "gtm" category triggers a match. We scan for 5 major categories (GTM, Product, Data, AI/ML, BizDev).

### D3: Functional Overlap (Weight: 13%)
- **Formula:** $min(100, (\frac{Match\_Count}{3}) \times 100)$
- **Logic:** Scans for alignment across the "Big 4" Startup functions: Product, Operations, Strategy, and Growth. 3 matching function-buckets achieve a 100% score.

### D4: Seniority Calibration (Weight: 10%)
- **Formula:** Non-linear logic.
  - **High Seniority JD** (VP/Director): 20% (Assumes "Over-qualification" or "Gap").
  - **Low Seniority JD** (Junior/Associate): 40%.
  - **Neutral/Mid JD**: 90% (Sweet spot for 3-7 year experienced consultants).

### D5: Output Deliverables (Weight: 10%)
- **Formula:** $min(100, Count \times 35)$
- **Logic:** Does the job specifically mention creating **Specs**, **Presentations (Decks)**, or **Analysis (Dashboards)**? Each matching output type grants 35 points.

### D6: Authority Verbs (Weight: 9%)
- **Formula:** $50 + (High\_Verbs \times 15) - (Low\_Verbs \times 15)$
- **Logic:** Base score is 50. Words like "Lead", "Own", "Drive" (High) add 15 points. Words like "Support", "Assist" (Low) subtract 15 points.

### D7: Archetype Fit (Weight: 9%)
- **Formula:** Heuristic Mapping.
  - **Seed/Stealth**: 100% (High speed, high risk).
  - **Series A-C**: 80% (Hypergrowth scale-up).
  - **Corporate**: 20% (Slower speed, lower alignment for EIR/Startup profiles).

### D8: Industry Adjacency (Weight: 8%)
- **Formula:** 100% for "Highest" (AI, SaaS, Fintech, VC), 70% for "Medium", 20% for "Lowest" (Manufacturing, Mining). 

### D9: Founder Language Ratio (Weight: 7%)
- **Formula:** Logic Branching.
  - **Founder Language > HR Language**: 90% score (Direct to founder potential).
  - **HR Language > Founder Language**: 30% score (High bureaucracy signal).

### D10: Timing Score (Weight: 6%)
- **Formula:** Fixed at 85% for all fresh API pulls via Adzuna/JSearch.

### D11: Learning Curve (Weight: 5%)
- **Formula:** Inverse Ratio Scan.
  - **Over-specialized** (>80% word overlap): 40% (No growth room).
  - **Under-specialized** (<20% overlap): 30% (Steep mountain).
  - **The Sweet Spot** (20-80%): 95% (Perfect growth role).

### D12: Geo-Mobility (Weight: 4%)
- **Formula:** 100% for "India" or "Remote", 60% for International/Unknown.

---

## 3. Automated Outreach Calculation

The **Email Engine** (`backend/app.py`) follows a 3-step generation logic:

1. **Template Selection:** Randomly picks from 3 high-conversion recruiter templates.
2. **Hook Extraction:** Scans the JD for the most relevant "Hook" keywords (e.g., "AI Strategy", "Scaling Growth").
3. **Skill Injection:** Injects your "Top Skills" based on the overlap found in $D_1$.

---

## 4. Connector Functionality

- **Google Sheets:** POSTs a JSON payload including `job_title`, `company`, `score`, and `suggested_action` to the Sheets API.
- **Notion:** Creates a "Database Page" with custom properties for tracking the application funnel.
- **Slack:** Broadcasts a "Hot Lead Alert" for any job where $Final\_Score \geq 75$.

---

> [!IMPORTANT]
> **Why No AI?** By using this deterministic math instead of an LLM, your scoring is **100% reproducible**, it costs **$0.00** per search, and it respects the maximum privacy of your resume data. 
