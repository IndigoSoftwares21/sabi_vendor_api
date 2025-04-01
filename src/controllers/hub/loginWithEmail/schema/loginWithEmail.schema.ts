import { z } from "zod";

const loginWithEmailSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters"),
});

type TLoginWithEmail = z.infer<typeof loginWithEmailSchema>;

export { loginWithEmailSchema, TLoginWithEmail };