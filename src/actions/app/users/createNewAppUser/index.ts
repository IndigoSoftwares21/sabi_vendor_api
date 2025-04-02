import insertNewAppUser from "@/queries/app/insertNewAppUser";
import jwt from "jsonwebtoken";

interface ICreateNewAppUser {
    firstName: string;
    lastName: string;
    email: any;
}

const createNewAppUser = async ({
    firstName,
    lastName,
    email,
}: ICreateNewAppUser) => {
    try {
        const accessSecret = process.env.APP_USER_JWT_ACCESS_SECRET;
        const accessExpiresIn = process.env.APP_USER_JWT_ACCESS_EXPIRY;
        const refreshExpiresIn = process.env.APP_USER_JWT_REFRESH_EXPIRY;
        const refreshSecret = process.env.APP_USER_JWT_REFRESH_SECRET;

        const missingSecrets = [];

        if (!accessSecret) missingSecrets.push("APP_USER_JWT_ACCESS_SECRET");
        if (!accessExpiresIn) missingSecrets.push("APP_USER_JWT_ACCESS_EXPIRY");
        if (!refreshSecret) missingSecrets.push("APP_USER_JWT_REFRESH_SECRET");
        if (!refreshExpiresIn) missingSecrets.push("APP_USER_JWT_REFRESH_EXPIRY");

        if (missingSecrets.length > 0) {
            throw `Missing environment variables: ${missingSecrets.join(", ")}`;
        }

        const accessToken = jwt.sign({ email }, accessSecret!, {
            expiresIn: accessExpiresIn as any,
        });
        const refreshToken = jwt.sign({ email }, refreshSecret!, {
            expiresIn: refreshExpiresIn as any,
        });

        const id = await insertNewAppUser({
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
        console.error("Error creating new app user", error);
        throw error;
    }
};

export default createNewAppUser;
