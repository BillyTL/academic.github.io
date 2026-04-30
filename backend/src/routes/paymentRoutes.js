const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/paymentController');

router.use(auth);
router.get('/', role('administrador', 'secretaria'), c.list);
router.get('/:id', role('administrador', 'secretaria'), c.getById);
router.post('/', role('administrador', 'secretaria'), c.create);
router.put('/:id', role('administrador', 'secretaria'), c.update);
router.patch('/:id/cancel', role('administrador', 'secretaria'), c.cancel);

module.exports = router;
