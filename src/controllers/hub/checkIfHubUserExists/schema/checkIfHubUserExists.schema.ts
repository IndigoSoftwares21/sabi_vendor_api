import { z } from "zod";

const checkIfHubUserExistsSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required")
        .max(255, "Email must be less than 255 characters"),
});

type TCheckIfHubUserExists = z.infer<typeof checkIfHubUserExistsSchema>;

export { checkIfHubUserExistsSchema, TCheckIfHubUserExists };