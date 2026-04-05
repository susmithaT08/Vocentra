const Skill = require('../models/Skill');
const InterviewSession = require('../models/Interview');
const jobRoleMatrix = require('../utils/jobMatrix');

// Helper to calculate blended scores
const computeBlendedScores = (aiScores, overrideScores) => {
    const blended = { ...aiScores };
    for (const key in overrideScores) {
        if (overrideScores.hasOwnProperty(key)) {
            blended[key] = overrideScores[key];
        }
    }
    return blended;
};

// Main Intelligence Logic (can be called on initial fetch or on override updates)
const generateIntelligencePayload = (userId, assessmentId, ai_scores, override_scores) => {

    // 1. Get Blended Scores (Overrides take precedence)
    const b = computeBlendedScores(ai_scores, override_scores);

    // Base Values Defaulting to 1 if missing for division safety
    const baseComm = b.communication_skills || 1;
    const baseTech = b.technical_skills || 1;
    const baseBehav = b.behavioral_skills || 1;
    const baseCognitive = b.cognitive_skills || 1;
    const baseProf = b.professional_readiness || 1;

    // 2. Compute Overall Employability Score (Weighted Formula: 20/25/20/15/20)
    let overallScore = (baseComm * 0.20) + (baseTech * 0.25) + (baseBehav * 0.20) + (baseCognitive * 0.15) + (baseProf * 0.20);
    overallScore = Math.round(overallScore);

    // Ensure it's bounded 0-100
    overallScore = Math.max(0, Math.min(100, overallScore));

    // 3. Level Label Logic
    const getLevelLabel = (score) => {
        if (score >= 85) return "Strong";
        if (score >= 70) return "Moderate";
        if (score >= 55) return "Average";
        if (score >= 40) return "Beginner";
        return "Not Ready";
    };

    const empLevel = overallScore >= 85 ? "Highly Job Ready" :
        overallScore >= 70 ? "Job Ready – Moderate Improvement Needed" :
            overallScore >= 55 ? "Developing" :
                overallScore >= 40 ? "Beginner" : "Not Ready";

    // Sub-skill Mock Spreads (User edit changes the top level Category Score for now, breakdown spreads slightly around it)
    const cap = (val) => Math.max(0, Math.min(100, Math.round(val)));

    const categorized_skill_indexes = {
        communication_skills: {
            score: baseComm,
            level: getLevelLabel(baseComm),
            sub_skills: ["fluency", "grammar accuracy", "clarity of thought", "active listening", "confidence tone", "filler word usage"],
            numerical_breakdown: { fluency: cap(baseComm), grammar_accuracy: cap(baseComm - 2), clarity_of_thought: cap(baseComm + 2), confidence_tone: cap(baseComm - 5) }
        },
        technical_skills: {
            score: baseTech,
            level: getLevelLabel(baseTech),
            sub_skills: ["concept clarity", "data structures", "algorithms", "system design", "backend development", "debugging ability"],
            numerical_breakdown: { concept_clarity: cap(baseTech + 5), system_design: cap(baseTech - 10), debugging_ability: cap(baseTech) }
        },
        behavioral_skills: {
            score: baseBehav,
            level: getLevelLabel(baseBehav),
            sub_skills: ["leadership", "ownership mindset", "conflict resolution", "team collaboration"],
            numerical_breakdown: { leadership: cap(baseBehav - 5), ownership_mindset: cap(baseBehav + 5), team_collaboration: cap(baseBehav) }
        },
        cognitive_skills: {
            score: baseCognitive,
            level: getLevelLabel(baseCognitive),
            sub_skills: ["critical thinking", "analytical reasoning", "logical structuring", "decision making"],
            numerical_breakdown: { critical_thinking: cap(baseCognitive), logical_structuring: cap(baseCognitive - 5) }
        },
        professional_readiness: {
            score: baseProf,
            level: getLevelLabel(baseProf),
            sub_skills: ["time management", "adaptability", "stress handling", "learning agility", "corporate etiquette"],
            numerical_breakdown: { time_management: cap(baseProf + 5), stress_handling: cap(baseProf - 10) }
        }
    };

    // 4. Job Eligibility Matching Engine
    const eligible_roles = [];
    const moderate_match_roles = [];
    const low_match_roles = [];

    // Object to track domain clusters (e.g. IT / Tech: 3 roles matched softly)
    const domainClusters = {};

    jobRoleMatrix.forEach(role => {
        const reqs = role.required_thresholds;

        let matchComm = (baseComm / reqs.communication_skills) * 0.20;
        let matchTech = (baseTech / reqs.technical_skills) * 0.25;
        let matchBehav = (baseBehav / reqs.behavioral_skills) * 0.20;
        let matchCog = (baseCognitive / reqs.cognitive_skills) * 0.15;
        let matchProf = (baseProf / reqs.professional_readiness) * 0.20;

        let rawMatchPercentage = (matchComm + matchTech + matchBehav + matchCog + matchProf) * 100;
        let matchPercentage = cap(rawMatchPercentage);

        // Gap Tracking (> 30% gap = Significant, < 15% = Moderate)
        const gap_skills = [];
        let hasSignificantGap = false;

        const checkGap = (actual, req, name) => {
            const gap = req - actual;
            if (gap > 30) {
                gap_skills.push(name);
                hasSignificantGap = true;
            } else if (gap > 0) {
                gap_skills.push(name);
            }
        };

        checkGap(baseComm, reqs.communication_skills, "Communication");
        checkGap(baseTech, reqs.technical_skills, "Technical");
        checkGap(baseBehav, reqs.behavioral_skills, "Behavioral");
        checkGap(baseCognitive, reqs.cognitive_skills, "Cognitive");
        checkGap(baseProf, reqs.professional_readiness, "Professional");

        // Aggregate domains
        if (!domainClusters[role.industry]) domainClusters[role.industry] = 0;
        domainClusters[role.industry] += matchPercentage;

        if (matchPercentage >= 85 && !hasSignificantGap) {
            eligible_roles.push({
                job_title: role.job_title,
                industry: role.industry,
                eligibility_score: matchPercentage,
                match_type: "Strong Match",
                required_skill_alignment: {
                    Communication: cap((baseComm / reqs.communication_skills) * 100),
                    Technical: cap((baseTech / reqs.technical_skills) * 100)
                },
                gap_skills: gap_skills.length > 0 ? gap_skills : ["None"],
                salary_range_lpa: role.salary_range_lpa,
                readiness_status: "Ready to Apply"
            });
        } else if (matchPercentage >= 60 && !hasSignificantGap) {
            moderate_match_roles.push({
                job_title: role.job_title,
                eligibility_score: matchPercentage,
                gap_reason: `Moderate shortfall in ${gap_skills.join(', ')}`,
                improvement_plan_weeks: gap_skills.length * 2
            });
        } else {
            low_match_roles.push({
                job_title: role.job_title,
                eligibility_score: matchPercentage,
                gap_reason: hasSignificantGap ? `Significant gaps in: ${gap_skills.join(', ')}` : `Shortfall in: ${gap_skills.join(', ')}`
            });
        }
    });

    // Sort to get Top 3 Relevant Jobs
    eligible_roles.sort((a, b) => b.eligibility_score - a.eligibility_score);
    const top_3_eligible = eligible_roles.slice(0, 3);

    const job_eligibility_matching = {
        job_readiness_percentage: overallScore,
        confidence_match_level: overallScore >= 80 ? "High" : overallScore >= 60 ? "Medium" : "Low",
        eligible_roles: top_3_eligible,
        moderate_match_roles: moderate_match_roles.sort((a, b) => b.eligibility_score - a.eligibility_score).slice(0, 5), // Keep UI clean
        low_match_roles: low_match_roles.sort((a, b) => b.eligibility_score - a.eligibility_score).slice(0, 5)
    };

    // 5. Strengths & Weaknesses Dynamic Assignment
    const categories = [
        { name: "Verbal & Communication", score: baseComm },
        { name: "Technical Precision", score: baseTech },
        { name: "Leadership & Collaboration", score: baseBehav },
        { name: "Cognitive Problem Solving", score: baseCognitive },
        { name: "Professional & Corporate Etiquette", score: baseProf }
    ];
    categories.sort((a, b) => b.score - a.score);

    let strengths = categories.filter(c => c.score >= 75).map(c => c.name).slice(0, 3);
    const improvement_areas = categories.filter(c => c.score < 60).map(c => c.name).slice(0, 3);

    // Fallback if Insufficient Data
    if (overallScore < 10) {
        strengths = ["Assessment Incomplete – Complete Mock Interview to Unlock Accurate Insights"];
    } else if (strengths.length === 0) {
        strengths = ["Continuous Learning Mindset"]; // Default positive framing
    }

    // 6. Best Fit Domain auto-detection
    let bestDomain = "General IT";
    let maxDomainScore = 0;
    for (const d in domainClusters) {
        if (domainClusters[d] > maxDomainScore) {
            maxDomainScore = domainClusters[d];
            bestDomain = d;
        }
    }

    // Calculate generic timeline based on lowest scores (Assume 5 pts improvement / month)
    const lowestCategory = categories[categories.length - 1];
    const avgReq = 80;
    const gapDistance = avgReq - lowestCategory.score;
    const estMonths = Math.max(1, Math.ceil(gapDistance / 5));

    const career_direction_recommendation = {
        best_fit_domain: bestDomain,
        suggested_career_path: top_3_eligible.length > 0
            ? jobRoleMatrix.find(j => j.job_title === top_3_eligible[0].job_title)?.growth_path
            : ["Entry Role", "Mid-Level Role", "Senior Role"],
        estimated_time_to_top_role_months: estMonths * 4 // Rough estimate from current readiness
    };

    const action_plan = {
        immediate_steps: [
            overallScore < 10 ? "Take a complete Mock Interview to generate your profile." : "Review lowest scoring categories.",
            improvement_areas.length > 0 ? `Schedule a targeted practice session for ${improvement_areas[0]}.` : "Apply for Strong Match Jobs!"
        ],
        skill_upgrade_focus: improvement_areas.length > 0 ? improvement_areas : ["Advanced System Architecture"]
    };

    return {
        overall_employability_score: overallScore,
        employability_level: empLevel,
        strengths,
        improvement_areas,
        categorized_skill_indexes,
        job_eligibility_matching,
        career_direction_recommendation,
        action_plan,
        blended_scores: b,
        ai_scores,
        override_scores
    };
};

