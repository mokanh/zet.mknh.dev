# Web Security

Web security adalah aspek penting dalam pengembangan web yang memastikan aplikasi web aman dari berbagai serangan. Go menyediakan berbagai cara untuk mengamankan aplikasi web, seperti CORS, CSRF protection, XSS prevention, SQL injection prevention, dan input validation.

## CORS (Cross-Origin Resource Sharing)

CORS adalah mekanisme yang memungkinkan sumber daya web di satu domain diakses oleh aplikasi web di domain lain. CORS adalah fitur keamanan penting yang mencegah akses tidak sah ke sumber daya web.

### Karakteristik CORS di Go
- **Origin**: Domain yang diizinkan mengakses sumber daya
- **Methods**: Metode HTTP yang diizinkan
- **Headers**: Header HTTP yang diizinkan
- **Credentials**: Apakah kredensial diizinkan
- **Max Age**: Waktu maksimum cache preflight request

### Implementasi CORS
```go
// CORS middleware dasar
package main

import (
    "fmt"
    "log"
    "net/http"
)

// CORSMiddleware adalah middleware untuk CORS
func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header CORS
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        w.Header().Set("Access-Control-Max-Age", "3600")
        
        // Menangani preflight request
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
    })
}

// CORSMiddlewareWithConfig adalah middleware CORS dengan konfigurasi
func CORSMiddlewareWithConfig(config CORSConfig) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Mengatur header CORS
            w.Header().Set("Access-Control-Allow-Origin", config.AllowOrigin)
            w.Header().Set("Access-Control-Allow-Methods", config.AllowMethods)
            w.Header().Set("Access-Control-Allow-Headers", config.AllowHeaders)
            w.Header().Set("Access-Control-Max-Age", config.MaxAge)
            
            if config.AllowCredentials {
                w.Header().Set("Access-Control-Allow-Credentials", "true")
            }
            
            // Menangani preflight request
            if r.Method == "OPTIONS" {
                w.WriteHeader(http.StatusOK)
                return
            }
            
            // Memanggil handler berikutnya
            next.ServeHTTP(w, r)
        })
    }
}

// CORSConfig adalah konfigurasi untuk CORS
type CORSConfig struct {
    AllowOrigin      string
    AllowMethods     string
    AllowHeaders     string
    AllowCredentials bool
    MaxAge           string
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, CORS!")
    })
    
    // Mendefinisikan handler untuk route "/api"
    mux.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, API!")
    })
    
    // Membuat konfigurasi CORS
    corsConfig := CORSConfig{
        AllowOrigin:      "http://localhost:3000",
        AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
        AllowHeaders:     "Content-Type, Authorization",
        AllowCredentials: true,
        MaxAge:           "3600",
    }
    
    // Membuat handler dengan middleware CORS
    handler := CORSMiddlewareWithConfig(corsConfig)(mux)
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## CSRF Protection (Cross-Site Request Forgery)

CSRF adalah serangan yang memaksa pengguna untuk melakukan tindakan yang tidak diinginkan pada aplikasi web yang mereka percayai. CSRF protection adalah mekanisme untuk mencegah serangan CSRF.

### Karakteristik CSRF Protection di Go
- **Token Generation**: Pembuatan token CSRF
- **Token Validation**: Validasi token CSRF
- **Token Storage**: Penyimpanan token CSRF
- **Token Expiration**: Kadaluarsa token CSRF
- **Token Rotation**: Rotasi token CSRF

### Implementasi CSRF Protection
```go
// CSRF protection dasar
package main

import (
    "crypto/rand"
    "encoding/base64"
    "fmt"
    "log"
    "net/http"
    "sync"
    "time"
)

