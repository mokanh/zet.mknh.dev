# Caching

Caching adalah teknik menyimpan data yang sering diakses di memori untuk meningkatkan performa aplikasi. Dalam konteks database, caching dapat mengurangi beban pada database dengan menyimpan hasil query yang sering digunakan, sehingga mengurangi jumlah akses ke database.

## In-Memory Caching

In-memory caching menyimpan data di memori aplikasi, yang memungkinkan akses data yang sangat cepat dibandingkan dengan mengakses database.

### Karakteristik In-Memory Caching
- **Kecepatan Akses**: Akses data sangat cepat karena data disimpan di memori
- **Volatilitas**: Data hilang saat aplikasi di-restart
- **Penggunaan Memori**: Membutuhkan memori yang cukup untuk menyimpan data
- **Sinkronisasi**: Perlu mekanisme untuk menjaga konsistensi data dengan database
- **Expiration**: Data dapat memiliki waktu kadaluarsa

### Implementasi In-Memory Caching
```go
// Implementasi dasar in-memory caching
package main

import (
    "fmt"
    "log"
    "sync"
    "time"
    "database/sql"
    _ "github.com/lib/pq"
)

// CacheItem merepresentasikan item dalam cache
type CacheItem struct {
    Value      interface{}
    Expiration *time.Time
}

// Cache adalah struktur data untuk menyimpan item cache
type Cache struct {
    items map[string]CacheItem
    mu    sync.RWMutex
}

// NewCache membuat instance baru dari Cache
func NewCache() *Cache {
    cache := &Cache{
        items: make(map[string]CacheItem),
    }
    
    // Memulai goroutine untuk membersihkan item yang kadaluarsa
    go cache.cleanupLoop()
    
    return cache
}

// Set menambahkan item ke cache
func (c *Cache) Set(key string, value interface{}, ttl time.Duration) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    var expiration *time.Time
    if ttl > 0 {
        t := time.Now().Add(ttl)
        expiration = &t
    }
    
    c.items[key] = CacheItem{
        Value:      value,
        Expiration: expiration,
    }
}

// Get mengambil item dari cache
func (c *Cache) Get(key string) (interface{}, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    
    item, found := c.items[key]
    if !found {
        return nil, false
    }
    
    // Cek apakah item sudah kadaluarsa
    if item.Expiration != nil && time.Now().After(*item.Expiration) {
        return nil, false
    }
    
    return item.Value, true
}

// Delete menghapus item dari cache
func (c *Cache) Delete(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    delete(c.items, key)
}

// Clear menghapus semua item dari cache
func (c *Cache) Clear() {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    c.items = make(map[string]CacheItem)
}

// cleanupLoop membersihkan item yang kadaluarsa secara periodik
func (c *Cache) cleanupLoop() {
    ticker := time.NewTicker(1 * time.Minute)
    defer ticker.Stop()
    
    for range ticker.C {
        c.mu.Lock()
        for key, item := range c.items {
            if item.Expiration != nil && time.Now().After(*item.Expiration) {
                delete(c.items, key)
            }
        }
        c.mu.Unlock()
    }
}

// User struct untuk contoh
type User struct {
    ID       int
    Username string
    Email    string
}

// UserRepository dengan caching
type UserRepository struct {
    db    *sql.DB
    cache *Cache
}

// NewUserRepository membuat instance baru dari UserRepository
func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{
        db:    db,
        cache: NewCache(),
    }
}

// GetUserByID mengambil user berdasarkan ID dengan caching
func (r *UserRepository) GetUserByID(id int) (*User, error) {
    // Cek cache terlebih dahulu
    cacheKey := fmt.Sprintf("user:%d", id)
    if cachedValue, found := r.cache.Get(cacheKey); found {
        if user, ok := cachedValue.(*User); ok {
            fmt.Println("Cache hit for user:", id)
            return user, nil
        }
    }
    
    // Jika tidak ada di cache, ambil dari database
    fmt.Println("Cache miss for user:", id)
    user := &User{}
    err := r.db.QueryRow("SELECT id, username, email FROM users WHERE id = $1", id).Scan(&user.ID, &user.Username, &user.Email)
    if err != nil {
        return nil, err
    }
    
    // Simpan di cache dengan TTL 5 menit
    r.cache.Set(cacheKey, user, 5*time.Minute)
    
    return user, nil
}

// UpdateUser memperbarui user dan invalidasi cache
func (r *UserRepository) UpdateUser(user *User) error {
    // Update di database
    _, err := r.db.Exec("UPDATE users SET username = $1, email = $2 WHERE id = $3", user.Username, user.Email, user.ID)
    if err != nil {
        return err
    }
    
    // Invalidate cache
    cacheKey := fmt.Sprintf("user:%d", user.ID)
    r.cache.Delete(cacheKey)
    
    return nil
}

// DeleteUser menghapus user dan invalidasi cache
func (r *UserRepository) DeleteUser(id int) error {
    // Hapus dari database
    _, err := r.db.Exec("DELETE FROM users WHERE id = $1", id)
    if err != nil {
        return err
    }
    
    // Invalidate cache
    cacheKey := fmt.Sprintf("user:%d", id)
    r.cache.Delete(cacheKey)
    
    return nil
}

func main() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Membuat repository
    repo := NewUserRepository(db)
    
    // Contoh penggunaan
    user, err := repo.GetUserByID(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User: %+v\n", user)
    
    // Akses kedua akan menggunakan cache
    user, err = repo.GetUserByID(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User (from cache): %+v\n", user)
    
    // Update user
    user.Username = "updated_username"
    err = repo.UpdateUser(user)
    if err != nil {
        log.Fatal(err)
    }
    
    // Akses setelah update akan mengambil dari database karena cache diinvalidate
    user, err = repo.GetUserByID(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User (after update): %+v\n", user)
}
```

