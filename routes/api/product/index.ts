import { Router } from 'express'
const router = Router();

import product from './product'

router.use('/', product);

export default router;