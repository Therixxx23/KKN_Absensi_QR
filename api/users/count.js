import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'mahasiswa');

  if (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghitung jumlah mahasiswa' });
  }

  res.json({ success: true, data: { count } });
}
