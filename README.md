# 🏥 MediQueue — Clinic Appointment & Queue Management API

> **Farhan** | Web Service berbasis REST API menggunakan Flask dan SQLite

---

## 📌 Deskripsi Proyek

**MediQueue** adalah Web Service berbasis REST API yang dibangun menggunakan **Flask** dan **SQLite** untuk mengelola sistem antrian dan pendaftaran online pada klinik atau puskesmas. Sistem ini dirancang untuk memudahkan pasien dalam mendaftar antrian secara digital tanpa harus datang langsung, serta membantu petugas dalam memantau dan mengelola antrian secara real-time.

### Latar Belakang

Antrian panjang di klinik dan puskesmas masih menjadi masalah umum yang dialami masyarakat. Pasien sering harus datang pagi-pagi hanya untuk mendapatkan nomor antrian, lalu menunggu berjam-jam tanpa kepastian. MediQueue hadir sebagai solusi digital yang memungkinkan pasien mendaftar dari mana saja dan mendapatkan informasi antrian secara real-time.

### Fitur Utama

- Pendaftaran antrian online oleh pasien
- Pemantauan status antrian secara real-time
- Manajemen antrian oleh petugas (panggil, lewati, selesaikan)
- Autentikasi multi-role: **Pasien** dan **Petugas**
- Riwayat kunjungan pasien
- Notifikasi estimasi waktu tunggu

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| Backend Framework | Python Flask |
| Database | SQLite |
| Autentikasi | JWT (JSON Web Token) |
| API Format | REST API (JSON) |
| Library Utama | Flask-JWT-Extended, Flask-SQLAlchemy, Flask-CORS |

---

## 📁 Struktur Proyek

```
mediqueue/
├── app.py                  # Entry point aplikasi
├── config.py               # Konfigurasi aplikasi
├── requirements.txt        # Daftar dependensi
├── database.db             # File database SQLite
│
├── models/
│   ├── user.py             # Model User (Pasien & Petugas)
│   ├── queue.py            # Model Antrian
│   └── appointment.py      # Model Appointment
│
├── routes/
│   ├── auth.py             # Endpoint autentikasi
│   ├── queue.py            # Endpoint manajemen antrian
│   └── appointment.py      # Endpoint appointment
│
└── middleware/
    └── auth_middleware.py  # Middleware JWT & role check
```

---

## ⚙️ Instalasi & Menjalankan Proyek

### 1. Clone Repository

```bash
git clone https://github.com/username/mediqueue.git
cd mediqueue
```

### 2. Buat Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install Dependensi

```bash
pip install -r requirements.txt
```

Isi `requirements.txt`:
```
Flask==3.0.0
Flask-JWT-Extended==4.6.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
```

### 4. Jalankan Aplikasi

```bash
python app.py
```

Server akan berjalan di: `http://localhost:5000`

---

## 🔗 Dokumentasi API Endpoint

### 🔐 Autentikasi

#### Register Pasien
```
POST /api/auth/register
```
**Request Body:**
```json
{
  "nama": "Budi Santoso",
  "email": "budi@email.com",
  "password": "password123",
  "no_hp": "081234567890"
}
```
**Response:**
```json
{
  "status": "success",
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "nama": "Budi Santoso",
    "email": "budi@email.com",
    "role": "pasien"
  }
}
```

---

#### Login
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "budi@email.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "status": "success",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "pasien"
}
```

---

### 🎫 Manajemen Antrian

#### Ambil Nomor Antrian (Pasien)
```
POST /api/queue/take
```
> 🔒 Memerlukan token JWT (role: pasien)

**Headers:**
```
Authorization: Bearer <access_token>
```
**Request Body:**
```json
{
  "poli": "Umum",
  "keluhan": "Demam dan batuk"
}
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "nomor_antrian": "A-023",
    "poli": "Umum",
    "estimasi_waktu": "± 45 menit",
    "posisi_antrian": 5
  }
}
```

---

#### Lihat Status Antrian (Pasien)
```
GET /api/queue/status
```
> 🔒 Memerlukan token JWT (role: pasien)

**Response:**
```json
{
  "status": "success",
  "data": {
    "nomor_antrian": "A-023",
    "status": "menunggu",
    "nomor_dipanggil": "A-018",
    "sisa_antrian": 5,
    "estimasi_waktu": "± 30 menit"
  }
}
```

---

#### Lihat Semua Antrian (Petugas)
```
GET /api/queue/all
```
> 🔒 Memerlukan token JWT (role: petugas)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 23,
      "nomor_antrian": "A-023",
      "nama_pasien": "Budi Santoso",
      "poli": "Umum",
      "keluhan": "Demam dan batuk",
      "status": "menunggu",
      "waktu_daftar": "2025-05-07 08:30:00"
    }
  ]
}
```

---

#### Panggil Antrian Berikutnya (Petugas)
```
PUT /api/queue/next
```
> 🔒 Memerlukan token JWT (role: petugas)

**Response:**
```json
{
  "status": "success",
  "message": "Memanggil nomor antrian A-019",
  "data": {
    "nomor_antrian": "A-019",
    "nama_pasien": "Siti Rahayu"
  }
}
```

---

#### Selesaikan Antrian (Petugas)
```
PUT /api/queue/done/{queue_id}
```
> 🔒 Memerlukan token JWT (role: petugas)

**Response:**
```json
{
  "status": "success",
  "message": "Antrian A-019 telah diselesaikan"
}
```

---

### 📋 Riwayat Kunjungan

#### Lihat Riwayat Kunjungan Pasien
```
GET /api/history
```
> 🔒 Memerlukan token JWT (role: pasien)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "tanggal": "2025-05-07",
      "nomor_antrian": "A-019",
      "poli": "Umum",
      "status": "selesai"
    }
  ]
}
```

---

## 🗄️ Skema Database

### Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INTEGER | Primary Key |
| nama | TEXT | Nama lengkap |
| email | TEXT | Email (unique) |
| password | TEXT | Password (hashed) |
| no_hp | TEXT | Nomor HP |
| role | TEXT | `pasien` atau `petugas` |
| created_at | DATETIME | Waktu daftar |

### Tabel `queues`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INTEGER | Primary Key |
| user_id | INTEGER | Foreign Key → users |
| nomor_antrian | TEXT | Contoh: A-023 |
| poli | TEXT | Nama poli |
| keluhan | TEXT | Keluhan pasien |
| status | TEXT | `menunggu`, `dipanggil`, `selesai` |
| created_at | DATETIME | Waktu ambil antrian |

---

## 👤 Role & Akses

| Endpoint | Pasien | Petugas |
|---|---|---|
| Register & Login | ✅ | ✅ |
| Ambil nomor antrian | ✅ | ❌ |
| Lihat status antrian sendiri | ✅ | ❌ |
| Lihat riwayat kunjungan | ✅ | ❌ |
| Lihat semua antrian | ❌ | ✅ |
| Panggil / selesaikan antrian | ❌ | ✅ |

---

## 🧪 Cara Testing API

Gunakan **Postman** atau **Thunder Client (VS Code)**:

1. Login terlebih dahulu untuk mendapatkan `access_token`
2. Salin token dari response login
3. Pada setiap request yang memerlukan autentikasi, tambahkan header:
   ```
   Authorization: Bearer <access_token>
   ```

---

## 👨‍💻 Developer

| | |
|---|---|
| **Nama** | Farhan |
| **Proyek** | MediQueue — Clinic Appointment & Queue Management API |
| **Stack** | Python Flask, SQLite, JWT |

---

> 📝 *Dibuat sebagai proyek Web Service dengan Flask*