import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function register(data) {
  return api.post('/auth/register', data);
}

export function login(nim, password) {
  return api.post('/auth/login', { nim, password });
}

export function getActiveSession() {
  return api.get('/sessions/today');
}

export function generateSession() {
  return api.post('/sessions/generate');
}

export function submitAttendance(qrToken, userId) {
  return api.post('/attendances', { qrToken, userId });
}

export function getAttendances(params) {
  return api.get('/attendances', { params });
}

export function verifyToken() {
  return api.get('/auth/verify');
}

export function getAllSessions() {
  return api.get('/sessions');
}

export function createSession(tanggalMulai, tanggalSelesai) {
  return api.post('/sessions', { tanggalMulai, tanggalSelesai });
}

export function deleteSession(id) {
  return api.delete('/sessions', { params: { id } });
}

export default api;
