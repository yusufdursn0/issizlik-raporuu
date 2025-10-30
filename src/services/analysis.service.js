// src/services/analysis.service.js
const MarketSnapshot = require('../models/MarketSnapshot');
const AnalysisResult = require('../models/AnalysisResult');
const { analyze } = require('../analysis/engine');

/** En güncel market snapshot’ını getirir. Yoksa anlaşılır bir hata fırlatır. */
async function getLatestSnapshot() {
    const snap = await MarketSnapshot.findOne({}, {}, { sort: { asOf: -1, createdAt: -1 } });
    if (!snap) {
        throw new Error('MarketSnapshot bulunamadı (örn. seed verisi yok)');
    }
    return snap;
}

/** Verilen profil ile analiz çalıştırır ve sonucu DB’ye kaydedip geri döner. */
async function runForProfile({ userId, profile }) {
    const snap = await getLatestSnapshot();
    const result = analyze(profile, snap);

    const doc = await AnalysisResult.create({
        userId,
        profile,
        asOf: snap.asOf,
        ...result
    });

    return doc.toObject();
}

/** Kullanıcının en son analiz sonucunu döner. */
async function getLatest({ userId }) {
    const doc = await AnalysisResult.findOne({ userId }, {}, { sort: { createdAt: -1 } });
    return doc ? doc.toObject() : null;
}

/**
 * Kullanıcının geçmiş analizlerini sayfalı listeler.
 * @param {Object} p
 * @param {string} p.userId
 * @param {number} [p.page=1]
 * @param {number} [p.limit=10]
 */
async function listHistory({ userId, page = 1, limit = 10 }) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 10));

    const query = { userId };
    const total = await AnalysisResult.countDocuments(query);
    const items = await AnalysisResult.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('riskScore level reasons recommendations featureContrib createdAt') // asOf/id göstermiyoruz
        .lean();

    return {
        items,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total
    };
}

/** Tek bir analiz sonucunu id ile getirir (kullanıcıya ait olmalı). */
async function getById({ userId, id }) {
    const doc = await AnalysisResult.findOne({ _id: id, userId }).lean();
    return doc || null;
}

/** Analizi sil (kullanıcıya ait kayıt). */
async function remove({ userId, id }) {
    const res = await AnalysisResult.deleteOne({ _id: id, userId });
    return res.deletedCount > 0;
}

module.exports = {
    runForProfile,
    getLatest,
    getLatestSnapshot,
    listHistory,
    getById,
    remove,
};
