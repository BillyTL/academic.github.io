const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

const authRoutes       = require('./routes/authRoutes');
const userRoutes       = require('./routes/userRoutes');
const studentRoutes    = require('./routes/studentRoutes');
const teacherRoutes    = require('./routes/teacherRoutes');
const courseRoutes     = require('./routes/courseRoutes');
const subjectRoutes    = require('./routes/subjectRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const gradeRoutes      = require('./routes/gradeRoutes');
const paymentRoutes    = require('./routes/paymentRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');
const studentPortalRoutes = require('./routes/studentPortalRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/students',    studentRoutes);
app.use('/api/teachers',    teacherRoutes);
app.use('/api/courses',     courseRoutes);
app.use('/api/subjects',    subjectRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendance',  attendanceRoutes);
app.use('/api/grades',      gradeRoutes);
app.use('/api/payments',    paymentRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/portal',      studentPortalRoutes);
app.use('/api/schedules',   scheduleRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

module.exports = app;
