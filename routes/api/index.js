const express = require('express');
const router = express.Router();

const survey = require('./survey');
const upload = require('./upload');

router.use('/survey', survey);
router.use('/upload', upload);

module.exports = router;