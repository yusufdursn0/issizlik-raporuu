const { z } = require('zod');


const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});


const loginSchema = registerSchema;


const profileUpdateSchema = z.object({
    name: z.string().optional(),
    city: z.string().optional(),
    sector: z.string().optional(),
    role: z.string().optional(),
    experienceYears: z.number().min(0).optional(),
    education: z.string().optional(),
    languages: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional()
});


module.exports = { registerSchema, loginSchema, profileUpdateSchema };