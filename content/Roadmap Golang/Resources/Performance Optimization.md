# Performance Optimization

Performance optimization adalah proses meningkatkan kinerja aplikasi web untuk memberikan pengalaman pengguna yang lebih baik. Go menyediakan berbagai cara untuk mengoptimalkan kinerja aplikasi web, seperti caching, compression, connection pooling, load balancing, dan CDN integration.

## Caching

Caching adalah teknik untuk menyimpan data yang sering diakses di memori untuk mengurangi waktu akses dan beban server. Caching dapat diterapkan pada berbagai level, seperti aplikasi, database, dan CDN.

### Karakteristik Caching di Go
- **In-Memory Cache**: Cache yang disimpan di memori
- **Distributed Cache**: Cache yang didistribusikan ke beberapa server
- **Cache Invalidation**: Proses menghapus atau memperbarui cache
- **Cache Expiration**: Waktu kadaluarsa cache
- **Cache Policies**: Kebijakan penggantian cache

### Implementasi Caching
```go
// Caching dasar
package main

import (
    "fmt"
    "log"
    "net/http"
    "sync"
    "time"
)

// Cache adalah struct untuk menyimpan data cache
type Cache struct {
    data map[string]CacheItem
    mu   sync.RWMutex
}

// CacheItem adalah struct untuk menyimpan item cache
type CacheItem struct {
    Value      interface{}
    Expiration time.Time
}

// NewCache membuat Cache baru
func NewCache() *Cache {
    return &Cache{
        data: make(map[string]CacheItem),
    }
}

// Set menyimpan data ke cache
func (c *Cache) Set(key string, value interface{}, expiration time.Duration) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    c.data[key] = CacheItem{
        Value:      value,
        Expiration: time.Now().Add(expiration),
    }
}

// Get mengambil data dari cache
func (c *Cache) Get(key string) (interface{}, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    
    item, ok := c.data[key]
    if !ok {
        return nil, false
    }
    
    if time.Now().After(item.Expiration) {
        c.mu.RUnlock()
        c.mu.Lock()
        delete(c.data, key)
        c.mu.Unlock()
        c.mu.RLock()
        return nil, false
    }
    
    return item.Value, true
}

// Delete menghapus data dari cache
func (c *Cache) Delete(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    delete(c.data, key)
}

// Clear menghapus semua data dari cache
func (c *Cache) Clear() {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    c.data = make(map[string]CacheItem)
}

// Cleanup menghapus data yang kadaluarsa dari cache
func (c *Cache) Cleanup() {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    now := time.Now()
    for key, item := range c.data {
        if now.After(item.Expiration) {
            delete(c.data, key)
        }
    }
}

// CacheMiddleware adalah middleware untuk caching
func CacheMiddleware(cache *Cache, expiration time.Duration) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Mengabaikan metode selain GET
            if r.Method != "GET" {
                next.ServeHTTP(w, r)
                return
            }
            
            // Membuat key cache
            key := r.URL.String()
            
            // Mengambil data dari cache
            if value, ok := cache.Get(key); ok {
                // Menampilkan data dari cache
                fmt.Fprintf(w, "%v", value)
                return
            }
            
            // Membuat response writer untuk menangkap response
            rw := &responseWriter{
                ResponseWriter: w,
                statusCode:     http.StatusOK,
                body:          make([]byte, 0),
            }
            
            // Memanggil handler berikutnya
            next.ServeHTTP(rw, r)
            
            // Menyimpan data ke cache
            cache.Set(key, string(rw.body), expiration)
            
            // Menampilkan data
            w.Write(rw.body)
        })
    }
}

// responseWriter adalah struct untuk menangkap response
type responseWriter struct {
    http.ResponseWriter
    statusCode int
    body       []byte
}

// WriteHeader menangkap status code
func (rw *responseWriter) WriteHeader(statusCode int) {
    rw.statusCode = statusCode
    rw.ResponseWriter.WriteHeader(statusCode)
}

// Write menangkap body
func (rw *responseWriter) Write(b []byte) (int, error) {
    rw.body = append(rw.body, b...)
    return rw.ResponseWriter.Write(b)
}

func main() {
    // Membuat cache
    cache := NewCache()
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan waktu saat ini
        fmt.Fprintf(w, "Current time: %s", time.Now().Format(time.RFC3339))
    })
    
    // Mendefinisikan handler untuk route "/data"
    mux.HandleFunc("/data", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan data
        fmt.Fprintf(w, "Data: %s", time.Now().Format(time.RFC3339))
    })
    
    // Membuat handler dengan middleware cache
    handler := CacheMiddleware(cache, 5*time.Second)(mux)
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## Compression

Compression adalah teknik untuk mengurangi ukuran data yang dikirim dari server ke client. Compression dapat diterapkan pada berbagai jenis data, seperti HTML, CSS, JavaScript, JSON, dan gambar.

### Karakteristik Compression di Go
- **Gzip Compression**: Kompresi menggunakan algoritma Gzip
- **Deflate Compression**: Kompresi menggunakan algoritma Deflate
- **Content Negotiation**: Negosiasi konten untuk menentukan jenis kompresi
- **Compression Level**: Level kompresi (kecepatan vs ukuran)
- **Selective Compression**: Kompresi selektif berdasarkan jenis konten

### Implementasi Compression
```go
// Compression dasar
package main

