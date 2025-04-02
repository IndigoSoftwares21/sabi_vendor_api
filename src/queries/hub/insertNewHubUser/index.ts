import { getInsertId, submitQuery } from "@/database/index";

interface InsertNewHubUser {
    firstName: string;
    lastName: string;
    email: string;
}

const insertNewHubUser = async ({
    firstName,
    lastName,
    email,
}: InsertNewHubUser) => submitQuery`
    INSERT INTO hub_users (first_name, last_name, email)
    VALUES (${firstName}, ${lastName}, ${email})
    RETURNING id, first_name, last_name, email`

export default getInsertId(insertNewHubUser);    