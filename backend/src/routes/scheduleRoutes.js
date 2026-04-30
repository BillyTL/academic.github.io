const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/scheduleController');

router.use(auth);

router.get('/me', role('docente'), c.mySchedule);
router.get('/student', role('estudiante'), c.studentSchedule);

router.get('/', role('administrador', 'secretaria'), c.list);
router.post('/', role('administrador', 'secretaria'), c.create);
router.put('/:id', role('administrador', 'secretaria'), c.update);
router.patch('/:id/deactivate', role('administrador', 'secretaria'), c.deactivate);
router.patch('/:id/activate', role('administrador', 'secretaria'), c.activate);

module.exports = router;
