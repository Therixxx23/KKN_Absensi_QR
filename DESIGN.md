# DESIGN.md — Panduan UI/UX Absensi QR KKN

## Filosofi Desain
Simple, friendly, cepat dipakai di lapangan (banyak mahasiswa akan akses dari HP saat KKN). Prioritas: jelas dan tidak bikin bingung, bukan mewah.

## Warna
- Primary: hijau (selaras tema KKN/lapangan) — misal `#2E7D32`
- Secondary: putih/abu muda untuk background
- Aksen sukses: hijau muda, Aksen error: merah lembut (`#E53935`)

## Tipografi
- Font: Inter / Poppins (sans-serif, mudah dibaca di mobile)
- Heading tebal, body regular, ukuran cukup besar untuk mobile (min 16px body text)

## Layout Tiap Halaman

### Login
- Form sederhana: NIM + Password
- Link "Belum punya akun? Daftar di sini" → ke halaman Register

### Register (BARU)
- Form: Nama, NIM, Email (opsional, ditandai "opsional" di label), Password, Kelompok KKN (dropdown/select)
- Validasi real-time di frontend: NIM harus angka, password min 8 karakter
- Pesan error jelas kalau NIM sudah terdaftar: "NIM ini sudah digunakan, silakan login"
- Setelah sukses: redirect ke Login dengan notifikasi sukses ("Registrasi berhasil, silakan login")
- Tidak ada pilihan role di form — otomatis mahasiswa
- Link "Sudah punya akun? Login di sini" → balik ke Login

### Scan Absen (Mahasiswa)
- Kamera full-screen dengan overlay kotak scan
- Setelah scan sukses: tampilkan konfirmasi besar "Absen berhasil ✓" + waktu
- Kalau QR sudah expired/salah sesi: pesan error jelas

### Admin — Generate QR
- Tombol besar "Generate QR Hari Ini"
- QR ditampilkan besar di tengah, bisa di-download/print
- Info sesi: tanggal, jam berlaku

### Dashboard Rekap
- Tabel rekap kehadiran per mahasiswa/kelompok
- Filter by tanggal, kelompok
- Indikator visual: hijau (hadir), merah (tidak hadir)

## Komponen Reusable
- `Button` (primary, secondary, danger variant)
- `InputField` (dengan label + error message di bawahnya)
- `Card` (untuk wrapping form Login/Register)
- `Alert` (sukses/error, dipakai di Register & Scan)
- `Badge` status kehadiran

## Gaya Bahasa di UI
- Bahasa Indonesia, santai tapi tetap sopan
- Contoh copy Register: "Daftar sebagai peserta KKN" (bukan "Create Account")
- Error message manusiawi, bukan pesan teknis (contoh: "NIM sudah terdaftar" bukan "Error 409: Conflict")
