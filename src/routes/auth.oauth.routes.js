// src/routes/auth.oauth.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');

const router = express.Router();

function issueJWT(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/* ------------ Google ------------ */
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/index.html?oauth=fail' }),
    (req, res) => {
        const token = issueJWT(req.user);
        // Token'ı hash'e koyup profile'a gönderiyoruz (JS orada localStorage'a yazacak)
        res.redirect('/profile.html#token=' + encodeURIComponent(token));
    }
);

/* ------------ GitHub ------------ */
router.get('/github',
    passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/index.html?oauth=fail' }),
    (req, res) => {
        const token = issueJWT(req.user);
        res.redirect('/profile.html#token=' + encodeURIComponent(token));
    }
);

module.exports = router;
