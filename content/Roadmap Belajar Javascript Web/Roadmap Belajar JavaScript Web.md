

# **Peta Jalan Belajar JavaScript dari Dasar untuk Pengembangan Web**

## **Pendahuluan: Memetakan Perjalanan Anda di Alam Semesta JavaScript**

JavaScript adalah *lingua franca* dari web modern. Hampir setiap pengalaman interaktif yang ditemui di internet, mulai dari validasi formulir sederhana, animasi yang menarik, hingga aplikasi web berskala besar yang kompleks, ditenagai oleh JavaScript.1 Bahasa ini adalah fondasi ketiga dari pengembangan web, bekerja bersama HTML untuk struktur dan CSS untuk gaya, untuk memberikan kehidupan dan fungsionalitas pada halaman web.1

Awalnya dirancang sebagai bahasa skrip sederhana untuk menambahkan interaktivitas pada peramban Netscape pada tahun 1995, JavaScript telah berevolusi secara dramatis.5 Kini, ia bukan lagi hanya terbatas pada peramban (sisi klien). Berkat lingkungan seperti Node.js, JavaScript telah menjadi kekuatan dominan di sisi server, aplikasi seluler (melalui kerangka kerja seperti React Native), aplikasi desktop, dan bahkan dalam pengembangan game dan Internet of Things (IoT).1 Fleksibilitas dan ekosistemnya yang luas menjadikannya salah satu keterampilan yang paling dicari di industri teknologi saat ini.1

Laporan ini menyajikan sebuah peta jalan (roadmap) yang terstruktur dan komprehensif, dirancang untuk memandu Anda dari seorang pemula mutlak menjadi seorang pengembang yang kompeten. Peta jalan ini dibagi menjadi beberapa tahap yang saling membangun. Setiap tahap berfokus pada serangkaian konsep dan alat, bergerak dari teori bahasa murni ke aplikasi praktis di peramban, pola asinkron modern, perangkat profesional, dan akhirnya, dunia kerangka kerja (framework). Tujuannya bukan hanya untuk mempelajari sintaksis, tetapi untuk membangun pola pikir dan keterampilan yang dibutuhkan oleh seorang pengembang web modern.

## **Tahap 1: Fondasi Utama \- Fundamental Inti JavaScript**

Tahap awal ini adalah yang paling krusial. Fokusnya adalah pada bahasa JavaScript itu sendiri, terisolasi dari peramban atau lingkungan lainnya. Setiap konsep yang dipelajari di sini adalah prasyarat mutlak untuk semua yang akan datang. Membangun fondasi yang kokoh di sini akan membuat sisa perjalanan menjadi jauh lebih mudah dan lebih bermakna.

### **1.1 Menyiapkan Meja Kerja Digital Anda (Lingkungan Pengembangan)**

Sebelum menulis baris kode pertama, penting untuk menyiapkan lingkungan pengembangan yang efisien.

* **Alat Utama Anda: Editor Kode.** Standar industri saat ini adalah Visual Studio Code (VS Code). Ini adalah editor kode gratis, kuat, dan sangat dapat disesuaikan yang dikembangkan oleh Microsoft. Popularitasnya didorong oleh fitur-fitur seperti penyorotan sintaksis (syntax highlighting), IntelliSense (pelengkapan kode cerdas), dan ekosistem ekstensi yang sangat besar yang dapat meningkatkan produktivitas secara signifikan.3  
* **Peramban sebagai Alat Belajar: Konsol Pengembang.** Setiap peramban modern (seperti Chrome, Firefox, Safari) dilengkapi dengan serangkaian alat pengembang. Yang paling penting bagi pemula adalah Konsol JavaScript. Ini adalah lingkungan interaktif di mana Anda dapat menjalankan potongan kode JavaScript secara langsung, melihat output, dan men-debug kesalahan. Perintah console.log() akan menjadi teman terbaik Anda untuk memeriksa nilai variabel dan memahami alur program.3  
* **Menjalankan JavaScript di Mana Saja: Node.js.** Node.js adalah lingkungan runtime yang memungkinkan Anda menjalankan kode JavaScript di luar peramban.6 Menginstalnya sangat penting, bahkan untuk pengembangan front-end, karena sebagian besar alat pengembangan modern seperti manajer paket dan bundler bergantung padanya.12  
* **Cara Menulis dan Menjalankan Skrip Pertama Anda.** Ada dua cara utama untuk menjalankan file JavaScript. Pertama, dengan menautkannya ke file HTML menggunakan tag \<script\>, yang akan dieksekusi oleh peramban.5 Kedua, dengan menjalankan file  
  .js langsung dari terminal menggunakan perintah node namafile.js, yang dimungkinkan setelah menginstal Node.js.6

### **1.2 Blok Bangunan: Variabel, Tipe Data, dan Komentar**

* **Menyimpan Informasi: Variabel.** Variabel adalah wadah bernama untuk menyimpan nilai.5 Di JavaScript modern, ada tiga cara untuk mendeklarasikan variabel:  
  var, let, dan const. Memahami perbedaan di antara ketiganya adalah konsep dasar yang sangat penting.  
  * var: Kata kunci warisan (legacy). var memiliki cakupan fungsi (*function-scoped*) dan dapat dideklarasikan ulang serta diperbarui. Karena perilakunya yang terkadang tidak intuitif (terutama terkait *hoisting*), penggunaannya umumnya dihindari dalam kode modern.9  
  * let: Standar modern untuk variabel yang nilainya mungkin perlu diubah. let memiliki cakupan blok (*block-scoped*), yang berarti ia hanya ada di dalam blok kode (misalnya, di dalam if atau for) tempat ia dideklarasikan. Ia dapat diperbarui tetapi tidak dapat dideklarasikan ulang dalam cakupan yang sama.15  
  * const: Standar modern untuk variabel yang nilainya tidak akan diubah (konstan). Seperti let, const juga *block-scoped*. Variabel const harus diinisialisasi saat dideklarasikan dan tidak dapat diberi nilai baru. Penting untuk dicatat, const tidak membuat objek atau array menjadi *immutable* (tidak dapat diubah); ia hanya mencegah referensi ke objek atau array tersebut diubah.15

Pergeseran dari var ke let dan const bukanlah sekadar penambahan fitur baru; ini adalah perubahan filosofis dalam bahasa menuju penulisan kode yang lebih aman, lebih dapat diprediksi, dan tidak terlalu rentan terhadap kesalahan. var memiliki cakupan fungsi dan di-*hoist* (diangkat) ke atas cakupannya dengan nilai awal undefined, yang dapat menyebabkan bug yang membingungkan di mana variabel dapat digunakan sebelum dideklarasikan tanpa menimbulkan kesalahan.15 Sebaliknya,let dan const memperkenalkan cakupan blok yang lebih ketat dan intuitif, sejalan dengan sebagian besar bahasa pemrograman lainnya. Mereka juga di-*hoist*, tetapi tidak diinisialisasi, menciptakan apa yang disebut "Temporal Dead Zone" yang akan memberikan ReferenceError jika diakses sebelum deklarasi. Perilaku ini memaksa praktik pengkodean yang lebih baik dan membuat kode lebih mudah untuk dipahami dan di-debug. Oleh karena itu, praktik terbaik modern adalah selalu menggunakan const secara default, dan hanya menggunakan let ketika Anda tahu variabel tersebut perlu diubah nilainya.**Tabel 1: Perbandingan var, let, dan const**

| Fitur | var | let | const |
| :---- | :---- | :---- | :---- |
| **Cakupan (Scope)** | Global atau Fungsi | Blok ({...}) | Blok ({...}) |
| **Hoisting** | Dideklarasikan dan diinisialisasi sebagai undefined | Dideklarasikan tetapi tidak diinisialisasi | Dideklarasikan tetapi tidak diinisialisasi |
| **Dapat Diperbarui?** | Ya | Ya | Tidak |
| **Dapat Dideklarasikan Ulang?** | Ya | Tidak (dalam cakupan yang sama) | Tidak (dalam cakupan yang sama) |
| **Penggunaan Modern** | Dihindari; dianggap warisan | Pilihan untuk variabel yang nilainya berubah | Pilihan utama; untuk variabel yang nilainya tetap |

* **Jenis-Jenis Data: Tipe Data.** JavaScript adalah bahasa yang diketik secara dinamis (*dynamically typed*), yang berarti Anda tidak perlu secara eksplisit menyatakan tipe data variabel. Mesin JavaScript akan menentukannya secara otomatis saat runtime.5 Tipe data dibagi menjadi:  
  * **Tipe Primitif:** String (teks), Number (angka), Boolean (benar/salah), BigInt (untuk bilangan bulat yang sangat besar), Symbol (untuk nilai unik), undefined (variabel yang telah dideklarasikan tetapi belum diberi nilai), dan null (representasi eksplisit dari "tidak ada nilai").5  
  * **Tipe Object:** Satu-satunya tipe non-primitif, yang berfungsi sebagai dasar untuk struktur data kompleks, termasuk array dan bahkan fungsi itu sendiri.4  
  * **Memeriksa Tipe dengan typeof:** Operator typeof digunakan untuk memeriksa tipe data dari sebuah variabel.13  
