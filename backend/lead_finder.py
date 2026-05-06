import os
import requests
import re

def find_leads(company, job_title):
    """
    Surgically finds LinkedIn profiles of relevant decision-makers at the SPECIFIC company.
    """
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key:
        return []

    # CLEAN COMPANY NAME: Remove Inc, Ltd, Pvt, etc.
    clean_company = re.sub(r'\b(inc|ltd|pvt|limited|corporation|corp|llc)\b', '', company, flags=re.I).strip()
    clean_company = re.sub(r'\(.*\)', '', clean_company).strip() # Remove (Alphabet), etc.

    # Identify the relevant department for better targeting
    dept = "Product" if "product" in job_title.lower() else \
           "Engineering" if any(w in job_title.lower() for w in ["engineer", "sde", "tech"]) else \
           "Talent"
           
    # Strict queries using quotes for the company name
    queries = [
        f"site:linkedin.com/in/ \"{clean_company}\" ({dept} OR \"Hiring Manager\")",
        f"site:linkedin.com/in/ \"{clean_company}\" (\"Talent Acquisition\" OR \"Recruiter\")",
        f"site:linkedin.com/in/ \"{clean_company}\" \"Founder\""
    ]
    
    leads = []
    seen_urls = set()
    company_lower = clean_company.lower()

    for query in queries:
        try:
            params = {
                "engine": "google",
                "q": query,
                "api_key": api_key,
                "num": 8 # Increased for better filtering
            }
            r = requests.get("https://serpapi.com/search", params=params, timeout=10)
            results = r.json().get("organic_results", [])
            
            for res in results:
                url = res.get("link", "")
                snippet = res.get("snippet", "").lower()
                title = res.get("title", "").lower()
                
                # VERIFICATION: Only keep if the company is mentioned
                is_valid = False
                if company_lower in title or company_lower in snippet:
                    is_valid = True
                
                if "linkedin.com/in/" in url and url not in seen_urls and is_valid:
                    name = res.get("title", "").split(" - ")[0].split(" | ")[0]
                    name = name.replace(" - LinkedIn", "").replace(" | LinkedIn", "").strip()
                    
                    leads.append({
                        "name": name,
                        "title": res.get("snippet", "").split("...")[0].strip(),
                        "url": url
                    })
                    seen_urls.add(url)
            
            if len(leads) >= 5: break 
            
        except Exception as e:
            print(f"Lead Finder Error: {e}")
            
    return leads[:6]
