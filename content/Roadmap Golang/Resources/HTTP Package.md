# HTTP Package

HTTP Package adalah package bawaan Go yang menyediakan implementasi client dan server HTTP. Package ini merupakan fondasi untuk pengembangan web di Go dan menyediakan API yang sederhana namun powerful untuk menangani request dan response HTTP. [[HTTP Server]]

## HTTP Server Basics

### Karakteristik HTTP Server di Go
- **Built-in Package**: Menggunakan package `net/http` bawaan Go
- **Concurrent**: Menangani request secara konkuren menggunakan goroutines
- **Simple API**: API yang sederhana dan mudah digunakan
- **High Performance**: Performa tinggi untuk menangani request HTTP
- **Extensible**: Mudah diperluas dengan middleware dan routing

### Implementasi HTTP Server Dasar
```go
// HTTP Server sederhana
package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    // Mendefinisikan handler untuk route "/"
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, World!")
    })
    
    // Mendefinisikan handler untuk route "/about"
    http.HandleFunc("/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    })
    
    // Menjalankan server pada port 8080
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// HTTP Server dengan custom handler
package main

import (
    "fmt"
    "log"
    "net/http"
)

// CustomHandler adalah struct yang mengimplementasikan http.Handler
type CustomHandler struct{}

// ServeHTTP mengimplementasikan method dari interface http.Handler
func (h *CustomHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    switch r.URL.Path {
    case "/":
        fmt.Fprintf(w, "Home Page")
    case "/about":
        fmt.Fprintf(w, "About Page")
    case "/contact":
        fmt.Fprintf(w, "Contact Page")
    default:
        http.NotFound(w, r)
    }
}

func main() {
    // Membuat instance dari CustomHandler
    handler := &CustomHandler{}
    
    // Menjalankan server dengan custom handler
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}

// HTTP Server dengan middleware
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

// LoggingMiddleware adalah middleware untuk logging
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
        
        // Logging setelah request selesai
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

// AuthMiddleware adalah middleware untuk autentikasi
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Cek apakah request memiliki header Authorization
        if r.Header.Get("Authorization") != "Bearer secret-token" {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
        
        // Memanggil handler berikutnya jika autentikasi berhasil
        next.ServeHTTP(w, r)
    })
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    
    // Mendefinisikan handler untuk route "/api"
    mux.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "API Page")
    })
    
    // Menerapkan middleware
    handler := LoggingMiddleware(AuthMiddleware(mux))
    
    // Menjalankan server dengan middleware
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## Request Handling

Request handling adalah proses menangani request HTTP yang diterima oleh server. Go menyediakan struct `http.Request` yang berisi informasi tentang request.

### Karakteristik Request Handling di Go
- **Request Parsing**: Parsing request body, query parameters, form data, dll.
- **Method Handling**: Menangani berbagai method HTTP (GET, POST, PUT, DELETE, dll.)
- **Header Access**: Mengakses header request
- **Cookie Access**: Mengakses cookie request
- **Remote Address**: Mendapatkan alamat IP client

### Implementasi Request Handling
```go
// Request handling sederhana
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}

