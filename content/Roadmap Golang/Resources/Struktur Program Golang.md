# Struktur Program Golang

Struktur program Golang mengikuti konvensi dan aturan tertentu yang membuat kode lebih terorganisir dan mudah dipahami. Memahami struktur dasar program Go adalah langkah penting dalam mempelajari bahasa ini.

## Package dan Import

### Package
- **Definisi**: Package adalah cara Go mengorganisir kode. Setiap file Go harus dimulai dengan deklarasi package.
- **Package main**: Package khusus untuk program yang dapat dieksekusi. Harus memiliki fungsi `main()`.
- **Package lain**: Package yang berfungsi sebagai library yang dapat diimpor oleh package lain.
- **Konvensi penamaan**: Nama package biasanya menggunakan kata benda tunggal, huruf kecil, dan tidak menggunakan underscore atau mixedCaps.

```go
package main  // Untuk program executable
// atau
package utils // Untuk library
```

### Import
- **Cara mengimpor**: Menggunakan keyword `import` diikuti dengan path package.
- **Multiple imports**: Dapat menggunakan kurung kurawal untuk mengimpor beberapa package.
- **Alias**: Dapat memberikan alias untuk package yang diimpor menggunakan sintaks `alias "package/path"`.
- **Blank identifier**: Menggunakan `_` untuk mengimpor package hanya untuk efek sampingnya (seperti registrasi).

```go
import (
    "fmt"
    "math"
    "time"
)

// Dengan alias
import (
    f "fmt"
    "math"
)

// Dengan blank identifier
import (
    _ "database/sql"
    "fmt"
)
```

## Fungsi main()

- **Titik masuk**: Fungsi `main()` adalah titik masuk untuk program Go yang dapat dieksekusi.
- **Signature**: `func main()` tanpa parameter dan tanpa nilai kembali.
- **Eksekusi**: Dieksekusi secara otomatis saat program dijalankan.
- **Package main**: Hanya program dengan package `main` yang dapat memiliki fungsi `main()`.

```go
package main

import "fmt"

func main() {
    fmt.Println("Program dimulai")
    // Logika program
}
```

## Struktur File .go

### Nama File
- **Konvensi**: Nama file biasanya menggunakan snake_case (huruf kecil dengan underscore).
- **Ekstensi**: Semua file Go memiliki ekstensi `.go`.
- **Test file**: File untuk unit testing memiliki suffix `_test.go`.

### Organisasi Kode
- **Deklarasi package**: Harus menjadi baris pertama (setelah komentar).
- **Import**: Mengikuti deklarasi package.
- **Konstanta dan variabel**: Dideklarasikan di level package.
- **Tipe data**: Didefinisikan sebelum digunakan.
- **Fungsi**: Didefinisikan setelah tipe data yang digunakan.

```go
// Komentar di awal file
package main

import (
    "fmt"
    "time"
)

// Konstanta
const (
    MaxRetries = 3
    Timeout    = 5 * time.Second
)

// Variabel
var (
    debugMode = false
    version   = "1.0.0"
)

// Tipe data
type User struct {
    ID   int
    Name string
}

// Fungsi
func main() {
    // Implementasi
}
```

## Struktur Proyek Go

### Layout Standar
- **cmd/**: Berisi aplikasi utama (executable).
- **internal/**: Kode yang tidak boleh diimpor oleh proyek lain.
- **pkg/**: Kode yang dapat diimpor oleh proyek lain.
- **api/**: Definisi API (protobuf, OpenAPI, dll.).
- **configs/**: File konfigurasi.
- **docs/**: Dokumentasi.
- **test/**: File testing tambahan.
- **scripts/**: Script untuk berbagai tugas.
- **build/**: File untuk packaging dan CI/CD.
- **deploy/**: Konfigurasi deployment.
- **.gitignore**: File yang diabaikan oleh Git.
- **README.md**: Dokumentasi proyek.
- **go.mod**: Definisi modul dan dependensi.
- **go.sum**: Checksum dependensi.

### Contoh Struktur Proyek
```
myproject/
├── cmd/
│   └── myapp/
│       └── main.go
├── internal/
│   ├── auth/
│   │   └── auth.go
│   └── database/
│       └── db.go
├── pkg/
│   └── utils/
│       └── helpers.go
├── api/
│   └── swagger.yaml
├── configs/
│   └── config.yaml
├── docs/
│   └── README.md
├── test/
│   └── integration_test.go
├── scripts/
│   └── build.sh
├── build/
│   └── Dockerfile
├── deploy/
│   └── kubernetes.yaml
├── .gitignore
├── README.md
├── go.mod
└── go.sum
```

## Go Modules

### Inisialisasi Modul
- **Perintah**: `go mod init [nama-modul]`
- **Nama modul**: Biasanya menggunakan path repositori (misal, `github.com/username/project`).
- **File go.mod**: Dibuat setelah inisialisasi, berisi informasi modul dan dependensi.

### Manajemen Dependensi
- **Menambah dependensi**: `go get [package]`
- **Memperbarui dependensi**: `go get -u [package]`
- **Membersihkan dependensi**: `go mod tidy`
- **Menggunakan versi spesifik**: `go get [package]@[version]`

### File go.mod
```go
module github.com/username/project

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/go-sql-driver/mysql v1.7.1
)

require (
    github.com/bytedance/sonic v1.10.2 // indirect
    github.com/chenzhuoyu/base64x v0.0.0-20230717121745-296ad89f973d // indirect
    // dependensi lain
)
```

## Kesimpulan

Memahami struktur program Golang adalah fondasi penting untuk pengembangan yang efektif. Dengan mengikuti konvensi dan best practice, kode Go menjadi lebih terorganisir, mudah dipelihara, dan sesuai dengan standar komunitas Go. 