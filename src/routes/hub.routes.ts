import checkIfHubUserExists from '@/controllers/hub/checkIfHubUserExists';
import sendEmailOtp from '@/controllers/hub/sendEmailOtp';
import verifyEmailOtp from '@/controllers/hub/verifyEmailOtp';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.send('Welcome to the Hub!');
});


// authentication
router.get("/auth/email/check", checkIfHubUserExists);
router.post("/auth/email/otp", sendEmailOtp);
router.post("/auth/email/otp/verify", verifyEmailOtp);

export default router;