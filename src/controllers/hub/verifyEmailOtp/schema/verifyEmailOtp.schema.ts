import selectHubUserByEmail from '@/queries/hub/selectHubUserByEmail';
import { z } from 'zod';


const verifyEmailOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    firstName: z.string().min(3).max(30).optional().nullable(),
    lastName: z.string().min(3).max(30).optional().nullable(),
}).refine(async obj => {
    const { firstName, lastName, email } = obj;

    const { id } = await selectHubUserByEmail({ email });

    if (!id) {
        if (!firstName || !lastName) {
            return false;
        }
    }
    return true;
}, {
    message: "First name and last name are required for new users",
    path: ["firstName", "lastName"],
});

type TVerifyEmailOtp = z.infer<typeof verifyEmailOtpSchema>;

export { verifyEmailOtpSchema, TVerifyEmailOtp };