func main() {
    // Mendefinisikan handler untuk route "/users"
    http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Menangani berbagai method HTTP
        switch r.Method {
        case "GET":
            // Mengambil query parameter
            id := r.URL.Query().Get("id")
            if id != "" {
                // Simulasi data user
                user := User{ID: id, Name: "User " + id}
                
                // Menulis response JSON
                w.Header().Set("Content-Type", "application/json")
                json.NewEncoder(w).Encode(user)
                return
            }
            
            // Simulasi data users
            users := []User{
                {ID: "1", Name: "John Doe"},
                {ID: "2", Name: "Jane Smith"},
            }
            
            // Menulis response JSON
            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(users)
            
        case "POST":
            // Membaca request body
            var user User
            if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
                http.Error(w, err.Error(), http.StatusBadRequest)
                return
            }
            
            // Simulasi menyimpan user
            fmt.Printf("User saved: %+v\n", user)
            
            // Menulis response
            w.WriteHeader(http.StatusCreated)
            fmt.Fprintf(w, "User created")
            
        default:
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// Request handling dengan form
package main

import (
    "fmt"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    Name  string
    Email string
}

func main() {
    // Mendefinisikan handler untuk route "/"
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        fmt.Fprintf(w, `
        <!DOCTYPE html>
        <html>
        <head>
            <title>User Form</title>
        </head>
        <body>
            <h1>User Form</h1>
            <form action="/submit" method="POST">
                <div>
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div>
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <button type="submit">Submit</button>
            </form>
        </body>
        </html>
        `)
    })
    
    // Mendefinisikan handler untuk route "/submit"
    http.HandleFunc("/submit", func(w http.ResponseWriter, r *http.Request) {
        // Hanya menerima method POST
        if r.Method != "POST" {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Parsing form data
        if err := r.ParseForm(); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        
        // Mengambil form data
        name := r.FormValue("name")
        email := r.FormValue("email")
        
        // Simulasi menyimpan user
        user := User{Name: name, Email: email}
        fmt.Printf("User saved: %+v\n", user)
        
        // Menampilkan hasil
        fmt.Fprintf(w, `
        <!DOCTYPE html>
        <html>
        <head>
            <title>User Saved</title>
        </head>
        <body>
            <h1>User Saved</h1>
            <p>Name: %s</p>
            <p>Email: %s</p>
            <a href="/">Back to Form</a>
        </body>
        </html>
        `, user.Name, user.Email)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// Request handling dengan file upload
package main

import (
    "fmt"
    "io"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

func main() {
    // Mendefinisikan handler untuk route "/"
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form upload
        fmt.Fprintf(w, `
        <!DOCTYPE html>
        <html>
        <head>
            <title>File Upload</title>
        </head>
        <body>
            <h1>File Upload</h1>
            <form action="/upload" method="POST" enctype="multipart/form-data">
                <div>
                    <label for="file">File:</label>
                    <input type="file" id="file" name="file" required>
                </div>
                <button type="submit">Upload</button>
            </form>
        </body>
        </html>
        `)
    })
    
    // Mendefinisikan handler untuk route "/upload"
    http.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
        // Hanya menerima method POST
        if r.Method != "POST" {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Membatasi ukuran file
        r.ParseMultipartForm(10 << 20) // 10 MB
        
        // Mengambil file dari form
        file, handler, err := r.FormFile("file")
        if err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        defer file.Close()
        
        // Membuat direktori uploads jika belum ada
        if err := os.MkdirAll("uploads", 0755); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Membuat file baru
        dst, err := os.Create(filepath.Join("uploads", handler.Filename))
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        defer dst.Close()
        
        // Menyalin file
        if _, err := io.Copy(dst, file); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Menampilkan hasil
        fmt.Fprintf(w, `
        <!DOCTYPE html>
        <html>
        <head>
            <title>File Uploaded</title>
        </head>
        <body>
            <h1>File Uploaded</h1>
            <p>Filename: %s</p>
            <p>Size: %d bytes</p>
            <a href="/">Back to Upload</a>
        </body>
        </html>
        `, handler.Filename, handler.Size)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Response Writing

Response writing adalah proses menulis response HTTP yang akan dikirim ke client. Go menyediakan interface `http.ResponseWriter` untuk menulis response.

### Karakteristik Response Writing di Go
- **Response Types**: Menulis berbagai tipe response (text, HTML, JSON, dll.)
- **Status Codes**: Mengatur status code response
- **Headers**: Mengatur header response
- **Cookies**: Mengatur cookie response
- **Streaming**: Menulis response secara streaming

### Implementasi Response Writing
```go
// Response writing sederhana
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}

func main() {
    // Mendefinisikan handler untuk route "/"
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menulis response text
        fmt.Fprintf(w, "Hello, World!")
    })
    
    // Mendefinisikan handler untuk route "/html"
    http.HandleFunc("/html", func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header Content-Type
        w.Header().Set("Content-Type", "text/html; charset=utf-8")
        
        // Menulis response HTML
        fmt.Fprintf(w, `
        <!DOCTYPE html>
        <html>
        <head>
            <title>HTML Response</title>
        </head>
        <body>
            <h1>HTML Response</h1>
            <p>This is an HTML response.</p>
        </body>
        </html>
        `)
    })
    
    // Mendefinisikan handler untuk route "/json"
    http.HandleFunc("/json", func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header Content-Type
        w.Header().Set("Content-Type", "application/json")
        
        // Menulis response JSON
        users := []User{
            {ID: "1", Name: "John Doe"},
            {ID: "2", Name: "Jane Smith"},
        }
        
        json.NewEncoder(w).Encode(users)
    })
    
    // Mendefinisikan handler untuk route "/status"
    http.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
        // Mengatur status code
        w.WriteHeader(http.StatusTeapot)
        
        // Menulis response
        fmt.Fprintf(w, "I'm a teapot")
    })
    
    // Mendefinisikan handler untuk route "/cookie"
    http.HandleFunc("/cookie", func(w http.ResponseWriter, r *http.Request) {
        // Mengatur cookie
        http.SetCookie(w, &http.Cookie{
            Name:  "session",
            Value: "abc123",
            Path:  "/",
        })
        
        // Menulis response
        fmt.Fprintf(w, "Cookie set")
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// Response writing dengan streaming
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func main() {
    // Mendefinisikan handler untuk route "/stream"
    http.HandleFunc("/stream", func(w http.ResponseWriter, r *http.Request) {
        // Set header untuk streaming
        w.Header().Set("Content-Type", "text/event-stream")
        w.Header().Set("Cache-Control", "no-cache")
        w.Header().Set("Connection", "keep-alive")
        w.Header().Set("Access-Control-Allow-Origin", "*")
        
        // Membuat channel untuk menutup koneksi
        closeChan := w.(http.CloseNotifier).CloseNotify()
        
        // Mengirim data secara periodik
        for i := 0; i < 10; i++ {
            select {
            case <-closeChan:
                // Koneksi ditutup oleh client
                return
            default:
                // Mengirim data
                fmt.Fprintf(w, "data: %d\n\n", i)
                w.(http.Flusher).Flush()
                
                // Menunggu sebentar
                time.Sleep(1 * time.Second)
            }
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Middleware

Middleware adalah fungsi yang dijalankan sebelum atau sesudah handler utama, memungkinkan kita untuk melakukan preprocessing atau postprocessing pada request.

### Karakteristik Middleware di Go
- **Chainable**: Middleware dapat dirantai satu sama lain
- **Order Matters**: Urutan middleware penting
- **Request Modification**: Dapat memodifikasi request sebelum mencapai handler
- **Response Modification**: Dapat memodifikasi response sebelum dikirim ke client
- **Early Return**: Dapat menghentikan request sebelum mencapai handler

### Implementasi Middleware
```go
// Middleware sederhana
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

// LoggingMiddleware adalah middleware untuk logging
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
        
        // Logging setelah request selesai
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

// AuthMiddleware adalah middleware untuk autentikasi
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Cek apakah request memiliki header Authorization
        if r.Header.Get("Authorization") != "Bearer secret-token" {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
        
        // Memanggil handler berikutnya jika autentikasi berhasil
        next.ServeHTTP(w, r)
    })
}

// CORSMiddleware adalah middleware untuk CORS
func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Set header CORS
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        // Handle preflight request
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
    })
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    
    // Mendefinisikan handler untuk route "/api"
    mux.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "API Page")
    })
    
    // Menerapkan middleware
    handler := LoggingMiddleware(AuthMiddleware(CORSMiddleware(mux)))
    
    // Menjalankan server dengan middleware
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}

