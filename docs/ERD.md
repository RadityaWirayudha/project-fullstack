# ERD — Aplikasi Administrasi RT

## Diagram

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        timestamps timestamps
    }

    RESIDENTS {
        bigint id PK
        varchar full_name
        varchar ktp_photo "path file upload, nullable"
        enum resident_status "tetap | kontrak"
        varchar phone_number
        enum marital_status "sudah | belum"
        timestamps timestamps
    }

    HOUSES {
        bigint id PK
        varchar house_number UK
        enum status "dihuni | tidak_dihuni"
        timestamps timestamps
    }

    HOUSE_RESIDENTS {
        bigint id PK
        bigint house_id FK
        bigint resident_id FK
        date start_date
        date end_date "null = masih menghuni"
        timestamps timestamps
    }

    PAYMENTS {
        bigint id PK
        bigint house_id FK
        bigint resident_id FK
        date payment_date
        bigint total_amount
        varchar notes "nullable"
        timestamps timestamps
    }

    PAYMENT_DETAILS {
        bigint id PK
        bigint payment_id FK
        enum fee_type "kebersihan | satpam"
        date period "tanggal 1 bulan yang dibayar"
        bigint amount
        timestamps timestamps
    }

    EXPENSES {
        bigint id PK
        varchar description
        varchar category
        bigint amount
        date expense_date
        timestamps timestamps
    }

    HOUSES ||--o{ HOUSE_RESIDENTS : "memiliki histori penghuni"
    RESIDENTS ||--o{ HOUSE_RESIDENTS : "pernah/masih menghuni"
    HOUSES ||--o{ PAYMENTS : "memiliki pembayaran"
    RESIDENTS ||--o{ PAYMENTS : "melakukan pembayaran"
    PAYMENTS ||--|{ PAYMENT_DETAILS : "terdiri dari detail per bulan"
```

## Penjelasan Relasi

| Tabel | Peran |
|---|---|
| `users` | Akun admin untuk login aplikasi (Laravel Sanctum token). |
| `residents` | Data penghuni: nama lengkap, foto KTP (upload), status penghuni (tetap/kontrak), nomor telepon, status pernikahan (sudah/belum). |
| `houses` | Data rumah dengan nomor unik dan status hunian (dihuni/tidak dihuni). Status dikelola otomatis saat penghuni ditempatkan/dikeluarkan. |
| `house_residents` | Tabel pivot **histori penghuni**. Setiap baris = satu periode hunian. `end_date` yang masih `NULL` berarti penghuni tersebut **aktif** menghuni rumah itu. Semua baris membentuk catatan sejarah siapa saja yang pernah menempati rumah. |
| `payments` | Header transaksi pembayaran iuran: rumah, penghuni yang membayar, tanggal bayar, dan total. |
| `payment_details` | Detail pembayaran **per bulan per jenis iuran**. Pembayaran bulanan menghasilkan 1 baris; pembayaran **tahunan iuran kebersihan** menghasilkan 12 baris (12 × Rp15.000). Status **Lunas/Belum** per rumah per bulan ditentukan dari ada/tidaknya baris detail untuk periode tersebut. |
| `expenses` | Pengeluaran operasional RT (gaji satpam, perbaikan, kegiatan, dll.). |

## Aturan Bisnis Utama

1. **Iuran Kebersihan**: Rp15.000/bulan — dapat dibayar bulanan atau **tahunan** (12 bulan sekaligus = Rp180.000).
2. **Iuran Satpam**: Rp100.000/bulan — hanya bulanan.
3. Satu rumah hanya boleh memiliki **satu penghuni aktif** pada satu waktu; penghuni juga tidak boleh aktif di dua rumah sekaligus (divalidasi backend).
4. Pembayaran ditolak jika periode + jenis iuran yang sama sudah lunas (mencegah bayar ganda).
5. Pemasukan pada report dihitung berdasarkan tanggal pembayaran diterima (cash basis); pengeluaran berdasarkan tanggal pengeluaran.
