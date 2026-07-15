import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { nim } = req.body;
  if (!nim) {
    return res.status(400).json({ success: false, message: 'NIM harus diisi' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, nim')
    .eq('nim', nim)
    .maybeSingle();

  if (error || !user) {
    return res.status(400).json({ success: false, message: 'NIM tidak ditemukan' });
  }

  const { error: insertError } = await supabase
    .from('password_reset_requests')
    .insert({ user_id: user.id, nim: user.nim, status: 'pending' });

  if (insertError) {
    return res.status(500).json({ success: false, message: 'Gagal mengirim permintaan reset password' });
  }

  res.json({
    success: true,
    message: 'Permintaan reset password terkirim, silakan hubungi admin/panitia KKN untuk verifikasi',
  });
}
