const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/studentPortalController');

router.use(auth);
router.use(role('estudiante'));

router.get('/my-courses', c.myCourses);
router.get('/my-courses/:courseId/subjects', c.mySubjects);
router.get('/my-grades', c.myGrades);
router.get('/my-attendance', c.myAttendance);
router.get('/my-payments', c.myPayments);

module.exports = router;
