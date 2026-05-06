# backend/scoring_engine.py
import re
from scoring_rules import *

def extract_words(text):
    return set(re.findall(r'\b[a-zA-Z]{3,}\b', str(text).lower()))

def count_matches(text, word_list):
    return sum(1 for w in word_list if re.search(r'\b' + re.escape(w.lower()) + r'\b', text.lower()))

def evaluate_job(job, resume_text):
    if not resume_text: return {"score": 0, "breakdown": {}, "suggested_action": "skip"}
    
    t_res = resume_text.lower()
    t_title = str(job.get("title", "")).lower()
    t_desc = str(job.get("description", "")).lower()
    t_full = (t_title + " " + t_desc).lower()
    
    w_res = extract_words(t_res)
    w_title = extract_words(t_title)
    w_desc = extract_words(t_desc)
    
    scores = {}

    # D1. Responsibility Alignment (35%) - Semantic
    resp_score = 0
    semantic_clusters = [
        ["scale", "grow", "build", "strategy", "roadmap", "lifecycle"],
        ["manage", "lead", "collaborate", "stakeholder", "cross-functional"],
        ["analyze", "metrics", "data", "insight", "report", "dashboard"],
        ["user", "customer", "feedback", "research", "market", "segment"]
    ]
    for cluster in semantic_clusters:
        if count_matches(t_res, cluster) > 0 and count_matches(t_desc, cluster) > 0:
            resp_score += 25
    scores["responsibility_alignment"] = resp_score

    # D2. Skill Density (15%)
    overlap = len(w_res.intersection(w_desc))
    scores["skill_density"] = min(100, int((overlap / 30.0) * 100))

    # D3. Founder Spirit (10%)
    fs_matches = count_matches(t_desc, FOUNDER_SPIRIT)
    scores["founder_spirit"] = min(100, fs_matches * 35)

    # D4. Industry Precision (10%)
    if count_matches(t_desc, INDUSTRIES["high"]) > 0: scores["industry_precision"] = 100
    elif count_matches(t_desc, INDUSTRIES["medium"]) > 0: scores["industry_precision"] = 60
    else: scores["industry_precision"] = 40

    # D5. Seniority Calibration (10%)
    # User is 1-3Y. 
    hi_sen = count_matches(t_desc, SENIORITY_INDICATORS["high"])
    lo_sen = count_matches(t_desc, SENIORITY_INDICATORS["low"])
    if hi_sen > 0: scores["seniority_match"] = 30 # Over-qualified role
    elif lo_sen > 0: scores["seniority_match"] = 100
    else: scores["seniority_match"] = 80 # Mid/General

    # D6. Title Precision (5%)
    title_overlap = len(w_res.intersection(w_title))
    scores["title_match"] = min(100, int((title_overlap / 2.0) * 100)) if title_overlap > 0 else 0

    # D7. Archetype Fit (5%)
    if count_matches(t_desc, COMPANY_ARCHETYPES["seed"]) > 0: scores["archetype_fit"] = 100
    elif count_matches(t_desc, COMPANY_ARCHETYPES["scaling"]) > 0: scores["archetype_fit"] = 80
    else: scores["archetype_fit"] = 50

    # D8. Authority Score (3%)
    hi_auth = count_matches(t_desc, AUTHORITY_VERBS["high"])
    scores["authority_score"] = min(100, hi_auth * 35)

    # D9. Output Match (2%)
    out_matches = count_matches(t_desc, OUTPUT_TYPES)
    scores["output_match"] = min(100, out_matches * 40)

    # D10. Cultural Intensity (2%)
    intense = count_matches(t_desc, CULTURE["intense"])
    scores["cultural_intensity"] = min(100, 50 + (intense * 20))

    # D11. Geo-Mobility (2%)
    loc = str(job.get("location", "")).lower()
    if "remote" in loc or "india" in loc: scores["geo_mobility"] = 100
    else: scores["geo_mobility"] = 60

    # D12. Recency Signal (1%)
    scores["recency_signal"] = 90

    # Calculate Final Weighted Score
    final = 0
    for dim, val in scores.items():
        w = WEIGHTS.get(dim, 0) / 100.0
        final += val * w
        
    fs = int(final)
    action = "apply" if fs >= 75 else "email" if fs >= 55 else "save" if fs >= 35 else "skip"
    
    return {
        "score": fs,
        "suggested_action": action,
        "breakdown": scores
    }
