import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../../lib/supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { nim, password } = req.body;
  if (!nim || !password) {
    return res.status(400).json({ success: false, message: 'NIM dan password harus diisi' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('nim', nim)
    .maybeSingle();

  if (error || !user) {
    return res.status(401).json({ success: false, message: 'NIM atau password salah' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'NIM atau password salah' });
  }

  const token = jwt.sign(
    { id: user.id, nim: user.nim, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Login berhasil',
    data: {
      token,
      user: {
        id: user.id,
        nim: user.nim,
        nama: user.nama,
        role: user.role,
      },
    },
  });
}
