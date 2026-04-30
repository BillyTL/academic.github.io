const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { login, seedPasswords, me } = require('../controllers/authController');

router.post('/login', login);
router.post('/seed-passwords', seedPasswords);
router.get('/me', auth, me);

module.exports = router;
