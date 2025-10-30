// src/utils/validators.js
const { z } = require('zod');

const registerSchema = z.object({
    fullName: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    token: z.string().min(10),
    password: z.string().min(6),
});

const profileUpdateSchema = z.object({
    fullName: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
    age: z.number().int().min(15).max(80).optional(),
    city: z.string().trim().max(60).optional(),
    sector: z.string().trim().max(80).optional(),
    experienceYears: z.number().int().min(0).max(60).optional(),
    skills: z.array(z.string().trim().min(1)).optional(),
    education: z.object({
        degree: z.string().trim().optional(),
        field: z.string().trim().optional(),
        university: z.string().trim().optional(),
        graduationYear: z.number().int().min(1950).max(2100).optional(),
    }).partial().optional(),
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    profileUpdateSchema,
};
