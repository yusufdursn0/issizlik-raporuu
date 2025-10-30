
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('./config/passport');

const app = express();


app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(passport.initialize());


app.use(express.static(path.join(__dirname, '..', 'public')));


const authRoutes = require('./routes/auth.routes');
const oauthRoutes = require('./routes/auth.oauth.routes');
const profileRoutes = require('./routes/profile.routes');
const uploadRoutes = require('./routes/upload.routes');
const analysisRoutes = require('./routes/analysis.routes');


app.get('/health', (req, res) => res.json({ ok: true }));


app.use('/auth', authRoutes);
app.use('/oauth', oauthRoutes);
app.use('/profile', profileRoutes);
app.use('/upload', uploadRoutes);
app.use('/analysis', analysisRoutes);


app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
    res.type('text/plain').send('API çalışıyor. Sağlık kontrolü için: /health');
});


app.use((req, res) => res.status(404).json({ message: 'Not Found' }));


app.use((err, req, res, next) => {
    console.error('❌ Error:', err);


    if (err?.name === 'ZodError') {
        return res.status(400).json({
            message: 'Geçersiz veri',
            errors: err.errors?.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
    }


    if (err?.code === 11000) {
        return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı' });
    }


    res.status(500).json({ message: 'Internal Server Error' });
});


process.on('unhandledRejection', (reason) => console.error('UNHANDLED REJECTION:', reason));
process.on('uncaughtException', (err) => console.error('UNCAUGHT EXCEPTION:', err));


const PORT = process.env.PORT || 4001;
connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/career_health')
    .then(() => app.listen(PORT, () => console.log(`🚀 Server ready on :${PORT}`)))
    .catch((e) => { console.error('DB connection error', e); process.exit(1); });
