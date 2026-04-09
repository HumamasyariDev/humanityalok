# SmartPark - Sistem Manajemen Parkir

Aplikasi manajemen parkir berbasis web dengan fitur barcode, monitoring real-time, AI Chatbot, dan laporan komprehensif. Dibuat untuk UKK (Uji Kompetensi Keahlian) RPL Paket 2 Tahun Pelajaran 2025/2026.

## Deskripsi

SmartPark adalah aplikasi web full-stack yang mengelola sistem parkir secara digital. Sistem mendukung 3 level pengguna (Admin, Petugas, Owner) dengan fitur transaksi parkir, manajemen area & tarif, cetak struk, rekap laporan, serta AI Chatbot untuk cek biaya dan slot parkir.

## Fitur

### Multi-Role User Management
| Fitur | Admin | Petugas | Owner |
|---|:---:|:---:|:---:|
| Login / Logout | v | v | v |
| CRUD User | v | | |
| CRUD Tarif Parkir | v | | |
| CRUD Area Parkir | v | | |
| CRUD Kendaraan | v | v | |
| Transaksi Masuk/Keluar | v | v | |
| Cetak Struk Parkir | v | v | |
| Akses Log Aktivitas | v | | |
| Rekap Transaksi | v | | v |
| AI Chatbot | v | v | v |

### Transaksi Parkir
- Transaksi kendaraan masuk dengan barcode otomatis
- Transaksi kendaraan keluar dengan scan barcode
- Perhitungan biaya otomatis (tarif per jam x durasi, pembulatan ke atas)
- Cetak kartu parkir dan struk pembayaran

### Area Parkir
- Monitoring kapasitas area parkir real-time
- Update status ketersediaan otomatis saat kendaraan masuk/keluar
- Multi-area parking support

### Tarif Parkir
- Tarif berdasarkan jenis kendaraan: Motor (Rp 2.000/jam), Mobil (Rp 5.000/jam), Lainnya (Rp 10.000/jam)
- Konfigurasi tarif fleksibel melalui CRUD

### Dashboard
- Statistik transaksi hari ini dan pendapatan
- Grafik tren 7 hari terakhir
- Status area parkir real-time
- Quick action cards (Kendaraan Masuk, Keluar, Rekap)
- Daftar transaksi terbaru

### Rekap & Laporan
- Rekap transaksi berdasarkan rentang waktu
- Grafik pendapatan dan analisis per jenis kendaraan
- Export laporan ke CSV

### AI Chatbot
- Chatbot untuk cek estimasi biaya parkir berdasarkan durasi
- Cek sisa kapasitas area parkir secara real-time
- Powered by NVIDIA AI API (Llama 3.1 8B)
- Floating widget yang tersedia di semua halaman

### Keamanan
- Token-based authentication (Laravel Sanctum)
- Role-based access control dengan middleware
- Log aktivitas seluruh pengguna

## Tech Stack

### Backend
- **Framework**: Laravel 12
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **AI Integration**: NVIDIA AI API (Llama 3.1 8B)
- **API**: RESTful API

### Frontend
- **Framework**: React 19 + Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7
- **Charts**: Recharts
- **Barcode**: react-barcode
- **Icons**: react-icons (Feather Icons)
- **Notifications**: react-hot-toast

## Skema Database

Semua tabel menggunakan prefix `tb_`:

```
tb_user          - Data pengguna (id_user, nama_lengkap, username, password, role, status_aktif)
tb_tarif         - Tarif parkir (id_tarif, jenis_kendaraan, tarif_per_jam)
tb_area_parkir   - Area parkir (id_area, nama_area, kapasitas, terisi)
tb_kendaraan     - Data kendaraan (id_kendaraan, plat_nomor, jenis_kendaraan, warna, pemilik)
tb_transaksi     - Transaksi parkir (id_parkir, id_kendaraan, waktu_masuk/keluar, id_tarif, durasi_jam, biaya_total, status, id_user, id_area)
tb_log_aktivitas - Log aktivitas (id_log, id_user, aktivitas, waktu_aktivitas)
```

## Struktur Project

```
parkir-ukk/
├── backend/                    # Laravel 12 Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── UserController.php
│   │   │   │   ├── TarifParkirController.php
│   │   │   │   ├── AreaParkirController.php
│   │   │   │   ├── KendaraanController.php
│   │   │   │   ├── TransaksiController.php
│   │   │   │   ├── LogAktivitasController.php
│   │   │   │   └── ChatbotController.php
│   │   │   └── Middleware/
│   │   │       └── RoleMiddleware.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── TarifParkir.php
│   │       ├── AreaParkir.php
│   │       ├── Kendaraan.php
│   │       ├── Transaksi.php
│   │       └── LogAktivitas.php
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
├── frontend/                   # React 19 Frontend
│   └── src/
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── ConfirmDialog.jsx
│       │   └── ChatbotWidget.jsx
│       ├── contexts/
│       │   └── AuthContext.jsx
│       ├── lib/
│       │   └── api.js
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── TransaksiMasuk.jsx
│       │   ├── TransaksiKeluar.jsx
│       │   ├── TransaksiList.jsx
│       │   ├── Kendaraan.jsx
│       │   ├── TarifParkir.jsx
│       │   ├── AreaParkir.jsx
│       │   ├── Users.jsx
│       │   ├── Rekap.jsx
│       │   └── LogAktivitas.jsx
│       ├── App.jsx
│       └── index.css
└── README.md
```

