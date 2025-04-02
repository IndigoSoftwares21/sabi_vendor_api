import { getInsertId, submitQuery } from "@/database/index";

interface InsertNewAppUser {
    firstName: string;
    lastName: string;
    email: string;
}

const insertNewAppUser = async ({
    firstName,
    lastName,
    email,
}: InsertNewAppUser) => submitQuery`
    INSERT INTO app_users (first_name, last_name, email)
    VALUES (${firstName}, ${lastName}, ${email})
    RETURNING id, first_name, last_name, email`;

export default getInsertId(insertNewAppUser);
