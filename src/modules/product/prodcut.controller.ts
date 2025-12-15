import { Request, Response } from 'express';
import { productService } from './product.service';
import { responseUtils } from '../../utils/response';
import { StatusCodes } from 'http-status-codes';
import { UpdateProductInput, CreateProductInput } from '../../interfaces/product';

export const productController = {
    async create(req: Request, res: Response) {
        try {
            const data: CreateProductInput = req.body;
            const product = await productService.create(data);
            return responseUtils.sendSuccess(
                res,
                product,
                StatusCodes.CREATED,
                'Product created successfully'
            );
        } catch (error: any) {
            if (error.message.includes('SKU already exists')) {
                return responseUtils.sendError(
                    res,
                    error.message,
                    StatusCodes.CONFLICT,
                    undefined,
                    'DUPLICATE_SKU'
                );
            }
            return responseUtils.sendError(
                res,
                error.message || 'Failed to create product',
                StatusCodes.BAD_REQUEST
            );
        }
    },

    async findAll(_req: Request, res: Response) {
        try {
            const products = await productService.findAll();
            return responseUtils.sendSuccess(
                res,
                products,
                StatusCodes.OK,
                'Products retrieved successfully'
            );
        } catch (error: any) {
            return responseUtils.sendError(
                res,
                'Failed to fetch products',
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
                    'Product ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            const product = await productService.findOne(id);
            return responseUtils.sendSuccess(
                res,
                product,
                StatusCodes.OK,
                'Product retrieved successfully'
            );
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return responseUtils.sendNotFound(res, error.message);
            }
            return responseUtils.sendError(
                res,
                error.message || 'Failed to fetch product',
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
                    'Product ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            const data: UpdateProductInput = req.body;
            const product = await productService.update(id, data);
            return responseUtils.sendSuccess(
                res,
                product,
                StatusCodes.OK,
                'Product updated successfully'
            );
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return responseUtils.sendNotFound(res, error.message);
            }
            if (error.message.includes('SKU already exists')) {
                return responseUtils.sendError(
                    res,
                    error.message,
                    StatusCodes.CONFLICT,
                    undefined,
                    'DUPLICATE_SKU'
                );
            }
            return responseUtils.sendError(
                res,
                error.message || 'Failed to update product',
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
                    'Product ID is required',
                    StatusCodes.BAD_REQUEST,
                    undefined,
                    'VALIDATION_ERROR'
                );
            }
            await productService.remove(id);
            return responseUtils.sendSuccess(
                res,
                null,
                StatusCodes.OK,
                'Product deleted successfully'
            );
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return responseUtils.sendNotFound(res, error.message);
            }
            return responseUtils.sendError(
                res,
                error.message || 'Failed to delete product',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
};