import express from 'express';
import survey from './survey/index';
import auth from './auth/auth';
import item from './item/index';
import product from './product/index';

const router = express.Router();

router.use('/survey', survey);
router.use('/auth', auth);
router.use('/item', item);
router.use('/product', product);

export default router;