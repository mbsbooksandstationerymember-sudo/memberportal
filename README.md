# Digital MBS Member Card (PWA – Offline)

Aplikasi kad keahlian digital MBS. **Boleh guna offline** selepas dibuka sekali dengan internet.

## Struktur projek

```
├── index.html      # Halaman utama (pasang app, no. ahli, kad, NEWS, SKIN, HELP)
├── style.css       # Semua gaya
├── main.js         # Logik app (kad, localStorage, PWA, modals)
├── camera.js       # Imbasan kod bar (kamera belakang)
├── manifest.json   # PWA (Add to Home Screen, ikon)
├── sw.js           # Service Worker (cache offline)
├── version.json    # Versi app (naikkan bila release baru; pengguna boleh pilih Update)
├── debug.html      # Debug: clear localStorage no. kad
└── assets/         # Imej
    ├── logo-192.png, logo-512.png   # Ikon app
    ├── png1.webp, png2.webp, png3.webp   # Gambar kad
    └── skin1.webp, skin2.webp, skin3.webp # Latar belakang
```

## Cara guna

1. Letakkan fail imej dalam folder **assets/** (lihat `assets/README.txt`).
2. Buka **index.html** dengan pelayar (lebih baik melalui HTTPS atau local server).
3. Pilih “Pasang Aplikasi” untuk pasang PWA (guna offline kemudian).
4. Masukkan No. Ahli atau imbas kod bar, lalu klik **AKTIFKAN KAD**.
5. Kad dipaparkan; pilih SKIN dan NEWS dari bar bawah.

## Deploy (contoh: GitHub Pages)

Letakkan semua fail (termasuk **assets/**) dalam satu folder. Pastikan **manifest.json** dan **index.html** menggunakan laluan relatif (./). Service Worker didaftar sebagai `sw.js`.

## Offline

**sw.js** akan cache: index.html, manifest.json, style.css, main.js, camera.js, dan semua imej dalam assets/. Tanpa rangkaian, pelayar guna cache.

## Kemas kini versi

- Fail **version.json** mengandungi `{"version":"1.0.0"}`. Bila anda push perubahan ke GitHub, naikkan nombor versi (cth. `1.0.1`).
- App akan semak version.json (pada muat dan bila pengguna kembali ke tab). Jika versi di server berbeza daripada yang disimpan, banner "Versi baru tersedia" dan butang **Update** akan dipaparkan.
- Pengguna klik **Update** untuk muat semula dan dapatkan fail terkini.