import (
    "compress/gzip"
    "fmt"
    "io"
    "log"
    "net/http"
    "strings"
)

// GzipMiddleware adalah middleware untuk kompresi Gzip
func GzipMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Memeriksa apakah client mendukung Gzip
        if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
            next.ServeHTTP(w, r)
            return
        }
        
        // Mengatur header Content-Encoding
        w.Header().Set("Content-Encoding", "gzip")
        w.Header().Set("Vary", "Accept-Encoding")
        
        // Membuat GzipWriter
        gz := gzip.NewWriter(w)
        defer gz.Close()
        
        // Membuat GzipResponseWriter
        gzw := &gzipResponseWriter{
            ResponseWriter: w,
            Writer:         gz,
        }
        
        // Memanggil handler berikutnya
        next.ServeHTTP(gzw, r)
    })
}

// gzipResponseWriter adalah struct untuk menangani response Gzip
type gzipResponseWriter struct {
    http.ResponseWriter
    Writer io.Writer
}

// Write menulis data ke GzipWriter
func (w *gzipResponseWriter) Write(b []byte) (int, error) {
    return w.Writer.Write(b)
}

// GzipMiddlewareWithLevel adalah middleware Gzip dengan level kompresi
func GzipMiddlewareWithLevel(level int) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Memeriksa apakah client mendukung Gzip
            if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
                next.ServeHTTP(w, r)
                return
            }
            
            // Mengatur header Content-Encoding
            w.Header().Set("Content-Encoding", "gzip")
            w.Header().Set("Vary", "Accept-Encoding")
            
            // Membuat GzipWriter dengan level kompresi
            gz, err := gzip.NewWriterLevel(w, level)
            if err != nil {
                next.ServeHTTP(w, r)
                return
            }
            defer gz.Close()
            
            // Membuat GzipResponseWriter
            gzw := &gzipResponseWriter{
                ResponseWriter: w,
                Writer:         gz,
            }
            
            // Memanggil handler berikutnya
            next.ServeHTTP(gzw, r)
        })
    }
}

// SelectiveGzipMiddleware adalah middleware Gzip selektif
func SelectiveGzipMiddleware(contentTypes []string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Memeriksa apakah client mendukung Gzip
            if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
                next.ServeHTTP(w, r)
                return
            }
            
            // Membuat response writer untuk menangkap content type
            rw := &contentTypeResponseWriter{
                ResponseWriter: w,
                contentTypes:   contentTypes,
            }
            
            // Memanggil handler berikutnya
            next.ServeHTTP(rw, r)
            
            // Memeriksa apakah content type didukung
            if !rw.shouldCompress {
                next.ServeHTTP(w, r)
                return
            }
            
            // Mengatur header Content-Encoding
            w.Header().Set("Content-Encoding", "gzip")
            w.Header().Set("Vary", "Accept-Encoding")
            
            // Membuat GzipWriter
            gz := gzip.NewWriter(w)
            defer gz.Close()
            
            // Menulis body ke GzipWriter
            gz.Write(rw.body)
        })
    }
}

