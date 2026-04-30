import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import UsersList from '../pages/users/UsersList';
import StudentsList from '../pages/students/StudentsList';
import TeachersList from '../pages/teachers/TeachersList';
import CoursesList from '../pages/courses/CoursesList';
import SubjectsList from '../pages/subjects/SubjectsList';
import EnrollmentForm from '../pages/enrollments/EnrollmentForm';
import TeacherAssignments from '../pages/assignments/TeacherAssignments';
import MyCourses from '../pages/teacher/MyCourses';
import MySchedule from '../pages/teacher/MySchedule';
import PaymentsList from '../pages/payments/PaymentsList';
import SchedulesList from '../pages/schedules/SchedulesList';
import MyCoursesStudent from '../pages/portal/MyCoursesStudent';
import MyGrades from '../pages/portal/MyGrades';
import MyPayments from '../pages/portal/MyPayments';
import MyScheduleStudent from '../pages/portal/MyScheduleStudent';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<ProtectedRoute roles={['administrador','secretaria']}><UsersList /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute roles={['administrador','secretaria']}><StudentsList /></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute roles={['administrador','secretaria']}><TeachersList /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute roles={['administrador','secretaria']}><CoursesList /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute roles={['administrador','secretaria']}><SubjectsList /></ProtectedRoute>} />
        <Route path="/schedules" element={<ProtectedRoute roles={['administrador','secretaria']}><SchedulesList /></ProtectedRoute>} />
        <Route path="/enrollments" element={<ProtectedRoute roles={['administrador','secretaria']}><EnrollmentForm /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute roles={['administrador','secretaria']}><TeacherAssignments /></ProtectedRoute>} />
        <Route path="/teacher" element={<ProtectedRoute roles={['docente']}><MyCourses /></ProtectedRoute>} />
        <Route path="/teacher/schedule" element={<ProtectedRoute roles={['docente']}><MySchedule /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute roles={['administrador','secretaria']}><PaymentsList /></ProtectedRoute>} />
        <Route path="/portal/courses" element={<ProtectedRoute roles={['estudiante']}><MyCoursesStudent /></ProtectedRoute>} />
        <Route path="/portal/schedule" element={<ProtectedRoute roles={['estudiante']}><MyScheduleStudent /></ProtectedRoute>} />
        <Route path="/portal/grades" element={<ProtectedRoute roles={['estudiante']}><MyGrades /></ProtectedRoute>} />
        <Route path="/portal/payments" element={<ProtectedRoute roles={['estudiante']}><MyPayments /></ProtectedRoute>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
