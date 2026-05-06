"""
ankur.hunt — Flask Backend
Rule-based scoring, template emails, multi-source job search
Free APIs: Remotive, RemoteOK, Arbeitnow (no key), SerpAPI (optional), Gmail, Sheets, Notion, Slack
"""

import os
import json
import base64
import datetime
import re
import hashlib
import random
import uuid
from pathlib import Path

import requests as http_requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from outreach_engine import generate_outreach
from lead_finder import find_leads

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
instance_path = os.path.join(basedir, 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(instance_path, 'rolynq.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class JobRecord(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(200))
    company = db.Column(db.String(200))
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    link = db.Column(db.Text)
    source = db.Column(db.String(50))
    posted = db.Column(db.String(50))
    score = db.Column(db.Integer)
    data_json = db.Column(db.JSON) # Full job data
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class ActivityRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), default="default")
    action = db.Column(db.String(50))
    job_title = db.Column(db.String(200))
    company = db.Column(db.String(200))
    detail = db.Column(db.Text)
    time = db.Column(db.String(50))

with app.app_context():
    db.create_all()

# In-memory cache for speed, but synced with DB
job_store = {} 

# ═══════════════════════════════════════════════
# ANKUR'S PROFILE
# ═══════════════════════════════════════════════

PROFILE = {
    "name": "Ankur",
    "current_role": "Associate Product Manager & Chief of Staff at DevKraft Technologies",
    "experience_years": "1-3",
    "education": "MA Economics & International Trade (IIFT Delhi), BA Economics Hons (Motilal Nehru College, Delhi University)",
    "target_roles": [
        "Chief of Staff", "Founder's Office", "Entrepreneur in Residence", "EIR",
        "Associate Product Manager", "Product Manager", "Strategy & Operations",
        "Growth Manager", "VC Analyst", "VC Associate", "Investment Analyst",
        "Management Consultant", "Business Analyst", "Program Manager"
    ],
    "preferred_industries": [
        "AI/ML", "SaaS", "B2B Enterprise", "DeepTech", "Venture Capital",
        "FinTech", "EdTech", "Enterprise Software", "Management Consulting",
        "Social Sector", "HealthTech"
    ],
    "key_skills": [
        "GTM Strategy", "Product Management", "Data Analytics", "AI/ML Products",
        "Pre-sales", "Strategy & Operations", "Stakeholder Management",
        "Market Research", "Business Development", "Project Management",
        "SQL", "Python", "Power BI", "Tableau", "Technical Writing",
        "Cross-functional Leadership"
    ],
    "highlights": [
        "Led Project Denali: data analytics platform for a global sports conglomerate",
        "Built Chanakya: AI-powered HR platform with resume parsing and JD matching",
        "Developed AI Insurance Claim Assistant",
        "Owned full GTM strategy and pre-sales for B2B SaaS products",
        "Represented DevKraft at GITEX Dubai with live enterprise demos",
        "Co-founded Women's Development Cell, led gender equity initiatives",
        "MA Economics from IIFT with trade policy specialization"
    ],
    "preferred_company_stages": [
        "Series A to C startups", "VC-backed firms", "Unicorns",
        "Consulting firms", "Social sector organizations"
    ]
}

SCORING_WEIGHTS = {
    "role_fit": 30,
    "skill_overlap": 25,
    "industry_alignment": 18,
    "growth_signal": 15,
    "seniority_match": 12
}

# ═══════════════════════════════════════════════
# RULE-BASED SCORING ENGINE
# ═══════════════════════════════════════════════

ROLE_FIT_HIGH = [
    "chief of staff", "cos", "founder's office", "founder office",
    "entrepreneur in residence", "eir", "product manager", "associate product manager",
    "apm", "strategy", "strategy & operations", "strategy and operations",
    "growth manager", "growth lead", "vc analyst", "vc associate",
    "investment analyst", "venture capital", "management consultant",
    "business analyst", "program manager", "business operations",
    "general manager", "special projects", "strategic initiatives"
]
ROLE_FIT_MED = [
    "operations manager", "operations analyst", "project manager",
    "business development", "partnerships", "account manager",
    "marketing manager", "analyst", "associate", "consultant",
    "coordinator", "category manager", "product analyst"
]
ROLE_FIT_LOW = [
    "software engineer", "sde", "frontend developer", "backend developer",
    "full stack", "devops", "sre", "data engineer", "ml engineer",
    "machine learning engineer", "ui/ux designer", "graphic designer",
    "accountant", "hr manager", "recruiter", "legal", "compliance",
    "sales executive", "telesales", "customer support", "support engineer",
    "content writer", "copywriter", "seo specialist"
]

SKILL_CATEGORIES = {
    "gtm": ["gtm", "go to market", "go-to-market", "market entry", "launch strategy", "market strategy"],
    "product": ["product management", "product manager", "product strategy", "roadmap", "prd", "user stories", "agile", "scrum", "product lifecycle"],
    "data": ["data analytics", "data analysis", "analytics", "dashboard", "sql", "python", "power bi", "tableau", "metrics", "kpi", "reporting"],
    "ai_ml": ["ai", "artificial intelligence", "machine learning", "ml", "nlp", "llm", "generative ai", "deep learning"],
    "presales": ["pre-sales", "presales", "demo", "client facing", "client-facing", "rfp", "proposal", "solution selling"],
    "strategy": ["strategy", "strategic", "business strategy", "competitive analysis", "market research", "market sizing"],
    "stakeholder": ["stakeholder", "cross-functional", "cross functional", "c-suite", "ceo", "leadership", "executive"],
    "bizdev": ["business development", "partnerships", "bd", "alliances", "channel partner"],
    "project": ["project management", "program management", "pmo", "delivery", "execution", "timeline"],
    "technical": ["sql", "python", "api", "technical", "saas", "b2b", "enterprise software", "cloud"]
}

INDUSTRY_HIGH = ["ai", "artificial intelligence", "machine learning", "saas", "b2b", "enterprise",
    "deeptech", "deep tech", "venture capital", "vc", "fintech", "edtech",
    "healthtech", "consulting", "management consulting", "social impact", "development sector"]
INDUSTRY_MED = ["e-commerce", "ecommerce", "marketplace", "d2c", "consumer tech",
    "media", "gaming", "travel", "logistics", "supply chain", "agritech", "proptech", "insurtech"]
INDUSTRY_LOW = ["manufacturing", "automotive", "oil and gas", "mining", "construction",
    "real estate", "fmcg", "telecom", "government", "defence", "pharma", "bpo", "outsourcing"]

GROWTH_HIGH = ["series a", "series b", "series c", "seed", "pre-seed", "funded", "raised",
    "unicorn", "yc", "y combinator", "startup", "early stage", "early-stage",
    "fast growing", "fast-growing", "hypergrowth", "zero to one", "0 to 1",
    "greenfield", "founding team", "first hire", "building from scratch"]