## Distributed Caching

Distributed caching menyimpan data di beberapa node, memungkinkan aplikasi untuk berbagi cache dan meningkatkan skalabilitas.

### Karakteristik Distributed Caching
- **Skalabilitas**: Dapat menangani beban yang lebih besar dengan menambahkan node
- **Redundansi**: Data dapat disimpan di beberapa node untuk meningkatkan ketahanan
- **Konsistensi**: Memerlukan mekanisme untuk menjaga konsistensi data antar node
- **Latency**: Akses data mungkin lebih lambat dibandingkan in-memory caching
- **Kompleksitas**: Lebih kompleks untuk diimplementasikan dan dikelola

### Implementasi Distributed Caching dengan Redis
```go
// Implementasi dasar distributed caching dengan Redis
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "time"
    "database/sql"
    _ "github.com/lib/pq"
    "github.com/go-redis/redis/v8"
)

// User struct untuk contoh
type User struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
}

// UserRepository dengan Redis caching
type UserRepository struct {
    db    *sql.DB
    redis *redis.Client
    ctx   context.Context
}

// NewUserRepository membuat instance baru dari UserRepository
func NewUserRepository(db *sql.DB) *UserRepository {
    // Membuat client Redis
    rdb := redis.NewClient(&redis.Options{
        Addr:     "localhost:6379",
        Password: "", // no password set
        DB:       0,  // use default DB
    })
    
    return &UserRepository{
        db:    db,
        redis: rdb,
        ctx:   context.Background(),
    }
}

// GetUserByID mengambil user berdasarkan ID dengan Redis caching
func (r *UserRepository) GetUserByID(id int) (*User, error) {
    // Cek Redis terlebih dahulu
    cacheKey := fmt.Sprintf("user:%d", id)
    val, err := r.redis.Get(r.ctx, cacheKey).Result()
    if err == nil {
        // Data ditemukan di Redis
        fmt.Println("Redis cache hit for user:", id)
        var user User
        err = json.Unmarshal([]byte(val), &user)
        if err != nil {
            return nil, err
        }
        return &user, nil
    }
    
    // Jika tidak ada di Redis, ambil dari database
    fmt.Println("Redis cache miss for user:", id)
    user := &User{}
    err = r.db.QueryRow("SELECT id, username, email FROM users WHERE id = $1", id).Scan(&user.ID, &user.Username, &user.Email)
    if err != nil {
        return nil, err
    }
    
    // Simpan di Redis dengan TTL 5 menit
    userJSON, err := json.Marshal(user)
    if err != nil {
        return nil, err
    }
    
    err = r.redis.Set(r.ctx, cacheKey, userJSON, 5*time.Minute).Err()
    if err != nil {
        log.Printf("Error setting Redis cache: %v", err)
    }
    
    return user, nil
}

// UpdateUser memperbarui user dan invalidasi cache
func (r *UserRepository) UpdateUser(user *User) error {
    // Update di database
    _, err := r.db.Exec("UPDATE users SET username = $1, email = $2 WHERE id = $3", user.Username, user.Email, user.ID)
    if err != nil {
        return err
    }
    
    // Invalidate cache
    cacheKey := fmt.Sprintf("user:%d", user.ID)
    err = r.redis.Del(r.ctx, cacheKey).Err()
    if err != nil {
        log.Printf("Error deleting Redis cache: %v", err)
    }
    
    return nil
}

// DeleteUser menghapus user dan invalidasi cache
func (r *UserRepository) DeleteUser(id int) error {
    // Hapus dari database
    _, err := r.db.Exec("DELETE FROM users WHERE id = $1", id)
    if err != nil {
        return err
    }
    
    // Invalidate cache
    cacheKey := fmt.Sprintf("user:%d", id)
    err = r.redis.Del(r.ctx, cacheKey).Err()
    if err != nil {
        log.Printf("Error deleting Redis cache: %v", err)
    }
    
    return nil
}

// GetUsersByRole mengambil users berdasarkan role dengan Redis caching
func (r *UserRepository) GetUsersByRole(role string) ([]*User, error) {
    // Cek Redis terlebih dahulu
    cacheKey := fmt.Sprintf("users:role:%s", role)
    val, err := r.redis.Get(r.ctx, cacheKey).Result()
    if err == nil {
        // Data ditemukan di Redis
        fmt.Println("Redis cache hit for users with role:", role)
        var users []*User
        err = json.Unmarshal([]byte(val), &users)
        if err != nil {
            return nil, err
        }
        return users, nil
    }
    
    // Jika tidak ada di Redis, ambil dari database
    fmt.Println("Redis cache miss for users with role:", role)
    rows, err := r.db.Query("SELECT id, username, email FROM users WHERE role = $1", role)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var users []*User
    for rows.Next() {
        user := &User{}
        err := rows.Scan(&user.ID, &user.Username, &user.Email)
        if err != nil {
            return nil, err
        }
        users = append(users, user)
    }
    
    // Simpan di Redis dengan TTL 5 menit
    usersJSON, err := json.Marshal(users)
    if err != nil {
        return nil, err
    }
    
    err = r.redis.Set(r.ctx, cacheKey, usersJSON, 5*time.Minute).Err()
    if err != nil {
        log.Printf("Error setting Redis cache: %v", err)
    }
    
    return users, nil
}

func main() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Membuat repository
    repo := NewUserRepository(db)
    
    // Contoh penggunaan
    user, err := repo.GetUserByID(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User: %+v\n", user)
    
    // Akses kedua akan menggunakan cache
    user, err = repo.GetUserByID(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User (from Redis cache): %+v\n", user)
    
    // Update user
    user.Username = "updated_username"
    err = repo.UpdateUser(user)
    if err != nil {
        log.Fatal(err)
    }
    
    // Akses setelah update akan mengambil dari database karena cache diinvalidate
    user, err = repo.GetUserByID(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User (after update): %+v\n", user)
    
    // Contoh penggunaan untuk query yang lebih kompleks
    users, err := repo.GetUsersByRole("admin")
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d admin users\n", len(users))
    for _, u := range users {
        fmt.Printf("Admin user: %+v\n", u)
    }
}
```

