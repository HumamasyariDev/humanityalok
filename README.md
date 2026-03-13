# 🚗 Smart Parking System

Sistem manajemen parkir berbasis web yang modern dan efisien untuk mengelola area parkir kendaraan dengan fitur barcode, tracking real-time, dan laporan komprehensif.

## 📋 Deskripsi

Smart Parking System adalah aplikasi web full-stack yang dirancang untuk mengelola sistem parkir secara digital. Sistem ini memungkinkan admin dan petugas untuk mengelola transaksi parkir, area parkir, tarif, dan menghasilkan laporan secara otomatis dengan antarmuka yang modern dan user-friendly.

## ✨ Fitur Utama

### 👤 Multi-Role User Management
- **Admin**: Akses penuh ke semua fitur sistem
- **Petugas**: Akses untuk transaksi parkir dan laporan

### 🎫 Manajemen Transaksi Parkir
- ✅ Transaksi kendaraan masuk dengan barcode otomatis
- ✅ Transaksi kendaraan keluar dengan perhitungan biaya otomatis
- ✅ Cetak kartu parkir dengan barcode
- ✅ Cetak struk pembayaran
- ✅ Riwayat transaksi lengkap

### 🏢 Manajemen Area Parkir
- 📊 Monitoring kapasitas area parkir real-time
- 🔄 Update status ketersediaan otomatis
- 📍 Multi-area parking support

### 💰 Manajemen Tarif Parkir
- 🏷️ Tarif berdasarkan jenis kendaraan (Motor/Mobil)
- ⏰ Perhitungan biaya otomatis berdasarkan durasi parkir
- 💵 Flexible pricing configuration

### 📊 Laporan & Analytics
- 📈 Rekap transaksi harian/bulanan
- 💵 Total pendapatan
- 📉 Statistik kendaraan masuk/keluar
- 🖨️ Export dan print laporan

### 🔐 Keamanan
- 🔒 JWT Authentication
- 👥 Role-based access control
- 📝 Log aktivitas pengguna

## 🛠️ Tech Stack

### Backend
- **Framework**: Laravel 11
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (JWT)
- **API**: RESTful API

### Frontend
- **Framework**: React 18 + Vite
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Barcode**: react-barcode

## 📁 Struktur Project

```
parkir-ukk/
├── backend/                # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   └── Middleware/
│   │   └── Models/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── frontend/               # React Frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── lib/
│       └── pages/
├── parkir_ukk.sql         # Database Schema
├── FLOWCHART.md           # System Flowchart
└── DATABASE_DIAGRAM.md    # Database Diagram
```

## 🚀 Instalasi

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL/MariaDB
- XAMPP/LAMPP (optional)

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

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parkir_ukk
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate

# (Optional) Seed database
php artisan db:seed

# Start development server
php artisan serve
```

Backend akan berjalan di `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API endpoint in src/lib/api.js
# Pastikan baseURL sesuai dengan backend

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 4. Import Database (Alternative)

Jika ingin langsung import database:

```bash
mysql -u root -p
CREATE DATABASE parkir_ukk;
USE parkir_ukk;
SOURCE parkir_ukk.sql;
```

## 🔑 Default Credentials

Setelah seeding database, gunakan credentials berikut:

### Admin
- **Email**: admin@parkir.com
- **Password**: password

### Petugas
- **Email**: petugas@parkir.com
- **Password**: password

## 📚 API Documentation

### Authentication

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@parkir.com",
  "password": "password"
}
```

### Transaksi Endpoints

#### Create Transaksi Masuk
```http
POST /api/transaksi/masuk
Authorization: Bearer {token}

{
  "plat_nomor": "B1234XYZ",
  "jenis_kendaraan": "mobil",
  "area_parkir_id": 1
}
```

#### Create Transaksi Keluar
```http
POST /api/transaksi/keluar
Authorization: Bearer {token}

{
  "kode_parkir": "PKR-20250313-0001"
}
```

### Area Parkir Endpoints

```http
GET    /api/area-parkir          # List all
POST   /api/area-parkir          # Create
GET    /api/area-parkir/{id}     # Show
PUT    /api/area-parkir/{id}     # Update
DELETE /api/area-parkir/{id}     # Delete
```

### Tarif Parkir Endpoints

```http
GET    /api/tarif-parkir         # List all
POST   /api/tarif-parkir         # Create
PUT    /api/tarif-parkir/{id}    # Update
DELETE /api/tarif-parkir/{id}    # Delete
```

### User Management Endpoints

```http
GET    /api/users                # List all (Admin only)
POST   /api/users                # Create (Admin only)
PUT    /api/users/{id}           # Update (Admin only)
DELETE /api/users/{id}           # Delete (Admin only)
```

## 📱 Fitur Unggulan

### 1. Barcode System
- Generate barcode otomatis untuk setiap transaksi
- Scan barcode untuk proses keluar yang cepat
- Print kartu parkir dengan barcode

### 2. Real-time Monitoring
- Status area parkir terupdate otomatis
- Tracking kapasitas parkir real-time
- Dashboard interaktif

### 3. Automated Billing
- Perhitungan biaya parkir otomatis
- Support multiple tarif
- Print struk pembayaran

### 4. Comprehensive Reports
- Laporan transaksi by periode
- Rekap pendapatan
- Export ke berbagai format

## 🎨 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Transaksi Masuk
![Transaksi Masuk](screenshots/transaksi-masuk.png)

### Laporan
![Laporan](screenshots/laporan.png)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Humamasyari Dev**
- GitHub: [@HumamasyariDev](https://github.com/HumamasyariDev)

## 🙏 Acknowledgments

- Laravel Team for the amazing framework
- React Team for the powerful UI library
- Tailwind CSS for the utility-first CSS framework
- shadcn/ui for beautiful UI components

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di GitHub repository atau hubungi developer.

---

⭐ Jangan lupa beri star jika project ini membantu!
