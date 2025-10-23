const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../utils/validators');


const router = express.Router();


router.post('/register', async (req, res) => {
    try {
        const parsed = registerSchema.parse(req.body);
        const exists = await User.findOne({ email: parsed.email });
        if (exists) return res.status(400).json({ message: 'Bu email zaten kayıtlı' });


        const passwordHash = await bcrypt.hash(parsed.password, 10);
        const user = await User.create({ email: parsed.email, passwordHash });


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const parsed = loginSchema.parse(req.body);
        const user = await User.findOne({ email: parsed.email });
        if (!user) return res.status(401).json({ message: 'Hatalı kimlik bilgileri' });


        const ok = await bcrypt.compare(parsed.password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: 'Hatalı kimlik bilgileri' });


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;