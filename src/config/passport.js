const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Strategy: LinkedInStrategy } = require('passport-linkedin-oauth2');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');

const JWT_SECRET = process.env.JWT_SECRET;
const BASE = process.env.OAUTH_CALLBACK_BASE || `http://localhost:${process.env.PORT || 4001}`;

async function upsertUser(provider, profile) {
    const providerId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
    const avatar = profile.photos?.[0]?.value || '';

    let user = await User.findOne({ provider, providerId });
    if (!user && email) {

        user = await User.findOne({ email });
        if (user) {
            user.provider = provider;
            user.providerId = providerId;
            user.name = user.name || name;
            user.avatar = user.avatar || avatar;
            await user.save();
        }
    }
    if (!user) {
        user = await User.create({ email, passwordHash: '', provider, providerId, name, avatar });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return token;
}


passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: `${BASE}/auth/linkedin/callback`,
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true
}, async (_at, _rt, profile, done) => {
    try { return done(null, { token: await upsertUser('linkedin', profile) }); }
    catch (e) { return done(e); }
}));


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE}/auth/google/callback`
}, async (_at, _rt, profile, done) => {
    try { return done(null, { token: await upsertUser('google', profile) }); }
    catch (e) { return done(e); }
}));


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${BASE}/auth/github/callback`,
    scope: ['user:email']
}, async (_at, _rt, profile, done) => {
    try { return done(null, { token: await upsertUser('github', profile) }); }
    catch (e) { return done(e); }
}));

module.exports = passport;
