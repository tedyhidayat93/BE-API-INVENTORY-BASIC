export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
}

export interface ErrorResponse {
    success: false;
    message: string;
    errors?: Array<{
        field?: string;
        message: string;
    }>;
    code?: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;