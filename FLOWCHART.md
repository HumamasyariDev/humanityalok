# Flowchart Sistem Parkir SmartPark

## 1. Flow Diagram Sistem Login

```mermaid
flowchart TD
    A[START] --> B[Tampil Form Login]
    B --> C[User Input Email & Password]
    C --> D{Validasi Credentials}
    D -->|Valid| E[Generate Sanctum Token]
    D -->|Tidak Valid| F[Tampil Error Message]
    F --> B
    E --> G[Simpan Token di LocalStorage]
    G --> H[Cek Role User]
    H -->|Admin| I[Redirect ke Dashboard Admin]
    H -->|Petugas| J[Redirect ke Dashboard Petugas]
    H -->|Owner| K[Redirect ke Dashboard Owner]
    I --> L[END]
    J --> L
    K --> L
```

## 2. Flow Diagram Kendaraan Masuk (Transaksi Entry)

```mermaid
flowchart TD
    A[START - Halaman Kendaraan Masuk] --> B[Load Data Area Parkir]
    B --> C[Load Data Tarif Parkir]
    C --> D[Tampil Form Input]
    D --> E[User Input Data Kendaraan]
    E --> F{Validasi Input}
    F -->|Tidak Valid| G[Tampil Error]
    G --> E
    F -->|Valid| H[Input Plat Nomor]
    H --> I[Pilih Jenis Kendaraan<br/>Motor/Mobil/Truk/Bus]
    I --> J[Pilih Area Parkir]
    J --> K{Cek Kapasitas Area}
    K -->|Area Penuh| L[Error: Area Penuh]
    L --> J
    K -->|Tersedia| M[Input Merk & Warna Opsional]
    M --> N[Klik Proses Masuk]
    N --> O[API: POST /transaksi/masuk]
    O --> P[Backend: Cek/Buat Kendaraan]
    P --> Q[Generate Kode Transaksi Unik]
    Q --> R[Generate Barcode]
    R --> S[Simpan Transaksi ke Database<br/>- waktu_masuk = NOW<br/>- status = parkir]
    S --> T[Update Area Parkir<br/>terisi = terisi + 1]
    T --> U[Log Aktivitas: MASUK]
    U --> V[Return Data Transaksi + Barcode]
    V --> W[Tampil Kartu Parkir di UI<br/>- Kode Transaksi<br/>- Barcode SVG<br/>- Detail Kendaraan<br/>- Waktu Masuk]
    W --> X{User Klik Cetak?}
    X -->|Ya| Y[Generate Print Preview<br/>dengan Barcode]
    Y --> Z[Print Kartu Parkir]
    X -->|Tidak| AA[END]
    Z --> AA
```

## 3. Flow Diagram Kendaraan Keluar (Transaksi Exit)

```mermaid
flowchart TD
    A[START - Halaman Kendaraan Keluar] --> B[Tampil Form Scan Barcode]
    B --> C[User Input/Scan Barcode]
    C --> D[Klik Cari]
    D --> E[API: POST /transaksi/scan-barcode]
    E --> F{Barcode Ditemukan?}
    F -->|Tidak| G[Error: Barcode Tidak Valid]
    G --> B
    F -->|Ya| H{Status Transaksi?}
    H -->|Selesai| I[Error: Sudah Keluar]
    I --> B
    H -->|Parkir| J[Ambil Data Transaksi]
    J --> K[Tampil Detail Kendaraan<br/>- Kode Transaksi<br/>- Plat Nomor<br/>- Waktu Masuk]
    K --> L[Hitung Durasi Parkir<br/>durasi = NOW - waktu_masuk]
    L --> M[Get Tarif Parkir<br/>berdasarkan Jenis Kendaraan]
    M --> N{Jenis Tarif?}
    N -->|Tarif Flat| O[Biaya = tarif_flat]
    N -->|Tarif Per Jam| P[Biaya = durasi_jam × tarif_per_jam]
    O --> Q[Tampil Estimasi Biaya]
    P --> Q
    Q --> R[User Pilih Metode Pembayaran<br/>Tunai/Kartu/E-Wallet]
    R --> S[Klik Proses Keluar & Bayar]
    S --> T[API: POST /transaksi/:id/keluar]
    T --> U[Backend: Update Transaksi<br/>- waktu_keluar = NOW<br/>- total_biaya<br/>- durasi_menit<br/>- metode_pembayaran<br/>- status = selesai]
    U --> V[Update Area Parkir<br/>terisi = terisi - 1]
    V --> W[Log Aktivitas: KELUAR]
    W --> X[Return Data Struk]
    X --> Y[Tampil Struk Pembayaran<br/>- Barcode<br/>- Detail Lengkap<br/>- Total Biaya]
    Y --> Z{User Klik Cetak?}
    Z -->|Ya| AA[Print Struk]
    Z -->|Tidak| AB[END]
    AA --> AB
```

