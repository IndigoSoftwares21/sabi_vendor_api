import { Request, Response } from "express";
import { verifyEmailOtpSchema } from "./schema/verifyEmailOtp.schema";
import handleError from "@/utils/handleError";
import createNewAppUser from "@/actions/app/users/createNewAppUser";
import selectAppUserByEmail from "@/queries/app/selectAppUserByEmail";
import handleSuccess from "@/utils/handleSuccess";
import loginAppUser from "@/actions/app/users/loginAppUser";
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
                code: 400,
            });
            return;
        }

        await deleteEmailOtp({
            email,
        });

        const {
            id,
            firstName: oldUserFirstName,
            lastName: oldUserLastName,
        } = await selectAppUserByEmail({ email });

        if (!id) {
            result = await createNewAppUser({
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

        result = await loginAppUser({
            firstName: oldUserFirstName,
            lastName: oldUserLastName,
            email,
        });
        handleSuccess({
            res,
            message: "User logged in successfully",
            data: {
                ...result,
                id,
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
