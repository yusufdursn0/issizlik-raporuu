const mongoose = require('mongoose');


// Örnek/Stub pazar anlık verisi. Gerçekte job board/lokal veri kaynaklarından beslenecek.
const marketSnapshotSchema = new mongoose.Schema(
    {
        asOf: { type: Date, default: Date.now },
        // skill -> demand(0..1), trend(-1..1), obsolete(boolean)
        skills: {
            type: Map,
            of: new mongoose.Schema(
                {
                    demand: Number,
                    trend: Number,
                    obsolete: Boolean
                },
                { _id: false }
            )
        },
        // cityRoleDemand: { "İstanbul|Frontend Geliştirici": 0.8, ... }
        cityRoleDemand: {
            type: Map,
            of: Number
        }
    },
    { timestamps: true }
);


module.exports = mongoose.model('MarketSnapshot', marketSnapshotSchema);