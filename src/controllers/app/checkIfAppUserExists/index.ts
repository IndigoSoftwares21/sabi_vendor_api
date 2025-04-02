import handleError from "@/utils/handleError";
import { Request, Response } from "express";
import { checkIfAppUserExistsSchema } from "./schema/checkIfAppUserExists.schema";
import selectAppUserByEmail from "@/queries/app/selectAppUserByEmail";
import handleSuccess from "@/utils/handleSuccess";

const checkIfAppUserExists = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        checkIfAppUserExistsSchema.parse({ email });
        const appUser = await selectAppUserByEmail({ email });
        const { id } = appUser;

        handleSuccess({
            res,
            message: id ? "App user exists" : "App user does not exist",
            code: 200,
            data: {
                userExists: Boolean(id),
            },
        });
    } catch (error) {
        handleError({
            res,
            message: "Failed to check if app user exists",
            code: 500,
            error,
        });
    }
};

export default checkIfAppUserExists;
