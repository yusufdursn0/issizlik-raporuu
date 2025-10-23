const mongoose = require('mongoose');


const reasonSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['risk', 'strength'], required: true },
        message: { type: String, required: true },
        weight: { type: Number, default: 0 }
    },
    { _id: false }
);


const recommendationSchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        expectedRiskDrop: { type: Number, default: 0 } // 0.15 -> %15
    },
    { _id: false }
);


const analysisResultSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        riskScore: { type: Number, required: true }, // 0..1
        reasons: [reasonSchema],
        recommendations: [recommendationSchema]
    },
    { timestamps: true }
);


module.exports = mongoose.model('AnalysisResult', analysisResultSchema);