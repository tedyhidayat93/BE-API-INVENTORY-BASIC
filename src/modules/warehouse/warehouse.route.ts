import { Router } from 'express';
import { body, param } from 'express-validator';
import { warehouseController } from './warehouse.controller';
import { validateRequest } from '../../middlewares/validate-request';

const router = Router();

// Validation middleware
const validateWarehouse = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('location').optional().trim(),
];

// Routes
router.post('/', validateWarehouse, validateRequest, warehouseController.create);
router.get('/', warehouseController.findAll);
router.get(
    '/:id',
    param('id').isUUID().withMessage('Invalid warehouse ID'),
    validateRequest,
    warehouseController.findOne
);
router.put(
    '/:id',
    [
        param('id').isUUID().withMessage('Invalid warehouse ID'),
        body('name').optional().trim().notEmpty(),
        body('location').optional().trim(),
    ],
    validateRequest,
    warehouseController.update
);
router.delete(
    '/:id',
    param('id').isUUID().withMessage('Invalid warehouse ID'),
    validateRequest,
    warehouseController.remove
);

export { router as warehouseRouter };