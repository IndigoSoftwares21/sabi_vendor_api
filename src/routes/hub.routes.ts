import loginWithEmail from '@/controllers/hub/loginWithEmail';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.send('Welcome to the Hub!');
});


// authentication
router.post("/auth/login/email", loginWithEmail)

export default router;