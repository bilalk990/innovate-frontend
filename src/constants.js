// API and WebSocket URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// Question Categories
export const QUESTION_CATEGORIES = [
  'Technical',
  'Behavioral',
  'Problem Solving',
  'System Design',
  'Coding',
  'General'
];

// AI Evaluation Criteria
export const AI_EVALUATION_CRITERIA = [
  { key: 'technical_accuracy', label: 'Technical Accuracy' },
  { key: 'communication', label: 'Communication' },
  { key: 'problem_solving', label: 'Problem Solving' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'clarity', label: 'Clarity' }
];

// Recommendation Map — keys MUST match backend engine.py values
export const RECOMMENDATION_MAP = {
  'strong_yes': { label: 'Strong Hire',  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  icon: '⭐' },
  'yes':        { label: 'Hire',         color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   icon: '✅' },
  'maybe':      { label: 'Maybe',        color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: '🤔' },
  'no':         { label: 'No Hire',      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: '⚠️' },
  'strong_no':  { label: 'Reject',       color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    icon: '❌' },
};

// Skills List
export const SKILLS_LIST = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring Boot',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'Git', 'CI/CD', 'Agile', 'Scrum',
  'Machine Learning', 'Data Science', 'AI', 'Deep Learning',
  'HTML', 'CSS', 'TypeScript', 'GraphQL', 'REST API'
];

// Countries List
export const COUNTRIES_LIST = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'China', 'Japan', 'Brazil', 'Mexico', 'Spain',
  'Italy', 'Netherlands', 'Sweden', 'Switzerland', 'Singapore', 'UAE',
  'Pakistan', 'Bangladesh', 'Other'
];

export const CORE_VALUES_LIST = [
  "Innovation", "Integrity", "Excellence", "Diversity", "Customer Focus", "Teamwork", 
  "Sustainability", "Accountability", "Agility", "Passion", "Transparency", "Inclusivity", 
  "Efficiency", "Creativity", "Reliability", "Impact", "Growth Mindset", "Quality", 
  "Collaboration", "Respect", "Courage", "Simplicity", "Speed", "Ambition"
];
