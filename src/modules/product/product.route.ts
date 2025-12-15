import { Router } from 'express';
import { body, param } from 'express-validator';
import { productController } from './prodcut.controller';
import { validateRequest } from '../../middlewares/validate-request';

const router = Router();

// Validation middleware
const validateProduct = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be a positive number'),
];

// Routes
router.post('/', validateProduct, validateRequest, productController.create);
router.get('/', productController.findAll);
router.get(
    '/:id',
    param('id').isUUID().withMessage('Invalid product ID'),
    validateRequest,
    productController.findOne
);
router.put(
    '/:id',
    [
        param('id').isUUID().withMessage('Invalid product ID'),
        body('name').optional().trim().notEmpty(),
        body('sku').optional().trim().notEmpty(),
        body('price')
            .optional()
            .isFloat({ gt: 0 })
            .withMessage('Price must be a positive number'),
    ],
    validateRequest,
    productController.update
);
router.delete(
    '/:id',
    param('id').isUUID().withMessage('Invalid product ID'),
    validateRequest,
    productController.remove
);

export { router as productRouter };