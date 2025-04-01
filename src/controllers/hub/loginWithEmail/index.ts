import handleError from "@/utils/handleError";
import { Request, Response } from "express";
import { loginWithEmailSchema } from "./schema/loginWithEmail.schema";
import handleSuccess from "@/utils/handleSuccess";
import insertOtp from "@/queries/shared/insertOtp";
import generateAndEncodeOtp from "@/utils/generateAndEncodeOtp";

const loginWithEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        loginWithEmailSchema.parse({ email });

        const otp = generateAndEncodeOtp();

        const otpId = await insertOtp({
            email,
            otp,
        });

        return handleSuccess({
            res,
            message: "Login with email successful",
            code: 201,
            data: {
                email,
                otpId
            },
        });

    } catch (error) {
        return handleError({
            res,
            message: "Failed to login with email",
            code: 500,
            error,
        });
    }
};

export default loginWithEmail;