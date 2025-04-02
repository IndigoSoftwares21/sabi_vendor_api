
import getStates from '@/controllers/shared/location/getStates';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.send('Welcome to the Shared Api!');
});

router.get("/location/states", getStates);
// router.get("/location/lga", getLocalGovernmentAreas);


export default router;