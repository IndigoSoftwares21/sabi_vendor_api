import { getInsertId, submitQuery } from "@/database";
interface IInsertOtp {
    email: string;
    otp: string;
}

const insertOtp = async ({ email, otp }: IInsertOtp) => {
    const checkQuery = await submitQuery`
        SELECT EXISTS (
            SELECT 1 
            FROM otp 
            WHERE email = ${email} 
            AND expires_at > CURRENT_TIMESTAMP
        ) AS has_unexpired
    `;

    if (checkQuery[0]?.has_unexpired) {
        throw 'Please wait for the current OTP to expire before requesting a new one';
    }

    // If no unexpired OTP exists, proceed with insertion/update
    return submitQuery`
        INSERT INTO otp (email, otp_code)
        VALUES (${email}, ${otp})
        ON CONFLICT (email) 
        DO UPDATE 
        SET otp_code = ${otp}, 
            expires_at = CURRENT_TIMESTAMP + INTERVAL '2m'
        WHERE otp.expires_at < CURRENT_TIMESTAMP
        RETURNING *
    `;
};

export default getInsertId(insertOtp);