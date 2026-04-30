import api from './api';
export const listCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);
export const studentsByCourse = (id) => api.get(`/courses/${id}/students`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deactivateCourse = (id) => api.patch(`/courses/${id}/deactivate`);
export const activateCourse = (id) => api.patch(`/courses/${id}/activate`);
