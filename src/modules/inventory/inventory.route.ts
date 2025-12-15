import { Router } from 'express';
import { body, param } from 'express-validator';
import { inventoryController } from './inventory.controller';
import { validateRequest } from '../../middlewares/validate-request';

const router = Router();

// Validation middleware
const validateInventoryItem = [
    body('productId').isUUID().withMessage('Valid product ID is required'),
    body('warehouseId').isUUID().withMessage('Valid warehouse ID is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('reorderLevel').optional().isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
];

// Routes
// Add or update inventory item
router.post(
    '/',
    validateInventoryItem,
    validateRequest,
    inventoryController.addOrUpdateItem
);

// Get inventory by warehouse
router.get(
    '/warehouse/:warehouseId',
    param('warehouseId').isUUID().withMessage('Valid warehouse ID is required'),
    validateRequest,
    inventoryController.getByWarehouse
);

// Get inventory by product
router.get(
    '/product/:productId',
    param('productId').isUUID().withMessage('Valid product ID is required'),
    validateRequest,
    inventoryController.getByProduct
);

// Update inventory quantity
router.patch(
    '/:id/quantity',
    [
        param('id').isUUID().withMessage('Valid inventory item ID is required'),
        body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    ],
    validateRequest,
    inventoryController.updateQuantity
);

// Delete inventory item
router.delete(
    '/:id',
    param('id').isUUID().withMessage('Valid inventory item ID is required'),
    validateRequest,
    inventoryController.deleteItem
);

export { router as inventoryRouter };