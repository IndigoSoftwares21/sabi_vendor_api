import handleError from "@/utils/handleError";
import { Request, Response } from "express";
import { sendEmailOtpSchema } from "./schema/sendEmailOtp.schema";
import handleSuccess from "@/utils/handleSuccess";
import insertOtp from "@/queries/shared/insertOtp";
import generateAndEncodeOtp from "@/utils/generateAndEncodeOtp";
import selectHubUserByEmail from "@/queries/hub/selectHubUserByEmail";
import EmailService from "@/services/email";
import otpEmailTemplate from "@/services/email/templates/otp.template";

const sendEmailOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        sendEmailOtpSchema.parse({ email });

        const hubUser = await selectHubUserByEmail({ email });

        const { id } = hubUser;

        const { otp, hashOtp } = generateAndEncodeOtp();

        await insertOtp({
            email,
            otp: hashOtp,
        });

        const emailService = new EmailService();
        await emailService.sendEmail({
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
            html: otpEmailTemplate(otp),
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