GROWTH_MED = ["growth stage", "scale-up", "scaleup", "expanding", "growing team", "new vertical"]
GROWTH_LOW = ["mnc", "fortune 500", "large enterprise", "established", "government", "public sector"]

SENIORITY_POS = ["associate", "analyst", "junior", "entry level", "entry-level",
    "0-2 years", "1-3 years", "0-3 years", "1-2 years", "2-4 years",
    "fresher", "graduate", "early career", "early-career"]
SENIORITY_NEG = ["senior", "sr.", "lead", "principal", "staff", "director", "vp",
    "vice president", "head of", "c-level", "cto", "cfo",
    "5+ years", "7+ years", "8+ years", "10+ years", "15+ years"]
SENIORITY_MID = ["manager", "3-5 years", "2-5 years", "mid-level"]

ANTI_SKILLS = ["react", "angular", "vue.js", "java ", "c++", "rust", "kubernetes",
    "docker", "aws certified", "cisco", "networking", "chartered accountant",
    "ca ", "cpa", "nurse", "mbbs", "mechanical engineer"]


def _tier_score(text, high, med, low):
    t = text.lower()
    h = sum(1 for k in high if k in t)
    m = sum(1 for k in med if k in t)
    l = sum(1 for k in low if k in t)
    if h >= 3: return min(95, 75 + h * 5)
    if h >= 1: return min(88, 62 + h * 10)
    if m >= 2: return min(65, 40 + m * 8)
    if m >= 1: return 45
    if l >= 1: return max(10, 28 - l * 8)
    return 35


def score_role_fit(job):
    title = job.get("title", "").lower()
    desc = job.get("description", "").lower()
    th = sum(1 for k in ROLE_FIT_HIGH if k in title)
    tm = sum(1 for k in ROLE_FIT_MED if k in title)
    tl = sum(1 for k in ROLE_FIT_LOW if k in title)
    if th >= 1: return min(95, 78 + th * 7)
    if tm >= 1: return min(65, 45 + tm * 8)
    if tl >= 1: return max(5, 20 - tl * 8)
    dh = sum(1 for k in ROLE_FIT_HIGH if k in desc)
    if dh >= 2: return min(70, 50 + dh * 5)
    return 30


def score_skill_overlap(job):
    text = f"{job.get('title', '')} {job.get('description', '')}".lower()
    matches = sum(1 for cat, kws in SKILL_CATEGORIES.items() if any(k in text for k in kws))
    anti = sum(1 for k in ANTI_SKILLS if k in text)
    raw = (matches / len(SKILL_CATEGORIES)) * 100
    return min(100, max(0, int(raw - anti * 12)))


def score_industry(job):
    text = f"{job.get('company', '')} {job.get('title', '')} {job.get('description', '')}".lower()
    return _tier_score(text, INDUSTRY_HIGH, INDUSTRY_MED, INDUSTRY_LOW)


def score_growth(job):
    text = f"{job.get('company', '')} {job.get('description', '')}".lower()
    return _tier_score(text, GROWTH_HIGH, GROWTH_MED, GROWTH_LOW)


def extract_experience(text):
    """
    Extracts years of experience from text using regex.
    Returns (min_years, max_years) or (None, None).
    """
    text = text.lower()
    # Matches "3+ years", "3-5 years", "3 to 5 years", "3 years"
    m = re.search(r'(\d+)\s*(?:-|\+to|\+)\s*(\d*)\s*year', text)
    if m:
        start = int(m.group(1))
        end = int(m.group(2)) if m.group(2) else start + 2
        return start, end
    # Matches "fresher" or "entry level"
    if any(w in text for w in ["fresher", "entry level", "graduate", "0-1 year"]):
        return 0, 1
    return None, None

def score_seniority(job):
    text = f"{job.get('title', '')} {job.get('description', '')}".lower()
    min_exp, max_exp = extract_experience(text)
    
    # Store extraction in job for UI
    if min_exp is not None:
        job["experience_required"] = f"{min_exp}-{max_exp}Y" if min_exp != max_exp else f"{min_exp}Y+"
    else:
        job["experience_required"] = "Not specified"

    # Profile: 1-3 years
    p_min, p_max = 1, 3
    
    if min_exp is not None:
        if min_exp > p_max + 2: return 10 # Far too senior
        if min_exp > p_max: return 40     # Slightly senior
        if max_exp < p_min: return 60     # Slightly junior
        return 95 # Good match
        
    # Fallback to keyword matching if regex fails
    p = sum(1 for k in SENIORITY_POS if k in text)
    n = sum(1 for k in SENIORITY_NEG if k in text)
    m = sum(1 for k in SENIORITY_MID if k in text)
    if n >= 2: return max(5, 25 - n * 8)
    if n == 1 and p == 0: return 30
    if p >= 2: return min(95, 75 + p * 5)
    if p >= 1: return 75
    if m >= 1: return 60
    return 50


def extract_salary(text):
    """
    Attempts to extract salary from text using regex.
    """
    # Patterns for INR (e.g., 15-20 LPA, 15,00,000)
    inr_patterns = [
        r'(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:lpa|l|lakh)',
        r'(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:lpa|l|lakh)',
    ]
    # Patterns for USD (e.g., $100k - $150k)
    usd_patterns = [
        r'(?:\$|usd)\s*(\d+k?)\s*(?:-|to)\s*(\d+k?)',
    ]

    text = text.lower()
    
    # Try INR extraction
    for p in inr_patterns:
        m = re.search(p, text)
        if m:
            return f"₹{m.group(1)}L - ₹{m.group(2)}L"
            
    # Try USD extraction
    for p in usd_patterns:
        m = re.search(p, text)
        if m:
            min_s, max_s = m.group(1), m.group(2)
            if 'k' not in min_s: min_s += 'k'
            if 'k' not in max_s: max_s += 'k'
            return f"${min_s} - ${max_s}"
            
    return None

