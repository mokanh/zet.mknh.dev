---
title: why using event emitter rather than watch changing state in parent on vue.js project?
draft: 
tags:
  - seedlings
  - blog
  - programming
---
Baik `event emitter` maupun `watcher` pada [[Vue.js|vue.js]] adalah alat untuk mengelola states dan merespons perubahan. Namun, keduanya memiliki tujuan yang berbeda dan digunakan dalam skenario yang berbeda. Berikut adalah penjelasan tentang mengapa Kamu mungkin memilih untuk menggunakan `event emitter` daripada `watch` untuk mengubah states di parent komponen:

### Event Emitter

1. **Komunikasi Antar Komponen**:
   - **Komunikasi dari child ke Parent**: Event emitter sering digunakan untuk memfasilitasi komunikasi dari child komponen ke parent komponen. Ini sangat berguna ketika child komponen perlu memberi tahu parent tentang tindakan atau perubahan tertentu, seperti pengiriman formulir atau interaksi pengguna.
   - **Pemisahan yang Longgar**: Menggunakan event emitter memungkinkan komponen anak tetap tidak menyadari detail spesifik komponen induknya. Ini mempromosikan pemisahan kepentingan yang lebih bersih dan membantu menjaga hubungan yang longgar antara komponen.

2. **Fleksibilitas**:
   - **Penanganan Dinamis**: Event dapat dipancarkan secara dinamis sebagai respons terhadap tindakan pengguna, dan komponen induk dapat memilih untuk mendengarkan event ini dan meresponsnya sesuai kebutuhan. Ini memberikan fleksibilitas dalam menangani berbagai jenis interaksi dan perubahan status.

3. **Kegunaan Kembali**:
   - **Komponen yang Dapat Digunakan Kembali**: Dengan menggunakan event emitter, komponen anak dapat lebih mudah digunakan kembali di berbagai bagian aplikasi karena tidak harus terikat khusus pada induknya. Komponen tersebut hanya memancarkan event yang dapat ditangani oleh induk mana pun.

4. **Kesederhanaan dalam Skenario Kompleks**:
   - **Menyederhanakan Komunikasi**: Dalam aplikasi yang kompleks dengan banyak komponen, menggunakan event emitter dapat menyederhanakan komunikasi antar komponen tanpa harus meneruskan props melalui beberapa lapisan komponen.

### Watcher

1. **Penanganan Data Reaktif**:
   - **Mengamati Data Secara Langsung**: Watcher digunakan untuk mengamati perubahan pada properti data reaktif. Mereka ideal untuk kasus di mana Anda perlu mengeksekusi kode sebagai respons terhadap perubahan data, seperti melakukan operasi asinkron atau memicu efek samping.

2. **Kontrol Komponen Induk**:
   - **Mengelola Status**: Jika komponen induk perlu memantau dan merespons perubahan pada data atau props-nya sendiri, watcher bisa menjadi alat yang efektif. Mereka menyediakan cara untuk merespons perubahan data secara langsung dan dapat digunakan untuk menyinkronkan status antara komponen induk dan anak.

3. **Ketergantungan Kompleks**:
   - **Menangani Logika Kompleks**: Watcher berguna ketika Anda memiliki ketergantungan atau perhitungan kompleks yang perlu dilakukan sebagai respons terhadap perubahan data. Mereka memungkinkan Anda menangani logika semacam itu secara terpusat di dalam komponen tempat data tersebut berada.

### Kesimpulan

- **Gunakan Event Emitter** ketika Anda perlu menangani komunikasi dari komponen anak ke komponen induk, menjaga hubungan yang longgar, dan ketika Anda memerlukan pendekatan yang fleksibel dan dapat digunakan kembali untuk interaksi antar komponen.

- **Gunakan Watcher** ketika Anda perlu merespons perubahan pada properti data reaktif di dalam komponen, melakukan efek samping, atau menangani ketergantungan kompleks berdasarkan status data.

Singkatnya, event emitter lebih tentang komunikasi dan interaksi antar komponen, sementara watcher lebih tentang merespons perubahan data dalam komponen. Kedua alat ini memiliki tempatnya masing-masing dan dapat digunakan secara komplementer berdasarkan kebutuhan proyek Vue.js Anda.