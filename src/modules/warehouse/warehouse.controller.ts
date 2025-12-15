import { Request, Response } from 'express';
import { warehouseService } from './warehouse.service';
import { responseUtils } from '../../utils/response';
import { StatusCodes } from 'http-status-codes';
import { CreateWarehouseInput, UpdateWarehouseInput } from '../../interfaces/warehouse';

export const warehouseController = {
    async create(req: Request, res: Response) {
        try {
            const data: CreateWarehouseInput = req.body;
            const warehouse = await warehouseService.create(data);
            return responseUtils.sendSuccess(
                res,
                warehouse,
                StatusCodes.CREATED,
                'Warehouse created successfully'
            );
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                return responseUtils.sendError(
                    res,
                    error.message,
                    StatusCodes.CONFLICT,
                    undefined,
                    'DUPLICATE_ENTRY'
                );
            }
            return responseUtils.sendError(
                res,
                error.message || 'Failed to create warehouse',
                StatusCodes.BAD_REQUEST
            );
        }
    },

    async findAll(_req: Request, res: Response) {
        try {
            const warehouses = await warehouseService.findAll();
            return responseUtils.sendSuccess(
                res,
                warehouses,
                StatusCodes.OK,
                'Warehouses retrieved successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                'Failed to fetch warehouses',
                StatusCodes.INTERNAL_SERVER_ERROR,
                undefined,
                'SERVER_ERROR'
            );
        }
    },

    async findOne(req: Request, res: Response) {
        try {
            const id = req.params.id;
            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Warehouse ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            const warehouse = await warehouseService.findOne(id);
            return responseUtils.sendSuccess(
                res,
                warehouse,
                StatusCodes.OK,
                'Warehouse retrieved successfully'
            );
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return responseUtils.sendNotFound(res, error.message);
            }
            return responseUtils.sendError(
                res,
                error.message || 'Failed to fetch warehouse',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    async update(req: Request, res: Response) {
        try {
            const id = req.params.id;
            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Warehouse ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            const data: UpdateWarehouseInput = req.body;
            const warehouse = await warehouseService.update(id, data);
            return responseUtils.sendSuccess(
                res,
                warehouse,
                StatusCodes.OK,
                'Warehouse updated successfully'
            );
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return responseUtils.sendNotFound(res, error.message);
            }
            if (error.message.includes('already exists')) {
                return responseUtils.sendError(
                    res,
                    error.message,
                    StatusCodes.CONFLICT,
                    undefined,
                    'DUPLICATE_ENTRY'
                );
            }
            return responseUtils.sendError(
                res,
                error.message || 'Failed to update warehouse',
                StatusCodes.BAD_REQUEST
            );
        }
    },

    async remove(req: Request, res: Response) {
        try {
            const id = req.params.id;
            if (!id) {
                return responseUtils.sendError(
                    res,
                    'Warehouse ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            await warehouseService.remove(id);
            return responseUtils.sendSuccess(
                res,
                null,
                StatusCodes.OK,
                'Warehouse deleted successfully'
            );
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return responseUtils.sendNotFound(res, error.message);
            }
            return responseUtils.sendError(
                res,
                error.message || 'Failed to delete warehouse',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
};