def estimate_salary(job):
    """
    Estimates market salary based on job title, company, and location.
    """
    # 0. Try to extract first
    extracted = extract_salary(job.get("description", ""))
    if extracted:
        return extracted

    title = job.get("title", "").lower()
    company = job.get("company", "").lower()
    loc = job.get("location", "").lower()
    desc = job.get("description", "").lower()
    
    # Base ranges (India context)
    is_foreign = any(c in loc for c in ["usa", "united states", "london", "europe", "uk", "remote", "worldwide"])
    base = 80 if is_foreign else 16 # Increased base to 16L INR
    
    multiplier = 1.0
    
    # 1. Company Tier
    top_tier = ["google", "meta", "amazon", "apple", "microsoft", "netflix", "uber", "airbnb", "atlassian", "goldman", "mckinsey", "bcg", "bain"]
    startups = ["unicorn", "series", "founding", "stealth", "y combinator", "yc", "backed"]
    
    if any(t in company for t in top_tier): multiplier *= 2.0 # Increased top tier multiplier
    elif any(s in company for s in startups) or any(s in desc for s in startups): multiplier *= 1.4
    
    # 2. Role Specificity
    if any(w in title for w in ["product", "cos", "chief of staff", "founder's office"]): multiplier *= 1.4
    if any(w in title for w in ["engineer", "tech", "data", "ml", "ai"]): multiplier *= 1.5
    if any(w in title for w in ["marketing", "sales", "ops", "operations"]): multiplier *= 1.1
    
    # 3. Seniority
    min_exp, _ = extract_experience(desc)
    if min_exp is not None:
        if min_exp >= 7: multiplier *= 2.2
        elif min_exp >= 4: multiplier *= 1.6
        elif min_exp >= 2: multiplier *= 1.2
    else:
        if any(w in title for w in ["senior", "lead", "sr", "head", "director"]): multiplier *= 1.8
        if any(w in title for w in ["vp", "chief", "founder"]): multiplier *= 2.8
        if any(w in title for w in ["junior", "intern", "associate"]): multiplier *= 0.7
    
    # 4. Location Premium
    if not is_foreign:
        if any(city in loc for city in ["bangalore", "bengaluru", "mumbai", "gurgaon", "gurugram", "noida"]): multiplier *= 1.25
    
    est_min = round(base * multiplier)
    est_max = round(est_min * 1.5)
    
    if is_foreign:
        return f"${est_min}k - ${est_max}k"
    
    return f"₹{est_min}L - ₹{est_max}L"

def score_job(job):
    bd = {
        "role_fit": score_role_fit(job),
        "skill_overlap": score_skill_overlap(job),
        "industry_alignment": score_industry(job),
        "growth_signal": score_growth(job),
        "seniority_match": score_seniority(job)
    }
    total = round(bd["role_fit"]*0.30 + bd["skill_overlap"]*0.25 +
                  bd["industry_alignment"]*0.18 + bd["growth_signal"]*0.15 +
                  bd["seniority_match"]*0.12)

    parts = []
    if bd["role_fit"] >= 70: parts.append(f"Strong role fit: '{job['title']}' matches target roles")
    elif bd["role_fit"] <= 35: parts.append(f"Weak role fit: '{job['title']}' is outside target functions")
    
    if bd["seniority_match"] >= 90: parts.append(f"Experience ({job.get('experience_required')}) matches your profile")
    elif bd["seniority_match"] <= 30: parts.append(f"Experience mismatch: job requires {job.get('experience_required')}")
    
    if bd["skill_overlap"] >= 70: parts.append("High skill overlap with GTM, product, analytics, strategy capabilities")
    elif bd["skill_overlap"] <= 35: parts.append("Low skill overlap with candidate's profile")
    
    if bd["industry_alignment"] >= 70: parts.append(f"{job['company']} is in a preferred industry")
    if bd["growth_signal"] >= 70: parts.append("Strong growth signals: startup energy or funding")
    
    if not parts: parts.append(f"Moderate fit for '{job['title']}' at {job['company']}")
    rationale = ". ".join(parts[:3]) + "."
    
    # 5. Skill Gap Identification
    job_text = f"{job.get('title', '')} {job.get('description', '')}".lower()
    missing_skills = []
    # Check for common high-value keywords that are NOT in candidate profile
    target_keywords = ["sql", "python", "product strategy", "gtm", "stakeholder management", 
                       "agile", "scrum", "data analytics", "market research", "growth",
                       "crm", "salesforce", "user research", "wireframing", "roadmapping"]
    
    candidate_skills = [s.lower() for s in PROFILE.get("key_skills", [])]
    
    for k in target_keywords:
        if k in job_text and k not in candidate_skills:
            # Only add if it's not already a partial match
            if not any(k in cs or cs in k for cs in candidate_skills):
                missing_skills.append(k.title())

    job["missing_skills"] = missing_skills[:4] # Store top 4 gaps
    job["salary_estimate"] = estimate_salary(job)

    action = "apply" if total >= 75 else "email" if total >= 55 else "save" if total >= 35 else "skip"
    return {
        "total_score": total, 
        "breakdown": bd, 
        "rationale": rationale, 
        "suggested_action": action,
        "missing_skills": missing_skills[:4],
        "salary": job["salary_estimate"]
    }


# ═══════════════════════════════════════════════
# TEMPLATE EMAIL GENERATION
# ═══════════════════════════════════════════════

TEMPLATES = [
    {"subject": "Re: {title} at {company}",
     "body": "Hi,\n\nI came across the {title} role at {company} and wanted to reach out directly.\n\nI'm currently the APM and Chief of Staff at DevKraft Technologies, where I've led a data analytics platform for a global sports conglomerate and built AI products including an HR automation tool and an insurance claim assistant. I hold an MA in Economics from IIFT Delhi.\n\nWhat drew me to {company} is {hook}. The {title} role aligns well with my background in {skills}.\n\nWould love to have a quick conversation about how I could contribute. Happy to jump on a 15 minute call at your convenience.\n\nBest,\nAnkur"},
    {"subject": "{title} opportunity at {company}",
     "body": "Hi,\n\nWriting to express my interest in the {title} position at {company}.\n\nQuick context: I work as APM and Chief of Staff at a B2B SaaS company, where I own GTM strategy, product builds (AI HR platform, insurance claim assistant), and client-facing pre-sales. I've also led a data analytics platform for a global sports conglomerate and represented our company at GITEX Dubai. My background is MA Economics from IIFT.\n\n{company}'s work in {hook} resonates with what I've been building toward. My mix of {skills} would translate well here.\n\nOpen to connecting whenever works.\n\nCheers,\nAnkur"},
    {"subject": "Interested in {title} at {company}",
     "body": "Hi,\n\nI noticed the {title} opening at {company} and it caught my attention.\n\nAbout me: I run product and strategy at DevKraft Technologies as APM and Chief of Staff. My work spans AI product development, data analytics for enterprise clients, and full GTM execution for B2B SaaS. I hold an MA in Economics from IIFT Delhi.\n\n{hook} is exactly the kind of challenge I'm looking for. With my background in {skills}, I think there's a genuine fit.\n\nWould be great to chat if you're open to it.\n\nBest,\nAnkur"},
]


def _hook(job):
    d = job.get("description", "").lower()
    c = job.get("company", "")
    if any(w in d for w in ["ai", "artificial intelligence", "machine learning"]): return f"the AI-driven approach {c} is taking"
    if any(w in d for w in ["series a", "series b", "funded", "raised"]): return f"the growth trajectory at {c}"
    if any(w in d for w in ["0 to 1", "zero to one", "greenfield"]): return f"the zero-to-one building at {c}"
    if any(w in d for w in ["enterprise", "b2b", "saas"]): return f"the enterprise focus at {c}"
    if any(w in d for w in ["startup", "early stage"]): return f"the startup energy at {c}"
    if any(w in d for w in ["social impact", "mission"]): return f"the mission-driven work at {c}"
    return f"what {c} is building and the scope of this role"


