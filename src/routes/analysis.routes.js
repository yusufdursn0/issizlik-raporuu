// src/routes/analysis.routes.js
const express = require('express');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const {
    runForProfile,
    getLatest,
    listHistory,
    getById,
    remove,
} = require('../services/analysis.service');

const router = express.Router();

/**
 * POST /analysis/run
 * Kullanıcının profilini alır, Analiz Motoru’nu çalıştırır ve sonucu DB’ye kaydeder.
 */
router.post('/run', auth, async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id }).lean();
        if (!profile) {
            return res.status(404).json({ message: 'Profil bulunamadı' });
        }
        const out = await runForProfile({ userId: req.user.id, profile });
        return res.json(out);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /analysis/latest
 * Kullanıcının en son analizini döndürür.
 */
router.get('/latest', auth, async (req, res, next) => {
    try {
        const out = await getLatest({ userId: req.user.id });
        if (!out) {
            return res.status(404).json({ message: 'Sonuç yok' });
        }
        return res.json(out);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /analysis/history?page=&limit=
 * Kullanıcının geçmiş analizlerini sayfalı listeler.
 */
router.get('/history', auth, async (req, res, next) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 10);
        const out = await listHistory({ userId: req.user.id, page, limit });
        return res.json(out);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /analysis/:id
 * Tek bir analiz kaydını getirir (kullanıcıya ait olmalı).
 * DİKKAT: Dinamik rota, sabit rotalardan sonra gelmeli.
 */
router.get('/:id', auth, async (req, res, next) => {
    try {
        const out = await getById({ userId: req.user.id, id: req.params.id });
        if (!out) {
            return res.status(404).json({ message: 'Analiz bulunamadı' });
        }
        return res.json(out);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /analysis/:id
 * Bir analiz kaydını siler (kullanıcıya ait olmalı).
 */
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const ok = await remove({ userId: req.user.id, id: req.params.id });
        if (!ok) {
            return res.status(404).json({ message: 'Silinecek analiz bulunamadı' });
        }
        return res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
