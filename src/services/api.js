import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function login(nim, password) {
  return api.post('/auth/login', { nim, password });
}

export function getActiveSession() {
  return api.get('/sessions/active');
}

export function createSession(data) {
  return api.post('/sessions', data);
}

export function submitAttendance(token) {
  return api.post('/attendances', { token });
}

export function getAttendances(params) {
  return api.get('/attendances', { params });
}

export default api;
