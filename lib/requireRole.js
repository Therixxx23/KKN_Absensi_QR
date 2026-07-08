import jwt from 'jsonwebtoken';

export function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireRole(allowedRoles) {
  return (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'Token tidak valid, silakan login ulang' });
      return null;
    }
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ success: false, message: 'Akses ditolak, halaman ini khusus admin' });
      return null;
    }
    return user;
  };
}