// CSRFMiddleware adalah middleware untuk CSRF protection
func CSRFMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Mengabaikan metode GET, HEAD, OPTIONS
        if r.Method == "GET" || r.Method == "HEAD" || r.Method == "OPTIONS" {
            next.ServeHTTP(w, r)
            return
        }
        
        // Mengambil token CSRF dari header
        token := r.Header.Get("X-CSRF-Token")
        if token == "" {
            http.Error(w, "CSRF token missing", http.StatusForbidden)
            return
        }
        
        // Mengambil token CSRF dari cookie
        cookie, err := r.Cookie("csrf_token")
        if err != nil {
            http.Error(w, "CSRF token missing", http.StatusForbidden)
            return
        }
        
        // Memvalidasi token CSRF
        if token != cookie.Value {
            http.Error(w, "CSRF token invalid", http.StatusForbidden)
            return
        }
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
    })
}

// CSRFMiddlewareWithStore adalah middleware CSRF dengan store
func CSRFMiddlewareWithStore(store *CSRFStore) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Mengabaikan metode GET, HEAD, OPTIONS
            if r.Method == "GET" || r.Method == "HEAD" || r.Method == "OPTIONS" {
                next.ServeHTTP(w, r)
                return
            }
            
            // Mengambil token CSRF dari header
            token := r.Header.Get("X-CSRF-Token")
            if token == "" {
                http.Error(w, "CSRF token missing", http.StatusForbidden)
                return
            }
            
            // Memvalidasi token CSRF
            if !store.ValidateToken(token) {
                http.Error(w, "CSRF token invalid", http.StatusForbidden)
                return
            }
            
            // Memanggil handler berikutnya
            next.ServeHTTP(w, r)
        })
    }
}

// CSRFStore adalah struct untuk menyimpan token CSRF
type CSRFStore struct {
    tokens map[string]time.Time
    mu     sync.RWMutex
}

// NewCSRFStore membuat CSRFStore baru
func NewCSRFStore() *CSRFStore {
    return &CSRFStore{
        tokens: make(map[string]time.Time),
    }
}

// GenerateToken menghasilkan token CSRF baru
func (s *CSRFStore) GenerateToken() string {
    // Membuat token acak
    b := make([]byte, 32)
    rand.Read(b)
    token := base64.URLEncoding.EncodeToString(b)
    
    // Menyimpan token
    s.mu.Lock()
    s.tokens[token] = time.Now().Add(24 * time.Hour)
    s.mu.Unlock()
    
    return token
}

// ValidateToken memvalidasi token CSRF
func (s *CSRFStore) ValidateToken(token string) bool {
    s.mu.RLock()
    expires, ok := s.tokens[token]
    s.mu.RUnlock()
    
    if !ok {
        return false
    }
    
    if time.Now().After(expires) {
        s.mu.Lock()
        delete(s.tokens, token)
        s.mu.Unlock()
        return false
    }
    
    return true
}

// CleanupTokens membersihkan token yang kadaluarsa
func (s *CSRFStore) CleanupTokens() {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    now := time.Now()
    for token, expires := range s.tokens {
        if now.After(expires) {
            delete(s.tokens, token)
        }
    }
}

func main() {
    // Membuat CSRF store
    csrfStore := NewCSRFStore()
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menghasilkan token CSRF
        token := csrfStore.GenerateToken()
        
        // Membuat cookie
        http.SetCookie(w, &http.Cookie{
            Name:     "csrf_token",
            Value:    token,
            Path:     "/",
            Expires:  time.Now().Add(24 * time.Hour),
            HttpOnly: true,
            Secure:   true,
        })
        
        // Menampilkan form dengan token CSRF
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>CSRF Protection</title>
</head>
<body>
    <h1>CSRF Protection</h1>
    <form action="/submit" method="POST">
        <input type="hidden" name="csrf_token" value="%s">
        <input type="text" name="message" placeholder="Enter a message">
        <button type="submit">Submit</button>
    </form>
    <script>
        // Menambahkan token CSRF ke header
        document.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-Token': document.querySelector('input[name="csrf_token"]').value
                },
                body: new URLSearchParams(new FormData(this))
            })
            .then(response => response.text())
            .then(text => alert(text))
            .catch(error => alert('Error: ' + error));
        });
    </script>
