import bcrypt from 'bcrypt';
import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { nama, nim, email, password, kelompok } = req.body;

  if (!nama || !nim || !password) {
    return res.status(400).json({ success: false, message: 'Nama, NIM, dan password harus diisi' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('nim', nim)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ success: false, message: 'NIM sudah terdaftar' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { error } = await supabase.from('users').insert([
    {
      nama,
      nim,
      email: email || '',
      password: password_hash,
      kelompok: kelompok || null,
      role: 'mahasiswa',
    },
  ]);

  if (error) {
    return res.status(500).json({ success: false, message: 'Gagal mendaftarkan pengguna' });
  }

  res.status(201).json({ success: true, message: 'Registrasi berhasil, silakan login' });
}
