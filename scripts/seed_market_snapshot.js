
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');


const MarketSnapshot = require(path.join(__dirname, '..', 'src', 'models', 'MarketSnapshot'));

(async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/career_health';
        await mongoose.connect(uri);

        const now = new Date();


        const cityDemand = {
            'istanbul|frontend geliştirici': 0.75,
            'ankara|backend geliştirici': 0.55
        };

        const skillDemand = {
            react: 0.8,
            typescript: 0.7,
            node: 0.7,
            python: 0.75,
            aws: 0.7,
            sql: 0.6,
            docker: 0.65,
            angularjs: 0.2,
            'php 5': 0.15,
            php: 0.45
        };

        const coSkills = {
            python: ['aws', 'sql', 'docker'],
            react: ['typescript', 'node'],
            node: ['docker', 'aws']
        };

        const legacySkills = ['angularjs', 'php 5'];

        await MarketSnapshot.create({
            asOf: now,
            cityDemand,
            skillDemand,
            coSkills,
            legacySkills
        });

        console.log('✅ Seed tamam: MarketSnapshot @', now.toISOString());
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed hata:', err);
        process.exit(1);
    }
})();
