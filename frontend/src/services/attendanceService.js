import api from './api';
export const listAttendance = (params) => api.get('/attendance', { params });
export const registerAttendance = (data) => api.post('/attendance', data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
