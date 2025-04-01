import otpGenerator from "otp-generator";
import crypto from "crypto";

/**
 * Generates a one-time password (OTP) and hashes it using HMAC with a secret key.
 * The OTP is a 6-digit number and the hash is generated using the secret stored in the environment variable `OTP_SECRET`.
 * 
 * The OTP is generated with only digits, and it is then hashed with SHA-256 using the provided secret key.
 * 
 * @returns {string} The hashed OTP as a hexadecimal string
 * @throws {Error} Throws an error if the OTP secret is not found in the environment variables or if HMAC creation fails
 */
const generateAndEncodeOtp = (): string => {
    try {
        // Generate a 6-digit OTP with only digits
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            digits: true,
            lowerCaseAlphabets: false,
        });

        // Retrieve the OTP_SECRET from environment variables
        const secret = process.env.OTP_SECRET;
        console.log("secret", secret);
        if (!secret) {
            throw new Error("OTP secret not found");
        }

        // Hash the OTP using HMAC with SHA-256
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(otp);
        const hashOtp = hmac.digest("hex");
        console.log("hashOtp", hashOtp);
        return hashOtp;
    } catch (error) {
        throw new Error(`Failed to generate OTP: ${error}`);
    }
}

export default generateAndEncodeOtp;
