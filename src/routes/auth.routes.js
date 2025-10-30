// src/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} = require('../utils/validators');
const { sendMail } = require('../services/emailService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

/* POST /auth/register */
router.post('/register', async (req, res, next) => {
    try {
        const { fullName, phone, email, password } = registerSchema.parse(req.body);

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı' });

        if (!JWT_SECRET) throw new Error('JWT_SECRET tanımlı değil (.env’i kontrol edin)');

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash });

        // Profil bilgilerini de oluştur/güncelle
        await Profile.findOneAndUpdate(
            { userId: user._id },
            { $set: { fullName: fullName || '', phone: phone || '' } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Kayıt başarılı', token });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı' });
        }
        next(err);
    }
});

/* POST /auth/login */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'E-posta veya şifre hatalı' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: 'E-posta veya şifre hatalı' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) { next(err); }
});

/* POST /auth/forgot-password */
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);
        const user = await User.findOne({ email });
        if (!user) return res.json({ message: 'Eğer böyle bir hesap varsa, e-posta gönderildi.' });

        const token = crypto.randomBytes(24).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        user.resetPasswordTokenHash = tokenHash;
        user.resetPasswordTokenExp = new Date(Date.now() + 1000 * 60 * 15); // 15 dk
        await user.save();

        const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 4001}`;
        const resetUrl = `${base}/reset-password.html?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

        await sendMail({
            to: email,
            subject: 'Şifre Sıfırlama Talebi',
            html: `<p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın (15 dk geçerli):</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>`
        });

        res.json({ message: 'Eğer böyle bir hesap varsa, e-posta gönderildi.' });
    } catch (err) { next(err); }
});

/* POST /auth/reset-password */
router.post('/reset-password', async (req, res, next) => {
    try {
        const { token, password } = resetPasswordSchema.parse(req.body);

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordTokenHash: tokenHash,
            resetPasswordTokenExp: { $gt: new Date() }
        });
        if (!user) return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş bağlantı.' });

        user.passwordHash = await bcrypt.hash(password, 10);
        user.resetPasswordTokenHash = undefined;
        user.resetPasswordTokenExp = undefined;
        await user.save();

        const tokenJwt = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Şifre güncellendi.', token: tokenJwt });
    } catch (err) { next(err); }
});

module.exports = router;