## Query Caching

Query caching menyimpan hasil query database untuk mengurangi beban pada database.

### Karakteristik Query Caching
- **Query Key**: Menggunakan query SQL sebagai kunci cache
- **Parameter Binding**: Menyimpan hasil query dengan parameter yang berbeda
- **Invalidation**: Perlu mekanisme untuk invalidasi cache saat data berubah
- **TTL**: Data dapat memiliki waktu kadaluarsa
- **Selective Caching**: Hanya menyimpan hasil query yang sering digunakan

### Implementasi Query Caching
```go
// Implementasi dasar query caching
package main

import (
    "crypto/md5"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "log"
    "strings"
    "time"
    "database/sql"
    _ "github.com/lib/pq"
    "github.com/go-redis/redis/v8"
)

// QueryCache adalah struktur untuk menyimpan hasil query
type QueryCache struct {
    redis *redis.Client
    ctx   context.Context
    ttl   time.Duration
}

// NewQueryCache membuat instance baru dari QueryCache
func NewQueryCache(redisAddr string, ttl time.Duration) *QueryCache {
    rdb := redis.NewClient(&redis.Options{
        Addr:     redisAddr,
        Password: "", // no password set
        DB:       0,  // use default DB
    })
    
    return &QueryCache{
        redis: rdb,
        ctx:   context.Background(),
        ttl:   ttl,
    }
}

// generateCacheKey menghasilkan kunci cache dari query SQL dan parameter
func generateCacheKey(query string, args ...interface{}) string {
    // Normalisasi query (hapus whitespace yang tidak perlu)
    normalizedQuery := strings.Join(strings.Fields(query), " ")
    
    // Gabungkan query dan parameter
    keyParts := []string{normalizedQuery}
    for _, arg := range args {
        keyParts = append(keyParts, fmt.Sprintf("%v", arg))
    }
    
    // Buat string kunci
    keyString := strings.Join(keyParts, "|")
    
    // Hash string kunci
    hasher := md5.New()
    hasher.Write([]byte(keyString))
    
    return "query:" + hex.EncodeToString(hasher.Sum(nil))
}

// Get mengambil hasil query dari cache
func (c *QueryCache) Get(query string, args ...interface{}) ([]map[string]interface{}, bool, error) {
    cacheKey := generateCacheKey(query, args...)
    
    val, err := c.redis.Get(c.ctx, cacheKey).Result()
    if err == redis.Nil {
        // Cache miss
        return nil, false, nil
    } else if err != nil {
        return nil, false, err
    }
    
    // Cache hit
    var result []map[string]interface{}
    err = json.Unmarshal([]byte(val), &result)
    if err != nil {
        return nil, false, err
    }
    
    return result, true, nil
}

// Set menyimpan hasil query ke cache
func (c *QueryCache) Set(query string, result []map[string]interface{}, args ...interface{}) error {
    cacheKey := generateCacheKey(query, args...)
    
    val, err := json.Marshal(result)
    if err != nil {
        return err
    }
    
    return c.redis.Set(c.ctx, cacheKey, val, c.ttl).Err()
}

// Invalidate menghapus hasil query dari cache
func (c *QueryCache) Invalidate(query string, args ...interface{}) error {
    cacheKey := generateCacheKey(query, args...)
    return c.redis.Del(c.ctx, cacheKey).Err()
}

// InvalidatePattern menghapus semua hasil query yang cocok dengan pola
func (c *QueryCache) InvalidatePattern(pattern string) error {
    // Hanya mendukung pola sederhana seperti "user:*"
    keys, err := c.redis.Keys(c.ctx, pattern).Result()
    if err != nil {
        return err
    }
    
    if len(keys) > 0 {
        return c.redis.Del(c.ctx, keys...).Err()
    }
    
    return nil
}

// CachedDB adalah wrapper untuk sql.DB dengan caching
type CachedDB struct {
    db    *sql.DB
    cache *QueryCache
}

// NewCachedDB membuat instance baru dari CachedDB
func NewCachedDB(db *sql.DB, redisAddr string, ttl time.Duration) *CachedDB {
    return &CachedDB{
        db:    db,
        cache: NewQueryCache(redisAddr, ttl),
    }
}

// QueryContext menjalankan query dengan caching
func (c *CachedDB) QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error) {
    // Cek cache terlebih dahulu
    result, found, err := c.cache.Get(query, args...)
    if err != nil {
        return nil, err
    }
    
    if found {
        // Menggunakan hasil dari cache
        // Ini adalah implementasi sederhana, dalam praktiknya perlu mengkonversi hasil cache ke sql.Rows
        // atau menggunakan pendekatan yang berbeda
        log.Printf("Cache hit for query: %s", query)
        return nil, fmt.Errorf("cache hit, not implemented")
    }
    
    // Jika tidak ada di cache, jalankan query
    log.Printf("Cache miss for query: %s", query)
    rows, err := c.db.QueryContext(ctx, query, args...)
    if err != nil {
        return nil, err
    }
    
    // Simpan hasil di cache
    // Ini adalah implementasi sederhana, dalam praktiknya perlu mengkonversi sql.Rows ke []map[string]interface{}
    // atau menggunakan pendekatan yang berbeda
    go func() {
        // Konversi rows ke []map[string]interface{}
        var result []map[string]interface{}
        columns, err := rows.Columns()
        if err != nil {
            log.Printf("Error getting columns: %v", err)
            return
        }
        
        values := make([]interface{}, len(columns))
        valuePtrs := make([]interface{}, len(columns))
        for i := range columns {
            valuePtrs[i] = &values[i]
        }
        
        for rows.Next() {
            err := rows.Scan(valuePtrs...)
            if err != nil {
                log.Printf("Error scanning row: %v", err)
                continue
            }
            
            row := make(map[string]interface{})
            for i, col := range columns {
                var v interface{}
                val := values[i]
                b, ok := val.([]byte)
                if ok {
                    v = string(b)
                } else {
                    v = val
                }
                row[col] = v
            }
            result = append(result, row)
        }
        
        // Simpan di cache
        err = c.cache.Set(query, result, args...)
        if err != nil {
            log.Printf("Error setting cache: %v", err)
        }
    }()
    
    return rows, nil
}

// ExecContext menjalankan query yang mengubah data dan invalidasi cache
func (c *CachedDB) ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
    // Jalankan query
    result, err := c.db.ExecContext(ctx, query, args...)
    if err != nil {
        return nil, err
    }
    
    // Invalidate cache berdasarkan jenis query
    if strings.HasPrefix(strings.ToUpper(strings.TrimSpace(query)), "INSERT") {
        // Untuk INSERT, invalidate query yang mengambil data dari tabel yang sama
        tableName := extractTableName(query)
        if tableName != "" {
            c.cache.InvalidatePattern(fmt.Sprintf("query:*%s*", tableName))
        }
    } else if strings.HasPrefix(strings.ToUpper(strings.TrimSpace(query)), "UPDATE") {
        // Untuk UPDATE, invalidate query yang mengambil data dari tabel yang sama
        tableName := extractTableName(query)
        if tableName != "" {
            c.cache.InvalidatePattern(fmt.Sprintf("query:*%s*", tableName))
        }
    } else if strings.HasPrefix(strings.ToUpper(strings.TrimSpace(query)), "DELETE") {
        // Untuk DELETE, invalidate query yang mengambil data dari tabel yang sama
        tableName := extractTableName(query)
        if tableName != "" {
            c.cache.InvalidatePattern(fmt.Sprintf("query:*%s*", tableName))
        }
    }
    
    return result, nil
}

// extractTableName mengekstrak nama tabel dari query SQL
func extractTableName(query string) string {
    query = strings.ToUpper(strings.TrimSpace(query))
    
    if strings.HasPrefix(query, "INSERT INTO") {
        parts := strings.Split(query, "INSERT INTO")
        if len(parts) > 1 {
            tablePart := strings.Split(parts[1], " ")[0]
            return strings.Trim(tablePart, "`\"'")
        }
    } else if strings.HasPrefix(query, "UPDATE") {
        parts := strings.Split(query, "UPDATE")
        if len(parts) > 1 {
            tablePart := strings.Split(parts[1], " ")[0]
            return strings.Trim(tablePart, "`\"'")
        }
    } else if strings.HasPrefix(query, "DELETE FROM") {
        parts := strings.Split(query, "DELETE FROM")
        if len(parts) > 1 {
            tablePart := strings.Split(parts[1], " ")[0]
            return strings.Trim(tablePart, "`\"'")
        }
    }
    
    return ""
}

