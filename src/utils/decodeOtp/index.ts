import crypto from "crypto";

interface IDecodeOtp {
    inputOtp: string;
    storedHash: string;
}
/**
 * Verifies if the provided OTP matches the stored hash.
 * 
 * @param inputOtp {string} The OTP input provided by the user.
 * @param storedHash {string} The previously stored hashed OTP.
 * @returns {boolean} Returns true if the input OTP, when hashed, matches the stored hash, otherwise false.
 * @throws {Error} Throws an error if the OTP secret is not found in the environment variables.
 */
const decodeOtp = ({
    inputOtp,
    storedHash,
}: IDecodeOtp): boolean => {
    try {
        // Retrieve the OTP_SECRET from environment variables
        const secret = process.env.OTP_SECRET;
        if (!secret) {
            throw "OTP secret not found";
        }

        // Hash the input OTP using the same method (HMAC-SHA-256 with the secret)
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(inputOtp);
        const inputHash = hmac.digest("hex");
        console.log("inputHash", inputHash);
        console.log("storedHash", storedHash);

        return inputHash === storedHash;

    } catch (error) {
        throw error;
    }
}

export default decodeOtp;
