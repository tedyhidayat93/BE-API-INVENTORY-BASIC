import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { inventoryController } from './inventory.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { STOCK_MOVEMENT_TYPES, STOCK_OPNAME_STATUSES, StockMovementType, StockOpnameStatus } from '../../interfaces/inventory.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';



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

// Stock Movement Routes
router.get(
    '/movements',
    [
        query('productId').optional().isUUID(),
        query('warehouseId').optional().isUUID(),
        query('type').optional().isIn(STOCK_MOVEMENT_TYPES),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        validateRequest
    ],
    inventoryController.getStockMovements
);

router.get(
    '/movements/:id',
    [
        param('id').isUUID(),
        validateRequest
    ],
    inventoryController.getStockMovementById
);

router.post(
    '/movements',
    [
        body('productId').isUUID().withMessage('Valid product ID is required'),
        body('type').isIn(STOCK_MOVEMENT_TYPES).withMessage(`Type must be one of: ${STOCK_MOVEMENT_TYPES.join(', ')}`),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
        body('fromWarehouseId')
            .optional()
            .isUUID()
            .withMessage('Valid source warehouse ID is required for OUT, TRANSFER, or ADJUSTMENT types')
            .custom((value, { req }) => {
                if (['OUT', 'TRANSFER'].includes(req.body.type) && !value) {
                    throw new Error('Source warehouse is required for this movement type');
                }
                if (req.body.type === 'ADJUSTMENT' && !value && !req.body.toWarehouseId) {
                    throw new Error('Either source or destination warehouse is required for adjustment');
                }
                return true;
            }),
        body('toWarehouseId')
            .optional()
            .isUUID()
            .withMessage('Valid destination warehouse ID is required for IN or TRANSFER types')
            .custom((value, { req }) => {
                if (req.body.type === 'IN' && !value) {
                    throw new Error('Destination warehouse is required for IN movement');
                }
                if (req.body.type === 'TRANSFER' && !value) {
                    throw new Error('Destination warehouse is required for TRANSFER movement');
                }
                if (req.body.type === 'TRANSFER' && value === req.body.fromWarehouseId) {
                    throw new Error('Source and destination warehouses must be different');
                }
                return true;
            }),
        body('referenceId').optional().isString().withMessage('Reference ID must be a string'),
        body('notes').optional().isString().withMessage('Notes must be a string'),
        validateRequest
    ],
    authMiddleware,
    inventoryController.createStockMovement
);

router.patch(
    '/movements/:id',
    [
        param('id').isUUID(),
        body('productId').isUUID(),
        body('warehouseId').isUUID(),
        body('type').isIn(STOCK_MOVEMENT_TYPES),
        body('quantity').isInt({ min: 0 }),
        body('notes').optional().isString(),
        body('updatedBy').isUUID(),
        validateRequest
    ],
    inventoryController.updateStockMovement
);

router.delete(
    '/movements/:id',
    [
        param('id').isUUID(),
        validateRequest
    ],
    inventoryController.deleteStockMovement
);

// Stock Opname Routes
router.post(
    '/opnames',
    [
        body('warehouseId').isUUID(),
        body('countDate').isISO8601(),
        body('notes').optional().isString(),
        body('items').isArray(),
        body('items.*.productId').isUUID(),
        body('items.*.physicalQuantity').isInt({ min: 0 }),
        body('items.*.notes').optional().isString(),
        body('createdBy').isUUID(),
        validateRequest
    ],
    inventoryController.createStockOpname
);

router.get(
    '/opnames',
    [
        query('warehouseId').optional().isUUID(),
        query('status').optional().isIn(STOCK_OPNAME_STATUSES),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        validateRequest
    ],
    inventoryController.getStockOpnames
);

router.get(
    '/opnames/:id',
    [
        param('id').isUUID(),
        validateRequest
    ],
    inventoryController.getStockOpnameById
);

router.patch(
    '/opnames/:id/status',
    [
        param('id').isUUID(),
        body('status').isIn(Object.values(STOCK_OPNAME_STATUSES)),
        body('updatedBy').isUUID(),
        validateRequest
    ],
    inventoryController.updateStockOpnameStatus
);

router.post(
    '/opnames/:id/process',
    [
        param('id').isUUID(),
        body('userId').isUUID(),
        validateRequest
    ],
    inventoryController.processStockOpname
);


export { router as inventoryRouter };