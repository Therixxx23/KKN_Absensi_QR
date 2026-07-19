import bcrypt from 'bcrypt';
import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { nim, passwordBaru } = req.body;

  if (!nim || !passwordBaru) {
    return res.status(400).json({ success: false, message: 'NIM dan password baru harus diisi' });
  }

  if (passwordBaru.length < 8) {
    return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('nim', nim)
    .maybeSingle();

  if (error || !user) {
    return res.status(400).json({ success: false, message: 'NIM tidak ditemukan' });
  }

  const passwordHash = await bcrypt.hash(passwordBaru, 10);

  const { error: updateError } = await supabase
    .from('users')
    .update({ password: passwordHash })
    .eq('id', user.id);

  if (updateError) {
    return res.status(500).json({ success: false, message: 'Gagal mengubah password' });
  }

  res.json({ success: true, message: 'Password berhasil diubah, silakan login' });
}
