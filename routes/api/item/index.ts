import { Router } from 'express';
import product from './item';
const router = Router();

router.use('/', product);

export default router;