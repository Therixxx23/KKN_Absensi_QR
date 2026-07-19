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
    .select('nama')
    .eq('nim', nim)
    .maybeSingle();

  if (error || !user) {
    return res.status(400).json({ success: false, message: 'NIM tidak ditemukan' });
  }

  res.json({ success: true, nama: user.nama });
}
