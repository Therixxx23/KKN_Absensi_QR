import { readDB } from '../db.js';

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan, silakan login ulang' });
  }

  const users = readDB('users');
  const user = users.find((u) => u.token === token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Token tidak valid, silakan login ulang' });
  }

  req.user = user;
  next();
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    next();
  };
}
