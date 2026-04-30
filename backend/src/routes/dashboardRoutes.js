const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/dashboardController');

router.use(auth);
router.get('/summary', c.summary);

module.exports = router;
