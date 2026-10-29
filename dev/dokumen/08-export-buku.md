## 8. Rancangan Fitur Export Buku

### 8.1 Struktur buku

| Urutan | Bagian | Isi | Sumber data |
|---|---|---|---|
| 1 | Sampul | Judul, subjudul, foto sampul, nama keluarga | BOOK_PROFILE |
| 2 | Persembahan | Foto uti dan teks persembahan [A] | BOOK_PROFILE |
| 3 | Kata pengantar | Teks dari ibu atau Akhmad | BOOK_PROFILE |
| 4 | Daftar isi | Kategori dan judul resep beserta nomor halaman | Dihitung otomatis |
| 5 | Pembatas kategori | Satu halaman berisi nama kategori | CATEGORY |
| 6 | Halaman resep | Satu resep dimulai di halaman baru | RECIPE, PHOTO, PERSON |
| 7 | Penutup | Halaman catatan kosong (tahap 2, L03) | Statis |

Urutan resep: berdasarkan `sort_order` kategori, lalu judul resep sesuai abjad. [A]

### 8.2 Ukuran kertas dan margin

| Aspek | Nilai | Sumber |
|---|---|---|
| Ukuran | A5, 148 x 210 mm, tegak | [K] |
| Margin atas dan bawah | 15 mm | [A] |
| Margin dalam (sisi jilid) | 20 mm | [A] |
| Margin luar | 15 mm | [A] |
| Huruf isi | Serif mudah dibaca, misalnya Lora (Google Fonts), ukuran 12 pt | [A] |
| Huruf judul resep | 20 pt | [A] |
| Nomor halaman | Di bawah, rata tengah | [A] |

Margin dalam dibuat lebih lebar karena sisi jilid "termakan" saat buku dijahit atau dilem. **Sebelum mencetak, tanyakan ke percetakan**: apakah mereka butuh bleed (area lebih di tepi kertas) untuk sampul, dan apakah PDF harus berupa halaman tunggal atau sudah disusun berpasangan. Jika sampul tanpa gambar sampai ke tepi, bleed tidak diperlukan.

### 8.3 Tata letak halaman resep

```
┌───────────────────────────────┐
│ LAUK                          │  ← nama kategori, kecil
│                               │
│ Opor Ayam Uti                 │  ← judul 20 pt
│ Resep dari: Uti               │
│ Porsi: 6 orang · 90 menit     │  ← hanya jika diisi
│ ┌───────────────────────────┐ │
│ │   Foto masakan            │ │  ← maksimal sepertiga tinggi halaman
│ └───────────────────────────┘ │
│ BAHAN                         │
│ • 1 ekor ayam kampung         │
│ • 2 butir kelapa, ambil santan│
│ • ...                         │
│ CARA MEMBUAT                  │
│ 1. Haluskan bumbu ...         │
│ 2. ...                        │
│ ┌───────────────────────────┐ │
│ │ Cerita resep ini          │ │  ← kotak berlatar lembut
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ Kenangan uti (huruf miring)│ │
│ └───────────────────────────┘ │
│              12               │  ← nomor halaman
└───────────────────────────────┘
```

Aturan tambahan [A]:
1. Jika resep lebih dari satu halaman, judul resep diulang kecil di bagian atas halaman lanjutan.
2. Foto tulisan asli, jika dipilih ikut dicetak, ditaruh di halaman berikutnya dengan keterangan "Tulisan asli".
3. Resep berstatus "Perlu dicek" tetap boleh masuk buku, tetapi admin mendapat peringatan sebelum membuat PDF.

### 8.4 Pendekatan teknis pembuatan PDF

| Pendekatan | Cara kerja | Kelebihan | Kekurangan |
|---|---|---|---|
| A. @react-pdf/renderer di browser | Halaman buku disusun sebagai komponen React lalu dirender menjadi file PDF di HP atau laptop pengguna | Tidak memakai kuota server Vercel, hasil berupa file PDF yang langsung diunduh, mendukung ukuran A5 dan nomor halaman | Daftar isi dengan nomor halaman butuh dua kali render, render buku besar di HP murah bisa lambat atau kehabisan memori, hanya mendukung gambar JPG dan PNG |
| B. Cetak browser dengan CSS @page dan Paged.js | Halaman HTML khusus cetak, pengguna menekan Cetak lalu Simpan sebagai PDF | Daftar isi dengan nomor halaman didukung lewat CSS, tata letak memakai HTML dan CSS biasa | Bergantung pada dialog cetak browser yang membingungkan lansia, hasil bisa berbeda antar browser |
| C. Puppeteer dengan @sparticuz/chromium di Vercel Function | Server menjalankan browser headless dan mencetak halaman menjadi PDF | Hasil konsisten di semua perangkat | Paling berat untuk paket gratis, ukuran fungsi dan waktu eksekusi terbatas, lebih rumit dikonfigurasi |

**Pilihan: A** [A]. Alasan: tombol "Buat PDF" langsung menghasilkan file tanpa dialog cetak, sesuai prinsip kesederhanaan, dan tidak menyentuh batas server gratis.

Langkah teknis:
1. Library PDF dimuat hanya saat halaman Buku dibuka (dynamic import) agar aplikasi utama tetap ringan.
2. Data resep sesuai pilihan diambil dari server dalam satu permintaan.
3. Foto diambil dari Cloudinary dengan transformasi URL: lebar sekitar 1200 px dan format JPG, karena library ini tidak mendukung format WebP.
4. Font Lora didaftarkan dari file TTF yang disimpan di folder public aplikasi.
5. **Render pertama**: setiap awal resep mencatat nomor halamannya.
6. **Render kedua**: daftar isi diisi dengan nomor halaman dari render pertama.
7. File PDF dibuat sebagai Blob lalu ditawarkan untuk diunduh atau dibagikan.

Jika render dua kali ternyata terlalu rumit di minggu ke 4, **cadangan sederhananya**: daftar isi memakai nomor resep (Resep 1, Resep 2, dan seterusnya) yang juga tercetak di setiap halaman resep. [A]

### 8.5 Keterbatasan dan antisipasi

1. Buku lengkap dengan banyak foto sebaiknya dibuat di laptop. Di HP, sarankan membuat per kategori.
2. Sebelum cetak massal, cetak satu eksemplar uji dulu untuk mengecek warna foto, ukuran huruf, dan margin jilid.

