import sendEmailOtp from '@/controllers/hub/sendEmailOtp';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.send('Welcome to the Hub!');
});


// authentication
router.post("/auth/email/otp", sendEmailOtp);

export default router;