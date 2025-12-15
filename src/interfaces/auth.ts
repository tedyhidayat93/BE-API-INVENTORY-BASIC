import { Request } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            userId: string;
            role: string;
        };
    }
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput extends LoginInput {
    name: string;
    role?: 'admin' | 'staff';
}

export interface AuthRequest extends Request {}