func main() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Membuat cached DB
    cachedDB := NewCachedDB(db, "localhost:6379", 5*time.Minute)
    
    // Contoh penggunaan
    ctx := context.Background()
    
    // Query dengan caching
    rows, err := cachedDB.QueryContext(ctx, "SELECT id, username, email FROM users WHERE role = $1", "admin")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Proses hasil
    for rows.Next() {
        var id int
        var username, email string
        err := rows.Scan(&id, &username, &email)
        if err != nil {
            log.Fatal(err)
        }
        fmt.Printf("User: %d, %s, %s\n", id, username, email)
    }
    
    // Query kedua akan menggunakan cache
    rows, err = cachedDB.QueryContext(ctx, "SELECT id, username, email FROM users WHERE role = $1", "admin")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Proses hasil
    for rows.Next() {
        var id int
        var username, email string
        err := rows.Scan(&id, &username, &email)
        if err != nil {
            log.Fatal(err)
        }
        fmt.Printf("User (from cache): %d, %s, %s\n", id, username, email)
    }
    
    // Update data
    _, err = cachedDB.ExecContext(ctx, "UPDATE users SET username = $1 WHERE id = $2", "updated_username", 1)
    if err != nil {
        log.Fatal(err)
    }
    
    // Query setelah update akan mengambil dari database karena cache diinvalidate
    rows, err = cachedDB.QueryContext(ctx, "SELECT id, username, email FROM users WHERE role = $1", "admin")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Proses hasil
    for rows.Next() {
        var id int
        var username, email string
        err := rows.Scan(&id, &username, &email)
        if err != nil {
            log.Fatal(err)
        }
        fmt.Printf("User (after update): %d, %s, %s\n", id, username, email)
    }
}
```

## Cache Invalidation

Cache invalidation adalah proses menghapus atau memperbarui data di cache untuk menjaga konsistensi dengan data di database.

### Karakteristik Cache Invalidation
- **Time-Based**: Data dihapus setelah waktu tertentu
- **Event-Based**: Data dihapus saat terjadi perubahan data
- **Version-Based**: Data diperbarui saat versi data berubah
- **Selective**: Hanya menghapus data yang terkait dengan perubahan
- **Bulk**: Menghapus semua data di cache

### Implementasi Cache Invalidation
```go
// Implementasi dasar cache invalidation
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "database/sql"
    _ "github.com/lib/pq"
    "github.com/go-redis/redis/v8"
)

