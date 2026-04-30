const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/courseController');

router.use(auth);
router.get('/', role('administrador', 'secretaria', 'docente'), c.list);
router.get('/:id', role('administrador', 'secretaria', 'docente'), c.getById);
router.get('/:id/students', role('administrador', 'secretaria', 'docente'), c.studentsByCourse);
router.post('/', role('administrador', 'secretaria'), c.create);
router.put('/:id', role('administrador', 'secretaria'), c.update);
router.patch('/:id/deactivate', role('administrador'), c.deactivate);
router.patch('/:id/activate', role('administrador'), c.activate);

module.exports = router;