## Instalasi

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL / MariaDB
- XAMPP / LAMPP (opsional)

### 1. Clone Repository

```bash
git clone https://github.com/HumamasyariDev/humanityalok.git
cd humanityalok
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Konfigurasi database di .env
# DB_DATABASE=parkir_ukk
# DB_USERNAME=root
# DB_PASSWORD=

# Konfigurasi NVIDIA API key di .env untuk fitur AI Chatbot
# NVIDIA_API_KEY=your_nvidia_api_key

# Jalankan migrasi dan seeder
php artisan migrate --seed

# Jalankan server
php artisan serve
```

Backend berjalan di `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend berjalan di `http://localhost:5173`

Vite sudah dikonfigurasi untuk proxy `/api` ke backend (`localhost:8000`).

### 4. Build Production

```bash
cd frontend
npm run build
```

Hasil build ada di `frontend/dist/`.

## Default Login

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `password` |
| Petugas | `petugas` | `password` |
| Owner | `owner` | `password` |

Login menggunakan **username** (bukan email).

## API Endpoints

### Authentication
```
POST   /api/login              # Login (public)
POST   /api/logout             # Logout
GET    /api/me                 # Get current user
```

### Dashboard
```
GET    /api/dashboard           # Dashboard stats & charts
```

### Transaksi (Admin, Petugas)
```
GET    /api/transaksi           # List transaksi (filter: status, search, tanggal)
POST   /api/transaksi/masuk     # Kendaraan masuk
POST   /api/transaksi/{id}/keluar  # Kendaraan keluar
GET    /api/transaksi/{id}      # Detail transaksi
GET    /api/transaksi/{id}/struk   # Data struk
POST   /api/transaksi/scan-barcode # Scan barcode
```

### Data Master
```
# Kendaraan (Admin, Petugas)
GET|POST        /api/kendaraan
GET|PUT|DELETE  /api/kendaraan/{id}
POST            /api/kendaraan/find-plat

# Tarif Parkir (Admin)
GET|POST        /api/tarif-parkir
GET|PUT|DELETE  /api/tarif-parkir/{id}
GET             /api/tarif-parkir-all    # Semua tarif (tanpa pagination)

# Area Parkir (Admin)
GET|POST        /api/area-parkir
GET|PUT|DELETE  /api/area-parkir/{id}
GET             /api/area-parkir-all     # Semua area (tanpa pagination)
```

### Administrasi
```
GET    /api/users               # CRUD Users (Admin)
GET    /api/rekap               # Rekap transaksi (Admin, Owner)
GET    /api/log-aktivitas       # Log aktivitas (Admin)
```

### AI Chatbot
```
POST   /api/chatbot             # Kirim pesan ke AI chatbot (semua role)
```

## Seed Data

### Area Parkir Default
| Area | Kapasitas |
|---|---|
| Area Motor Utama | 50 |
| Area Motor Belakang | 30 |
| Area Mobil Lantai 1 | 25 |
| Area Mobil Lantai 2 | 25 |
| Area Truk & Bus | 10 |

### Tarif Default
| Jenis Kendaraan | Tarif/Jam |
|---|---|
| Motor | Rp 2.000 |
| Mobil | Rp 5.000 |
| Lainnya | Rp 10.000 |

## Design System

Aplikasi menggunakan design language yang konsisten di semua halaman:

- **Color Scheme**: Gradient blue-to-indigo (`from-blue-600 to-indigo-600`)
- **Cards**: `bg-white rounded-2xl shadow-sm border border-gray-100`
- **Buttons**: Gradient dengan shadow dan `rounded-xl`
- **Inputs**: `rounded-xl` dengan focus ring biru
- **Sidebar**: Gradient `from-blue-700 via-blue-800 to-indigo-900` dengan grouped sections
- **Topbar**: Breadcrumb navigasi (`SmartPark > Section > Page`)
- **Modals**: `backdrop-blur-sm` overlay dengan `rounded-2xl` content
- **Confirm Dialogs**: Custom component (bukan browser `confirm()`)

## Developer

**Humamasyari Dev**
- GitHub: [@HumamasyariDev](https://github.com/HumamasyariDev)

## Lisensi

Project ini dibuat untuk keperluan UKK RPL Paket 2 Tahun Pelajaran 2025/2026.
