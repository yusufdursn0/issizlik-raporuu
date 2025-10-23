const mongoose = require('mongoose');


const profileSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, unique: true },
        name: String,
        city: String,
        sector: String,
        role: String,
        experienceYears: { type: Number, default: 0 },
        education: String,
        languages: [String],
        skills: [String],



        resumeParsed: {
            text: String,
            extracted: {
                emails: [String],
                phones: [String],
                skills: [String],
                education: [String],
                companies: [String],
                roles: [String]
            }
        }
    },
    { timestamps: true }
);


module.exports = mongoose.model('Profile', profileSchema);