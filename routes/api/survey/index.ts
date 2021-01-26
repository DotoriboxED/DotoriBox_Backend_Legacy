import survey from './survey';
import problem from './problem';
import recover from './recover';
import express from 'express';
const router = express.Router();

router.use('/', survey);
router.use('/problem', problem);
router.use('/recover', recover);

export default router;