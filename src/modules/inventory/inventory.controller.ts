import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inventoryService } from './inventory.service';
import { responseUtils } from '../../utils/response';
import { InventoryItem } from '../../interfaces/inventory';

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
                StatusCodes.NO_CONTENT,
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
    }
};