def _skills(job):
    text = f"{job.get('title', '')} {job.get('description', '')}".lower()
    m = {
        "GTM strategy": ["gtm", "go to market", "market", "launch"],
        "product management": ["product", "roadmap", "agile"],
        "data analytics": ["data", "analytics", "sql", "dashboard"],
        "AI product development": ["ai", "machine learning", "ml", "llm"],
        "strategy and operations": ["strategy", "operations"],
        "pre-sales": ["pre-sales", "presales", "demo", "client"],
    }
    matched = [k for k, vs in m.items() if any(v in text for v in vs)]
    return ", ".join(matched[:3]) if matched else "strategy, product thinking, and data analytics"


def generate_email_templates(job):
    # This is now handled by the outreach_engine.py
    return generate_outreach(job, PROFILE)


# ═══════════════════════════════════════════════
# JOB SOURCES — FREE APIs + OPTIONAL PAID
# ═══════════════════════════════════════════════

def _make_job(title, company, location, description, link, source, source_key, posted="", tags=None):
    jid = hashlib.md5(f"{title}{company}{source_key}".encode()).hexdigest()[:12]
    return {
        "id": jid, "title": title, "company": company,
        "location": location, "description": (description or "")[:2000],
        "posted": (posted or "").strip(), "schedule": "",
        "link": link, "source": source, "source_key": source_key,
        "thumbnail": "", "extensions": tags or [],
        "score": None, "score_breakdown": None, "rationale": None,
        "suggested_action": None, "status": "new"
    }


def fetch_remotive(query, limit=50):
    """Remotive API — free, no key. Fetches all and filters client-side."""
    resp = http_requests.get("https://remotive.com/api/remote-jobs", params={
        "limit": limit
    }, timeout=15)
    resp.raise_for_status()
    ql = [w.lower() for w in query.split() if len(w) > 2]
    jobs = []
    for item in resp.json().get("jobs", []):
        text = f"{item.get('title','')} {item.get('company_name','')} {' '.join(item.get('tags',[]))} {item.get('description','')}".lower()
        if any(q in text for q in ql):
            jobs.append(_make_job(
                title=item.get("title", ""),
                company=item.get("company_name", ""),
                location=item.get("candidate_required_location", "Anywhere"),
                description=item.get("description", ""),
                link=item.get("url", ""),
                source="Remotive", source_key="remotive",
                posted=item.get("publication_date", "")[:10],
                tags=item.get("tags", [])
            ))
    return jobs


def fetch_arbeitnow(query, limit=100):
    """Arbeitnow API — free, no key. Fetches all and filters client-side."""
    resp = http_requests.get("https://www.arbeitnow.com/api/job-board-api", params={
        "per_page": limit
    }, timeout=15)
    resp.raise_for_status()
    ql = [w.lower() for w in query.split() if len(w) > 2]
    jobs = []
    for item in resp.json().get("data", []):
        text = f"{item.get('title','')} {item.get('company_name','')} {item.get('description','')} {' '.join(item.get('tags',[]))}".lower()
        if any(q in text for q in ql):
            jobs.append(_make_job(
                title=item.get("title", ""),
                company=item.get("company_name", ""),
                location=item.get("location", ""),
                description=item.get("description", ""),
                link=item.get("url", ""),
                source="Arbeitnow", source_key="arbeitnow",
                posted=datetime.datetime.fromtimestamp(item["created_at"]).strftime("%Y-%m-%d") if isinstance(item.get("created_at"), (int, float)) else str(item.get("created_at", ""))[:10],
                tags=item.get("tags", [])
            ))
    return jobs


def fetch_adzuna(query, location="india", limit=20):
    """Adzuna API — free tier, 250 calls/month. Needs ADZUNA_APP_ID + ADZUNA_APP_KEY."""
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        raise ValueError("ADZUNA_APP_ID / ADZUNA_APP_KEY not set")
    country = "in" if "india" in location.lower() else "gb"
    resp = http_requests.get(f"https://api.adzuna.com/v1/api/jobs/{country}/search/1", params={
        "app_id": app_id, "app_key": app_key,
        "what": query, "results_per_page": limit,
        "content-type": "application/json"
    }, timeout=15)
    resp.raise_for_status()
    jobs = []
    for item in resp.json().get("results", []):
        jobs.append(_make_job(
            title=item.get("title", ""),
            company=item.get("company", {}).get("display_name", ""),
            location=item.get("location", {}).get("display_name", ""),
            description=item.get("description", ""),
            link=item.get("redirect_url", ""),
            source="Adzuna", source_key="adzuna",
            posted=item.get("created", "")[:10],
            tags=item.get("category", {}).get("label", "").split()
        ))
    return jobs


def fetch_jsearch(query, location="India", limit=10):
    """JSearch API (RapidAPI) — free tier 500/month. LinkedIn, Indeed, Glassdoor data."""
    key = os.getenv("JSEARCH_API_KEY")
    if not key:
        raise ValueError("JSEARCH_API_KEY not set")
    resp = http_requests.get("https://jsearch.p.rapidapi.com/search", params={
        "query": f"{query} in {location}",
        "num_pages": 1,
    }, headers={
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }, timeout=15)
    resp.raise_for_status()
    jobs = []
    for item in resp.json().get("data", []):
        src_name = item.get("job_publisher", "JSearch")
        src_key = src_name.lower().replace(" ", "_")
        jobs.append(_make_job(
            title=item.get("job_title", ""),
            company=item.get("employer_name", ""),
            location=f"{item.get('job_city','')}, {item.get('job_country','')}".strip(", "),
            description=item.get("job_description", ""),
            link=item.get("job_apply_link", "") or item.get("job_google_link", ""),
            source=src_name, source_key=f"jsearch_{src_key}",
            posted=item.get("job_posted_at_datetime_utc", "")[:10],
            tags=[item.get("job_employment_type", "")]
        ))
    return jobs


# ═══════════════════════════════════════════════
# SERPAPI (optional, needs key)
# ═══════════════════════════════════════════════

