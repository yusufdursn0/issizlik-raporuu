// src/server.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const uploadRoutes = require('./routes/upload.routes');
const analysisRoutes = require('./routes/analysis.routes');

const app = express();

// Orta katmanlar
app.use(cors()); // İstersen aşağıdaki daraltılmış sürümü kullan (Aşağıda örnek var)
app.use(express.json({ limit: '2mb' }));

// Statik dosyalar (public/index.html varsa kökten servis edilir)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// API rotaları
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/upload', uploadRoutes);
app.use('/analysis', analysisRoutes);

// Kök rota: public/index.html varsa gönder, yoksa bilgi mesajı döndür
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.type('text/plain').send('API çalışıyor. Sağlık kontrolü için: /health');
    }
});

// 404 ve hata yakalayıcılar
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (res.headersSent) return next(err);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Süreç seviyesinde güvenlik ağı (opsiyonel)
process.on('unhandledRejection', (reason) => console.error('UNHANDLED REJECTION:', reason));
process.on('uncaughtException', (err) => console.error('UNCAUGHT EXCEPTION:', err));

const PORT = process.env.PORT || 4001;

connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/career_health')
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server ready on :${PORT}`);
        });
    })
    .catch((e) => {
        console.error('DB connection error', e);
        process.exit(1);
    });
