# backend/scoring_rules.py

"""D1/D2: Semantic & Technical Skill Matching"""
SYNONYMS = {
    "gtm": ["gtm", "go to market", "go-to-market", "market entry", "launch strategy", "scaling", "growth"],
    "product": ["product management", "prd", "user stories", "roadmap", "agile", "wireframes", "pm"],
    "data": ["sql", "python", "power bi", "tableau", "analytics", "dashboard", "metrics", "kpi", "data analysis"],
    "ai_ml": ["genai", "generative ai", "llm", "machine learning", "nlp", "artificial intelligence", "deep learning", "ai"],
    "bizdev": ["business development", "partnerships", "sales", "alliances", "client facing", "pre-sales"]
}

"""D3: Founder's Spirit (0-to-1)"""
FOUNDER_SPIRIT = ["zero to one", "0 to 1", "scrappy", "ambiguous", "ownership", "hustle", "founding team", "figure things out", "wear many hats"]

"""D4: Industry Maps"""
INDUSTRIES = {
    "high": ["ai", "saas", "b2b", "deep tech", "venture capital", "fintech", "edtech", "healthtech", "enterprise software"],
    "medium": ["marketplace", "d2c", "e-commerce", "ecommerce", "media", "gaming", "consumer"],
    "low": ["manufacturing", "telecom", "bpo", "automotive", "mining", "defence", "outsourcing"]
}

"""D5: Seniority & Reporting"""
SENIORITY_INDICATORS = {
    "high": ["director", "vp", "c-level", "head of", "principal", "10+ years", "15+ years"],
    "mid": ["manager", "lead", "manage a team", "3-5 years", "2-4 years"],
    "low": ["junior", "associate", "entry level", "fresher", "intern", "0-2 years"]
}

"""D7: Company Archetype"""
COMPANY_ARCHETYPES = {
    "seed": ["seed", "pre-seed", "founding team", "first hire", "stealth", "angel backed"],
    "scaling": ["series a", "series b", "series c", "growth stage", "scale-up", "scaleup", "unicorn"],
    "corporate": ["fortune 500", "mnc", "enterprise", "public sector", "established"]
}

"""D8: Authority Verbs"""
AUTHORITY_VERBS = {
    "high": ["own", "lead", "define", "build", "decide", "drive", "architect", "spearhead", "oversee"],
    "low": ["support", "assist", "coordinate", "help", "execute under", "maintain"]
}

"""D9: Output Deliverables"""
OUTPUT_TYPES = ["prd", "spec", "deck", "presentation", "model", "pipeline", "dashboard", "report"]

"""D10: Cultural Intensity"""
CULTURE = {
    "intense": ["fast-paced", "high-pressure", "rapidly changing", "unstructured", "moving fast", "performance driven"],
    "stable": ["process-driven", "structured", "work-life balance", "established", "best practices"]
}

"""Weights Definition (Total == 100)"""
WEIGHTS = {
    "responsibility_alignment": 35,
    "skill_density": 15,
    "founder_spirit": 10,
    "industry_precision": 10,
    "seniority_match": 10,
    "title_match": 5,
    "archetype_fit": 5,
    "authority_score": 3,
    "output_match": 2,
    "cultural_intensity": 2,
    "geo_mobility": 2,
    "recency_signal": 1
}

FUNCTIONAL_BUCKETS = {
    "product": ["product", "roadmap", "user", "ux", "launch"],
    "strategy": ["strategy", "research", "market", "consulting"],
    "growth": ["growth", "marketing", "acquisition", "sales"]
}