SERP_SOURCES = {
    "google_jobs": {"label": "Google Jobs", "site": "", "color": "#4285F4", "type": "google_jobs"},
    "linkedin": {"label": "LinkedIn", "site": "linkedin", "color": "#0A66C2", "type": "google_jobs"},
    "naukri": {"label": "Naukri", "site": "naukri.com/job-listings", "color": "#4A90D9", "type": "organic"},
    "indeed": {"label": "Indeed", "site": "indeed.com", "color": "#2164F3", "type": "google_jobs"},
    "iimjobs": {"label": "IIMJobs", "site": "iimjobs.com", "color": "#FF6B35", "type": "google_jobs"},
    "foundit": {"label": "Foundit", "site": "foundit.in", "color": "#6C5CE7", "type": "google_jobs"},
    "wellfound": {"label": "Wellfound", "site": "wellfound.com/jobs", "color": "#050505", "type": "organic"},
    "yc": {"label": "YC Startup", "site": "workatastartup.com/jobs", "color": "#F26522", "type": "organic"},
    "weekday": {"label": "Weekday", "site": "weekday.works", "color": "#000000", "type": "organic"},
    "instahyre": {"label": "Instahyre", "site": "instahyre.com/job", "color": "#1F2937", "type": "organic"},
    "cutshort": {"label": "Cutshort", "site": "cutshort.io/jobs", "color": "#6C5CE7", "type": "organic"},
    "greenhouse": {"label": "Greenhouse", "site": "boards.greenhouse.io", "color": "#2F764D", "type": "organic"},
    "lever": {"label": "Lever", "site": "jobs.lever.co", "color": "#262626", "type": "organic"},
    "ashby": {"label": "Ashby", "site": "jobs.ashbyhq.com", "color": "#5E48E8", "type": "organic"},
}


