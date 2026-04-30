const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/attendanceController');

router.use(auth);
router.get('/', role('administrador', 'secretaria', 'docente'), c.list);
router.post('/', role('docente'), c.register);
router.put('/:id', role('docente'), c.update);

module.exports = router;
