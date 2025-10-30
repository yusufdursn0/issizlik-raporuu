// src/routes/profile.routes.js
const express = require('express');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const { profileUpdateSchema } = require('../utils/validators');

const router = express.Router();

/** GET /profile  → kullanıcı profilini getir (yoksa boş obje) */
router.get('/', auth, async (req, res, next) => {
    try {
        const p = await Profile.findOne({ userId: req.user.id }).lean();
        res.json(p || {});
    } catch (e) {
        next(e);
    }
});

/** PUT /profile → kullanıcı profilini güncelle/oluştur */
router.put('/', auth, async (req, res, next) => {
    try {
        // skills hem array hem "a, b, c" string gelebilir → normalize et
        if (typeof req.body.skills === 'string') {
            req.body.skills = req.body.skills
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
        }

        // education boşsa {} yap
        if (!req.body.education) req.body.education = {};

        // Zod doğrulama
        const data = profileUpdateSchema.parse(req.body);

        // upsert
        const updated = await Profile.findOneAndUpdate(
            { userId: req.user.id },
            { $set: data },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();

        res.json(updated);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
