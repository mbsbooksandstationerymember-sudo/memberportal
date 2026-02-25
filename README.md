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

## Polisi versi TERMA, SYARAT & PENGESAHAN (T&C)

### Di mana存放 T&C 文本

- 前端 T&C 文本集中在 `assets/tncv1.0.js`，并通过 `window.MBS_TNC_V1` 暴露：
  - `version`: 当前条款版本（例如 `"1.0"`、`"1.1"`、`"2.0"`）
  - `textEn`: 英文条款正文
  - `textMy`: 马来文条款正文
- 注册弹窗里的文案 (`#tncText`) 会在打开时使用 `MBS_TNC_V1.modalHtml` 自动填充。

### 与后端同步（code.gs）

- 在提交注册 (`hantarDanDownload`) 时，前端会同时发送：
  - `tncEn`: 当前英文条款
  - `tncMy`: 当前马来文条款
  - `tncVersion`: 当前条款版本号（来自 `MBS_TNC_V1.version`）
- 后端 `code.gs` 使用这些字段：
  - 在 `createMemberPDF` 中直接用 `data.tncEn` / `data.tncMy` 生成 PDF 条款内容；
  - 在 Google Sheet 的 `REKOD_MEMBER` 里额外保存一列 **"TNC Version"**（`data.tncVersion`）；
  - 在 PDF 底部显示 `TNC Version: ...`，方便日后追踪会员同意的是哪一版条款。

### 如何发布新版本 T&C（例如 v1.1 / v2.0）

> 推荐做法：**不改文件名，只改 `assets/tncv1.0.js` 里的内容和 version 字段**，这样前后端都会自动使用最新条款。

1. **编辑前端条款文件**：打开 `assets/tncv1.0.js`。
   - 更新 `TNC_EN` 为新的英文条款全文；
   - 更新 `TNC_MY` 为新的马来文条款全文；
   - 将 `version: '1.0'` 改成新的版本号（例如 `'1.1'` 或 `'2.0'`）。
2. **无需改动 JS 逻辑**：
   - `index.html` 会自动显示最新条款文本；
   - `main.js` 会自动把新的 `textEn` / `textMy` 和 `version` 一起 POST 给 `code.gs`；
   - `code.gs` 会用这些文本生成 PDF，并在 Sheet 和 PDF 里记录对应的 `tncVersion`。
3. **（可选）归档历史版本**：
   - 如果需要长期保存旧版本条款原文，可以在仓库里创建一个文档（例如 `TNC_HISTORY.md`），每次升级时把旧的 `TNC_EN` / `TNC_MY` 和版本号复制进去做记录。

这样设计后：

- **前端显示**、**Apps Script 生成的 PDF** 和 **Google Sheet 记录** 都来源于同一份 T&C 文本；
- 未来升级到 v1.1 / v2.0 等，只需维护 `assets/tncv1.0.js` 这一处和其内的 `version` 字段，无需动其它代码。
