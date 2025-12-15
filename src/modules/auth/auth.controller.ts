import { Request, Response } from 'express';
import { authService } from './auth.service';
import { LoginInput, RegisterInput } from '../../interfaces/auth';
import { StatusCodes } from 'http-status-codes';
import { responseUtils } from '../../utils/response';

export class AuthController {
    async register(req: Request, res: Response) {
        const userData = req.body as RegisterInput;
        const result = await authService.register(userData);
        return responseUtils.sendSuccess(
            res,
            result,
            StatusCodes.CREATED,
            'User registered successfully'
        );
        try {
            
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Registration failed',
                StatusCodes.BAD_REQUEST
            );
        }
    }

    async login(req: Request, res: Response) {
        try {
            const credentials = req.body as LoginInput;
            const result = await authService.login(credentials);
            
            return responseUtils.sendSuccess(
                res,
                result,
                StatusCodes.OK,
                'Login successful'
            );
        } catch (error: any) {
            return responseUtils.sendUnauthorized(
                res,
                error.message || 'Invalid credentials',
                'INVALID_CREDENTIALS'
            );
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            // @ts-ignore - user is attached to request by auth middleware
            const userId = req.user.userId;
            const user = await authService.getProfile(userId);
            
            return responseUtils.sendSuccess(
                res,
                user,
                StatusCodes.OK,
                'Profile retrieved successfully'
            );
        } catch (error: any) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: error.message || 'Profile not found'
            });
        }
    }
}

export const authController = new AuthController();