# DESIGN.md — Panduan Desain UI/UX (Friendly & Mudah Digunakan)

Target user aplikasi ini: mahasiswa KKN yang buka dari HP, sering terburu-buru (sebelum/sesudah kegiatan), dan lokasi dengan sinyal internet kadang lemah. Desain harus **cepat dipahami tanpa perlu diajarkan**.

## 1. Prinsip Utama
1. **Mobile-first** — asumsikan layar HP kecil sebagai kondisi utama, desktop cuma tambahan.
2. **Satu tujuan per halaman** — halaman scan cuma untuk scan, jangan dicampur dengan info lain yang tidak perlu.
3. **Tombol besar, jempol-friendly** — minimal tinggi tombol 48px, mudah ditekan tanpa perlu presisi.
4. **Feedback instan** — setiap aksi (scan, submit) harus langsung ada respons visual (loading, sukses, gagal), jangan biarkan user menebak-nebak.
5. **Minim teks, banyak visual** — pakai ikon + warna status daripada paragraf panjang.

## 2. Warna
Gunakan palet sederhana dengan makna konsisten:

| Warna | Fungsi | Contoh Hex |
|---|---|---|
| Hijau | Berhasil / hadir | `#22C55E` |
| Merah | Gagal / error / tidak valid | `#EF4444` |
| Kuning/Oranye | Peringatan (misal: terlambat) | `#F59E0B` |
| Biru | Aksi utama (tombol scan, submit) | `#3B82F6` |
| Abu-abu netral | Background, teks sekunder | `#F3F4F6` / `#6B7280` |

Jangan pakai lebih dari 4-5 warna dalam satu halaman supaya tidak ramai.

## 3. Tipografi
- Font: gunakan font sistem default (San Francisco/Segoe/Roboto) — tidak perlu font custom, biar loading cepat.
- Ukuran teks body minimal **16px** (supaya tidak perlu zoom di HP).
- Judul halaman: 20–24px, bold.
- Hindari huruf kapital semua (ALL CAPS) untuk kalimat panjang — susah dibaca.

## 4. Layout per Halaman

### a. Halaman Login
- Logo/nama program KKN di atas.
- 2 input saja: NIM, Password.
- 1 tombol besar: "Masuk".
- Tidak perlu elemen dekoratif berlebihan.

### b. Halaman Scan Absen (Mahasiswa) — halaman terpenting
- Langsung buka kamera begitu halaman dimuat (minim klik).
- Frame kamera besar di tengah layar.
- Status jelas di bawah kamera:
  - 🔄 "Mengarahkan ke QR..." (netral/abu-abu)
  - ✅ "Absen berhasil! Pukul 07:32" (hijau, besar)
  - ❌ "QR sudah kadaluarsa, coba scan ulang" (merah, beri instruksi jelas)
- Setelah absen berhasil, tampilkan ringkasan singkat (nama, waktu, kegiatan) — bukan cuma centang doang, biar user yakin datanya benar.

### c. Halaman Admin — Generate QR
- Tombol besar "Buat Sesi Absen Hari Ini".
- QR ditampilkan besar (minimal 250x250px) supaya gampang di-scan dari jarak agak jauh saat ditempel/diproyeksikan.
- Info di bawah QR: nama kegiatan, jam berlaku (valid_from–valid_until), tombol "Perpanjang" kalau mau extend waktu.

### d. Dashboard Rekap
- Tabel simpel: Nama, NIM, Jam Scan, Status (badge warna: hijau=hadir, merah=tidak hadir, kuning=telat).
- Filter tanggal di atas tabel (dropdown/date-picker sederhana).
- Tombol "Unduh CSV" jelas terlihat, tidak disembunyikan di menu.
- Kalau data kosong, tampilkan pesan ramah: "Belum ada yang absen hari ini" — jangan tabel kosong tanpa keterangan.

## 5. Komponen Reusable yang Perlu Dibuat
- `<Button>` — varian: primary (biru), success (hijau), danger (merah), dengan state loading (spinner kecil di dalam tombol).
- `<StatusBadge>` — badge kecil berwarna untuk status hadir/telat/tidak hadir.
- `<Toast>` / notifikasi kecil di pojok layar untuk konfirmasi aksi (misal "QR berhasil dibuat").
- `<EmptyState>` — komponen untuk kondisi data kosong (ikon + teks ramah).
- `<LoadingSpinner>` — dipakai konsisten di semua proses loading (jangan beda-beda gaya per halaman).

## 6. Aksesibilitas & Kondisi Nyata di Lapangan
- Pastikan kontras teks vs background cukup (jangan abu-abu muda di atas putih).
- Tampilkan indikator jelas kalau koneksi lambat/gagal: "Koneksi lambat, mencoba lagi..." — jangan cuma layar putih diam.
- Semua tombol aksi penting (submit absen) harus disable sementara saat proses berlangsung, supaya tidak ter-double klik/submit dua kali.
- Uji tampilan di layar kecil (contoh: 360px lebar, HP entry-level) — jangan cuma dites di laptop.

## 7. Nada Bahasa di UI (Microcopy)
- Gunakan bahasa santai tapi jelas, bukan bahasa teknis/sistem.
  - ✅ "QR sudah kadaluarsa, minta admin buat yang baru ya."
  - ❌ "Error 403: Token expired."
- Sapa user secara personal kalau memungkinkan: "Halo, Andi! Absen kamu tercatat pukul 07:32."

## 8. Referensi Cepat (Do & Don't)
| Do | Don't |
|---|---|
| Tombol besar, 1 aksi utama per layar | Banyak tombol kecil berdempetan |
| Warna status konsisten (hijau=ok, merah=gagal) | Warna acak tanpa makna jelas |
| Pesan error dalam bahasa manusia | Pesan error teknis mentah |
| Loading state jelas | Layar kosong/diam saat proses |
| Layout mobile-first | Desain didesain untuk desktop dulu baru disesuaikan ke HP |
