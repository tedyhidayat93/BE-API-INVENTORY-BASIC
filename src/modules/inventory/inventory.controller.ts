import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inventoryService } from './inventory.service';
import { responseUtils } from '../../utils/response';
import { InventoryItem, StockMovement } from '../../interfaces/inventory.js';
import { 
    StockMovementType, 
    StockOpnameStatus, 
    StockMovementInput, 
    StockOpnameInput 
} from '../../interfaces/inventory';


export const inventoryController = {
    async addOrUpdateItem(req: Request, res: Response) {
        try {
            const data: InventoryItem = req.body;
            const item = await inventoryService.addOrUpdateItem(data);
            
            return responseUtils.sendSuccess(
                res,
                item,
                StatusCodes.CREATED,
                'Inventory item added/updated successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to update inventory',
                error.message.includes('not found') ? StatusCodes.NOT_FOUND : StatusCodes.BAD_REQUEST,
                undefined,
                error.message.includes('already exists') ? 'DUPLICATE_ENTRY' : 'INVENTORY_ERROR'
            );
        }
    },

    async getByWarehouse(req: Request, res: Response) {
        try {
            const warehouseId = req.params.warehouseId as string;
            if (!warehouseId) {
                return responseUtils.sendError(
                    res,
                    'Warehouse ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            const items = await inventoryService.getInventoryByWarehouse(warehouseId);
            
            return responseUtils.sendSuccess(
                res,
                items,
                StatusCodes.OK,
                'Inventory retrieved successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                'Failed to fetch inventory',
                StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'INVENTORY_FETCH_ERROR'
            );
        }
    },

    async getByProduct(req: Request, res: Response) {
        try {
            const productId = req.params.productId as string;
            if (!productId) {
                return responseUtils.sendError(
                    res,
                    'Product ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            const items = await inventoryService.getInventoryByProduct(productId);
            
            return responseUtils.sendSuccess(
                res,
                items,
                StatusCodes.OK,
                'Inventory retrieved successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                'Failed to fetch inventory',
                StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'INVENTORY_FETCH_ERROR'
            );
        }
    },

    async updateQuantity(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { quantity } = req.body;
            
            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Item ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }

            if (typeof quantity !== 'number' || quantity < 0) {
                return responseUtils.sendError(
                    res,
                    'Quantity must be a non-negative number',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }

            const updatedItem = await inventoryService.updateQuantity(id, quantity);
            
            return responseUtils.sendSuccess(
                res,
                updatedItem,
                StatusCodes.OK,
                'Inventory quantity updated successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to update inventory quantity',
                error.message.includes('not found') ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'INVENTORY_UPDATE_ERROR'
            );
        }
    },

    async deleteItem(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Item ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            
            await inventoryService.deleteItem(id);
            
            return responseUtils.sendSuccess(
                res,
                null,
                StatusCodes.OK,
                'Inventory item deleted successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to delete inventory item',
                error.message.includes('not found') ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'INVENTORY_DELETE_ERROR'
            );
        }
    },

    // stock movement & stock opname
    async getStockMovements(req: Request, res: Response) {
        try {
            const filters: Parameters<typeof inventoryService.getStockMovements>[0] = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20,
            };

            if (typeof req.query.productId === 'string') {
                filters.productId = req.query.productId;
            }

            if (typeof req.query.warehouseId === 'string') {
                filters.warehouseId = req.query.warehouseId;
            }

            if (typeof req.query.type === 'string') {
                filters.type = req.query.type as StockMovementType;
            }

            if (typeof req.query.startDate === 'string') {
                filters.startDate = new Date(req.query.startDate);
            }

            if (typeof req.query.endDate === 'string') {
                filters.endDate = new Date(req.query.endDate);
            }

            const result = await inventoryService.getStockMovements(filters);

            return responseUtils.sendSuccess(
                res,
                result,
                StatusCodes.OK,
                'Stock movements retrieved successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to fetch stock movements',
                StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_MOVEMENT_ERROR'
            );
        }
    },

    async getStockMovementById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Stock movement ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }

            const movement = await inventoryService.getStockMovementById(id);
            return responseUtils.sendSuccess(
                res,
                movement,
                StatusCodes.OK,
                'Stock movement retrieved successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Stock movement not found',
                error.message.includes('not found') ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_MOVEMENT_ERROR'
            );
        }
    },

    async createStockMovement(req: Request, res: Response) {
        try {
            
            const data: StockMovementInput = {
                ...req.body,
                createdBy: req.user!.userId,
            };
            
            const movement = await inventoryService.createStockMovement(data);
            return responseUtils.sendSuccess(
                res,
                movement,
                StatusCodes.CREATED,
                'Stock movement created successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to create stock movement',
                StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_MOVEMENT_ERROR'
            );
        }
    },

    async updateStockMovement(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data: StockMovementInput = req.body;

            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Stock movement ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }

            const movement = await inventoryService.updateStockMovement(id, data);
            return responseUtils.sendSuccess(
                res,
                movement,
                StatusCodes.OK,
                'Stock movement updated successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to update stock movement',
                error.message.includes('not found') ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_MOVEMENT_ERROR'
            );
        }
    },

    async deleteStockMovement(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Stock movement ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }

            const movement = await inventoryService.deleteStockMovement(id);
            return responseUtils.sendSuccess(
                res,
                movement,
                StatusCodes.OK,
                'Stock movement deleted successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to delete stock movement',
                error.message.includes('not found') ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_MOVEMENT_ERROR'
            );
        }
    },

    // Stock Opname Controller Methods
    async createStockOpname(req: Request, res: Response) {
        try {
            const data: StockOpnameInput = {
                ...req.body,
                countDate: new Date(req.body.countDate)
            };
            
            const opname = await inventoryService.createStockOpname(data);
            
            return responseUtils.sendSuccess(
                res,
                opname,
                StatusCodes.CREATED,
                'Stock opname created successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to create stock opname',
                StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_OPNAME_ERROR'
            );
        }
    },

    async getStockOpnames(req: Request, res: Response) {
        try {
            const filters: Parameters<typeof inventoryService.getStockOpnames>[0] = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20,
            };

            if (typeof req.query.warehouseId === 'string') {
                filters.warehouseId = req.query.warehouseId;
            }

            if (typeof req.query.status === 'string') {
                filters.status = req.query.status as StockOpnameStatus;
            }

            if (typeof req.query.startDate === 'string') {
                filters.startDate = new Date(req.query.startDate);
            }

            if (typeof req.query.endDate === 'string') {
                filters.endDate = new Date(req.query.endDate);
            }

            const opnames = await inventoryService.getStockOpnames(filters);

            return responseUtils.sendSuccess(
                res,
                opnames,
                StatusCodes.OK,
                'Stock opnames retrieved successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to fetch stock opnames',
                StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_OPNAME_ERROR'
            );
        }
    },

    async getStockOpnameById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Stock opname by ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }

            const opname = await inventoryService.getStockOpnameById(id);

            return responseUtils.sendSuccess(
                res,
                opname,
                StatusCodes.OK,
                'Stock opname retrieved successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Stock opname not found',
                error.message.includes('not found') ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_OPNAME_ERROR'
            );
        }
    },

    async updateStockOpnameStatus(req: Request, res: Response) {
        try {
            const { status, updatedBy } = req.body;
            const { id } = req.params;
            
            if (!id || !status || !updatedBy) {
                return responseUtils.sendError(
                    res,
                    'Status and updatedBy are required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }

            const opname = await inventoryService.updateStockOpnameStatus(
                id,
                status,
                updatedBy
            );

            return responseUtils.sendSuccess(
                res,
                opname,
                StatusCodes.OK,
                'Stock opname status updated successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to update stock opname status',
                error.message.includes('not found') ? StatusCodes.NOT_FOUND : StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_OPNAME_ERROR'
            );
        }
    },

    async processStockOpname(req: Request, res: Response) {
        try {
            const { userId } = req.body;
            const { id } = req.params;
            
            if (!userId) {
                return responseUtils.sendError(
                    res,
                    'User ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Stock Opname  ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }

            const opname = await inventoryService.processStockOpname(
                id,
                userId
            );

            return responseUtils.sendSuccess(
                res,
                opname,
                StatusCodes.OK,
                'Stock opname processed successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                error.message || 'Failed to process stock opname',
                error.message.includes('not found') ? StatusCodes.NOT_FOUND : 
                error.message.includes('not in COMPLETED status') ? StatusCodes.CONFLICT :
                StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'STOCK_OPNAME_ERROR'
            );
        }
    }
};