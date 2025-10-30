const mongoose = require('mongoose');

const AnalysisResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    profile: mongoose.Schema.Types.Mixed,
    asOf: { type: Date, index: true },
    riskScore: Number,
    level: String,
    reasons: [{
        type: { type: String },
        message: String,
        weight: Number
    }],
    recommendations: [{
        action: String,
        expectedRiskDrop: Number,
        rationale: String
    }],
    featureContrib: [{
        contrib: Number
    }]
}, { timestamps: true });

AnalysisResultSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);
