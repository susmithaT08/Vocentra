const mongoose = require('mongoose');

// Define the exact JSON hierarchy requested by the user for Employability Intelligence
const employabilityAssessmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        assessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interview',
            required: true
        },
        status: {
            type: String,
            default: "success"
        },
        overall_employability_score: {
            type: Number,
            required: true
        },
        employability_level: {
            type: String,
            enum: ['Not Ready', 'Developing', 'Job Ready – Moderate Improvement Needed', 'Highly Job Ready'],
            required: true
        },
        strengths: [{ type: String }],
        improvement_areas: [{ type: String }],

        // Tracking original vs user-modified states
        ai_scores: { type: mongoose.Schema.Types.Mixed, default: {} },
        override_scores: { type: mongoose.Schema.Types.Mixed, default: {} },
        blended_scores: { type: mongoose.Schema.Types.Mixed, default: {} },

        improvement_history: [{
            date: { type: Date, default: Date.now },
            action: String,
            previousScore: Number,
            newScore: Number
        }],

        // Detailed Index Breakdown
        categorized_skill_indexes: {
            communication_skills: {
                score: Number,
                level: String,
                sub_skills: [String],
                numerical_breakdown: { type: Map, of: Number } // e.g. fluency: 80, grammar: 75
            },
            technical_skills: {
                score: Number,
                level: String,
                sub_skills: [String],
                numerical_breakdown: { type: Map, of: Number }
            },
            behavioral_skills: {
                score: Number,
                level: String,
                sub_skills: [String],
                numerical_breakdown: { type: Map, of: Number }
            },
            cognitive_skills: {
                score: Number,
                level: String,
                sub_skills: [String],
                numerical_breakdown: { type: Map, of: Number }
            },
            professional_readiness: {
                score: Number,
                level: String,
                sub_skills: [String],
                numerical_breakdown: { type: Map, of: Number }
            }
        },

        // Job Eligibility Engine Payload
        job_eligibility_matching: {
            job_readiness_percentage: Number,
            confidence_match_level: String, // High, Medium, Low
            eligible_roles: [{
                job_title: String,
                industry: String,
                eligibility_score: Number,
                match_type: String,
                required_skill_alignment: { type: Map, of: Number },
                gap_skills: [String],
                salary_range_lpa: String,
                readiness_status: String
            }],
            moderate_match_roles: [{
                job_title: String,
                eligibility_score: Number,
                gap_reason: String,
                improvement_plan_weeks: Number
            }],
            low_match_roles: [{
                job_title: String,
                eligibility_score: Number,
                gap_reason: String
            }]
        },

        career_direction_recommendation: {
            best_fit_domain: String,
            suggested_career_path: [String],
            estimated_time_to_top_role_months: Number
        },

        action_plan: {
            immediate_steps: [String],
            skill_upgrade_focus: [String]
        },

        generated_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        strict: false // Allow dynamic overrides just in case
    }
);

// We overwrite the existing 'Skill' model intentionally to not break routes that might depend on "Skill" export name initially.
module.exports = mongoose.model('Skill', employabilityAssessmentSchema);
