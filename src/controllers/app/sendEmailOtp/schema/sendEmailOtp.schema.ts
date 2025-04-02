import { z } from "zod";

const sendEmailOtpSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters"),
});

export type TSendEmailOtp = z.infer<typeof sendEmailOtpSchema>;
export { sendEmailOtpSchema };
