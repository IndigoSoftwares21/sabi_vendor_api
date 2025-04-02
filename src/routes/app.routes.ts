import { Router } from "express";
import checkIfAppUserExists from "@/controllers/app/checkIfAppUserExists";
import sendEmailOtp from "@/controllers/app/sendEmailOtp";
import verifyEmailOtp from "@/controllers/app/verifyEmailOtp";

const router = Router();

router.get("/", (req, res) => {
    res.send("Welcome to the App!");
});

// authentication
router.get("/auth/email/check", checkIfAppUserExists);
router.post("/auth/email/otp", sendEmailOtp);
router.post("/auth/email/otp/verify", verifyEmailOtp);

export default router;
