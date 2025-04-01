import { Response } from 'express';
import { ZodError } from 'zod';
import monitoring from '../monitoring';
import ERRORS from '@/constants/error_types';

interface IHandleError {
    res: Response;
    message?: string;
    code?: number;
    error?: any;
}

/**
 * Utility function to handle errors and send a structured error response.
 * 
 * @param {IHandleError} params - The parameters including the response object, message, error code, and optional data.
 * @returns {Response} The response object with the error details in JSON format.
 */
const handleError = ({
    res,
    message = 'An error occurred',
    code = 500,
    error,
}: IHandleError): Response => {
    monitoring.error(message, error);

    let errorResponse: Omit<IHandleError, "res"> = {
        message: error?.message || message,
        code,
        error: error?.stack || error,
    };

    if (error instanceof ZodError) {
        errorResponse = {
            message: ERRORS.FORM_VALIDATION_ERROR,
            code: 400,
            error,
        };
    }

    return res.status(errorResponse.code || 500).json(errorResponse);
};

export default handleError;
