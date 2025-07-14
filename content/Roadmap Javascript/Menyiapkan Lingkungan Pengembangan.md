
Sebelum Anda dapat mulai menulis kode JavaScript, langkah pertama yang paling penting adalah menyiapkan "meja kerja digital" Anda. Lingkungan pengembangan yang efisien akan membuat proses belajar dan bekerja menjadi lebih lancar dan produktif. Lingkungan ini terdiri dari beberapa alat esensial.

---

### 1.1.1 Editor Kode: Visual Studio Code

Editor kode adalah aplikasi utama tempat Anda akan menulis dan mengedit semua kode Anda.

* **Rekomendasi**: **Visual Studio Code (VS Code)**.
* **Mengapa?** VS Code adalah editor kode gratis yang dikembangkan oleh Microsoft dan telah menjadi standar industri. Ia sangat kuat, fleksibel, dan didukung oleh komunitas besar yang menyediakan ribuan ekstensi untuk menyesuaikan fungsionalitasnya.
* **Fitur Kunci untuk Pemula**:
    * **Penyorotan Sintaksis (Syntax Highlighting)**: Memberi warna berbeda pada bagian kode (variabel, fungsi, string), membuatnya lebih mudah dibaca.
    * **Pelengkapan Kode Cerdas (IntelliSense)**: Memberikan saran otomatis saat Anda mengetik, mempercepat penulisan kode dan mengurangi kesalahan.

---

### 1.1.2 Konsol Pengembang di Peramban

Setiap peramban modern (seperti Google Chrome, Mozilla Firefox, Microsoft Edge) dilengkapi dengan seperangkat alat untuk pengembang web. Bagi pemula JavaScript, alat yang paling penting adalah **Konsol**.

* **Fungsi**: Konsol adalah lingkungan interaktif di dalam peramban Anda. Anda bisa menggunakannya untuk:
    * Menjalankan potongan kode JavaScript secara langsung.
    * Melihat pesan log dari kode Anda (menggunakan `console.log()`).
    * Menemukan dan memperbaiki kesalahan (debugging).
* **Cara Membuka**: Biasanya dengan menekan `F12` atau `Ctrl+Shift+I` (Windows/Linux) atau `Cmd+Opt+I` (Mac), lalu pilih tab "Console".

---

### 1.1.3 Lingkungan Runtime: Node.js

JavaScript awalnya hanya berjalan di dalam peramban. **Node.js** adalah lingkungan *runtime* yang memungkinkan Anda menjalankan kode JavaScript di luar peramban, yaitu langsung di komputer Anda.

* **Mengapa Ini Penting?** Meskipun Anda berfokus pada pengembangan sisi klien (di peramban), hampir semua alat pengembangan web modern—seperti manajer paket, *bundler*, dan kerangka kerja—membutuhkan Node.js untuk bisa berjalan. Menginstalnya sejak awal adalah sebuah keharusan.

---

### 1.1.4 Cara Menjalankan Skrip JavaScript Pertama Anda

Ada dua cara utama untuk menjalankan kode JavaScript Anda:

1.  **Melalui File HTML (di Peramban)**:
    * Buat file HTML (misalnya, `index.html`).
    * Buat file JavaScript (misalnya, `script.js`).
    * Tautkan file JavaScript Anda di dalam file HTML, biasanya sebelum tag penutup `</body>`, menggunakan tag `<script>`:
        ```html
        <script src="script.js"></script>
        ```
    * Buka file `index.html` di peramban Anda. Peramban akan secara otomatis membaca dan mengeksekusi kode di dalam `script.js`.

2.  **Melalui Terminal (dengan Node.js)**:
    * Setelah menginstal Node.js, buka terminal atau command prompt Anda.
    * Arahkan ke direktori tempat Anda menyimpan file JavaScript (misalnya, `script.js`).
    * Jalankan perintah berikut:
        ```bash
        node script.js
        ```
    * Node.js akan mengeksekusi kode dan menampilkan output apa pun (misalnya dari `console.log()`) langsung di terminal.