</body>
</html>
`, token)
    })
    
    // Mendefinisikan handler untuk route "/submit"
    mux.HandleFunc("/submit", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Message submitted successfully!")
    })
    
    // Membuat handler dengan middleware CSRF
    handler := CSRFMiddlewareWithStore(csrfStore)(mux)
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## XSS Prevention (Cross-Site Scripting)

XSS adalah serangan yang memungkinkan penyerang menyuntikkan kode JavaScript berbahaya ke halaman web. XSS prevention adalah mekanisme untuk mencegah serangan XSS.

### Karakteristik XSS Prevention di Go
- **Input Sanitization**: Membersihkan input dari kode berbahaya
- **Output Encoding**: Mengkodekan output untuk mencegah eksekusi kode
- **Content Security Policy**: Kebijakan keamanan konten
- **HttpOnly Cookies**: Cookie yang tidak dapat diakses oleh JavaScript
- **SameSite Cookies**: Cookie yang hanya dikirim ke situs yang sama

### Implementasi XSS Prevention
```go
// XSS prevention dasar
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
    "strings"
)

// SanitizeInput membersihkan input dari kode berbahaya
func SanitizeInput(input string) string {
    // Mengganti karakter berbahaya
    input = strings.ReplaceAll(input, "<", "&lt;")
    input = strings.ReplaceAll(input, ">", "&gt;")
    input = strings.ReplaceAll(input, "\"", "&quot;")
    input = strings.ReplaceAll(input, "'", "&#39;")
    input = strings.ReplaceAll(input, "&", "&amp;")
    
    return input
}

// XSSMiddleware adalah middleware untuk XSS prevention
func XSSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header Content-Security-Policy
        w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';")
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
    })
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>XSS Prevention</title>
</head>
<body>
    <h1>XSS Prevention</h1>
    <form action="/submit" method="POST">
        <input type="text" name="message" placeholder="Enter a message">
        <button type="submit">Submit</button>
    </form>
</body>
</html>
`)
    })
    
    // Mendefinisikan handler untuk route "/submit"
    mux.HandleFunc("/submit", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil pesan dari form
        message := r.FormValue("message")
        
        // Membersihkan pesan
        message = SanitizeInput(message)
        
        // Menampilkan pesan
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>XSS Prevention</title>
</head>
<body>
    <h1>XSS Prevention</h1>
    <p>Your message: %s</p>
    <a href="/">Back</a>
</body>
</html>
`, message)
    })
    
    // Membuat handler dengan middleware XSS
    handler := XSSMiddleware(mux)
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## SQL Injection Prevention

SQL injection adalah serangan yang memungkinkan penyerang menyuntikkan kode SQL berbahaya ke query database. SQL injection prevention adalah mekanisme untuk mencegah serangan SQL injection.

### Karakteristik SQL Injection Prevention di Go
- **Parameterized Queries**: Query dengan parameter
- **Input Validation**: Validasi input
- **Escaping**: Escape karakter berbahaya
- **ORM**: Object-Relational Mapping
- **Query Builder**: Pembangun query

