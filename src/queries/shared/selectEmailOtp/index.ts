import { camelKeys, getFirst, submitQuery } from "@/database/index";

interface ISelectOtp {
    email: string;
}

const selectEmailOtp = ({ email }: ISelectOtp) => submitQuery`
    SELECT otp_code FROM email_otp WHERE email = ${email}
    AND expires_at > CURRENT_TIMESTAMP
    LIMIT 1
`;

export default getFirst(camelKeys(selectEmailOtp), null, {});