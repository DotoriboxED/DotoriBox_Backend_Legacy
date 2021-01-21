const express = require('express');
const { Problem } = require('../../../models');
const router = express.Router();

const survey = require('./survey');
const problem = require('./problem');

router.use('/', survey);
router.use('/problem', problem);

module.exports = router;