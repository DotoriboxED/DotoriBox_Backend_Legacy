import express from 'express';
import survey from './survey/index';
import auth from './auth/auth';
import product from './sample/index';

const router = express.Router();

router.use('/survey', survey);
router.use('/auth', auth);
router.use('/product', product);

export default router;