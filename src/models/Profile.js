
const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema(
    {
        degree: { type: String, trim: true },
        field: { type: String, trim: true },
        university: { type: String, trim: true },
        graduationYear: { type: Number },
    },
    { _id: false }
);

const ProfileSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
        fullName: { type: String, trim: true, maxlength: 120 },
        phone: { type: String, trim: true, maxlength: 24 },
        age: { type: Number, min: 15, max: 80 },
        city: { type: String, trim: true, maxlength: 60 },
        sector: { type: String, trim: true, maxlength: 80 },
        experienceYears: { type: Number, min: 0, max: 60 },
        skills: [{ type: String, trim: true }],
        education: EducationSchema,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Profile', ProfileSchema);
