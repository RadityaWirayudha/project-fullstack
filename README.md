# Aplikasi Administrasi RT

<<<<<<< HEAD
Aplikasi administrasi RT untuk mengelola **iuran bulanan**, **pengeluaran operasional**, serta **data penghuni dan rumah** di sebuah perumahan.

| Komponen | Teknologi |
|---|---|
| Backend | Laravel 12 (PHP 8.2) — REST API + Laravel Sanctum |
| Frontend | React 19 (Vite) + Tailwind CSS + Recharts |
| Database | MySQL / MariaDB |
| Arsitektur | **Decoupled** — backend & frontend terpisah, tanpa Docker |

## Struktur Repo

```
fullstack/
├── backend/        # Laravel REST API
├── frontend/       # React SPA (Vite)
├── docs/
│   ├── ERD.md          # Entity Relationship Diagram
│   └── screenshots/    # Screenshot per fitur
├── pengerjaan.md   # Soal / requirement
└── README.md       # Panduan instalasi (file ini)
```

## Fitur

1. **Pengelolaan Penghuni** — tambah/ubah penghuni: nama lengkap, upload foto KTP, status penghuni (tetap/kontrak), nomor telepon, status pernikahan.
2. **Pengelolaan Rumah** — tambah/ubah rumah, status dihuni/tidak dihuni, tambah & keluarkan penghuni rumah, **histori penghuni**, **histori pembayaran** per bulan (Lunas/Belum per jenis iuran).
3. **Pengelolaan Pembayaran** — iuran kebersihan (Rp15.000/bln) & iuran satpam (Rp100.000/bln), mendukung pembayaran **bulanan** atau **tahunan** (khusus iuran kebersihan, 12 bulan sekaligus), validasi anti bayar ganda.
4. **Report** — grafik summary pemasukan vs pengeluaran selama 1 tahun + detail report pemasukan & pengeluaran per bulan.
5. **Login Admin** — autentikasi token dengan Laravel Sanctum.

ERD lengkap: [docs/ERD.md](docs/ERD.md)

---

## Prasyarat

Pastikan sudah terpasang di komputer Anda:

| Software | Versi minimal | Cek versi |
|---|---|---|
| PHP | 8.2 (ekstensi: `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `gd`) | `php --version` |
| Composer | 2.x | `composer --version` |
| Node.js + npm | Node 20.19+ / npm 10 | `node --version` |
| MySQL / MariaDB | MySQL 8 / MariaDB 10.4 (mis. bawaan XAMPP) | — |

> **Catatan XAMPP (Windows):** jalankan modul **MySQL** dari XAMPP Control Panel sebelum instalasi. PHP & ekstensi di atas sudah termasuk dalam XAMPP.

## 1. Clone Repo

```bash
git clone <URL_REPO_INI> fullstack
cd fullstack
```

## 2. Siapkan Database

Buat database kosong bernama `rt_admin`:

```bash
# via CLI (sesuaikan path mysql bila memakai XAMPP: C:\xampp\mysql\bin\mysql.exe)
mysql -u root -e "CREATE DATABASE rt_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Atau lewat phpMyAdmin: buat database baru bernama `rt_admin`.

## 3. Instalasi Backend (Laravel)

```bash
cd backend

# 1) Install dependency PHP
composer install

# 2) Salin konfigurasi environment
cp .env.example .env
#    Windows CMD: copy .env.example .env

# 3) Generate application key
php artisan key:generate

# 4) Sesuaikan kredensial database di .env bila perlu (default: root tanpa password)
#    DB_CONNECTION=mysql
#    DB_HOST=127.0.0.1
#    DB_PORT=3306
#    DB_DATABASE=rt_admin
#    DB_USERNAME=root
#    DB_PASSWORD=

# 5) Migrasi tabel + isi data contoh (admin, rumah, penghuni, pembayaran, pengeluaran)
php artisan migrate --seed

# 6) Buat symlink untuk file upload (foto KTP)
php artisan storage:link

# 7) Jalankan server API di port 8000
php artisan serve
```

Backend berjalan di **http://localhost:8000** (API prefix: `/api`).

## 4. Instalasi Frontend (React)

Buka terminal **baru** (biarkan `php artisan serve` tetap berjalan):

```bash
cd frontend

# 1) Install dependency JavaScript
npm install

# 2) Jalankan dev server (proxy /api & /storage ke port 8000 sudah dikonfigurasi di vite.config.js)
npm run dev
```

Frontend berjalan di **http://localhost:5173**.

## 5. Login

Buka http://localhost:5173 lalu masuk dengan akun admin bawaan seeder:

| Email | Password |
|---|---|
| `admin@rt.test` | `password` |

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `SQLSTATE[HY000] [2002] Connection refused` saat migrate | MySQL belum berjalan — start modul MySQL di XAMPP Control Panel. |
| `could not find driver` | Aktifkan ekstensi `pdo_mysql` di `php.ini` (hapus `;` di depan `extension=pdo_mysql`). |
| Foto KTP tidak tampil | Pastikan `php artisan storage:link` sudah dijalankan di folder `backend`. |
| Port 8000/5173 sudah dipakai | Backend: `php artisan serve --port=8001` lalu sesuaikan `target` proxy di `frontend/vite.config.js`. |
| Error 401 terus-menerus di frontend | Logout lalu login ulang (token lama tidak valid setelah `migrate:fresh`). |

## Reset Data

Untuk mengulang dari data contoh awal:

```bash
cd backend
php artisan migrate:fresh --seed
```

## Screenshot

Rangkuman screenshot per fitur tersedia di [docs/screenshots/](docs/screenshots/).
