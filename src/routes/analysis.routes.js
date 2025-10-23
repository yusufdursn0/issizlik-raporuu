const express = require('express');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const AnalysisResult = require('../models/AnalysisResult');
const { runAnalysis } = require('../services/analysisEngine');


const router = express.Router();


router.post('/run', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) return res.status(400).json({ message: 'Önce profil oluşturun veya CV yükleyin' });


        const result = await runAnalysis({ _id: req.user.id }, profile);


        // Kullanıcıya dost sonuç formatı
        res.json({
            riskScore: result.riskScore, // 0..1
            riskPercent: Math.round(result.riskScore * 100),
            level: result.riskScore < 0.33 ? 'Düşük' : result.riskScore < 0.66 ? 'Orta' : 'Yüksek',
            reasons: result.reasons,
            recommendations: result.recommendations,
            resultId: result._id
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.get('/latest', auth, async (req, res) => {
    const latest = await AnalysisResult.findOne({ userId: req.user.id }, {}, { sort: { createdAt: -1 } });
    if (!latest) return res.json({});
    res.json({
        riskScore: latest.riskScore,
        riskPercent: Math.round(latest.riskScore * 100),
        level: latest.riskScore < 0.33 ? 'Düşük' : latest.riskScore < 0.66 ? 'Orta' : 'Yüksek',
        reasons: latest.reasons,
        recommendations: latest.recommendations,
        resultId: latest._id
    });
});


module.exports = router;