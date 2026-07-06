# AGENTS.md — Panduan untuk AI Coding Agent

Dokumen ini berisi konteks dan aturan kerja untuk agent (opencode/AI) yang membantu membangun project **Absensi QR KKN**. Baca dan ikuti sebelum generate/edit kode.

## 1. Tentang Project
Aplikasi web absensi online untuk peserta KKN menggunakan QR Code. Mahasiswa scan QR untuk absen, admin/koordinator generate QR harian dan melihat rekap kehadiran.

Referensi lengkap requirement & alur sistem ada di file `pre-production-absensi-qr-kkn.md` (fitur, database, flow) — selalu cek dokumen itu sebagai sumber kebenaran sebelum menambah fitur baru.

## 2. Tech Stack
- **Frontend**: React (Vite), React Router, axios
- **Library QR**: `qrcode.react` (generate QR), `html5-qrcode` (scan QR pakai kamera)
- **Backend**: Node.js + Express (folder `server/`)
- **Database**: mulai dari file JSON/SQLite (`better-sqlite3`) — sederhana dulu, tidak perlu database eksternal berat
- **Styling**: gunakan CSS biasa/CSS modules atau Tailwind (pilih salah satu, jangan campur beberapa sistem styling)

## 3. Struktur Folder yang Harus Diikuti
```
kkn-absensi-qr/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── ScanAbsen.jsx
│   │   └── DashboardAdmin.jsx
│   ├── components/
│   ├── services/
│   │   └── api.js
│   └── App.jsx
└── server/
    ├── index.js
    ├── routes/
    └── data/
```
Jangan buat struktur folder baru yang menyimpang tanpa alasan jelas.

## 4. Aturan Umum Coding
- Tulis kode React dengan **function component + hooks**, jangan pakai class component.
- Semua state global cukup pakai `useState`/`useContext`, tidak perlu Redux (project ini kecil).
- Setiap komponen halaman (`pages/`) harus tetap ringkas — pecah ke `components/` kalau sudah lebih dari ±150 baris.
- Semua pemanggilan API lewat `services/api.js`, jangan taruh `fetch`/`axios` langsung di komponen.
- Selalu tangani error (try/catch) dan tampilkan pesan error yang ramah ke user, jangan biarkan tampilan blank/crash.
- Jangan hardcode URL backend — gunakan environment variable (`.env` → `VITE_API_URL`).
- Komentar kode secukupnya dalam Bahasa Indonesia agar mudah dipahami pemilik project.

## 5. Prioritas Fitur (kerjakan berurutan)
1. Halaman login sederhana (NIM + password, role mahasiswa/admin)
2. Halaman admin: generate QR sesi harian (dengan waktu valid_from–valid_until)
3. Halaman mahasiswa: scan QR via kamera → kirim absen ke backend
4. Validasi backend: token valid & belum expired
5. (Opsional) validasi lokasi GPS radius tertentu
6. Dashboard rekap kehadiran + tombol ekspor CSV

Jangan lompat ke fitur lanjutan (misal notifikasi, geofencing) sebelum fitur inti (1–4) selesai dan berjalan.

## 6. Prinsip Desain Pengalaman Pengguna
Ikuti panduan di `DESIGN.md` untuk semua tampilan. Intinya: **sederhana, besar, jelas** — user mayoritas mahasiswa yang buka dari HP dengan koneksi internet terbatas di lokasi KKN.

## 7. Yang Harus Dihindari
- Jangan menambahkan library besar/berat kalau fungsinya bisa dicapai dengan cara sederhana.
- Jangan generate ulang seluruh file jika hanya perlu edit sebagian kecil — gunakan diff/edit langsung.
- Jangan mengubah struktur database/API tanpa memberi tahu alasan di komentar/commit message.
- Jangan asumsikan koneksi internet selalu stabil — tampilkan status loading & pesan retry yang jelas.

## 8. Testing Manual Sebelum Dianggap Selesai
Setiap fitur baru harus dicek manual:
- Bisa dibuka di layar HP (mobile-first, bukan cuma desktop)
- Scan QR benar-benar bisa membuka kamera & membaca kode
- Kondisi gagal (QR expired, token salah) menampilkan pesan yang jelas, bukan error teknis mentah

## 9. Wajib: Git Workflow (Supaya Bisa Rollback & Aman)
Agent WAJIB pakai Git dengan disiplin berikut. Tujuannya: setiap perubahan tercatat, dan kalau ada yang rusak bisa langsung kembali ke versi sebelumnya.

### a. Setup awal (sekali di awal project)
```bash
git init
git add .
git commit -m "chore: initial commit - project setup"
git branch -M main
git remote add origin https://github.com/Therixxx23/KKN_Absensi_QR.git
git push -u origin main
```
> Ganti `<URL_REPO_GITHUB_KAMU>` dengan URL repo yang sudah dibuat di GitHub (buat dulu repo kosong di github.com sebelum command ini).

### b. Buat file `.gitignore` di root project (WAJIB sebelum commit pertama)
```
node_modules/
dist/
.env
*.log
server/data/*.json
```
Supaya file besar, sensitif (`.env`), dan database lokal tidak ikut ter-push ke GitHub.

### c. Aturan commit — commit kecil & sering, bukan satu commit besar di akhir
Setiap kali 1 fitur/perbaikan kecil selesai dan sudah dites manual, langsung commit:
```bash
git add .
git commit -m "feat: halaman scan QR untuk mahasiswa"
git push
```

Format pesan commit (Conventional Commits, biar rapi & gampang dibaca di history):
- `feat: ...` → fitur baru
- `fix: ...` → perbaikan bug
- `style: ...` → perubahan tampilan/CSS saja
- `refactor: ...` → rapikan kode tanpa ubah fungsi
- `chore: ...` → hal teknis (setup, dependency, dll)

### d. Pakai branch untuk fitur yang agak besar/berisiko
Jangan langsung kerja di `main` untuk perubahan besar (misal integrasi backend baru). Buat branch dulu:
```bash
git checkout -b feat/dashboard-admin
# ...kerjakan perubahan...
git add .
git commit -m "feat: dashboard admin rekap kehadiran"
git push -u origin feat/dashboard-admin
```
Setelah yakin berjalan baik, baru merge ke `main`:
```bash
git checkout main
git merge feat/dashboard-admin
git push
```

### e. Cara rollback kalau ada yang rusak
**Kalau perubahan belum di-commit:**
```bash
git checkout -- .
```
**Kalau sudah di-commit tapi belum di-push, dan mau batalkan commit terakhir:**
```bash
git reset --soft HEAD~1
```
**Kalau sudah ter-push dan versi di GitHub perlu dikembalikan ke commit tertentu:**
```bash
git log --oneline          # cari hash commit yang mau dituju, misal a1b2c3d
git revert a1b2c3d..HEAD   # buat commit baru yang membatalkan perubahan setelah a1b2c3d (aman, history tetap utuh)
git push
```
> Gunakan `git revert`, bukan `git reset --hard` + force push, kalau kode sudah dibagikan/di-push — supaya history tidak hilang dan tetap bisa dilacak.

### f. Checklist sebelum push
- [ ] Sudah dites manual dan tidak error di halaman terkait
- [ ] Tidak ada file `.env` atau kredensial ikut ter-commit
- [ ] Pesan commit jelas menjelaskan apa yang berubah
- [ ] Kalau fitur besar, sudah lewat branch terpisah (bukan langsung di `main`)
