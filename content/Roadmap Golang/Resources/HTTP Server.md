# HTTP Server

HTTP Server adalah komponen dasar dalam pengembangan web dengan Go. Go menyediakan package `net/http` yang memungkinkan kita untuk membuat server HTTP dengan mudah dan efisien.

## Dasar HTTP Server

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

## Routing

Routing adalah proses menentukan bagaimana request HTTP ditangani berdasarkan URL dan method HTTP.

### Karakteristik Routing di Go
- **Simple Routing**: Routing sederhana dengan `http.HandleFunc` dan `http.Handle`
- **Custom Router**: Implementasi router kustom dengan `http.ServeMux`
- **Third-party Router**: Penggunaan router pihak ketiga seperti Gorilla Mux, Chi, dll.
- **Path Parameters**: Ekstraksi parameter dari path URL
- **Query Parameters**: Ekstraksi parameter dari query string

### Implementasi Routing
```go
// Routing sederhana
package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    // Mendefinisikan handler untuk berbagai route
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    
    http.HandleFunc("/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    })
    
    http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Users Page")
    })
    
    http.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "User Detail Page")
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// Routing dengan ServeMux
package main

import (
    "fmt"
    "log"
    "net/http"
    "strings"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    
    // Mendefinisikan handler untuk route "/about"
    mux.HandleFunc("/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    })
    
    // Mendefinisikan handler untuk route "/users"
    mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Cek apakah path memiliki trailing slash
        if strings.HasSuffix(r.URL.Path, "/") {
            // Jika ya, arahkan ke handler untuk user detail
            userID := strings.TrimSuffix(r.URL.Path, "/")
            userID = strings.TrimPrefix(userID, "/users/")
            fmt.Fprintf(w, "User Detail Page for ID: %s", userID)
            return
        }
        
        // Jika tidak, tampilkan halaman users
        fmt.Fprintf(w, "Users Page")
    })
    
    // Menjalankan server dengan mux
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Routing dengan Gorilla Mux
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    
    "github.com/gorilla/mux"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}

func main() {
    // Membuat router dengan Gorilla Mux
    router := mux.NewRouter()
    
    // Mendefinisikan handler untuk route "/"
    router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    }).Methods("GET")
    
    // Mendefinisikan handler untuk route "/users"
    router.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        users := []User{
            {ID: "1", Name: "John Doe"},
            {ID: "2", Name: "Jane Smith"},
        }
        
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(users)
    }).Methods("GET")
    
    // Mendefinisikan handler untuk route "/users/{id}"
    router.HandleFunc("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
        // Ekstrak parameter id dari path
        vars := mux.Vars(r)
        id := vars["id"]
        
        // Simulasi data user
        user := User{ID: id, Name: "User " + id}
        
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    }).Methods("GET")
    
    // Menjalankan server dengan router
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}

// Routing dengan Chi
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    
    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}

func main() {
    // Membuat router dengan Chi
    r := chi.NewRouter()
    
    // Menerapkan middleware
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    
    // Mendefinisikan handler untuk route "/"
    r.Get("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    
    // Mendefinisikan handler untuk route "/users"
    r.Get("/users", func(w http.ResponseWriter, r *http.Request) {
        users := []User{
            {ID: "1", Name: "John Doe"},
            {ID: "2", Name: "Jane Smith"},
        }
        
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(users)
    })
    
    // Mendefinisikan handler untuk route "/users/{id}"
    r.Get("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
        // Ekstrak parameter id dari path
        id := chi.URLParam(r, "id")
        
        // Simulasi data user
        user := User{ID: id, Name: "User " + id}
        
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    })
    
    // Menjalankan server dengan router
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", r))
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

## Request dan Response

Request dan Response adalah komponen dasar dalam komunikasi HTTP. Go menyediakan struct `http.Request` dan `http.ResponseWriter` untuk menangani request dan response.

### Karakteristik Request dan Response di Go
- **Request Parsing**: Parsing request body, query parameters, form data, dll.
- **Response Writing**: Menulis response body, header, status code, dll.
- **Content Negotiation**: Menangani berbagai format content (JSON, XML, dll.)
- **File Upload**: Menangani upload file
- **Streaming**: Menangani streaming data

### Implementasi Request dan Response
```go
// Request dan Response sederhana
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
        // Menulis response
        fmt.Fprintf(w, "Hello, World!")
    })
    
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

// Request dan Response dengan form
package main

import (
    "fmt"
    "html/template"
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
        tmpl := `
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
        `
        
        t := template.Must(template.New("form").Parse(tmpl))
        t.Execute(w, nil)
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
        tmpl := `
        <!DOCTYPE html>
        <html>
        <head>
            <title>User Saved</title>
        </head>
        <body>
            <h1>User Saved</h1>
            <p>Name: {{.Name}}</p>
            <p>Email: {{.Email}}</p>
            <a href="/">Back to Form</a>
        </body>
        </html>
        `
        
        t := template.Must(template.New("result").Parse(tmpl))
        t.Execute(w, user)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// Request dan Response dengan file upload
package main

import (
    "fmt"
    "html/template"
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
        tmpl := `
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
        `
        
        t := template.Must(template.New("upload").Parse(tmpl))
        t.Execute(w, nil)
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
        tmpl := `
        <!DOCTYPE html>
        <html>
        <head>
            <title>File Uploaded</title>
        </head>
        <body>
            <h1>File Uploaded</h1>
            <p>Filename: {{.Filename}}</p>
            <p>Size: {{.Size}} bytes</p>
            <a href="/">Back to Upload</a>
        </body>
        </html>
        `
        
        data := struct {
            Filename string
            Size     int64
        }{
            Filename: handler.Filename,
            Size:     handler.Size,
        }
        
        t := template.Must(template.New("result").Parse(tmpl))
        t.Execute(w, data)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

// Request dan Response dengan streaming
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

## Kesimpulan

HTTP Server adalah komponen dasar dalam pengembangan web dengan Go. Dengan memahami dan mengimplementasikan konsep-konsep seperti routing, middleware, dan request/response handling, kita dapat mengembangkan aplikasi web yang robust dan efisien. Go menyediakan package `net/http` yang memudahkan kita dalam membuat server HTTP, serta berbagai library pihak ketiga yang dapat memperluas fungsionalitas server HTTP.