// CacheManager mengelola cache dan invalidation
type CacheManager struct {
    redis *redis.Client
    ctx   context.Context
}

// NewCacheManager membuat instance baru dari CacheManager
func NewCacheManager(redisAddr string) *CacheManager {
    rdb := redis.NewClient(&redis.Options{
        Addr:     redisAddr,
        Password: "", // no password set
        DB:       0,  // use default DB
    })
    
    return &CacheManager{
        redis: rdb,
        ctx:   context.Background(),
    }
}

// Set menyimpan data di cache
func (m *CacheManager) Set(key string, value interface{}, ttl time.Duration) error {
    return m.redis.Set(m.ctx, key, value, ttl).Err()
}

// Get mengambil data dari cache
func (m *CacheManager) Get(key string) (string, error) {
    return m.redis.Get(m.ctx, key).Result()
}

// Delete menghapus data dari cache
func (m *CacheManager) Delete(key string) error {
    return m.redis.Del(m.ctx, key).Err()
}

// DeletePattern menghapus semua data yang cocok dengan pola
func (m *CacheManager) DeletePattern(pattern string) error {
    keys, err := m.redis.Keys(m.ctx, pattern).Result()
    if err != nil {
        return err
    }
    
    if len(keys) > 0 {
        return m.redis.Del(m.ctx, keys...).Err()
    }
    
    return nil
}

