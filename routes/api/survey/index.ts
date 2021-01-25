import survey from './survey';
import problem from './problem';
import express from 'express';
const router = express.Router();

router.use('/', survey);
router.use('/problem', problem);

export default router;