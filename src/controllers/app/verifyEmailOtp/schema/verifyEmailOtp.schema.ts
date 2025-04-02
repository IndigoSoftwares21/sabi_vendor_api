import { z } from "zod";

const verifyEmailOtpSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters"),
    otp: z
        .string()
        .min(6, "OTP must be 6 digits")
        .max(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only numbers"),
});

export type TVerifyEmailOtp = z.infer<typeof verifyEmailOtpSchema>;
export { verifyEmailOtpSchema };
