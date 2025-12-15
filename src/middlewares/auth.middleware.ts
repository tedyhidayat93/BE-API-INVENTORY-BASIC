import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthRequest } from '../interfaces/auth';

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    if (typeof authHeader !== 'string') {
        return res.status(401).json({ message: 'Authentication failed' });
    }
    const token = authHeader.split(' ')[1] || '';

    try {
        // Verify token and handle type safety
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (typeof decoded === 'string' || !decoded || !('userId' in decoded) || !('role' in decoded)) {
            throw new Error('Invalid token payload');
        }
        
        const { userId, role } = decoded as { userId: string; role: string };
        
        // Attach user to the request object
        req.user = {
            userId,
            role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Role-based access control middleware
export const authorize = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};