* **Meninggalkan Catatan: Komentar.** Komentar digunakan untuk membuat kode lebih mudah dipahami. JavaScript mendukung komentar satu baris (//) dan komentar multi-baris (/\*... \*/).5

### **1.3 Membuat Sesuatu Terjadi: Operator**

Operator adalah simbol yang melakukan operasi pada variabel dan nilai.4

* **Operator Aritmatika:** \+, \-, \*, /, % (modulo/sisa bagi), \*\* (pangkat), \++ (increment), \-- (decrement).22  
* **Operator Penugasan (Assignment):** \=, \+=, \-=, \*=, /=.22  
* **Operator Perbandingan:** Sangat penting untuk memahami perbedaan antara \== (persamaan longgar, dengan konversi tipe) dan \=== (persamaan ketat, tanpa konversi tipe). Praktik terbaik adalah **selalu menggunakan \===** untuk menghindari bug yang tidak terduga. Operator lain termasuk \!=, \!==, \>, \<, \>=, \<=.3  
* **Operator Logika:** && (DAN), || (ATAU), \! (TIDAK).22  
* **Operator Ternary:** Singkatan untuk pernyataan if/else: kondisi? ekspresiJikaBenar : ekspresiJikaSalah.4

### **1.4 Mengontrol Alur: Kondisional dan Perulangan**

* **Membuat Keputusan: Pernyataan Kondisional.** Struktur ini memungkinkan program Anda menjalankan blok kode yang berbeda berdasarkan kondisi tertentu.4  
  * if...else: Pernyataan kondisional fundamental.  
  * else if: Untuk merangkai beberapa kondisi.  
  * switch: Alternatif yang lebih bersih untuk rantai if/else if yang panjang ketika memeriksa satu variabel terhadap beberapa nilai. Penting untuk mengetahui kapan harus menggunakan switch versus if/else untuk keterbacaan kode yang lebih baik.24  
* **Mengulangi Tindakan: Perulangan (Loops).** Perulangan digunakan untuk menjalankan blok kode berulang kali.4  
  * for: Perulangan klasik ketika jumlah iterasi diketahui.  
  * while: Untuk perulangan selama kondisi bernilai benar.  
  * do...while: Mirip dengan while, tetapi blok kode dieksekusi setidaknya sekali.  
  * break dan continue: Kata kunci untuk mengontrol eksekusi perulangan.24

### **1.5 Mengorganisir Kode: Fungsi dan Cakupan (Scope)**

* **Blok yang Dapat Digunakan Kembali: Fungsi.** Fungsi adalah cara utama untuk mengelompokkan kode ke dalam blok yang dapat digunakan kembali dan terorganisir. Mereka adalah dasar dari setiap program yang tidak sepele.1  
* **Cara Membuat Fungsi:**  
  * **Deklarasi Fungsi:** function namaFungsi() {... }.  
  * **Ekspresi Fungsi:** const namaFungsi \= function() {... };.  
  * **Fungsi Panah (Arrow Function \- ES6):** const namaFungsi \= () \=\> {... };. Sintaks ini akan diperkenalkan di sini, dan implikasi yang lebih dalam (seperti *binding* this) akan dibahas di Tahap 4\.30  
* **Komponen Fungsi:** Parameter (pengganti) dan Argumen (nilai sebenarnya).1  
* **Mendapatkan Nilai Keluar: Pernyataan return.** Cara fungsi memberikan output.1  
* **Memahami Cakupan (Scope):** Konsep kritis yang menentukan visibilitas dan masa hidup variabel. Ada Cakupan Global, Cakupan Fungsi, dan Cakupan Blok. Ini terkait langsung dengan diskusi var vs let/const.16

### **1.6 Menyusun Data: Objek dan Array**

* **Kumpulan Data: Objek.** Kumpulan pasangan kunci-nilai yang tidak berurutan. Ini adalah struktur data utama dalam JavaScript. Materi akan mencakup pembuatan objek literal, mengakses properti (notasi titik vs. notasi kurung siku), dan menambah/mengubah/menghapus properti.4  
* **Daftar Terurut: Array.** Kumpulan nilai yang terurut. Materi akan mencakup pembuatan array literal, mengakses elemen berdasarkan indeks, dan metode array esensial seperti push, pop, forEach, dan map.4

### **Proyek Tonggak Pencapaian 1: Game Berbasis Konsol (Contoh: Batu, Gunting, Kertas)**

* **Tujuan:** Menerapkan semua fundamental inti yang dipelajari di Tahap 1 tanpa kompleksitas tambahan dari HTML dan CSS. Ini memaksa pelajar untuk fokus murni pada logika pemrograman.  
* **Konsep yang Diterapkan:** Variabel (let, const), fungsi, kondisional (if/else atau switch), perulangan (untuk memainkan beberapa putaran), dan array (untuk menyimpan pilihan).35  
* **Panduan:** Menyediakan panduan langkah demi langkah untuk membangun logika permainan, memperkuat konsep-konsep dari tahap ini.

## **Tahap 2: Menghidupkan Halaman Web \- JavaScript di Peramban**

Setelah menguasai bahasa itu sendiri, saatnya menghubungkannya dengan halaman web. Tahap ini adalah tentang membuat sesuatu terjadi di layar, mengubah HTML dan CSS statis menjadi pengalaman yang dinamis dan interaktif.

### **2.1 Jembatan ke HTML: Document Object Model (DOM)**

* **Apa itu DOM?** DOM adalah representasi struktur seperti pohon dari sebuah dokumen HTML yang dibuat oleh peramban. DOM berfungsi sebagai API (Application Programming Interface) yang memungkinkan JavaScript untuk berinteraksi dan mengubah struktur, gaya, dan konten halaman web.2  
* **Pohon DOM:** Memvisualisasikan struktur ini sangat membantu. Setiap bagian dari dokumen—elemen, atribut, teks—adalah sebuah *node* dalam pohon. Hubungan antar node (induk, anak, saudara) menentukan bagaimana dokumen tersebut disusun.39

### **2.2 Menemukan dan Memodifikasi Elemen (Manipulasi DOM)**

* **Memilih Elemen:** Cara mendapatkan referensi ke elemen HTML dalam kode JavaScript Anda.  
  * **Metode Modern (Direkomendasikan):** document.querySelector() (untuk elemen pertama yang cocok) dan document.querySelectorAll() (untuk semua elemen yang cocok, mengembalikan NodeList). Metode ini sangat kuat karena menggunakan selektor CSS.14  
  * **Metode Warisan:** document.getElementById(), getElementsByTagName(), getElementsByClassName(). Penting untuk mengetahui ini karena sering terlihat dalam kode yang lebih tua.40  
* **Mengubah Konten dan Struktur:**  
  * Memodifikasi teks: Perbedaan antara textContent (hanya teks) dan innerHTML (dapat mem-parsing tag HTML, waspadai risiko keamanan).42  
  * Memodifikasi atribut: Menggunakan setAttribute(), getAttribute(), dan removeAttribute().42  
* **Mengubah Gaya:**  
  * Langsung melalui properti style (misalnya, element.style.backgroundColor \= 'blue'). Perhatikan konversi dari CSS kebab-case ke JavaScript camelCase.39  
  * Cara yang lebih baik: Memanipulasi kelas CSS menggunakan properti classList (.add(), .remove(), .toggle()). Ini lebih disukai karena memisahkan urusan (CSS tetap di stylesheet).39  
* **Membuat dan Menghapus Elemen:**  
  * document.createElement(): Membuat elemen baru di memori.38  
  * parentNode.appendChild(): Menambahkan elemen yang dibuat ke DOM.38  
  * element.remove() (modern) dan parentNode.removeChild(childNode) (warisan): Cara menghapus elemen dari DOM.40

Pendekatan untuk mengubah gaya elemen adalah contoh mikro dari prinsip yang lebih besar dalam pengembangan web profesional: pemisahan urusan (*separation of concerns*). Seorang pemula mungkin pertama kali belajar mengubah gaya secara langsung dengan element.style.color \= 'red', karena ini intuitif dan memberikan umpan balik visual langsung.39 Namun, pendekatan ini mencampurkan aturan penataan (yang seharusnya berada di CSS) langsung ke dalam logika JavaScript. Jika Anda perlu mengubah sepuluh properti gaya, kode JS Anda akan menjadi berantakan dengan detail presentasi.46 Pendekatan yang lebih kuat dan dapat dipelihara adalah dengan mendefinisikan kelas CSS, misalnya

.highlight { color: red; font-weight: bold; }, di dalam stylesheet Anda. Kemudian, satu-satunya tugas JavaScript adalah untuk mengaktifkan atau menonaktifkan kelas ini pada elemen: element.classList.add('highlight').39 Ini memisahkan logika (kapan menerapkan status) dari presentasi (bagaimana status itu terlihat), membuat kode lebih bersih, lebih mudah dikelola, dan lebih berkinerja.

### **2.3 Merespons Pengguna: Penanganan Event (Event Handling)**

* **Apa itu Event?** Event adalah tindakan atau kejadian yang terjadi di peramban, seperti klik, penekanan tombol, gerakan mouse, atau halaman selesai dimuat. Event adalah inti dari interaktivitas.14  
* **Event Listener dan Handler:** "Event listener" menunggu event tertentu terjadi pada sebuah elemen. "Event handler" adalah fungsi yang berjalan ketika event tersebut dipicu.54  
* **Pendekatan Modern: addEventListener()**. Ini adalah cara yang direkomendasikan untuk melampirkan event handler. Sintaksnya adalah element.addEventListener('namaEvent', fungsiHandler). Metode removeEventListener() juga akan dibahas.55  
* **Tipe Event Umum:**  
  * Event Mouse: click, dblclick, mouseover, mouseout.55  
  * Event Keyboard: keydown, keyup. Penting dicatat bahwa keypress sudah usang (deprecated).55  
  * Event Formulir: submit (krusial untuk penanganan formulir), change, focus, blur.56  
  * Event Jendela: load, DOMContentLoaded, resize, scroll.43  
* **Objek Event:** Objek yang secara otomatis diteruskan ke fungsi handler, berisi informasi berharga tentang event tersebut (misalnya, event.target, event.key, event.preventDefault()).54  
* **Propagasi Event: Bubbling dan Capturing.** Konsep lanjutan yang penting. Ini menjelaskan bagaimana event "merambat" naik (bubbling) atau turun (capturing) melalui pohon DOM.54  
* **Delegasi Event (Event Delegation):** Pola yang kuat dan berkinerja tinggi yang memanfaatkan event bubbling. Alih-alih menambahkan banyak listener ke elemen anak, kita menambahkan satu listener ke elemen induk. Ini lebih efisien dan secara otomatis menangani elemen yang ditambahkan secara dinamis.54

### **Proyek Tonggak Pencapaian 2: Aplikasi To-Do List Interaktif**

* **Tujuan:** Membangun aplikasi front-end klasik yang sangat memanfaatkan manipulasi DOM dan penanganan event.  
* **Fitur:**  
  * Menambahkan tugas baru menggunakan input formulir dan tombol.  
  * Menampilkan daftar tugas.  
  * Menandai tugas sebagai selesai (misalnya, dengan mengkliknya, yang akan mengaktifkan/menonaktifkan kelas CSS).  
  * Menghapus tugas menggunakan tombol hapus di sebelah setiap tugas.  
  * (Bonus) Menyimpan tugas di localStorage agar tetap ada setelah halaman dimuat ulang.  
* **Konsep yang Diterapkan:** querySelector, createElement, appendChild, addEventListener (untuk 'submit' pada formulir dan 'click' pada daftar untuk delegasi), classList.toggle, element.remove(), event.preventDefault(), delegasi event.35

## **Tahap 3: Menguasai Asinkronisitas Modern**

Di sinilah kita beralih dari skrip sederhana ke membangun aplikasi web modern yang dapat mengambil data dari server tanpa membekukan antarmuka pengguna. Ini adalah topik yang menantang secara konseptual tetapi sangat penting.

### **3.1 "Mengapa": JavaScript Sinkron vs. Asinkron**

* **Sifat Single-Threaded JavaScript:** JavaScript mengeksekusi kode baris per baris, satu perintah pada satu waktu.67  
* **Masalah dengan Kode "Blocking":** Apa yang terjadi jika sebuah tugas (seperti permintaan jaringan) memakan waktu lama? Dalam model sinkron, seluruh peramban akan membeku. Ini adalah pengalaman pengguna yang buruk.67  
* **Solusi Asinkron:** Kode asinkron memungkinkan tugas yang berjalan lama untuk dimulai, dan sisa program terus berjalan. Ketika tugas selesai, program akan diberitahu. Ini adalah kunci untuk UI yang responsif.67  
* **Event Loop:** Penjelasan sederhana namun jelas tentang Call Stack, Web API, Callback Queue, dan Event Loop, yang bersama-sama memungkinkan perilaku asinkron dalam lingkungan single-threaded.

### **3.2 "Bagaimana": Evolusi Pola untuk Kode Asinkron**

Progresi dari Callback ke Promise ke async/await bukan hanya tentang sintaksis; ini tentang mendapatkan kembali kendali dan keterbacaan. Ini mewakili pergeseran mendasar dalam cara pengembang mengelola kompleksitas asinkron. Callback memperkenalkan "Inversi Kontrol," di mana Anda mempercayakan fungsi eksternal untuk memanggil kode Anda.70 Hal ini dapat menyebabkan "Callback Hell," yang membuat penalaran tentang alur program dan penanganan kesalahan menjadi sangat sulit.71 Promise memecahkan masalah ini dengan mengembalikan sebuah objek yang mewakili nilai masa depan, sehingga kode Anda tetap memegang kendali.69

async/await membangun di atas ini dengan menyediakan sintaksis yang memungkinkan kode asinkron terlihat dan berperilaku seperti kode sinkron, secara drastis mengurangi beban kognitif.71

* **Cara Lama: Callback.** Pola asli untuk menangani hasil asinkron, biasanya dicontohkan dengan setTimeout.67  
* **Jebakan: "Callback Hell".** Mendemonstrasikan bagaimana menumpuk beberapa callback mengarah pada kode yang berlekuk dalam, sulit dibaca, dan rentan kesalahan ("piramida kiamat").70  
* **Cara yang Lebih Baik: Promise (ES6).** Promise adalah objek yang mewakili penyelesaian (atau kegagalan) dari operasi asinkron di masa depan.68  
  * Status: pending, fulfilled, rejected.  
  * Merangkai dengan .then() untuk hasil yang sukses.  
  * Menangani kesalahan dengan .catch(), sebuah peningkatan besar dari penanganan kesalahan callback.  
* **Standar Modern: async/await (ES2017).** Cara terbersih dan paling mudah dibaca untuk bekerja dengan Promise. Ini adalah "gula sintaksis" di atas Promise.71  
  * Kata kunci async: Membuat fungsi mengembalikan Promise.  
  * Kata kunci await: Menjeda eksekusi fungsi async hingga Promise diselesaikan.  
  * Penanganan kesalahan dengan blok try...catch, yang intuitif bagi pengembang.

### **3.3 Berkomunikasi dengan Dunia: Fetch API**

* **Pengantar API:** Apa itu API (Application Programming Interface) dan mengapa kita menggunakannya untuk mendapatkan data dari layanan eksternal.  
* **Fetch API:** API peramban modern, bawaan, dan berbasis Promise untuk membuat permintaan jaringan (HTTP). Ini menggantikan XMLHttpRequest yang lebih tua.77  
* **Membuat Permintaan GET:** Contoh langkah demi langkah cara mengambil data JSON dari API publik, baik menggunakan .then() maupun async/await untuk menunjukkan keunggulan keterbacaan yang terakhir.77  
* **Membuat Permintaan POST:** Contoh singkat yang menunjukkan cara mengirim data ke server, termasuk mengatur opsi method, headers, dan body dalam panggilan fetch.78

### **Proyek Tonggak Pencapaian 3: Aplikasi Berbasis Data (Contoh: Aplikasi Cuaca atau Pencarian Film)**

* **Tujuan:** Mempraktikkan JavaScript asinkron dengan mengambil data dari API pihak ketiga di dunia nyata dan menampilkannya di halaman.  
* **Fitur:**  
  * Input untuk pengguna memasukkan nama kota atau judul film.  
  * Tombol "Cari" untuk memicu panggilan API.  
  * Menampilkan data yang relevan (misalnya, suhu, poster film) di halaman dengan memanipulasi DOM.  
  * Menangani status pemuatan (loading) dan potensi kesalahan dengan baik.  
* **Konsep yang Diterapkan:** async/await, fetch, try...catch, Promise, manipulasi DOM, dan penanganan event. Proyek ini mengintegrasikan semua yang telah dipelajari sejauh ini.35

## **Tahap 4: Perangkat Modern Pengembang**

Dengan penguasaan bahasa inti dan interaksi peramban, saatnya mempelajari alat dan sintaksis yang digunakan oleh pengembang profesional setiap hari. Tahap ini adalah tentang beralih dari menulis skrip menjadi merekayasa perangkat lunak. Pengembangan JavaScript modern adalah sebuah ekosistem, bukan hanya bahasa. Kemahiran membutuhkan pemahaman tentang rantai alat (toolchain) yang bekerja secara bersamaan.

### **4.1 Menulis Kode Elegan: Fitur Esensial ES6+**

ES6 (ECMAScript 2015\) dan versi-versi berikutnya telah memperkenalkan banyak fitur yang membuat kode lebih ringkas, kuat, dan mudah dibaca.18

* **Template Literals:** Cara modern untuk membuat string menggunakan backtick (\`). Ini mendukung string multi-baris dan interpolasi ekspresi (${...}), sebuah peningkatan besar dari penyambungan string.31  
* **Destructuring Assignment:** Sintaksis yang kuat untuk "membongkar" nilai dari array atau properti dari objek ke dalam variabel-variabel terpisah. Ini membuat kode lebih bersih dan lebih mudah dibaca.31  
* **Operator Spread (...) dan Rest (...):** Operator spread digunakan untuk memperluas iterable (seperti array) menjadi elemen-elemen individual. Operator rest digunakan dalam parameter fungsi untuk mengumpulkan sejumlah argumen tak terbatas ke dalam satu array.18  
* **ES Modules (import/export):** Cara standar dan asli untuk mengorganisir kode JavaScript ke dalam file-file terpisah yang dapat digunakan kembali. Ini adalah dasar dari semua kerangka kerja dan alat bantu modern.31

### **4.2 Manajemen Proyek Profesional: Kontrol Versi dengan Git & GitHub**

* **Apa itu Git?** Git adalah sistem kontrol versi terdistribusi (VCS). Ini bukan hanya untuk menyimpan file; ini untuk melacak seluruh riwayat perubahan, memungkinkan Anda kembali ke versi sebelumnya dan bereksperimen tanpa rasa takut.92  
* **Apa itu GitHub?** GitHub adalah platform berbasis web untuk hosting repositori Git. Ini menambahkan fitur kolaborasi seperti *pull requests*, *issues*, dan manajemen proyek di atas Git.92  
* **Perintah Git Esensial:** Panduan praktis untuk alur kerja dasar: git init, git add, git commit, git branch, git checkout, git merge, git push, dan git pull.

### **4.3 Menjinakkan Ketergantungan: Node Package Manager (npm)**

* **Apa itu npm?** Manajer paket default untuk Node.js dan registri perangkat lunak terbesar di dunia. Ini adalah alat yang digunakan untuk menginstal dan mengelola paket pihak ketiga (pustaka dan kerangka kerja) dalam proyek Anda.96  
* **File package.json:** Jantung dari setiap proyek Node.js. Ini adalah file manifes yang berisi metadata proyek dan, yang paling penting, daftar ketergantungan proyek. npm init digunakan untuk membuatnya.97  
* **Menginstal Paket:** npm install \<nama-paket\> digunakan untuk menginstal paket. Penting untuk memahami perbedaan antara dependencies (dibutuhkan agar aplikasi berjalan) dan devDependencies (hanya dibutuhkan untuk pengembangan, seperti alat pengujian).97  
* **npm Scripts:** Menggunakan bagian scripts dari package.json untuk mendefinisikan dan menjalankan tugas proyek umum (misalnya, npm start, npm test, npm run build).97

### **4.4 Membangun untuk Produksi: Module Bundlers**

Meskipun kita menulis kode dalam banyak modul terpisah, untuk produksi, kita perlu memproses dan menggabungkan file-file ini menjadi bundel yang dioptimalkan untuk meningkatkan kinerja peramban. Bundler menangani ini, bersama dengan minifikasi, transpilasi, dan optimisasi lainnya.103

* **Para Pesaing: Vite vs. Webpack.** Pilihan alat bantu build secara signifikan memengaruhi alur kerja dan produktivitas pengembang. Munculnya Vite adalah respons langsung terhadap hambatan kinerja bundler tradisional seperti Webpack dalam proyek-proyek besar.  
  * **Webpack:** Pemain lama yang mapan, kuat, dan sangat dapat dikonfigurasi. Ia membangun grafik dependensi lengkap dan mem-bundle semuanya di muka.105  
  * **Vite:** Penantang modern dan cepat yang memprioritaskan pengalaman pengembang (Developer Experience). Ia menggunakan modul ES asli di peramban selama pengembangan untuk waktu mulai server yang hampir instan dan Hot Module Replacement (HMR). Untuk produksi, ia menggunakan Rollup yang sangat dioptimalkan.106

**Tabel 2: Pertarungan Module Bundler: Vite vs. Webpack**

| Fitur | Vite | Webpack |
| :---- | :---- | :---- |
| **Filosofi Inti** | Mengutamakan kecepatan dan pengalaman pengembang; menggunakan modul ES asli saat pengembangan. | Mengutamakan kekuatan dan konfigurabilitas; mem-bundle semuanya di muka. |
| **Kecepatan Server Dev (HMR)** | Sangat cepat, hampir instan. | Lebih lambat, terutama pada proyek besar. |
| **Konfigurasi** | Minimal dan intuitif; banyak yang berfungsi "out-of-the-box". | Kompleks dan ekstensif; memerlukan lebih banyak pengaturan. |
| **Ekosistem/Plugin** | Berkembang pesat, tetapi lebih kecil. | Sangat matang dengan ekosistem plugin dan loader yang luas. |
| **Bundler Produksi** | Rollup | Webpack |
| **Paling Cocok Untuk** | Proyek modern, prototipe cepat, tim yang memprioritaskan kecepatan pengembangan. | Proyek besar dan kompleks, aplikasi enterprise, proyek yang memerlukan kontrol build yang sangat spesifik. |

## **Tahap 5: Meningkatkan Skala \- Kerangka Kerja dan Jalan ke Depan**

Setelah menguasai JavaScript murni dan toolchain modern, pelajar siap untuk meningkatkan produktivitas mereka dengan kerangka kerja (framework) front-end. Tahap ini memandu keputusan penting tersebut dan menetapkan arah untuk pembelajaran berkelanjutan.

### **5.1 Mengapa Menggunakan Kerangka Kerja?**

Meskipun kuat, membangun aplikasi berskala besar dan kompleks hanya dengan JavaScript murni dapat menyebabkan kode yang tidak terorganisir dan sulit dipelihara. Kerangka kerja menyediakan struktur, konvensi, dan abstraksi yang kuat (seperti arsitektur berbasis komponen dan rendering deklaratif) untuk mengelola kompleksitas dan mempercepat pengembangan.112 Aturan emasnya adalah: kerangka kerja dibangun

*di atas* JavaScript. Pemahaman mendalam tentang Tahap 1-4 sangat penting untuk menggunakan kerangka kerja apa pun secara efektif.

### **5.2 Memilih Jalan Anda: React vs. Vue vs. Angular**

Memilih kerangka kerja pertama adalah keputusan besar. Namun, ini lebih sedikit tentang memilih teknologi "terbaik" dan lebih banyak tentang berkomitmen pada ekosistem pembelajaran. Konsep inti yang dipelajari dalam satu kerangka kerja (komponen, state, props) sangat dapat ditransfer ke yang lain.112 Hambatan terbesar biasanya adalah toolchain dan sintaksis spesifik, bukan konsep arsitektur fundamental. Oleh karena itu, langkah terpenting adalah memilih satu, mendalaminya, dan menguasai prinsip-prinsip inti pengembangan berbasis komponen.

* **React:**  
  * **Filosofi:** Sebuah pustaka (*library*), bukan kerangka kerja penuh, yang berfokus pada pembangunan antarmuka pengguna dengan arsitektur berbasis komponen. Menawarkan fleksibilitas maksimum.112  
  * **Kelebihan:** Ekosistem dan komunitas yang sangat besar, pasar kerja yang luas, didukung oleh Meta, komponen yang dapat digunakan kembali, kinerja luar biasa dengan Virtual DOM.112  
  * **Kekurangan:** Dapat menyebabkan "kelelahan dalam mengambil keputusan" karena sifatnya yang tidak beropini. JSX bisa menjadi kurva belajar bagi sebagian orang.115  
* **Vue:**  
  * **Filosofi:** Kerangka kerja "progresif" yang dirancang agar mudah didekati dan diadopsi. Bertujuan untuk keseimbangan antara fleksibilitas React dan sifat lengkap Angular.115  
  * **Kelebihan:** Kurva belajar yang landai (sering disebut paling mudah dipelajari), dokumentasi yang sangat baik, kinerja yang baik.115  
  * **Kekurangan:** Ekosistem dan pasar kerja yang lebih kecil dibandingkan React, adopsi perusahaan yang lebih sedikit.118  
* **Angular:**  
  * **Filosofi:** Kerangka kerja komprehensif seperti platform, "sudah termasuk baterai," untuk membangun aplikasi skala enterprise yang besar dan kompleks. Sangat beropini dan menyediakan serangkaian alat lengkap.112  
  * **Kelebihan:** Sangat terstruktur (menegakkan konsistensi), menggunakan TypeScript, CLI yang kuat, solusi bawaan untuk routing dan manajemen state, didukung oleh Google.113  
  * **Kekurangan:** Kurva belajar yang paling curam, lebih banyak kode boilerplate, bisa bertele-tele, mungkin berlebihan untuk proyek kecil.118

**Tabel 3: Analisis Mendalam Kerangka Kerja: React vs. Vue vs. Angular**

| Aspek | React | Vue | Angular |
| :---- | :---- | :---- | :---- |
| **Tipe** | Pustaka (Library) | Kerangka Kerja (Framework) | Kerangka Kerja (Framework) |
| **Kurva Belajar** | Sedang | Mudah | Curam |
| **Permintaan Pasar Kerja** | Sangat Tinggi | Sedang, berkembang | Tinggi (terutama di enterprise) |
| **Kekuatan Inti** | Fleksibilitas, ekosistem besar, Virtual DOM | Kemudahan penggunaan, dokumentasi, progresif | Struktur, skalabilitas, "semua dalam satu" |
| **Fitur Kunci** | JSX, Virtual DOM, Hooks | Template HTML, Composition API | TypeScript, Dependency Injection, Two-way Binding |
| **Didukung Oleh** | Meta (Facebook) | Komunitas (diciptakan oleh Evan You) | Google |
| **Paling Cocok Untuk** | Aplikasi SPA, aplikasi seluler (React Native), proyek yang membutuhkan fleksibilitas tinggi. | Prototipe cepat, aplikasi skala kecil hingga menengah, integrasi mudah ke proyek yang ada. | Aplikasi enterprise berskala besar, proyek yang membutuhkan konsistensi dan struktur yang ketat. |

### **5.3 Membangun Portofolio Anda: Ide Proyek Lanjutan**

Setelah memilih dan mempelajari sebuah kerangka kerja, bangunlah proyek yang lebih kompleks untuk menunjukkan keahlian Anda kepada calon pemberi kerja.

* **Ide:** Aplikasi obrolan waktu nyata, front-end situs e-commerce, klon Instagram, aplikasi berbagi file, atau dasbor data interaktif. Proyek-proyek ini memerlukan konsep seperti routing, manajemen state tingkat lanjut, dan otentikasi pengguna.36

### **5.4 Pembelajar Seumur Hidup: Sumber Daya Esensial**

Perjalanan belajar tidak pernah berakhir. Berikut adalah sumber daya yang dikurasi untuk pembelajaran berkelanjutan.

* **Dokumentasi (Sumber Kebenaran):** MDN Web Docs (standar emas).14  
* **Platform Interaktif:** freeCodeCamp, Codecademy, The Odin Project, Scrimba.124  
* **Tutorial dan Buku:** Eloquent JavaScript, JavaScript.info, Udemy, saluran YouTube (misalnya, freeCodeCamp, SuperSimpleDev).125  
* **Komunitas:** Reddit (r/learnjavascript), Stack Overflow, dev.to.

## **Kesimpulan: Perjalanan Anda sebagai Pengembang Baru Saja Dimulai**

Peta jalan ini telah memandu Anda melalui perjalanan yang signifikan, dari variabel dasar hingga membangun aplikasi berbasis data dengan alat modern. Anda telah beralih dari sekadar menulis skrip menjadi memahami ekosistem rekayasa perangkat lunak yang menopang web modern.

Pelajaran terpenting bukanlah sintaksis dari satu kerangka kerja tertentu, tetapi pemahaman tentang prinsip-prinsip fundamental yang mendasarinya. Teknologi akan selalu berevolusi; var memberi jalan kepada let, XMLHttpRequest kepada fetch, dan Webpack mungkin suatu hari nanti akan sepenuhnya digantikan oleh alat seperti Vite. Namun, konsep-konsep inti seperti variabel, cakupan, manipulasi DOM, asinkronisitas, dan arsitektur berbasis komponen akan tetap relevan. Keterampilan yang paling berharga yang telah Anda kembangkan adalah kemampuan untuk belajar, beradaptasi, dan memecahkan masalah. Teruslah membangun, tetaplah penasaran, dan terlibatlah dengan komunitas pengembang yang dinamis. Perjalanan Anda baru saja dimulai.

#### **Works cited**

1. Belajar Dasar Pemrograman JavaScript \- Dicoding Indonesia, accessed on July 13, 2025, [https://www.dicoding.com/academies/256-belajar-dasar-pemrograman-javascript](https://www.dicoding.com/academies/256-belajar-dasar-pemrograman-javascript)  
2. Apa Itu JavaScript? Fungsi, Kelebihan, dan Tutorial Belajarnya \- Primakara University, accessed on July 13, 2025, [https://primakara.ac.id/blog/info-teknologi/javascript](https://primakara.ac.id/blog/info-teknologi/javascript)  
3. Belajar JavaScript: Panduan Lengkap untuk Pemula 2025 \- RevoU, accessed on July 13, 2025, [https://www.revou.co/panduan-teknis/belajar-javascript](https://www.revou.co/panduan-teknis/belajar-javascript)  
4. Tips dan Panduan Belajar Javascript untuk Pemula \- Ada Ide Indonesia, accessed on July 13, 2025, [https://adaide.co.id/tips-dan-panduan-belajar-javascript-untuk-pemula/](https://adaide.co.id/tips-dan-panduan-belajar-javascript-untuk-pemula/)  
5. Modul Lengkap Javascript.pdf \- Repository UNIKOM, accessed on July 13, 2025, [https://repository.unikom.ac.id/46889/1/Modul%20Lengkap%20Javascript.pdf](https://repository.unikom.ac.id/46889/1/Modul%20Lengkap%20Javascript.pdf)  
6. Apa Itu JavaScript? Fungsi dan Contohnya \- Dicoding Blog, accessed on July 13, 2025, [https://www.dicoding.com/blog/apa-itu-javascript-fungsi-dan-contohnya/](https://www.dicoding.com/blog/apa-itu-javascript-fungsi-dan-contohnya/)  
7. Documentation for Visual Studio Code, accessed on July 13, 2025, [https://code.visualstudio.com/docs](https://code.visualstudio.com/docs)  
8. Belajar Pemrograman Javascript untuk Pemula \- Petani Kode, accessed on July 13, 2025, [https://www.petanikode.com/tutorial/javascript/](https://www.petanikode.com/tutorial/javascript/)  
9. Memahami Variabel dan Tipe Data dalam Javascript \- Petani Kode, accessed on July 13, 2025, [https://www.petanikode.com/javascript-variabel/](https://www.petanikode.com/javascript-variabel/)  
10. Tutorial Belajar JavaScript Untuk Pemula | PDF \- Scribd, accessed on July 13, 2025, [https://id.scribd.com/document/708417155/Tutorial-Belajar-JavaScript-Untuk-Pemula](https://id.scribd.com/document/708417155/Tutorial-Belajar-JavaScript-Untuk-Pemula)  
11. Apa Itu JavaScript: Definisi, Fungsi, dan Perbedaannya dengan Java \- Hostinger, accessed on July 13, 2025, [https://www.hostinger.com/id/tutorial/apa-itu-javascript](https://www.hostinger.com/id/tutorial/apa-itu-javascript)  
12. Downloading and installing Node.js and npm, accessed on July 13, 2025, [https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)  
13. Tutorial Javascript Fundamentals \- Part 1 \- YouTube, accessed on July 13, 2025, [https://www.youtube.com/watch?v=523wUwYcBdU](https://www.youtube.com/watch?v=523wUwYcBdU)  
14. JavaScript: Adding interactivity \- Learn web development | MDN, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Learn\_web\_development/Getting\_started/Your\_first\_website/Adding\_interactivity](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Adding_interactivity)  
15. Difference between var, let and const keywords in JavaScript \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/javascript/difference-between-var-let-and-const-keywords-in-javascript/](https://www.geeksforgeeks.org/javascript/difference-between-var-let-and-const-keywords-in-javascript/)  
16. Difference between var, let and const in JavaScript | by Jack Pritom Soren \- Medium, accessed on July 13, 2025, [https://medium.com/@jackpritomsoren/difference-between-var-let-and-const-in-javascript-c6236899ca4d](https://medium.com/@jackpritomsoren/difference-between-var-let-and-const-in-javascript-c6236899ca4d)  
17. Belajar Javascript : Variable dan Tipe Data \- Depot Kode, accessed on July 13, 2025, [https://www.depotkode.com/javascript-variabel/](https://www.depotkode.com/javascript-variabel/)  
18. JavaScript ES6+ Features: A Beginner's Guide to Modern JavaScript | by Rashmi Patil, accessed on July 13, 2025, [https://medium.com/@rashmipatil24/javascript-es6-features-a-beginners-guide-to-modern-javascript-5786113ca9eb](https://medium.com/@rashmipatil24/javascript-es6-features-a-beginners-guide-to-modern-javascript-5786113ca9eb)  
19. var, let, and const \- What's The Difference? \- DEV Community, accessed on July 13, 2025, [https://dev.to/kjdowns/var-let-and-const-what-s-the-difference-31om](https://dev.to/kjdowns/var-let-and-const-what-s-the-difference-31om)  
20. var vs let vs const in JavaScript \- ui.dev, accessed on July 13, 2025, [https://ui.dev/var-let-const](https://ui.dev/var-let-const)  
21. Memahami Tipe Data dan Operator dalam Javascript | by Zulfianarahmi \- Medium, accessed on July 13, 2025, [https://medium.com/@zulfianarahmi4/memahami-tipe-data-dan-operator-dalam-javascript-4f7635f80184](https://medium.com/@zulfianarahmi4/memahami-tipe-data-dan-operator-dalam-javascript-4f7635f80184)  
22. Belajar Javascript \#6: Enam Jenis Operator yang Wajib Kamu Ketahui di Javascript, accessed on July 13, 2025, [https://www.petanikode.com/javascript-operator/](https://www.petanikode.com/javascript-operator/)  
23. Belajar JavaScript untuk Pemula: Pengertian, Fungsi, Cara Kerja, dan Panduan Belajarnya, accessed on July 13, 2025, [https://idwebhost.com/blog/belajar-javascript-untuk-pemula-2/](https://idwebhost.com/blog/belajar-javascript-untuk-pemula-2/)  
24. Control Structures (if-else, switch, loops) \- JavaScript \- myTectra, accessed on July 13, 2025, [https://www.mytectra.com/tutorials/javascript/control-structures-if-else-switch-loops](https://www.mytectra.com/tutorials/javascript/control-structures-if-else-switch-loops)  
25. JavaScript's Conditional Control Structures: if, else if, else, and switch | by Rajeswari Depala, accessed on July 13, 2025, [https://medium.com/@rajeswaridepala/javascripts-conditional-control-structures-if-else-if-else-and-switch-902789b33b19](https://medium.com/@rajeswaridepala/javascripts-conditional-control-structures-if-else-if-else-and-switch-902789b33b19)  
26. Control Flow in JavaScript: If Statements, Switch Cases, and Loops \- Noble Desktop, accessed on July 13, 2025, [https://www.nobledesktop.com/learn/javascript/control-flow-in-javascript-if-statements,-switch-cases,-and-loops](https://www.nobledesktop.com/learn/javascript/control-flow-in-javascript-if-statements,-switch-cases,-and-loops)  
27. Control flow and error handling \- JavaScript \- MDN Web Docs, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control\_flow\_and\_error\_handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)  
28. JavaScript If-Else vs Switch : r/learnprogramming \- Reddit, accessed on July 13, 2025, [https://www.reddit.com/r/learnprogramming/comments/1cirk2g/javascript\_ifelse\_vs\_switch/](https://www.reddit.com/r/learnprogramming/comments/1cirk2g/javascript_ifelse_vs_switch/)  
29. Control statements \- Enfocus, accessed on July 13, 2025, [http://enfocus.com/Manuals/UserGuide/SW/11U4/Switch/en-us/reference/r\_control\_statements.html](http://enfocus.com/Manuals/UserGuide/SW/11U4/Switch/en-us/reference/r_control_statements.html)  
30. Belajar Javascript: Memahami Fungsi di Javascript dan Contoh Programnya \- Petani Kode, accessed on July 13, 2025, [https://www.petanikode.com/javascript-fungsi/](https://www.petanikode.com/javascript-fungsi/)  
31. Frontend JavaScript ES6+ Features | AppMaster, accessed on July 13, 2025, [https://appmaster.io/glossary/frontend-javascript-es6-features](https://appmaster.io/glossary/frontend-javascript-es6-features)  
32. Arrow functions in JavaScript \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/javascript/arrow-functions-in-javascript/](https://www.geeksforgeeks.org/javascript/arrow-functions-in-javascript/)  
33. Arrow functions, the basics \- The Modern JavaScript Tutorial, accessed on July 13, 2025, [https://javascript.info/arrow-functions-basics](https://javascript.info/arrow-functions-basics)  
34. Difference between var, let and const : r/learnjavascript \- Reddit, accessed on July 13, 2025, [https://www.reddit.com/r/learnjavascript/comments/tomn5z/difference\_between\_var\_let\_and\_const/](https://www.reddit.com/r/learnjavascript/comments/tomn5z/difference_between_var_let_and_const/)  
35. 5 Ide Projek Pemula Menggunakan JavaScript \- BuildWithAngga, accessed on July 13, 2025, [https://buildwithangga.com/tips/5-ide-projek-pemula-menggunakan-javascript](https://buildwithangga.com/tips/5-ide-projek-pemula-menggunakan-javascript)  
36. Top 15+ JavaScript Projects for Beginners to Advanced \[With Source Code\] \- InterviewBit, accessed on July 13, 2025, [https://www.interviewbit.com/blog/javascript-projects/](https://www.interviewbit.com/blog/javascript-projects/)  
37. 10 Contoh Program JavaScript Sederhana untuk Pemula 2025 \- RevoU, accessed on July 13, 2025, [https://www.revou.co/panduan-teknis/contoh-program-javascript](https://www.revou.co/panduan-teknis/contoh-program-javascript)  
38. DOM scripting introduction \- Learn web development | MDN, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Learn\_web\_development/Core/Scripting/DOM\_scripting](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting)  
39. DOM scripting introduction \- Learn web development | MDN, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side\_web\_APIs/Manipulating\_documents](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents)  
40. JavaScript DOM Manipulation Step by Step Guide for Beginners | by Rahul Kaklotar, accessed on July 13, 2025, [https://medium.com/@kaklotarrahul79/master-javascript-dom-manipulation-step-by-step-guide-for-beginners-b1e07616f319](https://medium.com/@kaklotarrahul79/master-javascript-dom-manipulation-step-by-step-guide-for-beginners-b1e07616f319)  
41. JavaScript: Finding HTML DOM Elements | by Leo Chen \- Medium, accessed on July 13, 2025, [https://medium.com/@leorchen/javascript-finding-html-elements-2f49d5ac6794](https://medium.com/@leorchen/javascript-finding-html-elements-2f49d5ac6794)  
42. JavaScript \- How to Manipulate DOM Elements? \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/javascript/how-to-manipulate-dom-elements-in-javascript/](https://www.geeksforgeeks.org/javascript/how-to-manipulate-dom-elements-in-javascript/)  
43. JavaScript DOM Tutorial, accessed on July 13, 2025, [https://www.javascripttutorial.net/javascript-dom/](https://www.javascripttutorial.net/javascript-dom/)  
44. DOM Manipulation and Events \- The Odin Project, accessed on July 13, 2025, [https://www.theodinproject.com/lessons/foundations-dom-manipulation-and-events](https://www.theodinproject.com/lessons/foundations-dom-manipulation-and-events)  
45. Javascript Tutorial | Changing an Element's Style | Ep33 \- YouTube, accessed on July 13, 2025, [https://www.youtube.com/watch?v=LG1JfuwMaxM](https://www.youtube.com/watch?v=LG1JfuwMaxM)  
46. Using dynamic styling information \- Web APIs | MDN, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Web/API/CSS\_Object\_Model/Using\_dynamic\_styling\_information](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Using_dynamic_styling_information)  
47. Learn DOM Manipulation In 18 Minutes \- YouTube, accessed on July 13, 2025, [https://www.youtube.com/watch?v=y17RuWkWdn8](https://www.youtube.com/watch?v=y17RuWkWdn8)  
48. JavaScript — Changing CSS Styles \- Gerald Clark \- Medium, accessed on July 13, 2025, [https://geraldclarkaudio.medium.com/javascript-changing-css-styles-bd2165ea0e7e](https://geraldclarkaudio.medium.com/javascript-changing-css-styles-bd2165ea0e7e)  
49. Creating and removing HTML elements with JavaScript | by Tom Hendrych \- Medium, accessed on July 13, 2025, [https://medium.com/@tom.hendrych/creating-and-removing-html-elements-with-javascript-372bbd4cfdcc](https://medium.com/@tom.hendrych/creating-and-removing-html-elements-with-javascript-372bbd4cfdcc)  
50. Membuat elemen baru \- DOM \- Referensi javascript \- SkoDev, accessed on July 13, 2025, [https://sko.dev/referensi/javascript/membuat-elemen-baru---dom](https://sko.dev/referensi/javascript/membuat-elemen-baru---dom)  
51. Tutorial Javascript Dom : Menambah dan Menghapus Elemen HTML untuk Pemula Bahasa Indonesia \- YouTube, accessed on July 13, 2025, [https://m.youtube.com/watch?v=Df\_ZdofTPHY](https://m.youtube.com/watch?v=Df_ZdofTPHY)  
52. Cara Menghapus Elemen HTML DOM Javascript \- DUMET School, accessed on July 13, 2025, [https://www.dumetschool.com/blog/Cara-Menghapus-Elemen-HTML-DOM-Javascript](https://www.dumetschool.com/blog/Cara-Menghapus-Elemen-HTML-DOM-Javascript)  
53. Menghapus elemen DOM \- Referensi javascript \- SkoDev, accessed on July 13, 2025, [https://sko.dev/referensi/javascript/menghapus-elemen-dom](https://sko.dev/referensi/javascript/menghapus-elemen-dom)  
54. JavaScript Event Handling: Practical Guide with Examples \- Sencha.com, accessed on July 13, 2025, [https://www.sencha.com/blog/event-handling-in-javascript-a-practical-guide-with-examples/](https://www.sencha.com/blog/event-handling-in-javascript-a-practical-guide-with-examples/)  
55. Introduction to events \- Learn web development | MDN, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Learn\_web\_development/Core/Scripting/Events](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events)  
56. JavaScript Events \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/javascript/javascript-events/](https://www.geeksforgeeks.org/javascript/javascript-events/)  
57. Event Handling \- JavaScript \- Codecademy, accessed on July 13, 2025, [https://www.codecademy.com/resources/docs/javascript/event-handling](https://www.codecademy.com/resources/docs/javascript/event-handling)  
58. What is an Event Listener? \- Javascript Event Listener Explained \- AWS, accessed on July 13, 2025, [https://aws.amazon.com/what-is/event-listener/](https://aws.amazon.com/what-is/event-listener/)  
59. Event handling (overview) \- Event reference \- MDN Web Docs, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Web/Events/Event\_handlers](https://developer.mozilla.org/en-US/docs/Web/Events/Event_handlers)  
60. Element: click event \- Web APIs | MDN, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Web/API/Element/click\_event](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event)  
61. Keyboard Event In JS With Example \- Geekster, accessed on July 13, 2025, [https://www.geekster.in/articles/keyboard-event-in-javascript/](https://www.geekster.in/articles/keyboard-event-in-javascript/)  
62. Element: keypress event \- Web APIs | MDN, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Web/API/Element/keypress\_event](https://developer.mozilla.org/en-US/docs/Web/API/Element/keypress_event)  
63. Forms: event and method submit \- The Modern JavaScript Tutorial, accessed on July 13, 2025, [https://javascript.info/forms-submit](https://javascript.info/forms-submit)  
64. JavaScript Submit Form: A Complete Guide — CodeWithNazam | by Muhammad Nazam, accessed on July 13, 2025, [https://medium.com/@codewithnazam/javascript-submit-form-a-complete-guide-codewithnazam-24b8c60dcfb9](https://medium.com/@codewithnazam/javascript-submit-form-a-complete-guide-codewithnazam-24b8c60dcfb9)  
65. Simple examples of Event Listeners in Javascript \- SitePoint, accessed on July 13, 2025, [https://www.sitepoint.com/community/t/simple-examples-of-event-listeners-in-javascript/366113](https://www.sitepoint.com/community/t/simple-examples-of-event-listeners-in-javascript/366113)  
66. Learn JavaScript EventListeners in 4 Minutes \- YouTube, accessed on July 13, 2025, [https://www.youtube.com/watch?v=i\_8NQuEAOmg\&pp=0gcJCfwAo7VqN5tD](https://www.youtube.com/watch?v=i_8NQuEAOmg&pp=0gcJCfwAo7VqN5tD)  
67. Introduction to Asynchronous JavaScript \- Pluralsight, accessed on July 13, 2025, [https://www.pluralsight.com/resources/blog/guides/introduction-to-asynchronous-javascript](https://www.pluralsight.com/resources/blog/guides/introduction-to-asynchronous-javascript)  
68. Asynchronous JavaScript \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/javascript/asynchronous-javascript/](https://www.geeksforgeeks.org/javascript/asynchronous-javascript/)  
69. Asynchronous Programming \- Eloquent JavaScript, accessed on July 13, 2025, [https://eloquentjavascript.net/11\_async.html](https://eloquentjavascript.net/11_async.html)  
70. Async JavaScript: From Callbacks, to Promises, to Async/Await \- ui.dev, accessed on July 13, 2025, [https://ui.dev/async-javascript-from-callbacks-to-promises-to-async-await](https://ui.dev/async-javascript-from-callbacks-to-promises-to-async-await)  
71. Callbacks vs Promises vs Async/Await \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/javascript/callbacks-vs-promises-vs-async-await/](https://www.geeksforgeeks.org/javascript/callbacks-vs-promises-vs-async-await/)  
72. Callbacks vs. Promises vs. Async/Await: Detailed Comparison | by Karnika Gupta \- Medium, accessed on July 13, 2025, [https://medium.com/womenintechnology/callbacks-vs-promises-vs-async-await-detailed-comparison-d1f6ae7c778a](https://medium.com/womenintechnology/callbacks-vs-promises-vs-async-await-detailed-comparison-d1f6ae7c778a)  
73. Callback vs Promise vs Async/Await in JavaScript | by Lelianto Eko Pradana | Medium, accessed on July 13, 2025, [https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72](https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72)  
74. Flow Control in JavaScript: Callbacks, Promises, async/await \- SitePoint, accessed on July 13, 2025, [https://www.sitepoint.com/flow-control-callbacks-promises-async-await/](https://www.sitepoint.com/flow-control-callbacks-promises-async-await/)  
75. Learn JavaScript: Asynchronous Programming \- Codecademy, accessed on July 13, 2025, [https://www.codecademy.com/learn/asynchronous-javascript](https://www.codecademy.com/learn/asynchronous-javascript)  
76. JavaScript ASYNC/AWAIT is easy\! \- YouTube, accessed on July 13, 2025, [https://www.youtube.com/watch?v=9j1dZwFEJ-c\&pp=0gcJCfwAo7VqN5tD](https://www.youtube.com/watch?v=9j1dZwFEJ-c&pp=0gcJCfwAo7VqN5tD)  
77. How to Use JavaScript Fetch API: Step-by-Step Guide with Examples | DigitalOcean, accessed on July 13, 2025, [https://www.digitalocean.com/community/tutorials/how-to-use-the-javascript-fetch-api-to-get-data](https://www.digitalocean.com/community/tutorials/how-to-use-the-javascript-fetch-api-to-get-data)  
78. JavaScript Fetch API Ultimate Guide \- Web Dev Simplified Blog, accessed on July 13, 2025, [https://blog.webdevsimplified.com/2022-01/js-fetch-api/](https://blog.webdevsimplified.com/2022-01/js-fetch-api/)  
79. Fetch API \- MDN Web Docs, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Web/API/Fetch\_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)  
80. Fetch API in JavaScript \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/javascript/javascript-fetch-method/](https://www.geeksforgeeks.org/javascript/javascript-fetch-method/)  
81. Using the Fetch API \- MDN Web Docs, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Web/API/Fetch\_API/Using\_Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)  
82. 100+ JavaScript Projects | Learn Web Development, accessed on July 13, 2025, [https://www.100jsprojects.com/](https://www.100jsprojects.com/)  
83. Unfolding JavaScript: A Deep Dive into ES6+ Features | CodeSignal Learn, accessed on July 13, 2025, [https://codesignal.com/learn/courses/getting-into-javascript-fundamentals/lessons/unfolding-javascript-a-deep-dive-into-es6-features](https://codesignal.com/learn/courses/getting-into-javascript-fundamentals/lessons/unfolding-javascript-a-deep-dive-into-es6-features)  
84. JavaScript Template Literals: Syntax, Usage, and Examples \- Mimo, accessed on July 13, 2025, [https://mimo.org/glossary/javascript/template-literals](https://mimo.org/glossary/javascript/template-literals)  
85. JavaScript Template Literals \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/javascript/javascript-template-literals/](https://www.geeksforgeeks.org/javascript/javascript-template-literals/)  
86. JavaScript Template Literals are awesome \- Keith Cirkel, accessed on July 13, 2025, [https://www.keithcirkel.co.uk/es6-template-literals/](https://www.keithcirkel.co.uk/es6-template-literals/)  
87. Destructuring in JavaScript \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/javascript/destructuring-assignment-in-javascript/](https://www.geeksforgeeks.org/javascript/destructuring-assignment-in-javascript/)  
88. Destructuring assignment \- Modern JavaScript Eğitimi, accessed on July 13, 2025, [https://tr.javascript.info/destructuring-assignment](https://tr.javascript.info/destructuring-assignment)  
89. Destructuring \- JavaScript \- MDN Web Docs \- Mozilla, accessed on July 13, 2025, [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring)  
90. Modern JavaScript (ES6+). Let's dive deep into modern JS. | by Lilit Poghosyan | Medium, accessed on July 13, 2025, [https://medium.com/@rational\_cardinal\_ant\_861/modern-javascript-es6-23afbe58012b](https://medium.com/@rational_cardinal_ant_861/modern-javascript-es6-23afbe58012b)  
91. JavaScript ES6+ features \- DEV Community, accessed on July 13, 2025, [https://dev.to/clifftech123/javascript-es6-features-13co](https://dev.to/clifftech123/javascript-es6-features-13co)  
92. What Is GitHub and Why Should You Use It? \- Coursera, accessed on July 13, 2025, [https://www.coursera.org/articles/what-is-git](https://www.coursera.org/articles/what-is-git)  
93. Why is GitHub so important? : r/learnprogramming \- Reddit, accessed on July 13, 2025, [https://www.reddit.com/r/learnprogramming/comments/wg463w/why\_is\_github\_so\_important/](https://www.reddit.com/r/learnprogramming/comments/wg463w/why_is_github_so_important/)  
94. Why Use Git | Atlassian Git Tutorial, accessed on July 13, 2025, [https://www.atlassian.com/git/tutorials/why-git](https://www.atlassian.com/git/tutorials/why-git)  
95. \[Beginner\] What is Git and Github and should I start using it? : r/webdev \- Reddit, accessed on July 13, 2025, [https://www.reddit.com/r/webdev/comments/1jud4nm/beginner\_what\_is\_git\_and\_github\_and\_should\_i/](https://www.reddit.com/r/webdev/comments/1jud4nm/beginner_what_is_git_and_github_and_should_i/)  
96. NodeJS NPM \- GeeksforGeeks, accessed on July 13, 2025, [https://www.geeksforgeeks.org/node-js/node-js-npm-node-package-manager/](https://www.geeksforgeeks.org/node-js/node-js-npm-node-package-manager/)  
97. What is NPM? The Complete Beginner's Guide \- CareerFoundry, accessed on July 13, 2025, [https://careerfoundry.com/en/blog/web-development/what-is-npm/](https://careerfoundry.com/en/blog/web-development/what-is-npm/)  
98. An introduction to the npm package manager \- Node.js, accessed on July 13, 2025, [https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager)  
99. What is NPM and why do I need it? \[closed\] \- Stack Overflow, accessed on July 13, 2025, [https://stackoverflow.com/questions/31930370/what-is-npm-and-why-do-i-need-it](https://stackoverflow.com/questions/31930370/what-is-npm-and-why-do-i-need-it)  
100. The Basics: Getting started with npm \- NodeSource, accessed on July 13, 2025, [https://nodesource.com/blog/the-basics-getting-started-with-npm](https://nodesource.com/blog/the-basics-getting-started-with-npm)  
101. npm Basics for New Developers \- Daily.dev, accessed on July 13, 2025, [https://daily.dev/blog/npm-basics-for-new-developers](https://daily.dev/blog/npm-basics-for-new-developers)  
102. Node.js NPM \- Tutorialspoint, accessed on July 13, 2025, [https://www.tutorialspoint.com/nodejs/nodejs\_npm.htm](https://www.tutorialspoint.com/nodejs/nodejs_npm.htm)  
103. Vite vs. Webpack: A Head-to-Head Comparison \- Kinsta®, accessed on July 13, 2025, [https://kinsta.com/blog/vite-vs-webpack/](https://kinsta.com/blog/vite-vs-webpack/)  
104. How Bundlers work: Webpack Vs Vite | by Ruchi Vora \- Medium, accessed on July 13, 2025, [https://medium.com/@ruchivora16/how-react-code-becomes-production-ready-webpack-vs-vite-576856aed4bd](https://medium.com/@ruchivora16/how-react-code-becomes-production-ready-webpack-vs-vite-576856aed4bd)  
105. JavaScript Bundlers: Is It Worth Switching from Webpack to Vite? \- Career Comarch, accessed on July 13, 2025, [https://career.comarch.com/blog/javascript-bundlers-is-it-worth-switching-from-webpack-to-vite/](https://career.comarch.com/blog/javascript-bundlers-is-it-worth-switching-from-webpack-to-vite/)  
106. Vite vs. Webpack: Which JavaScript Bundler Should You Use? | Better Stack Community, accessed on July 13, 2025, [https://betterstack.com/community/guides/scaling-nodejs/vite-vs-webpack/](https://betterstack.com/community/guides/scaling-nodejs/vite-vs-webpack/)  
107. Vite or Webpack for GenAI development: which one scales better?, accessed on July 13, 2025, [https://pieces.app/blog/vite-vs-webpack-which-build-tool-is-right-for-your-project](https://pieces.app/blog/vite-vs-webpack-which-build-tool-is-right-for-your-project)  
108. A Beginner's Guide to Webpack \- SitePoint, accessed on July 13, 2025, [https://www.sitepoint.com/webpack-beginner-guide/](https://www.sitepoint.com/webpack-beginner-guide/)  
109. Vite vs. Webpack: The JavaScript Bundler Showdown \- DEV Community, accessed on July 13, 2025, [https://dev.to/lovestaco/vite-vs-webpack-the-javascript-bundler-showdown-3c0b](https://dev.to/lovestaco/vite-vs-webpack-the-javascript-bundler-showdown-3c0b)  
110. Getting Started \- Vite, accessed on July 13, 2025, [https://vite.dev/guide/](https://vite.dev/guide/)  
111. Vite.js: A Beginner's Guide | Better Stack Community, accessed on July 13, 2025, [https://betterstack.com/community/guides/scaling-nodejs/vitejs-explained/](https://betterstack.com/community/guides/scaling-nodejs/vitejs-explained/)  
112. Angular vs React vs Vue: The Best Framework for 2025 is… | Zero To Mastery, accessed on July 13, 2025, [https://zerotomastery.io/blog/angular-vs-react-vs-vue/](https://zerotomastery.io/blog/angular-vs-react-vs-vue/)  
113. Angular Vs React Vs Vue: Which One To Choose \- TatvaSoft Blog, accessed on July 13, 2025, [https://www.tatvasoft.com/blog/angular-vs-react-vs-vue/](https://www.tatvasoft.com/blog/angular-vs-react-vs-vue/)  
114. Should I learn Vue, React or Angular? : r/Frontend \- Reddit, accessed on July 13, 2025, [https://www.reddit.com/r/Frontend/comments/1iq0g4l/should\_i\_learn\_vue\_react\_or\_angular/](https://www.reddit.com/r/Frontend/comments/1iq0g4l/should_i_learn_vue_react_or_angular/)  
115. Which is better for web development in 2025, React, Angular, or Vue? \- Quora, accessed on July 13, 2025, [https://www.quora.com/Which-is-better-for-web-development-in-2025-React-Angular-or-Vue](https://www.quora.com/Which-is-better-for-web-development-in-2025-React-Angular-or-Vue)  
116. ReactJS — Advantages & Disadvantages | by Muhamed Salih Seyed Ibrahim | Medium, accessed on July 13, 2025, [https://medium.com/@muhamedsalihseyedibrahim/reactjs-advantages-disadvantages-16f479b3aa47](https://medium.com/@muhamedsalihseyedibrahim/reactjs-advantages-disadvantages-16f479b3aa47)  
117. React vs. Vue vs. Angular: Which One Should You Choose in 2025?, accessed on July 13, 2025, [https://atinatechnology.in/react-vs-vue-vs-angular-which-one-should-you-choose-in-2025/](https://atinatechnology.in/react-vs-vue-vs-angular-which-one-should-you-choose-in-2025/)  
118. React, Vue, or Angular: Making the Right Choice for Your Project in 2025 \- Medium, accessed on July 13, 2025, [https://medium.com/@wutamy77/react-vue-or-angular-making-the-right-choice-for-your-project-in-2025-d6939751e575](https://medium.com/@wutamy77/react-vue-or-angular-making-the-right-choice-for-your-project-in-2025-d6939751e575)  
119. Angular vs React vs Vue: Core Differences \- BrowserStack, accessed on July 13, 2025, [https://www.browserstack.com/guide/angular-vs-react-vs-vue](https://www.browserstack.com/guide/angular-vs-react-vs-vue)  
120. Pros and Cons of Angular Development \- Agiliway, accessed on July 13, 2025, [https://www.agiliway.com/pros-and-cons-of-angular-development/](https://www.agiliway.com/pros-and-cons-of-angular-development/)  
121. Angular Framework: Advantages and Disadvantages Elaborated \- Robin Waite, accessed on July 13, 2025, [https://www.robinwaite.com/blog/pros-and-cons-of-angular-framework-you-need-to-know](https://www.robinwaite.com/blog/pros-and-cons-of-angular-framework-you-need-to-know)  
122. Kelebihan dan Kekurangan Angular, Apa Saja? \- Alan Creative, accessed on July 13, 2025, [https://alan.co.id/kelebihan-dan-kekurangan-angular-apa-saja/](https://alan.co.id/kelebihan-dan-kekurangan-angular-apa-saja/)  
123. Website terbaik apa buat belajar JS gratis? : r/learnjavascript \- Reddit, accessed on July 13, 2025, [https://www.reddit.com/r/learnjavascript/comments/w4tlz7/whats\_the\_best\_website\_to\_learn\_js\_on\_for\_free/?tl=id](https://www.reddit.com/r/learnjavascript/comments/w4tlz7/whats_the_best_website_to_learn_js_on_for_free/?tl=id)  
124. Yuk, Intip Rekomendasi Situs Belajar Javascript Lengkap Untuk Kamu\! \- DomaiNesia, accessed on July 13, 2025, [https://www.domainesia.com/berita/belajar-javascript/](https://www.domainesia.com/berita/belajar-javascript/)  
125. Should I learn Javascript from MDN or W3Schools? : r/JavaScriptTips \- Reddit, accessed on July 13, 2025, [https://www.reddit.com/r/JavaScriptTips/comments/1eudgte/should\_i\_learn\_javascript\_from\_mdn\_or\_w3schools/](https://www.reddit.com/r/JavaScriptTips/comments/1eudgte/should_i_learn_javascript_from_mdn_or_w3schools/)  
126. 50 Resources to Learn JavaScript for Free Online in 2025 \- Skillcrush, accessed on July 13, 2025, [https://skillcrush.com/blog/learn-javascript-for-free/](https://skillcrush.com/blog/learn-javascript-for-free/)  
127. Learn JavaScript, accessed on July 13, 2025, [https://learnjavascript.online/](https://learnjavascript.online/)  
128. Kursus & Tutorial Online JavaScript Gratis Terpopuler \- Diperbarui \[Juli 2025\] \- Udemy, accessed on July 13, 2025, [https://www.udemy.com/id/topic/javascript/free/](https://www.udemy.com/id/topic/javascript/free/)  
129. JavaScript Tutorial Full Course \- Beginner to Pro \- YouTube, accessed on July 13, 2025, [https://www.youtube.com/watch?v=EerdGm-ehJQ](https://www.youtube.com/watch?v=EerdGm-ehJQ)