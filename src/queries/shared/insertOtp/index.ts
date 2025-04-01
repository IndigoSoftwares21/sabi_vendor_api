import { getInsertId, submitQuery } from "@/database";
interface IInsertOtp {
    email: string;
    otp: string;
}

const insertOtp = async ({ email, otp }: IInsertOtp) => {
    const checkQuery = await submitQuery`
        SELECT EXISTS (
            SELECT 1 
            FROM email_otp 
            WHERE email = ${email} 
            AND expires_at > CURRENT_TIMESTAMP
        ) AS has_unexpired
    `;

    if (checkQuery[0]?.has_unexpired) {
        throw 'Please wait for the current OTP to expire before requesting a new one';
    }

    // If no unexpired OTP exists, proceed with insertion/update
    return submitQuery`
        INSERT INTO email_otp (email, otp_code)
        VALUES (${email}, ${otp})
        ON CONFLICT (email) 
        DO UPDATE 
        SET otp_code = ${otp}, 
            expires_at = CURRENT_TIMESTAMP + INTERVAL '2m'
        WHERE email_otp.expires_at < CURRENT_TIMESTAMP
        RETURNING *
    `;
};

export default getInsertId(insertOtp);