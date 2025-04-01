import crypto from "crypto";

/**
 * Verifies if the provided OTP matches the stored hash.
 * 
 * @param inputOtp {string} The OTP input provided by the user.
 * @param storedHash {string} The previously stored hashed OTP.
 * @returns {boolean} Returns true if the input OTP, when hashed, matches the stored hash, otherwise false.
 * @throws {Error} Throws an error if the OTP secret is not found in the environment variables.
 */
const decodeOtp = (inputOtp: string, storedHash: string): boolean => {
    // Retrieve the OTP_SECRET from environment variables
    const secret = process.env.OTP_SECRET;
    if (!secret) {
        throw new Error("OTP secret not found");
    }

    // Hash the input OTP using the same method (HMAC-SHA-256 with the secret)
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(inputOtp);
    const inputHash = hmac.digest("hex");

    // Compare the hashed input OTP with the stored hash
    return inputHash === storedHash;
}

export default decodeOtp;
