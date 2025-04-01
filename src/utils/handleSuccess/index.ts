import { Response } from 'express';

interface IHandleSuccess {
    res: Response;
    message: string;
    code: number;
    data?: any;
}

/**
 * Utility function to handle success responses and send a structured success response.
 * 
 * @param {IHandleSuccess} params - The parameters including the response object, message, success code, and optional data.
 * @returns {Response} The response object with the success details in JSON format.
 */
const handleSuccess = ({
    res,
    message = 'Success',
    code = 204, // Default status code to 204
    data,
}: IHandleSuccess): Response => {
    const successResponse = {
        message,
        code,
        data: data || null,
    };

    return res.status(code).json(successResponse);
};

export default handleSuccess;