// Middleware dengan context
package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "time"
)

// ContextKey adalah tipe untuk key context
type ContextKey string

// UserKey adalah key untuk menyimpan user di context
const UserKey ContextKey = "user"

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
}

// AuthMiddleware adalah middleware untuk autentikasi
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Cek apakah request memiliki header Authorization
        token := r.Header.Get("Authorization")
        if token != "Bearer secret-token" {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
        
        // Simulasi user dari token
        user := User{ID: "1", Name: "John Doe"}
        
        // Menyimpan user di context
        ctx := context.WithValue(r.Context(), UserKey, user)
        
        // Memanggil handler berikutnya dengan context baru
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// UserMiddleware adalah middleware untuk mengambil user dari context
func UserMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Mengambil user dari context
        user, ok := r.Context().Value(UserKey).(User)
        if !ok {
            http.Error(w, "User not found", http.StatusUnauthorized)
            return
        }
        
        // Log user
        log.Printf("User: %s", user.Name)
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
    })
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil user dari context
        user, ok := r.Context().Value(UserKey).(User)
        if !ok {
            http.Error(w, "User not found", http.StatusUnauthorized)
            return
        }
        
        fmt.Fprintf(w, "Hello, %s!", user.Name)
    })
    
    // Menerapkan middleware
    handler := AuthMiddleware(UserMiddleware(mux))
    
    // Menjalankan server dengan middleware
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}

// Middleware dengan timeout
package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "time"
)

