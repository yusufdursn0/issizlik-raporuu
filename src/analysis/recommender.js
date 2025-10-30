const { normSkill } = require('./normalize');

function recommend({ skills, snapshot }) {
    const skillsSet = new Set((skills || []).map(normSkill));
    const recs = [];


    for (const s of skillsSet) {
        const list = snapshot.coSkills.get(s) || [];
        for (const cs of list) {
            if (!skillsSet.has(cs)) {
                recs.push({
                    action: `Profili "${cs}" ile güçlendir`,
                    expectedRiskDrop: 0.10,
                    rationale: `Pazarda ${s} ile beraber ${cs} sık isteniyor`
                });
            }
        }
    }


    (snapshot.legacySkills || []).forEach(legacy => {
        if (skillsSet.has(legacy)) {
            const modern = legacy.startsWith('php') ? 'node' :
                legacy.includes('angularjs') ? 'react' : 'docker';
            recs.push({
                action: `Legacy "${legacy}" yerine "${modern}" öğren`,
                expectedRiskDrop: 0.15,
                rationale: `${legacy} talebi düşük, ${modern} talebi daha yüksek`
            });
        }
    });


    const grouped = {};
    for (const r of recs) {
        grouped[r.action] = grouped[r.action]
            ? { ...grouped[r.action], expectedRiskDrop: Math.max(grouped[r.action].expectedRiskDrop, r.expectedRiskDrop) }
            : r;
    }
    return Object.values(grouped).slice(0, 6);
}

module.exports = { recommend };
