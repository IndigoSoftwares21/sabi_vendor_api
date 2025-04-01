import { getInsertId, submitQuery } from "@/database/index";

interface IInsertOtp {
    email: string;
    otp: string;
}

const insertOtp = async ({ email, otp }: IInsertOtp) => submitQuery`
    INSERT INTO otp (email, otp_code)
    VALUES (${email}, ${otp})
    ON CONFLICT (email) 
    DO UPDATE 
    SET otp_code = ${otp}, expires_at = CURRENT_TIMESTAMP + INTERVAL '2m'
    WHERE otp.expires_at < CURRENT_TIMESTAMP
`

export default getInsertId(insertOtp);