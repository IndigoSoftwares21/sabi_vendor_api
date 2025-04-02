import { camelKeys, getFirst, submitQuery } from "@/database/index";

interface ISelectAppUserByEmail {
    email: string;
}

const selectAppUserByEmail = async ({ email }: ISelectAppUserByEmail) =>
    await submitQuery`
    SELECT app_users.id,
           app_users.email,
           app_users.first_name,
           app_users.last_name,
           app_users.phone_number,
           app_users.profile_image_url,
           app_users.created_at,
           app_users.updated_at,
           app_users.is_verified
    FROM app_users 
    WHERE email = ${email}
`;

export default getFirst(camelKeys(selectAppUserByEmail), null, {});
