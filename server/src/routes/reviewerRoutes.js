const express = require('express');
const { generateReviewer } = require('../controllers/reviewerController');

const router = express.Router();

router.post('/generate', generateReviewer);

module.exports = router;