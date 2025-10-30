const { normSkills, normRole, cityKey } = require('./normalize');
const { recommend } = require('./recommender');
const { weights, thresholds } = require('./rules');

function clamp01(x) { return Math.max(0, Math.min(1, x)); }



function analyze(input, snapshot) {
    const skills = normSkills(input.skills);
    const role = normRole(input.role);
    const exp = Number(input.experienceYears || 0);
    const contrib = [];
    let risk = weights.base;


    const cdKey = cityKey(input.city, role);
    const cityDemand = snapshot.cityDemand.get(cdKey) || 0;
    const cityContrib = -weights.cityDemand * cityDemand;
    contrib.push({ feature: `city:${cdKey}`, contrib: cityContrib });
    risk = clamp01(risk + cityContrib);


    let skillDemandSum = 0;
    skills.forEach(s => { skillDemandSum += (snapshot.skillDemand.get(s) || 0); });
    const skillAvg = skills.length ? skillDemandSum / skills.length : 0;
    const skillContrib = -weights.skillDemand * skillAvg;
    contrib.push({ feature: `skills:demand_avg`, contrib: skillContrib });
    risk = clamp01(risk + skillContrib);


    let legacyHits = 0;
    (snapshot.legacySkills || []).forEach(legacy => {
        if (skills.includes(legacy)) legacyHits += 1;
    });
    const legacyContrib = weights.legacyPenalty * Math.min(legacyHits * 0.25, 1);
    if (legacyHits > 0) contrib.push({ feature: `legacy:${legacyHits}`, contrib: legacyContrib });
    risk = clamp01(risk + legacyContrib);


    let coHits = 0;
    skills.forEach(s => {
        const list = snapshot.coSkills.get(s) || [];
        const hasMatch = list.some(x => skills.includes(x));
        if (hasMatch) coHits += 1;
    });
    const coContrib = -weights.coSkillBoost * Math.min(coHits * 0.2, 1);
    if (coHits > 0) contrib.push({ feature: `coSkills:${coHits}`, contrib: coContrib });
    risk = clamp01(risk + coContrib);


    const exp01 = Math.min(exp / 10, 1);
    const expContrib = -weights.experience * exp01;
    contrib.push({ feature: `experience:${exp}y`, contrib: expContrib });
    risk = clamp01(risk + expContrib);


    const level = risk < thresholds.low ? 'Düşük'
        : risk < thresholds.mid ? 'Orta'
            : 'Yüksek';


    const sorted = [...contrib].sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib));
    const reasons = sorted.slice(0, 5).map(c => ({
        type: c.contrib < 0 ? 'strength' : 'risk',
        message: explain(c),
        weight: Math.min(Math.abs(c.contrib), 1)
    }));

    // Öneriler
    const recommendations = recommend({ skills, snapshot });

    return {
        riskScore: risk,
        level,
        reasons,
        recommendations,
        featureContrib: contrib
    };
}

function explain(c) {
    if (c.feature.startsWith('city:')) return c.contrib < 0 ? 'Şehrindeki rol talebi yüksek' : 'Şehrindeki rol talebi düşük';
    if (c.feature.startsWith('skills:demand_avg')) return c.contrib < 0 ? 'Becerilerin yüksek talep görüyor' : 'Becerilerin talebi sınırlı';
    if (c.feature.startsWith('legacy:')) return 'Legacy teknoloji riski artırıyor';
    if (c.feature.startsWith('coSkills:')) return c.contrib < 0 ? 'Birlikte istenen beceri eşleşmeleri var' : 'Birlikte istenen beceri uyumu zayıf';
    if (c.feature.startsWith('experience:')) return c.contrib < 0 ? 'Tecrübe riski düşürüyor' : 'Tecrübe yetersiz';
    return 'Etki eden faktör';
}

module.exports = { analyze };
