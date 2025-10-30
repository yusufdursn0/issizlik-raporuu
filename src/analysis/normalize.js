const ALIASES = {
    js: 'javascript', ts: 'typescript',
    'react.js': 'react', 'nodejs': 'node', 'node.js': 'node',
    'sql server': 'sql', 'postgresql': 'postgres'
};
const VERSION_STRIP = [/(\s+v?\d+(\.\d+)*)$/i];
const LOWER = s => (s || '').toLowerCase().trim();

function normSkill(s) {
    let v = LOWER(s);
    v = ALIASES[v] || v;
    VERSION_STRIP.forEach(rx => v = v.replace(rx, '').trim());
    return v;
}
function normSkills(arr) {
    return [...new Set((arr || []).map(normSkill).filter(Boolean))];
}
function normRole(role) { return LOWER(role); }
function cityKey(city, role) { return `${city || '-'}|${role || '-'}`; }

module.exports = { normSkill, normSkills, normRole, cityKey };