def fetch_full_jd(url):
    """
    Attempts to fetch the full job description from a URL using robust extraction.
    """
    if not url or "linkedin.com" in url or "naukri.com" in url: return None # These block simple scraping
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'}
        resp = http_requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        html = resp.text
        
        import re
        # Strip noisy elements
        html = re.sub(r'<(script|style|nav|footer|header|iframe|aside).*?>.*?</\1>', '', html, flags=re.DOTALL | re.IGNORECASE)
        
        # Look for common JD container patterns
        patterns = [
            r'<div[^>]*class="[^"]*(?:job-description|description|jd-content|job_details)[^"]*"[^>]*>(.*?)</div>',
            r'<section[^>]*class="[^"]*(?:job-description|description|jd-content)[^"]*"[^>]*>(.*?)</section>',
            r'<article[^>]*>(.*?)</article>',
            r'<div[^>]*id="[^"]*(?:job-description|description|jd-content)[^"]*"[^>]*>(.*?)</div>'
        ]
        
        best_match = None
        for p in patterns:
            m = re.search(p, html, flags=re.DOTALL | re.IGNORECASE)
            if m:
                content = m.group(1)
                if len(content) > (len(best_match or "")):
                    best_match = content
        
        if not best_match:
            # Fallback: Find the largest <div/> or <section/> with text
            best_match = html
            
        # Clean tags but preserve some spacing
        text = re.sub(r'<(p|br|div|li|h1|h2|h3)[^>]*>', '\n', best_match)
        text = re.sub(r'<[^>]*>', ' ', text)
        text = re.sub(r'&nbsp;', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        if len(text) > 200: return text
    except Exception as e:
        print(f"Full JD Fetch failed for {url}: {e}")
    return None

def fetch_serpapi(query, source_key, location="India", num=10):
    key = os.getenv("SERPAPI_KEY")
    if not key: raise ValueError("SERPAPI_KEY not set")
    src = SERP_SOURCES.get(source_key, {})
    
    loc_map = {
        "Gurugram/Gurgaon": "Gurugram, Haryana, India",
        "Mumbai": "Mumbai, Maharashtra, India",
        "Bangalore": "Bengaluru, Karnataka, India",
        "Hyderabad": "Hyderabad, Telangana, India",
        "Delhi NCR": "New Delhi, Delhi, India",
        "Noida": "Noida, Uttar Pradesh, India",
        "Pune": "Pune, Maharashtra, India",
        "India": "India",
        "Worldwide": ""
    }
    serp_loc = loc_map.get(location, location)
    
    jobs = []
    if src.get("type") == "organic":
        # Organic Search Fetching
        q = f"site:{src['site']} {query} {location}"
        params = {"engine": "google", "q": q, "api_key": key, "num": num}
        resp = http_requests.get("https://serpapi.com/search", params=params, timeout=30)
        resp.raise_for_status()
        
        for item in resp.json().get("organic_results", []):
            url = item.get("link", "")
            comp = src.get("label")
            if "greenhouse.io" in url:
                import re
                m = re.search(r"greenhouse.io/([^/]+)", url)
                if m: comp = m.group(1).title()
            elif "lever.co" in url:
                import re
                m = re.search(r"lever.co/([^/]+)", url)
                if m: comp = m.group(1).title()
            elif "ashbyhq.com" in url:
                import re
                m = re.search(r"ashbyhq.com/([^/]+)", url)
                if m: comp = m.group(1).title()

            desc = item.get("snippet", "")
            if any(ats in url for ats in ["greenhouse.io", "lever.co", "ashbyhq.com"]):
                full = fetch_full_jd(url)
                if full: desc = full

            jobs.append(_make_job(
                title=item.get("title", ""),
                company=comp,
                location=location,
                description=desc,
                link=url,
                source=src.get("label"),
                source_key=source_key,
                posted=item.get("date", "")
            ))
    else:
        # Google Jobs Engine Fetching
        q = f"{query} {src.get('site', '')}".strip()
        params = {
            "engine": "google_jobs", "q": q,
            "api_key": key, "num": num, "hl": "en"
        }
        if serp_loc:
            params["location"] = serp_loc
        elif location == "Worldwide":
            params["q"] += " remote"

        resp = http_requests.get("https://serpapi.com/search", params=params, timeout=30)
        resp.raise_for_status()
        for item in resp.json().get("jobs_results", []):
            links = item.get("apply_options", [])
            desc = item.get("description", "")
            if len(desc) < 500 and links:
                full = fetch_full_jd(links[0].get("link"))
                if full: desc = full

            jobs.append(_make_job(
                title=item.get("title", ""),
                company=item.get("company_name", ""),
                location=item.get("location", ""),
                description=desc,
                link=(links[0].get("link", "") if links else "") or item.get("share_link", ""),
                source=src.get("label", source_key), source_key=source_key,
                posted=item.get("detected_extensions", {}).get("posted_at", ""),
                tags=item.get("extensions", [])
            ))
    return jobs


# ═══════════════════════════════════════════════
# UNIFIED SEARCH
# ═══════════════════════════════════════════════

FREE_FETCHERS = {
    "remotive": fetch_remotive,
    "arbeitnow": fetch_arbeitnow,
}

KEYED_FETCHERS = {
    "adzuna": fetch_adzuna,
    "jsearch": fetch_jsearch,
}

ALL_SOURCES = {
    "remotive": {"label": "Remotive", "color": "#5850EC", "free": True},
    "arbeitnow": {"label": "Arbeitnow", "color": "#FF6B6B", "free": True},
    "adzuna": {"label": "Adzuna", "color": "#36B37E", "free": False},
    "jsearch": {"label": "JSearch", "color": "#F97316", "free": False},
    "google_jobs": {"label": "Google Jobs", "color": "#4285F4", "free": False},
    "linkedin": {"label": "LinkedIn", "color": "#0A66C2", "free": False},
    "naukri": {"label": "Naukri", "color": "#4A90D9", "free": False},
    "indeed": {"label": "Indeed", "color": "#2164F3", "free": False},
    "iimjobs": {"label": "IIMJobs", "color": "#FF6B35", "free": False},
    "foundit": {"label": "Foundit", "color": "#6C5CE7", "free": False},
    "wellfound": {"label": "Wellfound", "color": "#050505", "free": False},
    "yc": {"label": "YC Startup", "color": "#F26522", "free": False},
    "weekday": {"label": "Weekday", "color": "#000000", "free": False},
    "instahyre": {"label": "Instahyre", "color": "#1F2937", "free": False},
    "cutshort": {"label": "Cutshort", "color": "#6C5CE7", "free": False},
    "greenhouse": {"label": "Greenhouse", "color": "#2F764D", "free": False},
    "lever": {"label": "Lever", "color": "#262626", "free": False},
    "ashby": {"label": "Ashby", "color": "#5E48E8", "free": False},
}


def search_all(query, sources, location="India", company=""):
    # If company is provided, include it in the query for all fetchers
    search_q = f"{query} {company}".strip()
    all_jobs, seen, errors = [], set(), {}
    for src in sources:
        try:
            if src in FREE_FETCHERS:
                fetched = FREE_FETCHERS[src](search_q)
            elif src in KEYED_FETCHERS:
                fetched = KEYED_FETCHERS[src](search_q, location)
            elif src in SERP_SOURCES:
                fetched = fetch_serpapi(search_q, src, location)
            else:
                continue
            for job in fetched:
                dk = f"{job['title'].lower().strip()}|{job['company'].lower().strip()}"
                if dk not in seen:
                    seen.add(dk)
                    all_jobs.append(job)
        except Exception as e:
            errors[src] = str(e)
    return all_jobs, errors


# ═══════════════════════════════════════════════
# GOOGLE AUTH (Gmail + Sheets)
# ═══════════════════════════════════════════════

def get_creds():
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    SCOPES = ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/spreadsheets"]
    creds = None
    tp = Path(__file__).parent / "token.json"
    cp = Path(__file__).parent / "credentials.json"
    if tp.exists(): creds = Credentials.from_authorized_user_file(str(tp), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token: creds.refresh(Request())
        else:
            if not cp.exists(): raise FileNotFoundError("credentials.json not found in backend/")
            creds = InstalledAppFlow.from_client_secrets_file(str(cp), SCOPES).run_local_server(port=0)
        tp.write_text(creds.to_json())
    return creds


def gmail():
    from googleapiclient.discovery import build
    return build("gmail", "v1", credentials=get_creds())

def sheets():
    from googleapiclient.discovery import build
    return build("sheets", "v4", credentials=get_creds())


def send_email(to, subject, body, attachment=None):
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.mime.application import MIMEApplication
    msg = MIMEMultipart()
    msg["to"] = to
    msg["subject"] = subject
    msg.attach(MIMEText(body, 'plain'))
    if attachment:
        part = MIMEApplication(attachment.read(), Name=attachment.filename)
        part['Content-Disposition'] = f'attachment; filename="{attachment.filename}"'
        msg.attach(part)
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    return gmail().users().messages().send(userId="me", body={"raw": raw}).execute()


def log_sheet(job, sd):
    sid = os.getenv("GOOGLE_SHEETS_ID")
    if not sid: raise ValueError("GOOGLE_SHEETS_ID not set")
    bd = sd.get("breakdown", {})
    row = [datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
           job.get("title",""), job.get("company",""), job.get("location",""),
           job.get("source",""), sd.get("total_score",""),
           bd.get("role_fit",""), bd.get("skill_overlap",""), bd.get("industry_alignment",""),
           bd.get("growth_signal",""), bd.get("seniority_match",""),
           sd.get("rationale",""), sd.get("suggested_action",""), job.get("link",""), job.get("status","")]
    sheets().spreadsheets().values().append(
        spreadsheetId=sid, range="Sheet1!A:O",
        valueInputOption="USER_ENTERED", insertDataOption="INSERT_ROWS",
        body={"values": [row]}).execute()


def init_headers():
    sid = os.getenv("GOOGLE_SHEETS_ID")
    if not sid: return
    r = sheets().spreadsheets().values().get(spreadsheetId=sid, range="Sheet1!A1:O1").execute()
    if not r.get("values"):
        sheets().spreadsheets().values().update(spreadsheetId=sid, range="Sheet1!A1:O1",
            valueInputOption="USER_ENTERED",
            body={"values": [["Timestamp","Title","Company","Location","Source","Score",
                "Role Fit","Skill Overlap","Industry","Growth","Seniority",
                "Rationale","Action","Link","Status"]]}).execute()


# ═══════════════════════════════════════════════
# NOTION
# ═══════════════════════════════════════════════

def notion_card(job, sd):
    from notion_client import Client
    n = Client(auth=os.getenv("NOTION_TOKEN"))
    dbid = os.getenv("NOTION_DATABASE_ID")
    if not dbid: raise ValueError("NOTION_DATABASE_ID not set")
    sc = sd.get("total_score", 0)
    st = "Hot Lead" if sc >= 75 else "Warm" if sc >= 50 else "Monitor"
    bd = sd.get("breakdown", {})
    # DB schema: Company (title), Role (rich_text), Link (rich_text), Status (status)
    return n.pages.create(
        parent={"database_id": dbid},
        properties={
            "Company": {"title": [{"text": {"content": job.get("company","")}}]},
            "Role": {"rich_text": [{"text": {"content": job.get("title","")}}]},
            "Link": {"rich_text": [{"text": {"content": job.get("link","")}}]},
        },
        children=[
            {"object":"block","type":"heading_2","heading_2":{"rich_text":[{"text":{"content":f"Score: {sc}/100 — {sd.get('suggested_action','save').upper()}"}}]}},
            {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"text":{"content":sd.get("rationale","")}}]}},
            {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"text":{"content":
                f"Role Fit: {bd.get('role_fit','N/A')} | Skills: {bd.get('skill_overlap','N/A')} | "
                f"Industry: {bd.get('industry_alignment','N/A')} | Growth: {bd.get('growth_signal','N/A')} | "
                f"Seniority: {bd.get('seniority_match','N/A')}"}}]}},
            {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"text":{"content":
                f"Location: {job.get('location','')} | Source: {job.get('source','')}"}}]}},
        ]
    ).get("id", "")


# ═══════════════════════════════════════════════
# SLACK WEBHOOK
# ═══════════════════════════════════════════════