// TimeoutMiddleware adalah middleware untuk timeout
func TimeoutMiddleware(timeout time.Duration) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Membuat context dengan timeout
            ctx, cancel := context.WithTimeout(r.Context(), timeout)
            defer cancel()
            
            // Membuat channel untuk menandakan selesai
            done := make(chan struct{})
            
            // Menjalankan handler di goroutine
            go func() {
                next.ServeHTTP(w, r.WithContext(ctx))
                close(done)
            }()
            
            // Menunggu handler selesai atau timeout
            select {
            case <-done:
                // Handler selesai
            case <-ctx.Done():
                // Timeout
                http.Error(w, "Request timeout", http.StatusGatewayTimeout)
            }
        })
    }
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Simulasi operasi yang memakan waktu
        time.Sleep(2 * time.Second)
        fmt.Fprintf(w, "Home Page")
    })
    
    // Menerapkan middleware
    handler := TimeoutMiddleware(1 * time.Second)(mux)
    
    // Menjalankan server dengan middleware
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## Static File Serving

Static file serving adalah proses menyajikan file statis (HTML, CSS, JavaScript, gambar, dll.) kepada client. Go menyediakan `http.FileServer` untuk menyajikan file statis.

### Karakteristik Static File Serving di Go
- **File System**: Menggunakan file system lokal untuk menyimpan file statis
- **MIME Types**: Mendukung berbagai tipe MIME
- **Directory Listing**: Dapat menampilkan daftar file dalam direktori
- **Security**: Dapat membatasi akses ke file tertentu
- **Caching**: Dapat mengatur header cache untuk file statis

### Implementasi Static File Serving
```go
// Static file serving sederhana
package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    // Membuat file server untuk direktori "static"
    fs := http.FileServer(http.Dir("static"))
    
    // Mendefinisikan handler untuk route "/static/"
    http.Handle("/static/", http.StripPrefix("/static/", fs))
    
    // Mendefinisikan handler untuk route "/"
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Static File Serving</title>
            <link rel="stylesheet" href="/static/css/style.css">
        </head>
        <body>
            <h1>Static File Serving</h1>
            <p>This page uses static files.</p>
            <img src="/static/img/logo.png" alt="Logo">
            <script src="/static/js/script.js"></script>
        </body>
        </html>
        `)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// Static file serving dengan custom file system
package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

// CustomFileSystem adalah file system kustom
type CustomFileSystem struct {
    fs http.FileSystem
}

// Open adalah method untuk membuka file
func (cfs *CustomFileSystem) Open(name string) (http.File, error) {
    f, err := cfs.fs.Open(name)
    if err != nil {
        return nil, err
    }
    
    return &CustomFile{f}, nil
}

// CustomFile adalah file kustom
type CustomFile struct {
    http.File
}

// Readdir adalah method untuk membaca direktori
func (cf *CustomFile) Readdir(count int) ([]os.FileInfo, error) {
    // Nonaktifkan directory listing
    return nil, nil
}

func main() {
    // Membuat file server dengan file system kustom
    fs := &CustomFileSystem{http.Dir("static")}
    
    // Mendefinisikan handler untuk route "/static/"
    http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(fs)))
    
    // Mendefinisikan handler untuk route "/"
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Static File Serving</title>
            <link rel="stylesheet" href="/static/css/style.css">
        </head>
        <body>
            <h1>Static File Serving</h1>
            <p>This page uses static files.</p>
            <img src="/static/img/logo.png" alt="Logo">
            <script src="/static/js/script.js"></script>
        </body>
        </html>
        `)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// Static file serving dengan caching
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

// CacheControlMiddleware adalah middleware untuk mengatur header cache
func CacheControlMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Set header cache
        w.Header().Set("Cache-Control", "public, max-age=3600")
        w.Header().Set("Expires", time.Now().Add(1*time.Hour).Format(time.RFC1123))
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
    })
}

func main() {
    // Membuat file server untuk direktori "static"
    fs := http.FileServer(http.Dir("static"))
    
    // Mendefinisikan handler untuk route "/static/"
    http.Handle("/static/", CacheControlMiddleware(http.StripPrefix("/static/", fs)))
    
    // Mendefinisikan handler untuk route "/"
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Static File Serving</title>
            <link rel="stylesheet" href="/static/css/style.css">
        </head>
        <body>
            <h1>Static File Serving</h1>
            <p>This page uses static files.</p>
            <img src="/static/img/logo.png" alt="Logo">
            <script src="/static/js/script.js"></script>
        </body>
        </html>
        `)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Kesimpulan

HTTP Package adalah fondasi untuk pengembangan web di Go. Dengan memahami dan mengimplementasikan konsep-konsep seperti HTTP server basics, request handling, response writing, middleware, dan static file serving, kita dapat mengembangkan aplikasi web yang robust dan efisien. Go menyediakan API yang sederhana dan mudah digunakan, serta performa yang tinggi untuk menangani request HTTP. 