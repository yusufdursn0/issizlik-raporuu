const express = require('express');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const { profileUpdateSchema } = require('../utils/validators');


const router = express.Router();


router.get('/me', auth, async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json(profile || {});
});


router.put('/me', auth, async (req, res) => {
    try {
        const parsed = profileUpdateSchema.parse(req.body);
        const updated = await Profile.findOneAndUpdate(
            { userId: req.user.id },
            { $set: parsed },
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;