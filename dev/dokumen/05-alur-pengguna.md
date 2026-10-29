## 5. Alur Pengguna Utama

### 5.1 Tambah resep

Prinsip: hanya **judul** yang wajib diisi. Semua layar lain boleh dilewati dan dilengkapi kapan saja. [A]

| Layar | Isi | Tombol |
|---|---|---|
| 1 | Judul masakan, kategori, pemilik resep | Lanjut |
| 2 | Bahan, satu per baris | Kembali, Lanjut |
| 3 | Langkah memasak, satu per baris | Kembali, Lanjut |
| 4 | Foto masakan dan foto tulisan asli | Kembali, Lewati, Lanjut |
| 5 | Cerita asal resep dan kenangan atau pesan uti | Kembali, Lewati, Lanjut |
| 6 | Info tambahan (porsi, waktu, tingkat kesulitan) dan status kelengkapan, lalu pratinjau | Kembali, Simpan Resep |

Setiap tekan "Lanjut" data tersimpan sebagai draf di server.

```mermaid
flowchart TD
    A[Beranda] -->|Tekan Tambah Resep| B[Layar 1: Judul, kategori, pemilik]
    B -->|Lanjut, draf tersimpan| C[Layar 2: Bahan]
    C -->|Lanjut| D[Layar 3: Langkah]
    D -->|Lanjut| E[Layar 4: Foto]
    E -->|Lanjut atau Lewati| F[Layar 5: Cerita dan kenangan]
    F -->|Lanjut atau Lewati| G[Layar 6: Info tambahan dan pratinjau]
    G -->|Simpan Resep| H[Resep tersimpan, versi pertama dibuat]
    H --> I[Tampil di mode baca]
    B -.->|Keluar di tengah jalan| J[Masuk daftar Belum selesai]
    J -.->|Lanjutkan| C
```

### 5.2 Cari resep

1. Beranda menampilkan kotak pencarian besar di paling atas.
2. Pengguna mengetik nama masakan atau bahan. Hasil muncul saat mengetik.
3. Di bawah kotak pencarian ada tombol kategori dan pemilik resep untuk menyaring.
4. Pengguna menekan satu resep, lalu masuk mode baca.

```mermaid
flowchart TD
    A[Beranda] --> B[Ketik di kotak pencarian]
    A --> C[Tekan tombol kategori atau pemilik]
    B --> D[Daftar hasil]
    C --> D
    D -->|Tekan resep| E[Mode baca: huruf besar, layar tetap menyala]
    D -->|Tidak ada hasil| F[Pesan: Resep belum ada. Tombol Tambah Resep]
```

### 5.3 Export ke buku PDF

1. Pengguna membuka menu **Buku**.
2. Memilih isi buku: Semua resep, Per kategori, atau Per pemilik resep.
3. Layar ringkasan menampilkan jumlah resep yang akan masuk dan pilihan "Sertakan foto tulisan asli".
4. Menekan **Buat PDF**. Muncul indikator proses.
5. Setelah selesai, tersedia tombol **Unduh** dan **Bagikan** (misalnya ke WhatsApp) [A].

```mermaid
flowchart TD
    A[Menu Buku] --> B{Pilih isi buku}
    B -->|Semua| C[Ringkasan isi]
    B -->|Per kategori| C
    B -->|Per pemilik resep| C
    C -->|Buat PDF| D[Proses di browser]
    D -->|Berhasil| E[Unduh atau Bagikan]
    D -->|Gagal karena HP kehabisan memori| F[Saran: buat per kategori atau pakai laptop]
```