def send_slack(job, sd):
    url = os.getenv("SLACK_WEBHOOK_URL")
    if not url: raise ValueError("SLACK_WEBHOOK_URL not set")
    sc = sd.get("total_score", 0)
    bd = sd.get("breakdown", {})
    emoji = ":fire:" if sc >= 75 else ":large_yellow_circle:" if sc >= 50 else ":white_circle:"
    blocks = [
        {"type":"header","text":{"type":"plain_text","text":f"{emoji} {job.get('title','')} @ {job.get('company','')}"}},
        {"type":"section","fields":[
            {"type":"mrkdwn","text":f"*Score:* {sc}/100"},
            {"type":"mrkdwn","text":f"*Action:* {sd.get('suggested_action','—')}"},
            {"type":"mrkdwn","text":f"*Location:* {job.get('location','—')}"},
            {"type":"mrkdwn","text":f"*Source:* {job.get('source','—')}"},
        ]},
        {"type":"section","text":{"type":"mrkdwn","text":
            f"*Breakdown:* Role {bd.get('role_fit','—')} | Skills {bd.get('skill_overlap','—')} | "
            f"Industry {bd.get('industry_alignment','—')} | Growth {bd.get('growth_signal','—')} | "
            f"Seniority {bd.get('seniority_match','—')}"}},
        {"type":"section","text":{"type":"mrkdwn","text":f"_{sd.get('rationale','')}_"}},
    ]
    if job.get("link"):
        blocks.append({"type":"actions","elements":[
            {"type":"button","text":{"type":"plain_text","text":"View Job"},"url":job["link"],"style":"primary"}
        ]})
    resp = http_requests.post(url, json={"blocks": blocks}, timeout=10)
    resp.raise_for_status()
    return True


# ═══════════════════════════════════════════════
# ACTIVITY LOG
# ═══════════════════════════════════════════════

def log_activity(action, job, detail=""):
    now = datetime.datetime.now().strftime("%H:%M:%S")
    entry = {
        "action": action,
        "job_title": job.get("title", ""),
        "company": job.get("company", ""),
        "detail": detail,
        "time": now
    }
    with app.app_context():
        user_id = "default"
        try:
            from flask import request
            user_id = request.headers.get("X-User-ID", "default")
        except: pass
        rec = ActivityRecord(user_id=user_id, action=action, job_title=entry["job_title"], 
                             company=entry["company"], detail=detail, time=now)
        db.session.add(rec)
        db.session.commit()
    return entry


from scoring_engine import evaluate_job

# ═══════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════

job_store = {}

@app.route("/api/health")
def health(): return jsonify({"status": "ok", "timestamp": datetime.datetime.now().isoformat()})

@app.route("/api/profile")
def profile(): return jsonify({"profile": PROFILE, "weights": SCORING_WEIGHTS})

@app.route("/api/sources")
def api_sources():
    return jsonify({"sources": {k: {"label":v["label"],"color":v["color"],"free":v["free"]} for k,v in ALL_SOURCES.items()}})

@app.route("/")
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route("/api/search", methods=["POST"])
def api_search():
    d = request.json
    try:
        jobs, errs = search_all(
            d.get("query", "Product Manager AI"),
            d.get("sources", ["remotive", "remoteok", "arbeitnow"]),
            d.get("location", "India"),
            d.get("company", "")
        )

        for j in jobs: 
            # Instant Salary Estimation
            j["salary_estimate"] = estimate_salary(j)
            job_store[j["id"]] = j
            # Save to DB
            if not JobRecord.query.get(j["id"]):
                db.session.add(JobRecord(id=j["id"], title=j["title"], company=j["company"], 
                                       location=j["location"], source=j["source"], posted=j["posted"],
                                       data_json=j))
        db.session.commit()
        log_activity("search", {"title": d.get("query",""), "company": ""}, f"{len(jobs)} results from {len(d.get('sources',[]))} sources")
        return jsonify({"jobs": jobs, "count": len(jobs), "errors": errs})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/external/save", methods=["POST"])
def api_external_save():
    d = request.json
    if not d.get("title") or not d.get("company"):
        return jsonify({"error": "Missing title or company"}), 400
    
    import uuid
    job_id = f"ext_{uuid.uuid4().hex[:8]}"
    job = {
        "id": job_id,
        "title": d.get("title"),
        "company": d.get("company"),
        "location": d.get("location", "Remote"),
        "description": d.get("description", ""),
        "link": d.get("url", ""),
        "source": "Extension",
        "posted": "Just now",
        "extracted_at": datetime.datetime.now().isoformat()
    }
    
    # Auto-score the incoming job
    r = score_job(job)
    job.update({"score": r["total_score"], "score_breakdown": r["breakdown"], 
                "rationale": r["rationale"], "suggested_action": r["suggested_action"],
                "missing_skills": r.get("missing_skills", []),
                "salary_estimate": estimate_salary(job)})
    
    job_store[job_id] = job
    log_activity("extension_clip", job, f"Clipped from {d.get('url','')[:30]}...")
    return jsonify({"status": "success", "job_id": job_id, "score": job["score"]})

@app.route("/api/score", methods=["POST"])
def api_score():
    if "resume" in request.files:
        file = request.files["resume"]
        job_str = request.form.get("job")
        if not job_str: return jsonify({"error": "Job missing"}), 400
        import json
        job = json.loads(job_str)
        try:
            resume_text = ""
            if file.filename.endswith(".pdf"):
                import PyPDF2
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages: resume_text += page.extract_text() + " "
            else:
                resume_text = file.read().decode("utf-8", errors="ignore")
            r = evaluate_job(job, resume_text)
            job.update({"score":r["score"],"score_breakdown":r["breakdown"],
                        "rationale": f"12-Dimension algorithmic grading applied.", "suggested_action":r["suggested_action"]})
            if job.get("id"): job_store[job["id"]] = job
            log_activity("scored_dynamic", job, f"Score: {r['score']}")
            return jsonify({"score": r, "job": job})
        except Exception as e: return jsonify({"error": str(e)}), 500

    d = request.json
    job = d.get("job") or job_store.get(d.get("job_id"))
    if not job: return jsonify({"error": "Job not found"}), 404
    try:
        r = score_job(job)
        job.update({"score":r["total_score"],"score_breakdown":r["breakdown"],
                     "rationale":r["rationale"],"suggested_action":r["suggested_action"]})
        if d.get("job_id"): job_store[d["job_id"]] = job
        log_activity("scored", job, f"Score: {r['total_score']}")
        return jsonify({"score": r, "job": job})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/job/refetch", methods=["POST"])
def api_refetch_job():
    data = request.json
    url = data.get("url")
    if not url: return jsonify({"error": "No URL"}), 400
    
    full = fetch_full_jd(url)
    if not full:
        # Try a more aggressive approach if the standard one failed
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'}
            resp = http_requests.get(url, headers=headers, timeout=10)
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(resp.text, 'html.parser')
            # Kill scripts and styles
            for s in soup(["script", "style"]): s.decompose()
            text = soup.get_text(separator=' ')
            # Filter for meaningful lines
            lines = [l.strip() for l in text.splitlines() if len(l.strip()) > 40]
            full = "\n".join(lines)
        except: pass

    return jsonify({"description": full or "Could not fetch full description. Please visit the link."})