// InvalidateOnUpdate menghapus cache saat data diperbarui
func (m *CacheManager) InvalidateOnUpdate(tableName string, id interface{}) error {
    // Hapus cache untuk entitas spesifik
    entityKey := fmt.Sprintf("%s:%v", tableName, id)
    err := m.Delete(entityKey)
    if err != nil {
        return err
    }
    
    // Hapus cache untuk query yang menggunakan tabel ini
    queryPattern := fmt.Sprintf("query:*%s*", tableName)
    err = m.DeletePattern(queryPattern)
    if err != nil {
        return err
    }
    
    // Hapus cache untuk daftar entitas
    listKey := fmt.Sprintf("%s:list", tableName)
    err = m.Delete(listKey)
    if err != nil {
        return err
    }
    
    return nil
}

// InvalidateOnDelete menghapus cache saat data dihapus
func (m *CacheManager) InvalidateOnDelete(tableName string, id interface{}) error {
    // Hapus cache untuk entitas spesifik
    entityKey := fmt.Sprintf("%s:%v", tableName, id)
    err := m.Delete(entityKey)
    if err != nil {
        return err
    }
    
    // Hapus cache untuk query yang menggunakan tabel ini
    queryPattern := fmt.Sprintf("query:*%s*", tableName)
    err = m.DeletePattern(queryPattern)
    if err != nil {
        return err
    }
    
    // Hapus cache untuk daftar entitas
    listKey := fmt.Sprintf("%s:list", tableName)
    err = m.Delete(listKey)
    if err != nil {
        return err
    }
    
    return nil
}

