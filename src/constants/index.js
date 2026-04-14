/**
 * constants/index.js — Static data and configuration constants
 */

export const ROLES = {
    CANDIDATE: 'candidate',
    RECRUITER: 'recruiter',
    ADMIN: 'admin',
};

export const INTERVIEW_STATUS = [
    { value: 'scheduled', label: 'Scheduled', badge: 'indigo' },
    { value: 'pending', label: 'Pending', badge: 'amber' },
    { value: 'active', label: 'Active', badge: 'cyan' },
    { value: 'completed', label: 'Completed', badge: 'green' },
    { value: 'cancelled', label: 'Cancelled', badge: 'red' },
];

export const QUESTION_CATEGORIES = [
    { value: 'general', label: '🗣️ General' },
    { value: 'technical', label: '💻 Technical' },
    { value: 'behavioral', label: '🧠 Behavioral' },
    { value: 'hr', label: '🤝 HR / Culture' },
];

export const RECOMMENDATION_MAP = {
    strong_yes: { label: 'Strong Yes', badge: 'green', icon: '✅' },
    yes: { label: 'Yes', badge: 'cyan', icon: '👍' },
    maybe: { label: 'Maybe', badge: 'amber', icon: '🤔' },
    no: { label: 'No', badge: 'red', icon: '👎' },
    strong_no: { label: 'Strong No', badge: 'red', icon: '❌' },
};

export const AI_EVALUATION_CRITERIA = {
    communication_clarity: '💬 Communication Clarity',
    response_depth: '🔍 Response Depth',
    keyword_alignment: '🎯 Keyword Alignment',
    resume_consistency: '📋 Resume Consistency',
    response_completeness: '✅ Response Completeness',
    confidence_indicators: '💪 Confidence Indicators',
    semantic_accuracy: '🧠 Semantic Accuracy',
};

export const SKILLS_LIST = [
    // Programming Languages
    "JavaScript", "Python", "Java", "C++", "C#", "TypeScript", "PHP", "Ruby", "Swift", "Go", "Rust", "Kotlin", "Scala", "Dart", "R", "SQL", "HTML5", "CSS3", "Shell Scripting", "Perl", "COBOL", "Pascal", "Assembly", "Fortran", "Lua", "Matlab",
    // Frontend Frameworks
    "React", "Angular", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "Redux", "Zustand", "Tailwind CSS", "Bootstrap", "Material UI", "Framer Motion", "Three.js",
    // Backend & Cloud
    "Node.js", "Django", "Flask", "Spring Boot", "Laravel", "Ruby on Rails", "Express.js", "ASP.NET", "PostgreSQL", "MongoDB", "MySQL", "Redis", "Firebase", "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "GraphQL", "REST API", "Microservices",
    // AI & Data
    "Machine Learning", "Deep Learning", "Data Science", "Natural Language Processing (NLP)", "Computer Vision", "PyTorch", "TensorFlow", "Pandas", "NumPy", "Scikit-Learn", "OpenCV", "AI Prompt Engineering", "Neural Architecture Search",
    // Recruitment & HR (Elite Specialized)
    "Candidate Sourcing", "Boolean Search", "Full-Cycle Recruiting", "ATS Proficiency", "Employer Branding", "Social Recruiting", "Executive Search", "Resume Parsing", "Interview Scheduling", "Talent Mapping", "Strategic Workforce Planning", "People Analytics", "CRM Proficiency", "Diversity & Inclusion (DEI)", "Onboarding Coordination", "Psychometric Testing",
    // Tools & Others
    "Git", "GitHub", "Jenkins", "Terraform", "Ansible", "Jira", "Confluence", "Figma", "Adobe XD", "Unity", "Unreal Engine", "Cyber Security", "Penetration Testing", "SEO", "Digital Marketing", "Project Management", "Agile", "Scrum", "Product Management"
];

export const COUNTRIES_LIST = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
];

export const CORE_VALUES_LIST = [
    "Innovation", "Integrity", "Excellence", "Diversity", "Customer Focus", "Teamwork", 
    "Sustainability", "Accountability", "Agility", "Passion", "Transparency", "Inclusivity", 
    "Efficiency", "Creativity", "Reliability", "Impact", "Growth Mindset", "Quality", 
    "Collaboration", "Respect", "Courage", "Simplicity", "Speed", "Ambition"
];

// Fail fast if environment variables are not set in production
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    throw new Error('VITE_API_URL must be set in production environment!');
}
if (import.meta.env.PROD && !import.meta.env.VITE_WS_URL) {
    throw new Error('VITE_WS_URL must be set in production environment!');
}

export const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const WS_URL = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000').replace(/\/$/, '');
