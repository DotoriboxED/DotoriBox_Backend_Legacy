import express from 'express';
import survey from './survey/index';
import auth from './auth/auth';

const router = express.Router();

router.use('/survey', survey);
router.use('/auth', auth);

export default router;