@app.route("/api/email/generate", methods=["POST"])
def api_gen_email():
    d = request.json
    job = d.get("job") or job_store.get(d.get("job_id"))
    if not job: return jsonify({"error": "Job not found"}), 404
    
    lead_name = d.get("lead_name")
    leads = []
    
    # Only search for leads if not already provided
    if not lead_name:
        try:
            leads = find_leads(job.get("company", ""), job.get("title", ""))
            if leads:
                # Use the first lead as the default for the initial draft
                lead_name = leads[0]["name"]
        except Exception as e:
            print(f"Lead Finder failed: {e}")

    res = generate_outreach(job, PROFILE, lead_name=lead_name)
    return jsonify({
        "email": {"subject": res["email_subject"], "body": res["email_body"]},
        "linkedin": {"invite": res["linkedin_invite"], "message": res["linkedin_message"]},
        "leads": leads,
        "selected_lead": lead_name
    })

@app.route("/api/email/send", methods=["POST"])
def api_send_email():
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        to = request.form.get("to")
        subject = request.form.get("subject")
        body = request.form.get("body")
        attachment = request.files.get("resume")
    else:
        d = request.json
        to = d.get("to")
        subject = d.get("subject")
        body = d.get("body")
        attachment = None

    if not all([to, subject, body]): return jsonify({"error": "Missing fields"}), 400
    try:
        r = send_email(to, subject, body, attachment)
        log_activity("emailed", {"title": subject, "company": to}, f"To: {to}")
        return jsonify({"sent": True, "message_id": r.get("id")})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/sheets/log", methods=["POST"])
def api_log_sheet():
    d = request.json
    job = d.get("job") or job_store.get(d.get("job_id"))
    if not job: return jsonify({"error": "Job not found"}), 404
    sd = d.get("score_data") or {"total_score":job.get("score"),"breakdown":job.get("score_breakdown",{}),
         "rationale":job.get("rationale",""),"suggested_action":job.get("suggested_action","")}
    try:
        log_sheet(job, sd); job["status"]="logged"
        log_activity("sheet_logged", job)
        return jsonify({"logged":True})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/sheets/log-all", methods=["POST"])
def api_log_all():
    logged, errs = 0, []
    for jid, job in job_store.items():
        if job.get("score") is not None:
            try:
                sd = {"total_score":job["score"],"breakdown":job.get("score_breakdown",{}),"rationale":job.get("rationale",""),"suggested_action":job.get("suggested_action","")}
                log_sheet(job, sd); job["status"]="logged"; logged += 1
            except Exception as e: errs.append({"id":jid,"error":str(e)})
    return jsonify({"logged":logged,"errors":errs})

@app.route("/api/sheets/init", methods=["POST"])
def api_init(): init_headers(); return jsonify({"ok":True})

@app.route("/api/notion/create", methods=["POST"])
def api_notion():
    d = request.json
    job = d.get("job") or job_store.get(d.get("job_id"))
    if not job: return jsonify({"error":"Job not found"}), 404
    sd = d.get("score_data") or {"total_score":job.get("score",0),"breakdown":job.get("score_breakdown",{}),"rationale":job.get("rationale",""),"suggested_action":job.get("suggested_action","")}
    try:
        pid = notion_card(job, sd); job["status"]="tracked"
        log_activity("notion_created", job, f"Page: {pid}")
        return jsonify({"created":True,"page_id":pid})
    except Exception as e: return jsonify({"error":str(e)}), 500

@app.route("/api/slack/notify", methods=["POST"])
def api_slack():
    d = request.json
    job = d.get("job") or job_store.get(d.get("job_id"))
    if not job: return jsonify({"error":"Job not found"}), 404
    sd = d.get("score_data") or {"total_score":job.get("score",0),"breakdown":job.get("score_breakdown",{}),"rationale":job.get("rationale",""),"suggested_action":job.get("suggested_action","")}
    try:
        send_slack(job, sd)
        log_activity("slack_notified", job)
        return jsonify({"sent":True})
    except Exception as e: return jsonify({"error":str(e)}), 500

@app.route("/api/connectors/status")
def api_connectors():
    has_gmail = Path(Path(__file__).parent/"credentials.json").exists()
    gmail_email = ""
    if has_gmail:
        try: gmail_email = gmail().users().getProfile(userId="me").execute().get("emailAddress", "")
        except: pass
    return jsonify({
        "connectors":{
            "remotive": True,
            "arbeitnow": True,
            "adzuna": bool(os.getenv("ADZUNA_APP_ID")) and bool(os.getenv("ADZUNA_APP_KEY")),
            "jsearch": bool(os.getenv("JSEARCH_API_KEY")),
            "serpapi": bool(os.getenv("SERPAPI_KEY")),
            "gmail": has_gmail,
            "sheets": bool(os.getenv("GOOGLE_SHEETS_ID")),
            "notion": bool(os.getenv("NOTION_TOKEN")) and bool(os.getenv("NOTION_DATABASE_ID")),
            "slack": bool(os.getenv("SLACK_WEBHOOK_URL")),
        },
        "gmail_email": gmail_email
    })

@app.route("/api/jobs")
def api_jobs():
    try:
        recs = JobRecord.query.all()
        jobs = [r.data_json for r in recs]
        return jsonify({"jobs":sorted(jobs,key=lambda j:j.get("score") or -1,reverse=True)})
    except: return jsonify({"jobs": []})

@app.route("/api/activity", methods=["GET"])
def api_activity():
    try:
        user_id = request.headers.get("X-User-ID", "default")
        recs = ActivityRecord.query.filter_by(user_id=user_id).order_by(ActivityRecord.id.desc()).limit(50).all()
        log = [{"action": r.action, "job_title": r.job_title, "company": r.company, 
                "detail": r.detail, "time": r.time} for r in recs]
        return jsonify({"log": log})
    except: return jsonify({"log": []})

@app.route("/api/stats")
def api_stats():
    try:
        recs = JobRecord.query.all()
        all_j = [r.data_json for r in recs]
        scored = [j for j in all_j if j.get("score") is not None]
        return jsonify({
            "total": len(all_j),
            "scored": len(scored),
            "avg_score": round(sum(j["score"] for j in scored)/max(len(scored),1)) if scored else 0,
            "hot_leads": len([j for j in scored if j["score"] >= 75])
        })
    except: return jsonify({"total":0, "scored":0, "avg_score":0, "hot_leads":0})

@app.route("/api/outreach/generate", methods=["POST"])
def api_outreach():
    d = request.json
    job = d.get("job") or job_store.get(d.get("job_id"))
    if not job: return jsonify({"error":"Job not found"}), 404
    try:
        outreach = generate_outreach(job, PROFILE)
        return jsonify(outreach)
    except Exception as e: return jsonify({"error":str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
else:
    # This is for production logging
    import logging
    logging.basicConfig(level=logging.INFO)
    print("Backend application initialized and ready for Gunicorn...")