### Implementasi SQL Injection Prevention
```go
// SQL injection prevention dasar
package main

import (
    "database/sql"
    "fmt"
    "log"
    "net/http"
    "regexp"
    _ "github.com/mattn/go-sqlite3"
)

// ValidateInput memvalidasi input
func ValidateInput(input string) bool {
    // Membuat regex untuk validasi
    pattern := regexp.MustCompile(`^[a-zA-Z0-9\s]+$`)
    
    // Memvalidasi input
    return pattern.MatchString(input)
}

// EscapeInput membersihkan input dari karakter berbahaya
func EscapeInput(input string) string {
    // Mengganti karakter berbahaya
    input = strings.ReplaceAll(input, "'", "''")
    input = strings.ReplaceAll(input, "\"", "\"\"")
    input = strings.ReplaceAll(input, ";", "")
    input = strings.ReplaceAll(input, "--", "")
    input = strings.ReplaceAll(input, "/*", "")
    input = strings.ReplaceAll(input, "*/", "")
    input = strings.ReplaceAll(input, "xp_", "")
    
    return input
}

func main() {
    // Membuka koneksi database
    db, err := sql.Open("sqlite3", "users.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Membuat tabel users
    _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>SQL Injection Prevention</title>
</head>
<body>
    <h1>SQL Injection Prevention</h1>
    <form action="/login" method="POST">
        <input type="text" name="username" placeholder="Username">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Login</button>
    </form>
</body>
</html>
`)
    })
    
    // Mendefinisikan handler untuk route "/login"
    mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil username dan password dari form
        username := r.FormValue("username")
        password := r.FormValue("password")
        
        // Memvalidasi input
        if !ValidateInput(username) || !ValidateInput(password) {
            http.Error(w, "Invalid input", http.StatusBadRequest)
            return
        }
        
        // Membersihkan input
        username = EscapeInput(username)
        password = EscapeInput(password)
        
        // Menggunakan parameterized query
        var id int
        err := db.QueryRow("SELECT id FROM users WHERE username = ? AND password = ?", username, password).Scan(&id)
        if err != nil {
            if err == sql.ErrNoRows {
                http.Error(w, "Invalid username or password", http.StatusUnauthorized)
                return
            }
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Menampilkan pesan sukses
        fmt.Fprintf(w, "Login successful! User ID: %d", id)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Input Validation

Input validation adalah proses memvalidasi input pengguna untuk memastikan input tersebut aman dan sesuai dengan format yang diharapkan. Input validation adalah mekanisme penting untuk mencegah berbagai serangan, seperti XSS, SQL injection, dan command injection.

### Karakteristik Input Validation di Go
- **Type Validation**: Validasi tipe data
- **Format Validation**: Validasi format
- **Range Validation**: Validasi rentang
- **Length Validation**: Validasi panjang
- **Pattern Validation**: Validasi pola

### Implementasi Input Validation
```go
// Input validation dasar
package main

import (
    "fmt"
    "log"
    "net/http"
    "regexp"
    "strconv"
)

// Validator adalah struct untuk validasi
type Validator struct {
    errors map[string]string
}

// NewValidator membuat Validator baru
func NewValidator() *Validator {
    return &Validator{
        errors: make(map[string]string),
    }
}

// ValidateString memvalidasi string
func (v *Validator) ValidateString(value, field string, rules map[string]interface{}) bool {
    // Validasi required
    if required, ok := rules["required"].(bool); ok && required {
        if value == "" {
            v.errors[field] = field + " is required"
            return false
        }
    }
    
    // Validasi min length
    if min, ok := rules["min"].(int); ok {
        if len(value) < min {
            v.errors[field] = field + " must be at least " + strconv.Itoa(min) + " characters"
            return false
        }
    }
    
    // Validasi max length
    if max, ok := rules["max"].(int); ok {
        if len(value) > max {
            v.errors[field] = field + " must be at most " + strconv.Itoa(max) + " characters"
            return false
        }
    }
    
    // Validasi pattern
    if pattern, ok := rules["pattern"].(string); ok {
        regex := regexp.MustCompile(pattern)
        if !regex.MatchString(value) {
            v.errors[field] = field + " is invalid"
            return false
        }
    }
    
    return true
}

// ValidateInt memvalidasi integer
func (v *Validator) ValidateInt(value, field string, rules map[string]interface{}) bool {
    // Validasi required
    if required, ok := rules["required"].(bool); ok && required {
        if value == 0 {
            v.errors[field] = field + " is required"
            return false
        }
    }
    
    // Validasi min
    if min, ok := rules["min"].(int); ok {
        if value < min {
            v.errors[field] = field + " must be at least " + strconv.Itoa(min)
            return false
        }
    }
    
    // Validasi max
    if max, ok := rules["max"].(int); ok {
        if value > max {
            v.errors[field] = field + " must be at most " + strconv.Itoa(max)
            return false
        }
    }
    
    return true
}

// ValidateEmail memvalidasi email
func (v *Validator) ValidateEmail(value, field string) bool {
    // Validasi required
    if value == "" {
        v.errors[field] = field + " is required"
        return false
    }
    
    // Validasi pattern
    regex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
    if !regex.MatchString(value) {
        v.errors[field] = field + " is invalid"
        return false
    }
    
    return true
}

// ValidateURL memvalidasi URL
func (v *Validator) ValidateURL(value, field string) bool {
    // Validasi required
    if value == "" {
        v.errors[field] = field + " is required"
        return false
    }
    
    // Validasi pattern
    regex := regexp.MustCompile(`^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$`)
    if !regex.MatchString(value) {
        v.errors[field] = field + " is invalid"
        return false
    }
    
    return true
}

// HasErrors mengembalikan apakah ada error
func (v *Validator) HasErrors() bool {
    return len(v.errors) > 0
}

// GetErrors mengembalikan error
func (v *Validator) GetErrors() map[string]string {
    return v.errors
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>Input Validation</title>
</head>
<body>
    <h1>Input Validation</h1>
    <form action="/validate" method="POST">
        <div>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name">
        </div>
        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email">
        </div>
        <div>
            <label for="age">Age:</label>
            <input type="number" id="age" name="age">
        </div>
        <div>
            <label for="website">Website:</label>
            <input type="url" id="website" name="website">
        </div>
        <button type="submit">Submit</button>
    </form>
</body>
</html>
`)
    })
    
    // Mendefinisikan handler untuk route "/validate"
    mux.HandleFunc("/validate", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil input dari form
        name := r.FormValue("name")
        email := r.FormValue("email")
        ageStr := r.FormValue("age")
        website := r.FormValue("website")
        
        // Mengkonversi age ke integer
        age, err := strconv.Atoi(ageStr)
        if err != nil {
            age = 0
        }
        
        // Membuat validator
        validator := NewValidator()
        
        // Memvalidasi name
        validator.ValidateString(name, "Name", map[string]interface{}{
            "required": true,
            "min":      2,
            "max":      50,
            "pattern":  `^[a-zA-Z\s]+$`,
        })
        
        // Memvalidasi email
        validator.ValidateEmail(email, "Email")
        
        // Memvalidasi age
        validator.ValidateInt(age, "Age", map[string]interface{}{
            "required": true,
            "min":      18,
            "max":      100,
        })
        
        // Memvalidasi website
        validator.ValidateURL(website, "Website")
        
        // Menampilkan hasil validasi
        if validator.HasErrors() {
            fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>Input Validation</title>
</head>
<body>
    <h1>Input Validation</h1>
    <h2>Errors:</h2>
    <ul>
`)
            
            for field, message := range validator.GetErrors() {
                fmt.Fprintf(w, "<li>%s: %s</li>", field, message)
            }
            
            fmt.Fprintf(w, `
    </ul>
    <a href="/">Back</a>
</body>
</html>
`)
            return
        }
        
        // Menampilkan pesan sukses
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>Input Validation</title>
</head>
<body>
    <h1>Input Validation</h1>
    <h2>Success!</h2>
    <p>Name: %s</p>
    <p>Email: %s</p>
    <p>Age: %d</p>
    <p>Website: %s</p>
    <a href="/">Back</a>
</body>
</html>
`, name, email, age, website)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Kesimpulan

Web security adalah aspek penting dalam pengembangan web yang memastikan aplikasi web aman dari berbagai serangan. Go menyediakan berbagai cara untuk mengamankan aplikasi web, seperti CORS, CSRF protection, XSS prevention, SQL injection prevention, dan input validation.

Dengan memahami dan mengimplementasikan konsep-konsep seperti CORS, CSRF protection, XSS prevention, SQL injection prevention, dan input validation, kita dapat mengembangkan aplikasi web yang aman dari berbagai serangan. Pilihan metode web security yang tepat tergantung pada kebutuhan aplikasi dan kompleksitas data yang disimpan. 