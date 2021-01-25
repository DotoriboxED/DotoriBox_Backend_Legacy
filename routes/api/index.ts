import express from 'express';
import survey from './survey/index';

const router = express.Router();

router.use('/survey', survey);

export default router;