## 4. Role-Based Access Control Flow

```mermaid
flowchart TD
    A[User Login Berhasil] --> B{Cek Role User}
    B -->|ADMIN| C[Full Access]
    B -->|PETUGAS| D[Limited Access]
    B -->|OWNER| E[Read-Only Access]
    
    C --> C1[Dashboard]
    C --> C2[Users CRUD]
    C --> C3[Tarif Parkir CRUD]
    C --> C4[Area Parkir CRUD]
    C --> C5[Kendaraan CRUD]
    C --> C6[Transaksi Masuk/Keluar]
    C --> C7[Rekap Transaksi]
    C --> C8[Log Aktivitas]
    
    D --> D1[Dashboard]
    D --> D2[Kendaraan CRUD]
    D --> D3[Transaksi Masuk/Keluar]
    D --> D4[View Transaksi List]
    
    E --> E1[Dashboard Read-Only]
    E --> E2[Rekap Transaksi]
    E --> E3[Export Reports]
```

## 5. Database Transaction Flow

```mermaid
flowchart TD
    A[Request Transaksi] --> B{Jenis Request?}
    B -->|Kendaraan Masuk| C[Cek Data Kendaraan]
    B -->|Kendaraan Keluar| D[Cari Transaksi Aktif]
    
    C --> E{Kendaraan Exists?}
    E -->|Tidak| F[Insert Kendaraan Baru]
    E -->|Ya| G[Use Existing Kendaraan]
    F --> G
    G --> H[Insert Transaksi<br/>status=parkir]
    H --> I[Update Area terisi++]
    I --> J[Insert Log Aktivitas]
    
    D --> K[Update Transaksi<br/>status=selesai]
    K --> L[Update Area terisi--]
    L --> M[Insert Log Aktivitas]
    
    J --> N[Commit Transaction]
    M --> N
    N --> O[Return Success]
```

## 6. API Request Flow

```mermaid
sequenceDiagram
    participant F as Frontend React
    participant A as API Gateway
    participant M as Middleware
    participant C as Controller
    participant D as Database
    
    F->>A: POST /api/transaksi/masuk
    A->>M: Check Auth Token
    M->>M: Verify Sanctum Token
    M->>M: Check Role (admin/petugas)
    alt Token Invalid
        M-->>F: 401 Unauthorized
    else Token Valid
        M->>C: Forward Request
        C->>D: Check Kendaraan
        D-->>C: Kendaraan Data
        C->>D: Insert/Update Transaksi
        D-->>C: Transaksi Created
        C->>D: Update Area Parkir
        D-->>C: Area Updated
        C->>D: Insert Log Aktivitas
        D-->>C: Log Created
        C-->>F: 200 Success + Data
    end
```

## 7. Error Handling Flow

```mermaid
flowchart TD
    A[API Request] --> B{Try Execute}
    B -->|Success| C[Return 200 OK]
    B -->|Exception| D{Error Type?}
    
    D -->|Validation Error| E[Return 422 Unprocessable]
    D -->|Not Found| F[Return 404 Not Found]
    D -->|Unauthorized| G[Return 401/403]
    D -->|Server Error| H[Log Error]
    
    H --> I[Return 500 Internal Error]
    
    E --> J[Frontend: Toast Error]
    F --> J
    G --> J
    I --> J
    
    J --> K[User Retry/Fix Input]
```

## 8. Dashboard Stats Calculation Flow

```mermaid
flowchart TD
    A[Load Dashboard] --> B[API: GET /dashboard]
    B --> C[Query: Total Kendaraan Parkir<br/>status=parkir]
    C --> D[Query: Pendapatan Hari Ini<br/>waktu_keluar=TODAY]
    D --> E[Query: Total Transaksi Hari Ini]
    E --> F[Query: Kapasitas Area Parkir]
    F --> G[Query: Transaksi Per Hari<br/>Last 7 Days]
    G --> H[Query: Transaksi Per Jenis<br/>Group By jenis_kendaraan]
    H --> I[Aggregate All Data]
    I --> J[Return JSON Response]
    J --> K[Frontend: Render Charts<br/>- Line Chart<br/>- Pie Chart]
    K --> L[Display Stats Cards]
```

---

## Install Extension untuk Preview

1. **Install Extension di VS Code/Windsurf:**
   - Cari "Markdown Preview Mermaid Support"
   - Install extension tersebut

2. **Cara Melihat Diagram:**
   - Buka file `FLOWCHART.md`
   - Klik icon preview (Ctrl+Shift+V)
   - Diagram Mermaid akan ter-render otomatis

3. **Export ke Image:**
   - Klik kanan pada diagram
   - Copy as PNG/SVG

