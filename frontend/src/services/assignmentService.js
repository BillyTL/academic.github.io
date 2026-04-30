import api from './api';
export const listAssignments = () => api.get('/assignments');
export const createAssignment = (data) => api.post('/assignments', data);
export const updateAssignment = (id, data) => api.put(`/assignments/${id}`, data);
export const deactivateAssignment = (id) => api.patch(`/assignments/${id}/deactivate`);
export const activateAssignment = (id) => api.patch(`/assignments/${id}/activate`);
export const myCourses = () => api.get('/assignments/me/courses');
export const mySubjects = (courseId) => api.get(`/assignments/me/courses/${courseId}/subjects`);
export const myStudents = (courseId, subjectId) => api.get(`/assignments/me/courses/${courseId}/subjects/${subjectId}/students`);
