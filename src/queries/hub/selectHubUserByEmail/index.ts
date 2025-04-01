import { camelKeys, getFirst, submitQuery } from "@/database/index";

interface ISelectHubUserByEmail {
    email: string;
}

const selectHubUserByEmail = async ({ email }: ISelectHubUserByEmail) => await submitQuery`
       SELECT hub_users.id,
       hub_users.email,
       hub_users.first_name,
       hub_users.last_name, 
       hub_users.phone_number,
       hub_users.profile_image_url, 
       hub_users.created_at, 
       hub_users.updated_at, 
       hub_users.is_verified
        FROM hub_users WHERE email = ${email}
    `;
;

export default getFirst(camelKeys(selectHubUserByEmail), null, {});