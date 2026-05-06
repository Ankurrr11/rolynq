import random
import re

def clean_text(t, is_company=False):
    if not t: return ""
    import re
    # Remove common corporate suffixes
    if is_company:
        t = re.sub(r'\b(Private Limited|Pvt Ltd|Ltd|Inc|Corp|LLP|Solutions|Technologies)\b.*', '', t, flags=re.IGNORECASE)
    # Remove things in brackets or after separators
    t = re.split(r'\(|-|\|', t)[0].strip()
    return t

def generate_outreach(job, profile, lead_name=None):
    """
    Generates personalized LinkedIn and Email outreach messages.
    """
    title = clean_text(job.get("title", "this role"))
    company = clean_text(job.get("company", "your company"), True)
    name = profile.get("name", "Ankur")
    greeting = f"Hi {lead_name.split()[0]}" if lead_name else "Hi"
    
    # Extract key skills from the job description
    desc = job.get("description", "").lower()
    skills = [s for s in profile.get("key_skills", []) if s.lower() in desc]
    top_skill = skills[0] if skills else "strategy & ops"
    
    # LinkedIn Connection Request (Strictly 300 chars)
    # Using a more concise template to ensure it fits with long titles
    templates = [
        f"{greeting}, I'm an APM/CoS at DevKraft. I saw the {title} role at {company} and would love to connect. I've led GTM strategy and AI product dev, and I'm very interested in {company}'s vision. Hope to connect!",
        f"{greeting}, noticed the {title} opening at {company}. I'm a Chief of Staff at DevKraft with a focus on {top_skill}. I've been following your growth and would love to connect and learn more about the team!",
        f"{greeting}, I'm interested in the {title} role at {company}. My background as an APM/CoS at DevKraft matches your requirements for {top_skill}. Would love to connect and discuss further!"
    ]
    linkedin_invite = random.choice(templates)
    
    # LinkedIn Message (Longer)
    linkedin_message = (
        f"{greeting}!\n\nI just saw the {title} role at {company} and it immediately caught my eye. "
        f"I'm currently the APM and Chief of Staff at DevKraft Technologies, where I've led GTM strategy and "
        f"AI product development (like our HR automation platform).\n\n"
        f"My background in {top_skill} seems like a great fit for what {company} is building. "
        f"Would love to have a brief chat about the role if you have a moment. Cheers!"
    )
    
    # Email Template
    email_subjects = [
        f"Inquiry: {title} position at {company} - {name}",
        f"Exploring {title} opportunities at {company}",
        f"Connecting regarding the {title} role"
    ]
    
    email_body = (
        f"{greeting},\n\n"
        f"I'm {name}, currently the {profile.get('current_role')} at DevKraft Technologies. "
        f"I've been following {company}'s impact in the market and was thrilled to see the {title} opening.\n\n"
        f"At DevKraft, I've led strategic initiatives like Project Denali (data analytics for a global sports giant) "
        f"and built AI-powered products from the ground up. My experience in {top_skill} and cross-functional leadership "
        f"aligns closely with the requirements of this role.\n\n"
        f"I'm passionate about {company}'s mission and would love to bring my 'founder's office' mindset to your team. "
        f"Attached is my resume for your review. I'm available for a 15-minute call any time this week.\n\n"
        f"Best regards,\n{name}"
    )
    
    def smart_truncate(text, limit=300):
        if len(text) <= limit:
            return text
        # Truncate at the last full sentence
        truncated = text[:limit]
        last_dot = truncated.rfind('.')
        if last_dot > limit * 0.7:
            return truncated[:last_dot + 1]
        # Otherwise last space
        return truncated.rsplit(' ', 1)[0].rstrip(' ,;') + '!'

    return {
        "linkedin_invite": smart_truncate(linkedin_invite, 300),
        "linkedin_message": linkedin_message,
        "email_subject": random.choice(email_subjects),
        "email_body": email_body
    }
