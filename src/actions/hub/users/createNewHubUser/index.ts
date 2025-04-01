import insertNewHubUser from '@/queries/hub/insertNewHubUser';
import jwt from 'jsonwebtoken';

interface ICreateNewHubUser {
    firstName: string;
    lastName: string;
    email: any;
};

const createNewHubUser = async ({ firstName, lastName, email }: ICreateNewHubUser) => {
    try {
        const accessSecret = process.env.HUB_USER_JWT_ACCESS_SECRET;
        const accessExpiresIn = process.env.HUB_USER_JWT_ACCESS_EXPIRY;
        const refreshExpiresIn = process.env.HUB_USER_JWT_REFRESH_EXPIRY;
        const refreshSecret = process.env.HUB_USER_JWT_REFRESH_SECRET;


        if (!accessSecret || !accessExpiresIn || !refreshSecret || !refreshExpiresIn) {
            throw "Secrets not found for creating new hub user";
        }

        const accessToken = jwt.sign({ email }, accessSecret, { expiresIn: accessExpiresIn as any });
        const refreshToken = jwt.sign({ email }, refreshSecret, { expiresIn: refreshExpiresIn as any });

        const id = await insertNewHubUser({
            firstName,
            lastName,
            email,
        });
        return {
            user: {
                id,
                firstName,
                lastName,
                email,
            },
            accessToken,
            refreshToken,
        };
    } catch (error) {
        console.error("Error creating new hub user", error);
        throw error;
    }
};

export default createNewHubUser;