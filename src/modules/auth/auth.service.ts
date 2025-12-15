import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema/users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginInput, RegisterInput } from '../../interfaces/auth.js';

export class AuthService {
    private generateToken(userId: string, role: string): string {
        return jwt.sign(
            { userId, role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );
    }

    async register(data: RegisterInput) {
        try {
            const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1);

            if (existingUser) {
                throw new Error('Email already in use');
            }

            const hashedPassword = await bcrypt.hash(data.password, 10);

            const [newUser] = await db
            .insert(users)
            .values({
                name: data.name,
                email: data.email,
                passwordHash: hashedPassword,
                role: data.role ?? 'staff',
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
            });

            if (!newUser) {
                throw new Error('Failed to create user');
            }

            const token = this.generateToken(newUser.id ?? '', newUser.role ?? 'staff');

            return {
                user: newUser,
                token,
            };
        } catch (err) {
            console.error('DB ERROR DETAIL:', err);
            throw err;
        }
    }

    async login(data: LoginInput) {
        // Find user by email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, data.email));

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = this.generateToken(user.id, user.role || 'staff');

        return {
            user: {
                id: user.id,
                name: user.name || '',
                email: user.email,
                role: user.role || 'staff'
            },
            token
        };
    }

    async getProfile(userId: string) {
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt
            })
            .from(users)
            .where(eq(users.id, userId));

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }
}

export const authService = new AuthService();