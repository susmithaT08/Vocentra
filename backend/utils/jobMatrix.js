/**
 * Job-Role Skill Matrix
 * Maps required skill indices for specific job titles.
 * The Matcher Engine will compare user scores to these minimum thresholds.
 */

const jobRoleMatrix = [
    {
        job_title: "Software Engineer",
        industry: "IT / Tech",
        salary_range_lpa: "8-15 LPA",
        required_thresholds: {
            communication_skills: 65,
            technical_skills: 80,
            behavioral_skills: 70,
            cognitive_skills: 75,
            professional_readiness: 70
        },
        growth_path: ["Junior Developer", "SDE II", "Senior Engineer", "Tech Lead"]
    },
    {
        job_title: "Frontend Developer",
        industry: "IT / Tech",
        salary_range_lpa: "6-12 LPA",
        required_thresholds: {
            communication_skills: 70,
            technical_skills: 75,
            behavioral_skills: 65,
            cognitive_skills: 70,
            professional_readiness: 70
        },
        growth_path: ["Frontend Dev", "Senior UI Dev", "Frontend Architect"]
    },
    {
        job_title: "Product Manager",
        industry: "Product / Tech",
        salary_range_lpa: "12-25 LPA",
        required_thresholds: {
            communication_skills: 85,
            technical_skills: 60,
            behavioral_skills: 85,
            cognitive_skills: 85,
            professional_readiness: 90
        },
        growth_path: ["Associate PM", "Product Manager", "Senior PM", "VP of Product"]
    },
    {
        job_title: "Data Analyst",
        industry: "Data Science",
        salary_range_lpa: "7-14 LPA",
        required_thresholds: {
            communication_skills: 70,
            technical_skills: 75,
            behavioral_skills: 60,
            cognitive_skills: 85,
            professional_readiness: 70
        },
        growth_path: ["Data Analyst", "Senior Analyst", "Data Scientist"]
    },
    {
        job_title: "Business Analyst",
        industry: "Business / Finance",
        salary_range_lpa: "6-12 LPA",
        required_thresholds: {
            communication_skills: 80,
            technical_skills: 55,
            behavioral_skills: 75,
            cognitive_skills: 80,
            professional_readiness: 80
        },
        growth_path: ["Business Analyst", "Senior BA", "Product Manager"]
    }
];

module.exports = jobRoleMatrix;
