import jwt from "jsonwebtoken";

interface ILoginAppUser {
    firstName: string;
    lastName: string;
    email: string;
}

const loginAppUser = async ({ firstName, lastName, email }: ILoginAppUser) => {
    try {
        const accessSecret = process.env.APP_USER_JWT_ACCESS_SECRET;
        const accessExpiresIn = process.env.APP_USER_JWT_ACCESS_EXPIRY;
        const refreshExpiresIn = process.env.APP_USER_JWT_REFRESH_EXPIRY;
        const refreshSecret = process.env.APP_USER_JWT_REFRESH_SECRET;

        if (
            !accessSecret ||
            !accessExpiresIn ||
            !refreshSecret ||
            !refreshExpiresIn
        ) {
            throw "Secrets not found for logging in app user";
        }

        const accessToken = jwt.sign({ email }, accessSecret, {
            expiresIn: accessExpiresIn as any,
        });
        const refreshToken = jwt.sign({ email }, refreshSecret, {
            expiresIn: refreshExpiresIn as any,
        });

        return {
            firstName,
            lastName,
            email,
            accessToken,
            refreshToken,
        };
    } catch (error) {
        console.error("Error logging in app user", error);
        throw error;
    }
};

export default loginAppUser;
