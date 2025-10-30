const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, default: '' },


        provider: { type: String },
        providerId: { type: String, index: true, sparse: true },
        name: { type: String },
        avatar: { type: String },


        resetPasswordTokenHash: { type: String, index: true },
        resetPasswordTokenExp: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
