# Rolynq: The 12-Dimensional Recruitment OS

**Rolynq** is a high-performance, offline-capable job search and application engine designed specifically for elite candidates (Chief of Staff, APM, EIR, Strategy). It replaces generic, black-box AI algorithms with a deterministic, 12-dimensional rule-based scoring engine and automated outreach tools.

---

## 1. Technical Architecture

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | Python (Flask) | Rule-based scoring, Regex Parsing, API Connectors. |
| **Frontend** | React (Vite) | Premium consulting-grade dashboard, Real-time state management. |
| **Parsing** | PyPDF2 | Local, secure PDF ingestion (zero external data leaks). |
| **Database** | JSON / Excel / Notion | Multi-channel data persistence across three platforms. |

---

## 2. Core Features & Capabilities

### 🏢 Premium Consulting UI (MBB Theme)
Rolynq is inspired by the design language of McKinsey, BCG, and Bain. 
- **Palette:** Deep Emerald Green (#005F4B) and Pristine White (#FFFFFF).
- **Interactions:** Subtle vertical lifts on hover, geometric 4px card systems, and high-readability slate typography.
- **Micro-Animations:** Fluid loading states and high-performance list rendering.

### 🎯 12-Dimensional Scoring Engine
The heart of Rolynq is a deterministic heuristic engine located in `backend/scoring_engine.py`. It calculates a composite "Fit Score" (0-100) using the following weights:

| Dimension | Weight | Metric Logic |
| :--- | :--- | :--- |
| **Semantic Match** | 15% | Uses `SYNONYMS` dictionary to map "GTM" to "Launch" or "Growth". |
| **Keyword Overlap** | 14% | Calculates the raw intersection of skills vs. description. |
| **Functional Match** | 13% | Checks alignment in "B2B SaaS", "AI Product", or "Data Strategy". |
| **Seniority Level**| 10% | Penalizes under-qualified and over-qualified matches. |
| **Authority Verbs**| 9% | Scans for "Lead", "Direct", "Own" (High) vs. "Support", "Assist" (Low). |
| **Company Fit** | 9% | Detects Archetypes: Seed/Early Startup vs. Mature Corporate. |
| **Founder Ratio** | 7% | Detects if the JD is written by a Founder or a standardized HR bot. |
| **Output Type** | 10% | Matches specific artifacts you build (AI Agents, Dashboards, Reports). |
| **Curve/Geo** | 13% | Location proximity and the "Learning Curve" penalty/bonus. |

### 📧 Automated Outreach Engine
- **Recruiter Extraction:** Real-time regex scanner detects emails hidden inside job descriptions.
- **Dynamic Drafting:** Selecting "Email" opens the `EmailModal`, which randomly selects from three pre-validated professional templates.
- **Placeholder Injection:** The backend automatically injects a "Hook" based on JD content (e.g., "AI Trajectory" or "Series A Growth") and your most relevant skills.

---

## 3. Integrated Connectors

Rolynq is designed to fit your existing professional workflow:
- **Google Sheets:** Log every scored job, its rationale, and its metadata into a live tracker.
- **Notion:** Automatically create a structured "Lead Card" in your hiring database.
- **Slack:** Send real-time notifications for "Hot Leads" (Score >= 75) to yourself or a channel.
- **Gmail:** Native API integration for sending drafted outreach directly from the dashboard.

---

## 4. Operational Setup

1. **Environment Config**: Use `.env` to store your `JSEARCH_API_KEY`, `GOOGLE_SHEETS_ID`, and `NOTION_TOKEN`.
2. **Resume Synchronization**: Click "Score" on any job to securely synchronize your local resume PDF with the session.
3. **Pipeline Management**: Scored jobs move from the general "Search" tab to the "Pipeline" and "Hot Leads" sections for tracking.

---

> [!TIP]
> **Rolynq** is built for speed and privacy. No job description or resume content ever leaves your local machine for "AI training." The scoring is 100% deterministic and runs in microseconds. 
