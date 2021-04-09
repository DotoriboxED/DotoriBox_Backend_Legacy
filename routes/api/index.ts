import express from 'express';
import survey from './survey/index';
import auth from './auth/auth';
import sample from './sample/index';
import product from './product/index';

const router = express.Router();

router.use('/survey', survey);
router.use('/auth', auth);
router.use('/sample', sample);
router.use('/product', product);

export default router;