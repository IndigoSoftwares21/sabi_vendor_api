import { Request, Response } from "express";
import { verifyEmailOtpSchema } from "./schema/verifyEmailOtp.schema";
import handleError from "@/utils/handleError";
import createNewHubUser from "@/actions/hub/users/createNewHubUser";
import selectHubUserByEmail from "@/queries/hub/selectHubUserByEmail";
import handleSuccess from "@/utils/handleSuccess";
import loginHubUser from "@/actions/hub/users/loginHubUser";
import decodeOtp from "@/utils/decodeOtp";
import selectEmailOtp from "@/queries/shared/selectEmailOtp";
import deleteEmailOtp from "@/queries/shared/deleteEmailOtp";

const verifyEmailOtp = async (req: Request, res: Response) => {
    try {
        let result;
        const { email, otp, firstName, lastName } = req.body;

        await verifyEmailOtpSchema.parseAsync({
            email,
            otp,
            firstName,
            lastName,
        });
        const { otpCode } = await selectEmailOtp({
            email,
        });

        const isOTPValid = decodeOtp({
            inputOtp: otp,
            storedHash: otpCode,
        });

        if (!otpCode || !isOTPValid) {
            handleError({
                res,
                message: "Invalid OTP",
                code: 400
            });
            return;
        }

        await deleteEmailOtp({
            email
        });


        const { id, firstName: oldUserFirstName, lastName: oldUserLastName } = await selectHubUserByEmail({ email });

        if (!id) {
            result = await createNewHubUser({
                firstName,
                lastName,
                email,
            });
            handleSuccess({
                res,
                message: "User created successfully",
                data: result,
                code: 201,
            });
            return;
        }

        result = await loginHubUser({
            firstName: oldUserFirstName,
            lastName: oldUserLastName,
            email,
        });
        handleSuccess({
            res,
            message: "User logged in successfully",
            data: {
                ...result,
                id
            },
            code: 201,
        });
        return;

    } catch (error) {
        handleError({
            res,
            message: "Invalid request",
            code: 500,
            error,
        });
        return;
    }
};

export default verifyEmailOtp;