// InvalidateOnInsert menghapus cache saat data ditambahkan
func (m *CacheManager) InvalidateOnInsert(tableName string) error {
    // Hapus cache untuk query yang menggunakan tabel ini
    queryPattern := fmt.Sprintf("query:*%s*", tableName)
    err := m.DeletePattern(queryPattern)
    if err != nil {
        return err
    }
    
    // Hapus cache untuk daftar entitas
    listKey := fmt.Sprintf("%s:list", tableName)
    err = m.Delete(listKey)
    if err != nil {
        return err
    }
    
    return nil
}

// UserRepository dengan cache invalidation
type UserRepository struct {
    db    *sql.DB
    cache *CacheManager
}

// NewUserRepository membuat instance baru dari UserRepository
func NewUserRepository(db *sql.DB, redisAddr string) *UserRepository {
    return &UserRepository{
        db:    db,
        cache: NewCacheManager(redisAddr),
    }
}

// GetUserByID mengambil user berdasarkan ID dengan caching
func (r *UserRepository) GetUserByID(id int) (string, error) {
    // Cek cache terlebih dahulu
    cacheKey := fmt.Sprintf("user:%d", id)
    val, err := r.cache.Get(cacheKey)
    if err == nil {
        // Data ditemukan di cache
        fmt.Println("Cache hit for user:", id)
        return val, nil
    }
    
    // Jika tidak ada di cache, ambil dari database
    fmt.Println("Cache miss for user:", id)
    var username string
    err = r.db.QueryRow("SELECT username FROM users WHERE id = $1", id).Scan(&username)
    if err != nil {
        return "", err
    }
    
    // Simpan di cache dengan TTL 5 menit
    err = r.cache.Set(cacheKey, username, 5*time.Minute)
    if err != nil {
        log.Printf("Error setting cache: %v", err)
    }
    
    return username, nil
}

