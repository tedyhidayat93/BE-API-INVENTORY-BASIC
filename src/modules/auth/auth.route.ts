import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { body } from 'express-validator';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Register route
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    validateRequest,
    authController.register.bind(authController)
);

// Login route
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').exists().withMessage('Password is required')
    ],
    validateRequest,
    authController.login.bind(authController)
);

// Get current user profile
router.get(
    '/me',
    authMiddleware,
    authController.getProfile.bind(authController)
);

export { router as authRoutes };