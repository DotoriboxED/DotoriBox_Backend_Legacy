import { Router } from 'express';
import product from './sample';
const router = Router();

router.use('/', product);

export default router;