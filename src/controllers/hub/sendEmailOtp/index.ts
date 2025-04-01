import handleError from "@/utils/handleError";
import { Request, Response } from "express";
import { sendEmailOtpSchema } from "./schema/loginWithEmail.schema";
import handleSuccess from "@/utils/handleSuccess";
import insertOtp from "@/queries/shared/insertOtp";
import generateAndEncodeOtp from "@/utils/generateAndEncodeOtp";
import selectHubUserByEmail from "@/queries/hub/selectHubUserByEmail";

const sendEmailOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        sendEmailOtpSchema.parse({ email });

        const hubUser = await selectHubUserByEmail({ email });

        const { id, is_verified } = hubUser;
        console.log("hubUser", hubUser);

        const { otp, hashOtp } = generateAndEncodeOtp();

        await insertOtp({
            email,
            otp: hashOtp,
        });

        return handleSuccess({
            res,
            message: "OTP sent successfully",
            code: 201,
            data: {
                email,
                newUser: Boolean(!id),
            },
        });

    } catch (error) {
        return handleError({
            res,
            message: "Failed to send OTP",
            code: 500,
            error,
        });
    }
};

export default sendEmailOtp;