// contentTypeResponseWriter adalah struct untuk menangkap content type
type contentTypeResponseWriter struct {
    http.ResponseWriter
    contentTypes  []string
    shouldCompress bool
    body           []byte
}

// WriteHeader menangkap content type
func (w *contentTypeResponseWriter) WriteHeader(statusCode int) {
    contentType := w.Header().Get("Content-Type")
    for _, ct := range w.contentTypes {
        if strings.Contains(contentType, ct) {
            w.shouldCompress = true
            break
        }
    }
    w.ResponseWriter.WriteHeader(statusCode)
}

// Write menangkap body
func (w *contentTypeResponseWriter) Write(b []byte) (int, error) {
    w.body = append(w.body, b...)
    return len(b), nil
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan HTML
        w.Header().Set("Content-Type", "text/html")
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>Compression</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #333;
        }
        p {
            color: #666;
        }
    </style>
</head>
<body>
    <h1>Compression</h1>
    <p>This page is compressed using Gzip.</p>
</body>
</html>
`)
    })
    
    // Mendefinisikan handler untuk route "/json"
    mux.HandleFunc("/json", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan JSON
        w.Header().Set("Content-Type", "application/json")
        fmt.Fprintf(w, `{"message": "This JSON is compressed using Gzip."}`)
    })
    
    // Mendefinisikan handler untuk route "/text"
    mux.HandleFunc("/text", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan teks
        w.Header().Set("Content-Type", "text/plain")
        fmt.Fprintf(w, "This text is compressed using Gzip.")
    })
    
    // Membuat handler dengan middleware Gzip
    handler := GzipMiddleware(mux)
    
    // Membuat handler dengan middleware Gzip selektif
    // handler := SelectiveGzipMiddleware([]string{"text/html", "application/json"})(mux)
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## Connection Pooling

Connection pooling adalah teknik untuk menyimpan dan menggunakan kembali koneksi database atau koneksi jaringan. Connection pooling dapat meningkatkan kinerja aplikasi dengan mengurangi overhead pembuatan koneksi baru.

### Karakteristik Connection Pooling di Go
- **Connection Reuse**: Penggunaan kembali koneksi
- **Connection Limits**: Batasan jumlah koneksi
- **Connection Timeout**: Waktu tunggu koneksi
- **Connection Health**: Kesehatan koneksi
- **Connection Metrics**: Metrik koneksi

### Implementasi Connection Pooling
```go
// Connection pooling dasar
package main

import (
    "database/sql"
    "fmt"
    "log"
    "net/http"
    "time"
    _ "github.com/mattn/go-sqlite3"
)

// DatabasePool adalah struct untuk menyimpan pool koneksi database
type DatabasePool struct {
    db *sql.DB
}

// NewDatabasePool membuat DatabasePool baru
func NewDatabasePool(driver, dsn string, maxOpen, maxIdle int, maxLifetime time.Duration) (*DatabasePool, error) {
    // Membuka koneksi database
    db, err := sql.Open(driver, dsn)
    if err != nil {
        return nil, err
    }
    
    // Mengatur pool koneksi
    db.SetMaxOpenConns(maxOpen)
    db.SetMaxIdleConns(maxIdle)
    db.SetConnMaxLifetime(maxLifetime)
    
    // Memeriksa koneksi
    err = db.Ping()
    if err != nil {
        return nil, err
    }
    
    return &DatabasePool{
        db: db,
    }, nil
}

// Close menutup pool koneksi
func (p *DatabasePool) Close() error {
    return p.db.Close()
}

// Query menjalankan query
func (p *DatabasePool) Query(query string, args ...interface{}) (*sql.Rows, error) {
    return p.db.Query(query, args...)
}

// QueryRow menjalankan query dan mengembalikan satu baris
func (p *DatabasePool) QueryRow(query string, args ...interface{}) *sql.Row {
    return p.db.QueryRow(query, args...)
}

// Exec menjalankan query tanpa mengembalikan hasil
func (p *DatabasePool) Exec(query string, args ...interface{}) (sql.Result, error) {
    return p.db.Exec(query, args...)
}

