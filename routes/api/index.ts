import express from 'express';
import survey from './survey/index';
import upload from './upload';

const router = express.Router();

router.use('/survey', survey);
router.use('/upload', upload);

export default router;