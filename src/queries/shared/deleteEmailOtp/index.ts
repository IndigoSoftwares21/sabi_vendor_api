import { camelKeys, getFirst, submitQuery } from "@/database/index";

interface ISelectOtp {
    email: string;
}

const deleteEmailOtp = ({ email }: ISelectOtp) => submitQuery`
    DELETE FROM email_otp WHERE email = ${email}
`;

export default deleteEmailOtp;