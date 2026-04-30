const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/assignmentController');

router.use(auth);
router.get('/me/courses', role('docente'), c.myCourses);
router.get('/me/courses/:courseId/subjects', role('docente'), c.mySubjects);
router.get('/me/courses/:courseId/subjects/:subjectId/students', role('docente'), c.myStudents);
router.get('/', role('administrador', 'secretaria'), c.list);
router.post('/', role('administrador', 'secretaria'), c.create);
router.put('/:id', role('administrador', 'secretaria'), c.update);
router.patch('/:id/deactivate', role('administrador', 'secretaria'), c.deactivate);
router.patch('/:id/activate', role('administrador', 'secretaria'), c.activate);

module.exports = router;