// Stats mengembalikan statistik pool koneksi
func (p *DatabasePool) Stats() sql.DBStats {
    return p.db.Stats()
}

func main() {
    // Membuat pool koneksi database
    pool, err := NewDatabasePool("sqlite3", "users.db", 10, 5, 30*time.Minute)
    if err != nil {
        log.Fatal(err)
    }
    defer pool.Close()
    
    // Membuat tabel users
    _, err = pool.Exec(`
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
    <title>Connection Pooling</title>
</head>
<body>
    <h1>Connection Pooling</h1>
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
        
        // Menggunakan pool koneksi untuk query
        var id int
        err := pool.QueryRow("SELECT id FROM users WHERE username = ? AND password = ?", username, password).Scan(&id)
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
    
    // Mendefinisikan handler untuk route "/stats"
    mux.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil statistik pool koneksi
        stats := pool.Stats()
        
        // Menampilkan statistik
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>Connection Pooling Stats</title>
</head>
<body>
    <h1>Connection Pooling Stats</h1>
    <p>MaxOpenConnections: %d</p>
    <p>OpenConnections: %d</p>
    <p>InUse: %d</p>
    <p>Idle: %d</p>
    <p>MaxIdleTime: %v</p>
    <p>MaxLifetime: %v</p>
    <a href="/">Back</a>
</body>
</html>
`, stats.MaxOpenConnections, stats.OpenConnections, stats.InUse, stats.Idle, stats.MaxIdleTime, stats.MaxLifetime)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Load Balancing

Load balancing adalah teknik untuk mendistribusikan beban kerja ke beberapa server. Load balancing dapat meningkatkan kinerja dan ketersediaan aplikasi dengan mengurangi beban pada satu server.

### Karakteristik Load Balancing di Go
- **Round Robin**: Distribusi beban secara bergiliran
- **Least Connections**: Distribusi beban ke server dengan koneksi paling sedikit
- **IP Hash**: Distribusi beban berdasarkan IP client
- **Health Checks**: Pemeriksaan kesehatan server
- **Session Affinity**: Mempertahankan koneksi client ke server yang sama

### Implementasi Load Balancing
```go
// Load balancing dasar
package main

import (
    "fmt"
    "log"
    "net/http"
    "net/http/httputil"
    "net/url"
    "sync"
    "sync/atomic"
    "time"
)

// Backend adalah struct untuk menyimpan informasi backend
type Backend struct {
    URL          *url.URL
    Alive        bool
    Connections  int64
    LastUsed     time.Time
    mu           sync.RWMutex
}

// LoadBalancer adalah struct untuk menyimpan informasi load balancer
type LoadBalancer struct {
    backends []*Backend
    current  uint64
    mu       sync.RWMutex
}

// NewLoadBalancer membuat LoadBalancer baru
func NewLoadBalancer(backendURLs []string) (*LoadBalancer, error) {
    lb := &LoadBalancer{
        backends: make([]*Backend, 0, len(backendURLs)),
    }
    
    for _, backendURL := range backendURLs {
        url, err := url.Parse(backendURL)
        if err != nil {
            return nil, err
        }
        
        lb.backends = append(lb.backends, &Backend{
            URL:     url,
            Alive:   true,
            LastUsed: time.Now(),
        })
    }
    
    return lb, nil
}

// NextBackend mengembalikan backend berikutnya
func (lb *LoadBalancer) NextBackend() *Backend {
    lb.mu.RLock()
    defer lb.mu.RUnlock()
    
    if len(lb.backends) == 0 {
        return nil
    }
    
    // Round Robin
    next := atomic.AddUint64(&lb.current, 1)
    idx := next % uint64(len(lb.backends))
    
    return lb.backends[idx]
}

// LeastConnectionsBackend mengembalikan backend dengan koneksi paling sedikit
func (lb *LoadBalancer) LeastConnectionsBackend() *Backend {
    lb.mu.RLock()
    defer lb.mu.RUnlock()
    
    if len(lb.backends) == 0 {
        return nil
    }
    
    var leastConnectionsBackend *Backend
    var leastConnections int64 = 1<<63 - 1
    
    for _, backend := range lb.backends {
        backend.mu.RLock()
        connections := backend.Connections
        backend.mu.RUnlock()
        
        if connections < leastConnections {
            leastConnections = connections
            leastConnectionsBackend = backend
        }
    }
    
    return leastConnectionsBackend
}

// IPHashBackend mengembalikan backend berdasarkan IP client
func (lb *LoadBalancer) IPHashBackend(clientIP string) *Backend {
    lb.mu.RLock()
    defer lb.mu.RUnlock()
    
    if len(lb.backends) == 0 {
        return nil
    }
    
    // Menghitung hash dari IP client
    var hash uint64
    for _, c := range clientIP {
        hash = hash*31 + uint64(c)
    }
    
    // Memilih backend berdasarkan hash
    idx := hash % uint64(len(lb.backends))
    
    return lb.backends[idx]
}

// HealthCheck memeriksa kesehatan backend
func (lb *LoadBalancer) HealthCheck() {
    lb.mu.Lock()
    defer lb.mu.Unlock()
    
    for _, backend := range lb.backends {
        backend.mu.Lock()
        defer backend.mu.Unlock()
        
        // Memeriksa kesehatan backend
        resp, err := http.Get(backend.URL.String() + "/health")
        if err != nil || resp.StatusCode != http.StatusOK {
            backend.Alive = false
        } else {
            backend.Alive = true
        }
    }
}

// ServeHTTP menangani request HTTP
func (lb *LoadBalancer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // Memilih backend
    backend := lb.NextBackend()
    // backend := lb.LeastConnectionsBackend()
    // backend := lb.IPHashBackend(r.RemoteAddr)
    
    if backend == nil {
        http.Error(w, "No available backends", http.StatusServiceUnavailable)
        return
    }
    
    // Menambah koneksi
    atomic.AddInt64(&backend.Connections, 1)
    defer atomic.AddInt64(&backend.Connections, -1)
    
    // Memperbarui waktu terakhir digunakan
    backend.mu.Lock()
    backend.LastUsed = time.Now()
    backend.mu.Unlock()
    
    // Membuat reverse proxy
    proxy := httputil.NewSingleHostReverseProxy(backend.URL)
    
    // Menangani error
    proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
        log.Printf("Error proxying to %s: %v", backend.URL.String(), err)
        http.Error(w, "Backend unavailable", http.StatusServiceUnavailable)
    }
    
    // Menjalankan reverse proxy
    proxy.ServeHTTP(w, r)
}

func main() {
    // Membuat load balancer
    lb, err := NewLoadBalancer([]string{
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:8083",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    // Menjalankan health check secara periodik
    go func() {
        for {
            lb.HealthCheck()
            time.Sleep(10 * time.Second)
        }
    }()
    
    // Menjalankan server
    fmt.Println("Load balancer running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", lb))
}
```

## CDN Integration

CDN (Content Delivery Network) adalah jaringan server yang didistribusikan secara geografis untuk menyimpan dan mengirimkan konten statis. CDN dapat meningkatkan kinerja aplikasi dengan mengurangi latensi dan beban server.

### Karakteristik CDN Integration di Go
- **Static File Serving**: Penyajian file statis
- **Cache Control**: Kontrol cache untuk file statis
- **Origin Pull**: Pengambilan file dari origin server
- **Origin Push**: Pengiriman file ke CDN
- **Custom Domain**: Domain kustom untuk CDN

### Implementasi CDN Integration
```go
// CDN integration dasar
package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "path/filepath"
    "strings"
    "time"
)

// StaticFileServer adalah struct untuk menyajikan file statis
type StaticFileServer struct {
    root       string
    cacheTime  time.Duration
    indexFiles []string
}

// NewStaticFileServer membuat StaticFileServer baru
func NewStaticFileServer(root string, cacheTime time.Duration, indexFiles []string) *StaticFileServer {
    return &StaticFileServer{
        root:       root,
        cacheTime:  cacheTime,
        indexFiles: indexFiles,
    }
}

// ServeHTTP menangani request HTTP
func (s *StaticFileServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // Mengambil path file
    path := filepath.Join(s.root, r.URL.Path)
    
    // Memeriksa apakah path adalah direktori
    info, err := os.Stat(path)
    if err != nil {
        if os.IsNotExist(err) {
            http.NotFound(w, r)
            return
        }
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    if info.IsDir() {
        // Mencari file index
        for _, indexFile := range s.indexFiles {
            indexPath := filepath.Join(path, indexFile)
            if _, err := os.Stat(indexPath); err == nil {
                path = indexPath
                break
            }
        }
    }
    
    // Membuka file
    file, err := os.Open(path)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer file.Close()
    
    // Mengatur header Content-Type
    contentType := getContentType(path)
    w.Header().Set("Content-Type", contentType)
    
    // Mengatur header Cache-Control
    w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d", int(s.cacheTime.Seconds())))
    
    // Mengatur header Expires
    w.Header().Set("Expires", time.Now().Add(s.cacheTime).Format(time.RFC1123))
    
    // Mengatur header Last-Modified
    w.Header().Set("Last-Modified", info.ModTime().Format(time.RFC1123))
    
    // Mengatur header ETag
    w.Header().Set("ETag", fmt.Sprintf(`"%x"`, info.ModTime().UnixNano()))
    
    // Menangani conditional request
    if match := r.Header.Get("If-None-Match"); match != "" {
        if strings.Contains(match, fmt.Sprintf(`"%x"`, info.ModTime().UnixNano())) {
            w.WriteHeader(http.StatusNotModified)
            return
        }
    }
    
    if modifiedSince := r.Header.Get("If-Modified-Since"); modifiedSince != "" {
        if t, err := time.Parse(time.RFC1123, modifiedSince); err == nil {
            if !info.ModTime().After(t) {
                w.WriteHeader(http.StatusNotModified)
                return
            }
        }
    }
    
    // Mengirim file
    http.ServeFile(w, r, path)
}

// getContentType mengembalikan Content-Type berdasarkan ekstensi file
func getContentType(path string) string {
    ext := strings.ToLower(filepath.Ext(path))
    switch ext {
    case ".html", ".htm":
        return "text/html"
    case ".css":
        return "text/css"
    case ".js":
        return "application/javascript"
    case ".json":
        return "application/json"
    case ".png":
        return "image/png"
    case ".jpg", ".jpeg":
        return "image/jpeg"
    case ".gif":
        return "image/gif"
    case ".svg":
        return "image/svg+xml"
    case ".ico":
        return "image/x-icon"
    case ".woff":
        return "application/font-woff"
    case ".woff2":
        return "application/font-woff2"
    case ".ttf":
        return "application/x-font-ttf"
    case ".eot":
        return "application/vnd.ms-fontobject"
    default:
        return "application/octet-stream"
    }
}

// CDNMiddleware adalah middleware untuk CDN
func CDNMiddleware(cdnURL string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Mengatur header X-CDN-URL
            w.Header().Set("X-CDN-URL", cdnURL)
            
            // Memanggil handler berikutnya
            next.ServeHTTP(w, r)
        })
    }
}

func main() {
    // Membuat static file server
    staticServer := NewStaticFileServer("static", 24*time.Hour, []string{"index.html"})
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan HTML
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>CDN Integration</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <h1>CDN Integration</h1>
    <p>This page uses static files served from a CDN.</p>
    <script src="/js/script.js"></script>
</body>
</html>
`)
    })
    
    // Mendefinisikan handler untuk route "/static/"
    mux.Handle("/static/", http.StripPrefix("/static/", staticServer))
    
    // Membuat handler dengan middleware CDN
    handler := CDNMiddleware("https://cdn.example.com")(mux)
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## Kesimpulan

Performance optimization adalah aspek penting dalam pengembangan web yang memastikan aplikasi web berjalan dengan cepat dan efisien. Go menyediakan berbagai cara untuk mengoptimalkan kinerja aplikasi web, seperti caching, compression, connection pooling, load balancing, dan CDN integration.

Dengan memahami dan mengimplementasikan konsep-konsep seperti caching, compression, connection pooling, load balancing, dan CDN integration, kita dapat mengembangkan aplikasi web yang berkinerja tinggi. Pilihan metode performance optimization yang tepat tergantung pada kebutuhan aplikasi dan kompleksitas data yang disimpan. 