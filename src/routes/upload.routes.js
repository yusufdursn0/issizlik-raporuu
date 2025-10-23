// src/routes/upload.routes.js
const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const cvParser = require('../services/cvParser');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CV yükleme ve profili güncelleme
router.post('/cv', auth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Dosya gerekli (PDF/DOCX)' });
        }

        // ⬇️ await kullanacağımız için handler async
        const parsed = await cvParser.parseResume(req.file); // Promise dönmeli
        const parsedText = parsed?.text || '';
        const extracted = parsed?.extracted || {};

        const parsedSkills = Array.from(
            new Set((extracted.skills || []).map(s => String(s).trim()).filter(Boolean))
        );

        // Mevcut profili al ya da oluştur
        let profile = await Profile.findOne({ userId: req.user.id });

        if (!profile) {
            profile = await Profile.create({
                userId: req.user.id,
                resumeParsed: { text: parsedText, extracted },
                skills: parsedSkills
            });
        } else {
            // Node tarafında string[] birleştir (MONGO $setUnion KULLANMA!)
            const currentSkills = (profile.skills || []).map(s => String(s).trim()).filter(Boolean);
            const mergedSkills = Array.from(new Set([...currentSkills, ...parsedSkills]));

            profile.resumeParsed = { text: parsedText, extracted };
            profile.skills = mergedSkills;
            await profile.save();
        }

        return res.json({
            message: 'CV yüklendi ve profil güncellendi',
            profile: {
                city: profile.city,
                role: profile.role,
                skills: profile.skills
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
