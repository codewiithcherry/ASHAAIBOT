from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os

def create_pdf(filename, title, content):
    # Create the PDF
    doc = SimpleDocTemplate(
        f"frontend/public/resources/{filename}",
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30
    )
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=18,
        spaceAfter=20
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=12
    )
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontSize=12,
        leftIndent=20,
        spaceAfter=8
    )
    
    # Add title
    elements.append(Paragraph(title, title_style))
    elements.append(Spacer(1, 12))
    
    # Add content
    for section in content:
        if section['type'] == 'title':
            elements.append(Paragraph(section['text'], subtitle_style))
        elif section['type'] == 'text':
            elements.append(Paragraph(section['text'], body_style))
        elif section['type'] == 'bullet':
            elements.append(Paragraph(section['text'], bullet_style))
        elements.append(Spacer(1, 12))
    
    # Build PDF
    doc.build(elements)

# Resume Templates
resume_content = [
    {'type': 'title', 'text': 'Professional Resume Templates for Various Industries'},
    {'type': 'title', 'text': 'A. Chronological Resume'},
    {'type': 'text', 'text': 'Best for: Professionals with steady work history in one field.'},
    {'type': 'title', 'text': 'Structure:'},
    {'type': 'bullet', 'text': '• Contact Information'},
    {'type': 'bullet', 'text': '• Professional Summary'},
    {'type': 'bullet', 'text': '• Work Experience (reverse chronological order)'},
    {'type': 'bullet', 'text': '• Skills'},
    {'type': 'bullet', 'text': '• Education'},
    
    {'type': 'title', 'text': 'B. Functional Resume'},
    {'type': 'text', 'text': 'Best for: Career changers or those with employment gaps.'},
    {'type': 'title', 'text': 'Structure:'},
    {'type': 'bullet', 'text': '• Contact Information'},
    {'type': 'bullet', 'text': '• Skills Summary'},
    {'type': 'bullet', 'text': '• Key Achievements (grouped by skill)'},
    {'type': 'bullet', 'text': '• Work History (brief)'},
    {'type': 'bullet', 'text': '• Education'},
    
    {'type': 'title', 'text': 'C. Combination Resume'},
    {'type': 'text', 'text': 'Best for: Experienced professionals with diverse skills.'},
    {'type': 'title', 'text': 'Structure:'},
    {'type': 'bullet', 'text': '• Contact Information'},
    {'type': 'bullet', 'text': '• Professional Summary'},
    {'type': 'bullet', 'text': '• Skills & Achievements'},
    {'type': 'bullet', 'text': '• Work Experience'},
    {'type': 'bullet', 'text': '• Education'},
    
    {'type': 'title', 'text': 'D. Creative Resume'},
    {'type': 'text', 'text': 'Best for: Designers, marketers, and creative roles.'},
    {'type': 'title', 'text': 'Structure:'},
    {'type': 'bullet', 'text': '• Visually appealing layout'},
    {'type': 'bullet', 'text': '• Infographics, color schemes'},
    {'type': 'bullet', 'text': '• Portfolio links'}
]

# Interview Preparation Guide
interview_content = [
    {'type': 'title', 'text': 'A. Before the Interview'},
    {'type': 'bullet', 'text': '• Research the company (mission, culture, recent news)'},
    {'type': 'bullet', 'text': '• Review the job description and match skills'},
    {'type': 'bullet', 'text': '• Prepare answers to common questions (STAR method)'},
    {'type': 'bullet', 'text': '• Dress appropriately (business formal/casual)'},
    
    {'type': 'title', 'text': 'B. Common Interview Questions'},
    {'type': 'bullet', 'text': '1. Tell me about yourself → Keep it concise (60-90 secs)'},
    {'type': 'bullet', 'text': '2. Why do you want this job? → Align with company goals'},
    {'type': 'bullet', 'text': '3. What\'s your greatest weakness? → Show growth'},
    {'type': 'bullet', 'text': '4. Describe a challenge you faced → Use STAR method'},
    
    {'type': 'title', 'text': 'C. Questions to Ask the Interviewer'},
    {'type': 'bullet', 'text': '• What does success look like in this role?'},
    {'type': 'bullet', 'text': '• How does the team collaborate?'},
    {'type': 'bullet', 'text': '• What are the next steps?'},
    
    {'type': 'title', 'text': 'D. Post-Interview Follow-Up'},
    {'type': 'bullet', 'text': '• Send a thank-you email within 24 hours'}
]

