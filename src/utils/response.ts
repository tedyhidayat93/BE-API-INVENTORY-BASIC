import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse, ErrorResponse, SuccessResponse } from '../interfaces/response';

export const responseUtils = {
    /**
     * Send a successful response
     */
    sendSuccess<T>(
        res: Response,
        data: T,
        statusCode: number = StatusCodes.OK,
        message?: string
    ): Response<ApiResponse<T>> {
        const response: SuccessResponse<T> = {
            success: true,
            data,
        };

        if (message) {
            response.message = message;
        }

        return res.status(statusCode).json(response);
    },

    /**
     * Send an error response
     */
    sendError(
        res: Response,
        message: string,
        statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
        errors?: Array<{ field?: string; message: string }>,
        code?: string
    ): Response<ErrorResponse> {
        const response: ErrorResponse = {
            success: false,
            message,
        };

        if (errors && errors.length > 0) {
            response.errors = errors;
        }

        if (code) {
            response.code = code;
        }

        return res.status(statusCode).json(response);
    },

    /**
     * Send a validation error response
     */
    sendValidationError(
        res: Response,
        message: string = 'Validation error',
        errors: Array<{ field?: string; message: string }>
    ) {
        return this.sendError(
            res,
            message,
            StatusCodes.BAD_REQUEST,
            errors,
            'VALIDATION_ERROR'
        );
    },

    /**
     * Send a not found error response
     */
    sendNotFound(res: Response, message: string = 'Resource not found') {
        return this.sendError(
            res,
            message,
            StatusCodes.NOT_FOUND,
            undefined,
            'NOT_FOUND'
        );
    },

    /**
     * Send an unauthorized error response
     */
    sendUnauthorized(
        res: Response,
        message: string = 'Unauthorized access',
        code: string = 'UNAUTHORIZED'
    ) {
        return this.sendError(
            res,
            message,
            StatusCodes.UNAUTHORIZED,
            undefined,
            code
        );
    },

    /**
     * Send a forbidden error response
     */
    sendForbidden(
        res: Response,
        message: string = 'Forbidden',
        code: string = 'FORBIDDEN'
    ) {
        return this.sendError(
            res,
            message,
            StatusCodes.FORBIDDEN,
            undefined,
            code
        );
    },
};

export default responseUtils;