# Package Management

Package management adalah sistem untuk mengelola dependensi dalam proyek Go. Sejak Go 1.11, Go Modules menjadi standar untuk package management. Memahami package management sangat penting untuk pengembangan proyek yang terstruktur dan maintainable.

## Go Modules

### Inisialisasi Module
- **go mod init**: Membuat file go.mod
- **Module path**: Biasanya menggunakan path repositori
- **Version**: Versi Go yang digunakan

```go
// Inisialisasi module
go mod init github.com/username/project

// File go.mod yang dihasilkan
module github.com/username/project

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/go-sql-driver/mysql v1.7.1
)
```

### Dependensi
- **go get**: Menambah dependensi
- **go mod tidy**: Membersihkan dependensi
- **go mod vendor**: Membuat vendor directory
- **go mod download**: Mengunduh dependensi

```bash
# Menambah dependensi
go get github.com/gin-gonic/gin

# Membersihkan dependensi
go mod tidy

# Membuat vendor directory
go mod vendor

# Mengunduh dependensi
go mod download
```

### Version Management
- **Semantic versioning**: Menggunakan versi semantik
- **Pseudo-versions**: Versi untuk commit spesifik
- **Replace directive**: Mengganti dependensi

```go
// File go.mod dengan version management
module github.com/username/project

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/go-sql-driver/mysql v1.7.1
)

// Replace directive
replace github.com/gin-gonic/gin => github.com/gin-gonic/gin v1.9.0
```

## Package Structure

### Layout Standar
- **cmd/**: Aplikasi utama
- **internal/**: Kode private
- **pkg/**: Kode yang dapat diimpor
- **api/**: Definisi API
- **configs/**: File konfigurasi
- **docs/**: Dokumentasi
- **test/**: File testing
- **scripts/**: Script utilitas
- **build/**: File build
- **deploy/**: File deployment

```
project/
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
├── go.mod
└── go.sum
```

### Package Naming
- **Konvensi**: Nama package harus lowercase
- **Singular**: Gunakan kata benda tunggal
- **Deskriptif**: Nama harus deskriptif
- **Scope**: Sesuaikan dengan scope package

```go
// Package naming
package auth      // Baik
package user      // Baik
package users     // Kurang baik
package authService // Kurang baik
```

## Import Path

### Import Rules
- **Absolute path**: Menggunakan path lengkap
- **Alias**: Menggunakan alias untuk package
- **Blank identifier**: Menggunakan _ untuk package yang tidak digunakan
- **Dot import**: Menggunakan . untuk mengimpor semua identifier

```go
// Import rules
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

// Dot import
import (
    . "fmt"
)
```

### Import Groups
- **Standard library**: Package bawaan Go
- **External packages**: Package dari luar
- **Internal packages**: Package dari proyek sendiri

```go
// Import groups
import (
    // Standard library
    "fmt"
    "time"

    // External packages
    "github.com/gin-gonic/gin"
    "github.com/go-sql-driver/mysql"

    // Internal packages
    "github.com/username/project/internal/auth"
    "github.com/username/project/pkg/utils"
)
```

## Dependency Management

### Version Constraints
- **Exact version**: Versi spesifik
- **Version range**: Range versi yang diizinkan
- **Latest version**: Versi terbaru
- **Pseudo-version**: Versi untuk commit spesifik

```go
// Version constraints
require (
    github.com/gin-gonic/gin v1.9.1
    github.com/go-sql-driver/mysql v1.7.1
    github.com/some/package v0.0.0-20230101000000-abcdef123456
)
```

### Dependency Updates
- **go get -u**: Update semua dependensi
- **go get -u package**: Update package spesifik
- **go get package@version**: Update ke versi spesifik

```bash
# Update semua dependensi
go get -u

# Update package spesifik
go get -u github.com/gin-gonic/gin

# Update ke versi spesifik
go get github.com/gin-gonic/gin@v1.9.1
```

### Vendor Directory
- **go mod vendor**: Membuat vendor directory
- **-mod=vendor**: Menggunakan vendor directory
- **Vendor management**: Mengelola dependensi lokal

```bash
# Membuat vendor directory
go mod vendor

# Build dengan vendor
go build -mod=vendor

# Update vendor
go mod vendor
```

## Best Practices

### Guidelines
- **Semantic versioning**: Gunakan versi semantik
- **Minimal dependencies**: Minimalkan jumlah dependensi
- **Security**: Periksa keamanan dependensi
- **Updates**: Update dependensi secara berkala
- **Documentation**: Dokumentasikan dependensi

```go
// Good dependency management
module github.com/username/project

go 1.21

require (
    // Core dependencies
    github.com/gin-gonic/gin v1.9.1
    github.com/go-sql-driver/mysql v1.7.1

    // Development dependencies
    github.com/golangci/golangci-lint v1.55.2 // indirect
    github.com/stretchr/testify v1.8.4 // indirect
)
```

### Security
- **go list -m all**: Melihat semua dependensi
- **go mod verify**: Verifikasi dependensi
- **go mod graph**: Melihat graph dependensi
- **go mod why**: Menjelaskan dependensi

```bash
# Melihat semua dependensi
go list -m all

# Verifikasi dependensi
go mod verify

# Melihat graph dependensi
go mod graph

# Menjelaskan dependensi
go mod why github.com/gin-gonic/gin
```

## Kesimpulan

Package management adalah aspek penting dalam pengembangan Go. Dengan memahami dan menggunakan sistem package management dengan baik, kita dapat mengelola dependensi dengan efektif dan membuat proyek yang lebih maintainable.