# Salary Negotiation Tips
salary_content = [
    {'type': 'title', 'text': 'A. Research Market Rates'},
    {'type': 'bullet', 'text': '• Use Glassdoor, Payscale, LinkedIn Salary'},
    {'type': 'bullet', 'text': '• Consider location, experience, and industry'},
    
    {'type': 'title', 'text': 'B. How to Negotiate'},
    {'type': 'bullet', 'text': '1. Delay discussing salary → "I\'d like to learn more about the role first"'},
    {'type': 'bullet', 'text': '2. Give a range → Based on research'},
    {'type': 'bullet', 'text': '3. Highlight value → Skills, experience, and achievements'},
    {'type': 'bullet', 'text': '4. Practice scripts → "Given my [X skill], I was hoping for [Y]"'},
    
    {'type': 'title', 'text': 'C. Handling Rejection'},
    {'type': 'bullet', 'text': '• Ask: "What\'s the budget for this role?"'},
    {'type': 'bullet', 'text': '• Negotiate perks (remote work, bonuses, growth opportunities)'}
]

# Career Path Guides
career_content = [
    {'type': 'title', 'text': 'A. Entry-Level to Mid-Career'},
    {'type': 'bullet', 'text': '• Skill development → Certifications, mentorship'},
    {'type': 'bullet', 'text': '• Lateral moves → Gain diverse experience'},
    
    {'type': 'title', 'text': 'B. Mid-Career to Senior Roles'},
    {'type': 'bullet', 'text': '• Leadership training'},
    {'type': 'bullet', 'text': '• Networking (industry events, LinkedIn)'},
    
    {'type': 'title', 'text': 'C. Switching Industries'},
    {'type': 'bullet', 'text': '• Transferable skills (project management, communication)'},
    {'type': 'bullet', 'text': '• Side projects/freelancing to gain experience'},
    
    {'type': 'title', 'text': 'D. High-Demand Careers (2025 Trends)'},
    {'type': 'bullet', 'text': '• AI/ML, cybersecurity, healthcare, renewable energy'}
]

# Industry Insights
industry_content = [
    {'type': 'title', 'text': 'A. Tech Industry'},
    {'type': 'bullet', 'text': '• Remote work trends'},
    {'type': 'bullet', 'text': '• Upskilling in AI/cloud computing'},
    
    {'type': 'title', 'text': 'B. Healthcare'},
    {'type': 'bullet', 'text': '• Growth in telemedicine'},
    {'type': 'bullet', 'text': '• Demand for nurses, data analysts'},
    
    {'type': 'title', 'text': 'C. Finance'},
    {'type': 'bullet', 'text': '• Fintech disruption'},
    {'type': 'bullet', 'text': '• Roles in risk management, blockchain'},
    
    {'type': 'title', 'text': 'D. Creative Fields'},
    {'type': 'bullet', 'text': '• Freelance economy growth'},
    {'type': 'bullet', 'text': '• Importance of digital portfolios'}
]

# Create PDFs
create_pdf("resume_templates.pdf", "Resume Templates Guide", resume_content)
create_pdf("interview_guide.pdf", "Interview Preparation Guide", interview_content)
create_pdf("salary_tips.pdf", "Salary Negotiation Guide", salary_content)
create_pdf("career_guides.pdf", "Career Path Development Guide", career_content)
create_pdf("industry_insights.pdf", "Industry Insights Guide", industry_content) 