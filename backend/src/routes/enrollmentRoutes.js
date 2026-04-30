const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/enrollmentController');

router.use(auth);
router.get('/', role('administrador', 'secretaria'), c.list);
router.post('/', role('administrador', 'secretaria'), c.create);
router.put('/:id', role('administrador', 'secretaria'), c.update);
router.patch('/:id/deactivate', role('administrador', 'secretaria'), c.deactivate);

module.exports = router;