// UpdateUser memperbarui user dan invalidasi cache
func (r *UserRepository) UpdateUser(id int, username string) error {
    // Update di database
    _, err := r.db.Exec("UPDATE users SET username = $1 WHERE id = $2", username, id)
    if err != nil {
        return err
    }
    
    // Invalidate cache
    err = r.cache.InvalidateOnUpdate("user", id)
    if err != nil {
        log.Printf("Error invalidating cache: %v", err)
    }
    
    return nil
}

// DeleteUser menghapus user dan invalidasi cache
func (r *UserRepository) DeleteUser(id int) error {
    // Hapus dari database
    _, err := r.db.Exec("DELETE FROM users WHERE id = $1", id)
    if err != nil {
        return err
    }
    
    // Invalidate cache
    err = r.cache.InvalidateOnDelete("user", id)
    if err != nil {
        log.Printf("Error invalidating cache: %v", err)
    }
    
    return nil
}

// CreateUser membuat user baru dan invalidasi cache
func (r *UserRepository) CreateUser(username, email string) error {
    // Insert ke database
    _, err := r.db.Exec("INSERT INTO users (username, email) VALUES ($1, $2)", username, email)
    if err != nil {
        return err
    }
    
    // Invalidate cache
    err = r.cache.InvalidateOnInsert("user")
    if err != nil {
        log.Printf("Error invalidating cache: %v", err)
    }
    
    return nil
}

func main() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Membuat repository
    repo := NewUserRepository(db, "localhost:6379")
    
    // Contoh penggunaan
    username, err := repo.GetUserByID(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User 1: %s\n", username)
    
    // Akses kedua akan menggunakan cache
    username, err = repo.GetUserByID(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User 1 (from cache): %s\n", username)
    
    // Update user
    err = repo.UpdateUser(1, "updated_username")
    if err != nil {
        log.Fatal(err)
    }
    
    // Akses setelah update akan mengambil dari database karena cache diinvalidate
    username, err = repo.GetUserByID(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User 1 (after update): %s\n", username)
    
    // Create user
    err = repo.CreateUser("new_user", "new_user@example.com")
    if err != nil {
        log.Fatal(err)
    }
    
    // Delete user
    err = repo.DeleteUser(2)
    if err != nil {
        log.Fatal(err)
    }
}
```

## Kesimpulan

Caching adalah teknik penting untuk meningkatkan performa aplikasi database. Dengan menyimpan data yang sering diakses di memori, kita dapat mengurangi beban pada database dan meningkatkan respons aplikasi.

Teknik-teknik caching seperti in-memory caching, distributed caching, query caching, dan cache invalidation dapat digunakan untuk mengoptimalkan akses data. Pemilihan teknik yang tepat tergantung pada kebutuhan aplikasi, seperti skalabilitas, konsistensi, dan kompleksitas.

Dalam Go, kita dapat mengimplementasikan teknik-teknik ini menggunakan library seperti Redis untuk distributed caching atau struktur data bawaan Go untuk in-memory caching. Dengan memahami dan mengimplementasikan teknik-teknik ini, kita dapat mengembangkan aplikasi database yang lebih cepat dan efisien. 