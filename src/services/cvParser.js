const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');


function extractEmails(text) {
    const matches = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [];
    return Array.from(new Set(matches));
}


function extractPhones(text) {
    const matches = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g) || [];
    return Array.from(new Set(matches));
}


// Basit anahtar kelime tabanlı beceri çıkarımı (örnek). Gerçekte bir NER/LLM ile zenginleştirilebilir.
const KNOWN_SKILLS = [
    'python', 'aws', 'azure', 'gcp', 'react', 'angular', 'angularjs', 'node', 'express', 'php', 'php 5', 'sql', 'nosql', 'mongodb', 'docker', 'kubernetes', 'java', 'spring', '.net', 'c#', 'typescript', 'javascript'
];


function extractSkills(text) {
    const lower = text.toLowerCase();
    const set = new Set();
    for (const s of KNOWN_SKILLS) if (lower.includes(s)) set.add(s.toUpperCase());
    return Array.from(set);
}


async function parsePdf(buffer) {
    const data = await pdfParse(buffer);
    const text = data.text || '';
    return text;
}


async function parseDocx(buffer) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value || '';
}


async function parseResume(file) {
    const mime = file.mimetype;
    let text = '';
    if (mime === 'application/pdf') {
        text = await parsePdf(file.buffer);
    } else if (
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mime === 'application/msword'
    ) {
        text = await parseDocx(file.buffer);
    } else {
        throw new Error('Desteklenmeyen dosya türü');
    }


    const extracted = {
        emails: extractEmails(text),
        phones: extractPhones(text),
        skills: extractSkills(text),
        education: [],
        companies: [],
        roles: []
    };


    return { text, extracted };
}


module.exports = { parseResume };