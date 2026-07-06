# Absensi QR KKN

Aplikasi absensi berbasis QR Code untuk kegiatan KKN. Mahasiswa scan QR statis yang ditempel di lokasi, sistem otomatis mencatat absen siang/sore.

## Tech Stack

- **Frontend:** React (Vite) + `html5-qrcode` + `qrcode.react` + `axios`
- **Backend:** Node.js + Express, penyimpanan file JSON
- **Auth:** bcrypt untuk hash password

## Struktur Folder

```
├── server/              # Backend Express
│   ├── data/            # JSON storage (users, sessions, attendances)
│   ├── routes/          # auth, sessions, attendances
│   ├── middleware/       # authMiddleware
│   ├── utils/           # hash.js
│   ├── db.js            # read/write JSON helpers
│   ├── index.js         # Entry point
│   ├── seed.js          # Seed data awal
│   └── package.json
├── src/                 # Frontend React
│   ├── pages/           # Login, Register, ScanAbsen, DashboardAdmin
│   ├── components/      # UI components
│   ├── services/api.js  # Axios config
│   └── App.jsx
├── render.yaml          # Konfigurasi deploy Render
├── .env.example         # Contoh environment variable frontend
└── package.json         # Frontend dependencies
```

## Development Lokal

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd kkn-absensi-qr

# Backend
cd server
npm install

# Frontend (root)
cd ..
npm install
```

### 2. Seed data awal

```bash
cd server
node seed.js
```

### 3. Jalankan backend

```bash
cd server
npm run dev
```

Backend berjalan di `http://localhost:5000`.

### 4. Jalankan frontend

```bash
cd kkn-absensi-qr
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

### 5. Login

| Role       | NIM          | Password   |
|------------|--------------|------------|
| Admin      | admin        | admin123   |
| Mahasiswa  | 220101001    | 12345678   |

## Deployment

### Backend ke Render

1. Push repo ke GitHub.
2. Di [Render Dashboard](https://dashboard.render.com), klik **New + → Web Service**.
3. Connect repositori GitHub ini.
4. Isi konfigurasi:
   - **Name:** `kkn-absensi-qr-api`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
   - **Auto-Deploy:** Yes (branch `main`)
5. Tambahkan **Environment Variable**:
   - `FRONTEND_URL` → URL Vercel setelah frontend di-deploy (contoh: `https://kkn-absensi-qr.vercel.app`)
6. Klik **Create Web Service**.
7. Catat URL backend (contoh: `https://kkn-absensi-qr-api.onrender.com`).

> Atau deploy otomatis pakai `render.yaml` yang sudah disediakan — tinggal hubungkan repositori di Render, file konfigurasi akan terbaca otomatis.

### Frontend ke Vercel

1. Di [Vercel Dashboard](https://vercel.com), klik **Add New → Project**.
2. Import repositori GitHub ini.
3. **Root Directory:** biarkan default (`.`).
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Tambahkan **Environment Variable**:
   - `VITE_API_URL` → URL Render backend (contoh: `https://kkn-absensi-qr-api.onrender.com/api`)
7. Klik **Deploy**.

### Urutan Deploy

1. Deploy backend ke Render **terlebih dahulu**, catat URL-nya.
2. Deploy frontend ke Vercel dengan `VITE_API_URL` diisi URL Render.
3. Setelah frontend jadi, update `FRONTEND_URL` di environment Render dengan URL Vercel.

## Akun Default (Seed)

| Nama             | NIM        | Password   | Role       |
|------------------|------------|------------|------------|
| Koordinator KKN  | admin      | admin123   | admin      |
| Andi Pratama     | 220101001  | 12345678   | mahasiswa  |
| Siti Rahmawati   | 220101002  | 12345678   | mahasiswa  |
| Budi Santoso     | 220101003  | 12345678   | mahasiswa  |
| Dewi Lestari     | 220101004  | 12345678   | mahasiswa  |
