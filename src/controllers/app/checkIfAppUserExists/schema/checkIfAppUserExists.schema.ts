import { z } from "zod";

const checkIfAppUserExistsSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters"),
});

export type TCheckIfAppUserExists = z.infer<typeof checkIfAppUserExistsSchema>;
export { checkIfAppUserExistsSchema };
