const mongoose = require('mongoose');

const MarketSnapshotSchema = new mongoose.Schema({
    asOf: { type: Date, index: true },
    cityDemand: { type: Map, of: Number, default: {} },
    skillDemand: { type: Map, of: Number, default: {} },
    coSkills: { type: Map, of: [String], default: {} },
    legacySkills: { type: [String], default: [] },
}, { timestamps: true });

MarketSnapshotSchema.index({ asOf: -1 });
module.exports = mongoose.model('MarketSnapshot', MarketSnapshotSchema);
