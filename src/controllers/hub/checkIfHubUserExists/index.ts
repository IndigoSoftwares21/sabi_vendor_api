import handleError from '@/utils/handleError';
import { Request, Response } from 'express';
import { checkIfHubUserExistsSchema } from './schema/checkIfHubUserExists.schema';
import selectHubUserByEmail from '@/queries/hub/selectHubUserByEmail';
import handleSuccess from '@/utils/handleSuccess';


const checkIfHubUserExists = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        checkIfHubUserExistsSchema.parse({ email });
        const hubUser = await selectHubUserByEmail({ email });
        const { id } = hubUser;
        handleSuccess({
            res,
            message: id ? 'Hub user exists' : 'Hub user does not exist',
            code: 200,
            data: {
                userExists: Boolean(id),
            },
        });

    } catch (error) {
        handleError({
            res,
            message: 'Failed to check if hub user exists',
            code: 500,
            error,
        });
    }
}

export default checkIfHubUserExists;