// @desc    Generate structured Job Eligibility & Employability JSON
// @route   GET /api/skills/analyze
// @access  Private
const generateAnalysis = async (req, res) => {
    try {
        let existingAssessment = await Skill.findOne({ userId: req.user.id }).sort({ generated_at: -1 });

        // If an assessment already exists, return the dynamically blended result based on DB state
        if (existingAssessment) {
            const payload = generateIntelligencePayload(
                req.user.id,
                existingAssessment.assessmentId,
                existingAssessment.ai_scores,
                existingAssessment.override_scores
            );
            return res.status(200).json({ ...existingAssessment.toObject(), ...payload });
        }

        // If NO assessment exists, fetch Latest Completed Interview to create one
        const latestInterview = await InterviewSession.findOne({
            userId: req.user.id,
            status: 'COMPLETED'
        }).sort({ date: -1 });

        let ai_scores = {};

        if (!latestInterview) {
            // Assessment Incomplete State (Blank slate)
            ai_scores = {
                communication_skills: 0,
                technical_skills: 0,
                behavioral_skills: 0,
                cognitive_skills: 0,
                professional_readiness: 0
            };
        } else {
            // Extract from Interview
            const m = latestInterview.overallMetrics || {};
            ai_scores = {
                communication_skills: m.communicationIndex || 50,
                technical_skills: m.technicalStrengthIndex || 50,
                behavioral_skills: m.leadershipReadiness || 50,
                cognitive_skills: Math.round(((m.technicalStrengthIndex || 50) * 0.6) + ((m.leadershipReadiness || 50) * 0.4)),
                professional_readiness: Math.round(((m.confidenceLevel || 50) * 0.5) + ((m.communicationIndex || 50) * 0.5))
            };
        }

        const payload = generateIntelligencePayload(req.user.id, latestInterview ? latestInterview._id : null, ai_scores, {});

        // Save new baseline
        const assessment = await Skill.create({
            userId: req.user.id,
            assessmentId: latestInterview ? latestInterview._id : null,
            status: "success",
            ai_scores,
            override_scores: {},
            blended_scores: payload.blended_scores,
            overall_employability_score: payload.overall_employability_score,
            employability_level: payload.employability_level,
            strengths: payload.strengths,
            improvement_areas: payload.improvement_areas,
            categorized_skill_indexes: payload.categorized_skill_indexes,
            job_eligibility_matching: payload.job_eligibility_matching,
            career_direction_recommendation: payload.career_direction_recommendation,
            action_plan: payload.action_plan
        });

        res.status(200).json(assessment);

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// @desc    Dynamic Real-Time User Override
// @route   POST /api/skills/override
// @access  Private
const overrideScore = async (req, res) => {
    try {
        const { category, newScore } = req.body; // e.g., category: "technical_skills", newScore: 85

        let assessment = await Skill.findOne({ userId: req.user.id }).sort({ generated_at: -1 });

        if (!assessment) {
            return res.status(404).json({ status: "error", message: "No Employability Engine data exists yet." });
        }

        // Update Overrides and History
        const prevScore = assessment.blended_scores[category] || assessment.ai_scores[category];
        assessment.override_scores[category] = Number(newScore);

        assessment.improvement_history.push({
            date: new Date(),
            action: `User Overrode ${category} from ${prevScore} to ${newScore}`,
            previousScore: prevScore,
            newScore: Number(newScore)
        });

        // Trigger Recalculation completely
        const payload = generateIntelligencePayload(
            req.user.id,
            assessment.assessmentId,
            assessment.ai_scores,
            assessment.override_scores
        );

        // Save all recalculations back to DB
        Object.assign(assessment, payload);
        assessment.markModified('override_scores');
        assessment.markModified('blended_scores');
        assessment.markModified('improvement_history');
        assessment.markModified('categorized_skill_indexes');
        assessment.markModified('job_eligibility_matching');
        assessment.markModified('career_direction_recommendation');
        assessment.markModified('action_plan');

        await assessment.save();

        res.status(200).json(assessment);

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// @desc    Get Historical Assessments
// @route   GET /api/skills/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        const history = await Skill.find({ userId: req.user.id }).sort({ generated_at: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

module.exports = { generateAnalysis, overrideScore, getHistory };
