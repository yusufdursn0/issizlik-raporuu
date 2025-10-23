const AnalysisResult = require('../models/AnalysisResult');
function clamp01(x) { return Math.max(0, Math.min(1, x)); }


function hasAny(skills = [], list = []) {
    const set = new Set((skills || []).map(s => s.toUpperCase()));
    return list.some(s => set.has(s));
}


async function runAnalysis(user, profile) {
    const snapshot = await getLatestSnapshot();
    const skillsMap = snapshot.skills || new Map();


    let score = 0.5;
    const reasons = [];
    const recs = [];


    const userSkills = (profile.skills || []).map(s => s.toUpperCase());


    // Obsolete skills
    for (const s of userSkills) {
        const meta = skillsMap.get(s);
        if (meta?.obsolete) {
            score += 0.1;
            reasons.push({ type: 'risk', message: `Eskimiş teknoloji: ${s}`, weight: 0.1 });
            // Öneri: modern karşılığı
            if (s.includes('ANGULARJS')) recs.push({ action: 'AngularJS -> React/Angular (güncel) geçiş eğitimi', expectedRiskDrop: 0.15 });
            if (s.includes('PHP 5')) recs.push({ action: 'PHP 5 -> Modern PHP/Laravel veya Node/Java geçiş planı', expectedRiskDrop: 0.15 });
        }
    }


    // High demand skills -> düşür
    for (const s of userSkills) {
        const meta = skillsMap.get(s);
        if (meta && meta.demand > 0.8) {
            score -= 0.1;
            reasons.push({ type: 'strength', message: `Yüksek talep beceri: ${s}`, weight: 0.1 });
        }
    }


    // Python + Cloud sinerji
    if (hasAny(userSkills, ['PYTHON']) && hasAny(userSkills, ['AWS', 'AZURE', 'GCP'])) {
        score -= 0.15;
        reasons.push({ type: 'strength', message: 'PYTHON + Bulut sinerjisi', weight: 0.15 });
    } else if (hasAny(userSkills, ['PYTHON']) && !hasAny(userSkills, ['AWS', 'AZURE', 'GCP'])) {
        // Öneri: Cloud ekle
        recs.push({ action: 'PYTHON ile birlikte AWS/Azure/GCP temel sertifika', expectedRiskDrop: 0.15 });
    }


    // Şehir/Rol talebi
    if (profile.city && profile.role) {
        const key = `${profile.city}|${profile.role}`;
        const cityDemand = snapshot.cityRoleDemand?.get(key);
        if (typeof cityDemand === 'number') {
            if (cityDemand > 0.75) {
                score -= 0.1;
                reasons.push({ type: 'strength', message: `${profile.city} için ${profile.role} talebi yüksek`, weight: 0.1 });
            } else if (cityDemand < 0.5) {
                score += 0.1;
                reasons.push({ type: 'risk', message: `${profile.city} için ${profile.role} talebi sınırlı`, weight: 0.1 });
                recs.push({ action: 'Uzaktan/hibrit işlere başvuru veya şehir esnekliği', expectedRiskDrop: 0.1 });
            }
        }
    }


    // Genel öneriler: Docker
    if (!hasAny(userSkills, ['DOCKER'])) {
        recs.push({ action: 'Docker temelini ekle (CI/CD hattına giriş)', expectedRiskDrop: 0.1 });
    }


    score = clamp01(score);


    const result = await AnalysisResult.create({
        userId: user._id,
        riskScore: score,
        reasons,
        recommendations: recs
    });


    return result;
}


module.exports = { runAnalysis };