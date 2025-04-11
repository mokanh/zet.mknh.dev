# Database Basics

Database adalah komponen penting dalam pengembangan aplikasi backend. Go menyediakan berbagai cara untuk berinteraksi dengan database, mulai dari koneksi dasar hingga pengelolaan transaksi dan error handling.

## Koneksi Database

Koneksi database adalah langkah pertama dalam berinteraksi dengan database. Go menyediakan package `database/sql` yang menyediakan antarmuka umum untuk berinteraksi dengan berbagai jenis database.

### Karakteristik Koneksi Database di Go
- **Driver Independence**: Antarmuka umum untuk berbagai driver database
- **Connection String**: String koneksi untuk mengidentifikasi database
- **Connection Options**: Opsi koneksi seperti timeout, max connections, dll.
- **Connection Lifecycle**: Pengelolaan siklus hidup koneksi
- **Error Handling**: Penanganan error saat koneksi

### Implementasi Koneksi Database
```go
// Koneksi database dasar
package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"
    _ "github.com/mattn/go-sqlite3" // Driver SQLite
)

func main() {
    // Membuka koneksi database
    db, err := sql.Open("sqlite3", "users.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Memeriksa koneksi
    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Connected to database")
    
    // Mengatur opsi koneksi
    db.SetMaxOpenConns(10)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(30 * time.Minute)
    
    // Menjalankan query
    rows, err := db.Query("SELECT * FROM users")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Memproses hasil query
    for rows.Next() {
        var id int
        var username string
        var email string
        
        err := rows.Scan(&id, &username, &email)
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("ID: %d, Username: %s, Email: %s\n", id, username, email)
    }
    
    // Memeriksa error setelah iterasi
    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }
}
```

## Connection Pooling

Connection pooling adalah teknik untuk menyimpan dan menggunakan kembali koneksi database. Connection pooling dapat meningkatkan kinerja aplikasi dengan mengurangi overhead pembuatan koneksi baru.

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
    "sync"
    "time"
    _ "github.com/mattn/go-sqlite3"
)

// DatabasePool adalah struct untuk menyimpan pool koneksi database
type DatabasePool struct {
    db *sql.DB
    mu sync.RWMutex
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
    p.mu.Lock()
    defer p.mu.Unlock()
    
    return p.db.Close()
}

// Query menjalankan query
func (p *DatabasePool) Query(query string, args ...interface{}) (*sql.Rows, error) {
    p.mu.RLock()
    defer p.mu.RUnlock()
    
    return p.db.Query(query, args...)
}

// QueryRow menjalankan query dan mengembalikan satu baris
func (p *DatabasePool) QueryRow(query string, args ...interface{}) *sql.Row {
    p.mu.RLock()
    defer p.mu.RUnlock()
    
    return p.db.QueryRow(query, args...)
}

// Exec menjalankan query tanpa mengembalikan hasil
func (p *DatabasePool) Exec(query string, args ...interface{}) (sql.Result, error) {
    p.mu.Lock()
    defer p.mu.Unlock()
    
    return p.db.Exec(query, args...)
}

// Stats mengembalikan statistik pool koneksi
func (p *DatabasePool) Stats() sql.DBStats {
    p.mu.RLock()
    defer p.mu.RUnlock()
    
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
    email TEXT NOT NULL
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Menambahkan data
    _, err = pool.Exec("INSERT INTO users (username, email) VALUES (?, ?)", "john", "john@example.com")
    if err != nil {
        log.Fatal(err)
    }
    
    // Mengambil data
    rows, err := pool.Query("SELECT * FROM users")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Memproses hasil query
    for rows.Next() {
        var id int
        var username string
        var email string
        
        err := rows.Scan(&id, &username, &email)
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("ID: %d, Username: %s, Email: %s\n", id, username, email)
    }
    
    // Memeriksa error setelah iterasi
    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }
    
    // Menampilkan statistik pool koneksi
    stats := pool.Stats()
    fmt.Printf("MaxOpenConnections: %d\n", stats.MaxOpenConnections)
    fmt.Printf("OpenConnections: %d\n", stats.OpenConnections)
    fmt.Printf("InUse: %d\n", stats.InUse)
    fmt.Printf("Idle: %d\n", stats.Idle)
    fmt.Printf("MaxIdleTime: %v\n", stats.MaxIdleTime)
    fmt.Printf("MaxLifetime: %v\n", stats.MaxLifetime)
}
```

## Transaction Management

Transaksi adalah unit kerja yang terdiri dari satu atau lebih operasi database. Transaksi memastikan bahwa semua operasi dalam transaksi berhasil atau tidak ada yang berhasil (atomicity).

### Karakteristik Transaction Management di Go
- **Atomicity**: Semua operasi dalam transaksi berhasil atau tidak ada yang berhasil
- **Consistency**: Transaksi membawa database dari satu keadaan konsisten ke keadaan konsisten lainnya
- **Isolation**: Transaksi yang berjalan secara bersamaan tidak saling mengganggu
- **Durability**: Setelah transaksi berhasil, perubahan yang dilakukan bersifat permanen
- **Error Handling**: Penanganan error saat transaksi

### Implementasi Transaction Management
```go
// Transaction management dasar
package main

import (
    "context"
    "database/sql"
    "fmt"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

// User adalah struct untuk menyimpan data user
type User struct {
    ID       int
    Username string
    Email    string
}

// UserRepository adalah struct untuk menyimpan repository user
type UserRepository struct {
    db *sql.DB
}

// NewUserRepository membuat UserRepository baru
func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{
        db: db,
    }
}

// CreateUser membuat user baru
func (r *UserRepository) CreateUser(ctx context.Context, user *User) error {
    // Membuat transaksi
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    
    // Memastikan transaksi di-commit atau di-rollback
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        }
    }()
    
    // Menjalankan query dalam transaksi
    result, err := tx.ExecContext(ctx, "INSERT INTO users (username, email) VALUES (?, ?)", user.Username, user.Email)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    // Mengambil ID user yang baru dibuat
    id, err := result.LastInsertId()
    if err != nil {
        tx.Rollback()
        return err
    }
    
    user.ID = int(id)
    
    // Commit transaksi
    return tx.Commit()
}

// CreateUsers membuat beberapa user baru dalam satu transaksi
func (r *UserRepository) CreateUsers(ctx context.Context, users []*User) error {
    // Membuat transaksi
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    
    // Memastikan transaksi di-commit atau di-rollback
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        }
    }()
    
    // Menjalankan query dalam transaksi
    for _, user := range users {
        result, err := tx.ExecContext(ctx, "INSERT INTO users (username, email) VALUES (?, ?)", user.Username, user.Email)
        if err != nil {
            tx.Rollback()
            return err
        }
        
        id, err := result.LastInsertId()
        if err != nil {
            tx.Rollback()
            return err
        }
        
        user.ID = int(id)
    }
    
    // Commit transaksi
    return tx.Commit()
}

// GetUserByID mengambil user berdasarkan ID
func (r *UserRepository) GetUserByID(ctx context.Context, id int) (*User, error) {
    user := &User{}
    
    err := r.db.QueryRowContext(ctx, "SELECT id, username, email FROM users WHERE id = ?", id).Scan(&user.ID, &user.Username, &user.Email)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("user not found")
        }
        return nil, err
    }
    
    return user, nil
}

// UpdateUser memperbarui user
func (r *UserRepository) UpdateUser(ctx context.Context, user *User) error {
    // Membuat transaksi
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    
    // Memastikan transaksi di-commit atau di-rollback
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        }
    }()
    
    // Menjalankan query dalam transaksi
    result, err := tx.ExecContext(ctx, "UPDATE users SET username = ?, email = ? WHERE id = ?", user.Username, user.Email, user.ID)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    // Memeriksa apakah ada baris yang diperbarui
    rows, err := result.RowsAffected()
    if err != nil {
        tx.Rollback()
        return err
    }
    
    if rows == 0 {
        tx.Rollback()
        return fmt.Errorf("user not found")
    }
    
    // Commit transaksi
    return tx.Commit()
}

// DeleteUser menghapus user
func (r *UserRepository) DeleteUser(ctx context.Context, id int) error {
    // Membuat transaksi
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    
    // Memastikan transaksi di-commit atau di-rollback
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        }
    }()
    
    // Menjalankan query dalam transaksi
    result, err := tx.ExecContext(ctx, "DELETE FROM users WHERE id = ?", id)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    // Memeriksa apakah ada baris yang dihapus
    rows, err := result.RowsAffected()
    if err != nil {
        tx.Rollback()
        return err
    }
    
    if rows == 0 {
        tx.Rollback()
        return fmt.Errorf("user not found")
    }
    
    // Commit transaksi
    return tx.Commit()
}

func main() {
    // Membuka koneksi database
    db, err := sql.Open("sqlite3", "users.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Memeriksa koneksi
    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat tabel users
    _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat repository
    repo := NewUserRepository(db)
    
    // Membuat context
    ctx := context.Background()
    
    // Membuat user
    user := &User{
        Username: "john",
        Email:    "john@example.com",
    }
    
    err = repo.CreateUser(ctx, user)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    
    // Mengambil user
    user, err = repo.GetUserByID(ctx, user.ID)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Retrieved user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    
    // Memperbarui user
    user.Username = "jane"
    user.Email = "jane@example.com"
    
    err = repo.UpdateUser(ctx, user)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Updated user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    
    // Menghapus user
    err = repo.DeleteUser(ctx, user.ID)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Deleted user: ID=%d\n", user.ID)
    
    // Membuat beberapa user dalam satu transaksi
    users := []*User{
        {
            Username: "alice",
            Email:    "alice@example.com",
        },
        {
            Username: "bob",
            Email:    "bob@example.com",
        },
        {
            Username: "charlie",
            Email:    "charlie@example.com",
        },
    }
    
    err = repo.CreateUsers(ctx, users)
    if err != nil {
        log.Fatal(err)
    }
    
    for _, user := range users {
        fmt.Printf("Created user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    }
}
```

## Error Handling

Error handling adalah proses menangani error yang terjadi saat berinteraksi dengan database. Error handling yang baik dapat meningkatkan keandalan dan kemudahan pemeliharaan aplikasi.

### Karakteristik Error Handling di Go
- **Error Types**: Jenis error yang dapat terjadi
- **Error Wrapping**: Membungkus error dengan informasi tambahan
- **Error Recovery**: Pemulihan dari error
- **Error Logging**: Pencatatan error untuk debugging
- **Error Propagation**: Penyebaran error ke lapisan aplikasi

### Implementasi Error Handling
```go
// Error handling dasar
package main

import (
    "context"
    "database/sql"
    "errors"
    "fmt"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

// DatabaseError adalah struct untuk menyimpan error database
type DatabaseError struct {
    Op  string // Operasi yang menyebabkan error
    Err error  // Error asli
}

// Error mengembalikan pesan error
func (e *DatabaseError) Error() string {
    if e.Err != nil {
        return fmt.Sprintf("%s: %v", e.Op, e.Err)
    }
    return e.Op
}

// Unwrap mengembalikan error asli
func (e *DatabaseError) Unwrap() error {
    return e.Err
}

// UserRepository adalah struct untuk menyimpan repository user
type UserRepository struct {
    db *sql.DB
}

// NewUserRepository membuat UserRepository baru
func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{
        db: db,
    }
}

// GetUserByID mengambil user berdasarkan ID
func (r *UserRepository) GetUserByID(ctx context.Context, id int) (*User, error) {
    user := &User{}
    
    err := r.db.QueryRowContext(ctx, "SELECT id, username, email FROM users WHERE id = ?", id).Scan(&user.ID, &user.Username, &user.Email)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, &DatabaseError{
                Op:  "GetUserByID",
                Err: errors.New("user not found"),
            }
        }
        return nil, &DatabaseError{
            Op:  "GetUserByID",
            Err: err,
        }
    }
    
    return user, nil
}

// CreateUser membuat user baru
func (r *UserRepository) CreateUser(ctx context.Context, user *User) error {
    // Membuat transaksi
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return &DatabaseError{
            Op:  "CreateUser.BeginTx",
            Err: err,
        }
    }
    
    // Memastikan transaksi di-commit atau di-rollback
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        }
    }()
    
    // Menjalankan query dalam transaksi
    result, err := tx.ExecContext(ctx, "INSERT INTO users (username, email) VALUES (?, ?)", user.Username, user.Email)
    if err != nil {
        tx.Rollback()
        return &DatabaseError{
            Op:  "CreateUser.ExecContext",
            Err: err,
        }
    }
    
    // Mengambil ID user yang baru dibuat
    id, err := result.LastInsertId()
    if err != nil {
        tx.Rollback()
        return &DatabaseError{
            Op:  "CreateUser.LastInsertId",
            Err: err,
        }
    }
    
    user.ID = int(id)
    
    // Commit transaksi
    if err := tx.Commit(); err != nil {
        return &DatabaseError{
            Op:  "CreateUser.Commit",
            Err: err,
        }
    }
    
    return nil
}

// UpdateUser memperbarui user
func (r *UserRepository) UpdateUser(ctx context.Context, user *User) error {
    // Membuat transaksi
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return &DatabaseError{
            Op:  "UpdateUser.BeginTx",
            Err: err,
        }
    }
    
    // Memastikan transaksi di-commit atau di-rollback
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        }
    }()
    
    // Menjalankan query dalam transaksi
    result, err := tx.ExecContext(ctx, "UPDATE users SET username = ?, email = ? WHERE id = ?", user.Username, user.Email, user.ID)
    if err != nil {
        tx.Rollback()
        return &DatabaseError{
            Op:  "UpdateUser.ExecContext",
            Err: err,
        }
    }
    
    // Memeriksa apakah ada baris yang diperbarui
    rows, err := result.RowsAffected()
    if err != nil {
        tx.Rollback()
        return &DatabaseError{
            Op:  "UpdateUser.RowsAffected",
            Err: err,
        }
    }
    
    if rows == 0 {
        tx.Rollback()
        return &DatabaseError{
            Op:  "UpdateUser",
            Err: errors.New("user not found"),
        }
    }
    
    // Commit transaksi
    if err := tx.Commit(); err != nil {
        return &DatabaseError{
            Op:  "UpdateUser.Commit",
            Err: err,
        }
    }
    
    return nil
}

// DeleteUser menghapus user
func (r *UserRepository) DeleteUser(ctx context.Context, id int) error {
    // Membuat transaksi
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return &DatabaseError{
            Op:  "DeleteUser.BeginTx",
            Err: err,
        }
    }
    
    // Memastikan transaksi di-commit atau di-rollback
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        }
    }()
    
    // Menjalankan query dalam transaksi
    result, err := tx.ExecContext(ctx, "DELETE FROM users WHERE id = ?", id)
    if err != nil {
        tx.Rollback()
        return &DatabaseError{
            Op:  "DeleteUser.ExecContext",
            Err: err,
        }
    }
    
    // Memeriksa apakah ada baris yang dihapus
    rows, err := result.RowsAffected()
    if err != nil {
        tx.Rollback()
        return &DatabaseError{
            Op:  "DeleteUser.RowsAffected",
            Err: err,
        }
    }
    
    if rows == 0 {
        tx.Rollback()
        return &DatabaseError{
            Op:  "DeleteUser",
            Err: errors.New("user not found"),
        }
    }
    
    // Commit transaksi
    if err := tx.Commit(); err != nil {
        return &DatabaseError{
            Op:  "DeleteUser.Commit",
            Err: err,
        }
    }
    
    return nil
}

// User adalah struct untuk menyimpan data user
type User struct {
    ID       int
    Username string
    Email    string
}

func main() {
    // Membuka koneksi database
    db, err := sql.Open("sqlite3", "users.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Memeriksa koneksi
    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat tabel users
    _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat repository
    repo := NewUserRepository(db)
    
    // Membuat context
    ctx := context.Background()
    
    // Membuat user
    user := &User{
        Username: "john",
        Email:    "john@example.com",
    }
    
    err = repo.CreateUser(ctx, user)
    if err != nil {
        var dbErr *DatabaseError
        if errors.As(err, &dbErr) {
            log.Printf("Database error: %v", dbErr)
        } else {
            log.Printf("Unknown error: %v", err)
        }
    } else {
        fmt.Printf("Created user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    }
    
    // Mengambil user
    user, err = repo.GetUserByID(ctx, user.ID)
    if err != nil {
        var dbErr *DatabaseError
        if errors.As(err, &dbErr) {
            log.Printf("Database error: %v", dbErr)
        } else {
            log.Printf("Unknown error: %v", err)
        }
    } else {
        fmt.Printf("Retrieved user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    }
    
    // Memperbarui user
    user.Username = "jane"
    user.Email = "jane@example.com"
    
    err = repo.UpdateUser(ctx, user)
    if err != nil {
        var dbErr *DatabaseError
        if errors.As(err, &dbErr) {
            log.Printf("Database error: %v", dbErr)
        } else {
            log.Printf("Unknown error: %v", err)
        }
    } else {
        fmt.Printf("Updated user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    }
    
    // Menghapus user
    err = repo.DeleteUser(ctx, user.ID)
    if err != nil {
        var dbErr *DatabaseError
        if errors.As(err, &dbErr) {
            log.Printf("Database error: %v", dbErr)
        } else {
            log.Printf("Unknown error: %v", err)
        }
    } else {
        fmt.Printf("Deleted user: ID=%d\n", user.ID)
    }
    
    // Mengambil user yang tidak ada
    user, err = repo.GetUserByID(ctx, 999)
    if err != nil {
        var dbErr *DatabaseError
        if errors.As(err, &dbErr) {
            log.Printf("Database error: %v", dbErr)
        } else {
            log.Printf("Unknown error: %v", err)
        }
    } else {
        fmt.Printf("Retrieved user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    }
}
```

## Connection Lifecycle

Connection lifecycle adalah siklus hidup koneksi database, mulai dari pembuatan koneksi hingga penutupan koneksi. Pengelolaan connection lifecycle yang baik dapat meningkatkan kinerja dan keandalan aplikasi.

### Karakteristik Connection Lifecycle di Go
- **Connection Creation**: Pembuatan koneksi database
- **Connection Reuse**: Penggunaan kembali koneksi
- **Connection Health**: Kesehatan koneksi
- **Connection Cleanup**: Pembersihan koneksi
- **Connection Monitoring**: Pemantauan koneksi

### Implementasi Connection Lifecycle
```go
// Connection lifecycle dasar
package main

import (
    "context"
    "database/sql"
    "fmt"
    "log"
    "sync"
    "time"
    _ "github.com/mattn/go-sqlite3"
)

// DatabaseManager adalah struct untuk menyimpan manager database
type DatabaseManager struct {
    db *sql.DB
    mu sync.RWMutex
}

// NewDatabaseManager membuat DatabaseManager baru
func NewDatabaseManager(driver, dsn string, maxOpen, maxIdle int, maxLifetime time.Duration) (*DatabaseManager, error) {
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
    
    return &DatabaseManager{
        db: db,
    }, nil
}

// Close menutup koneksi database
func (m *DatabaseManager) Close() error {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    return m.db.Close()
}

// Ping memeriksa koneksi database
func (m *DatabaseManager) Ping() error {
    m.mu.RLock()
    defer m.mu.RUnlock()
    
    return m.db.Ping()
}

// Stats mengembalikan statistik pool koneksi
func (m *DatabaseManager) Stats() sql.DBStats {
    m.mu.RLock()
    defer m.mu.RUnlock()
    
    return m.db.Stats()
}

// HealthCheck memeriksa kesehatan koneksi database
func (m *DatabaseManager) HealthCheck() error {
    m.mu.RLock()
    defer m.mu.RUnlock()
    
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    return m.db.PingContext(ctx)
}

// QueryContext menjalankan query dengan context
func (m *DatabaseManager) QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error) {
    m.mu.RLock()
    defer m.mu.RUnlock()
    
    return m.db.QueryContext(ctx, query, args...)
}

// QueryRowContext menjalankan query dengan context dan mengembalikan satu baris
func (m *DatabaseManager) QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row {
    m.mu.RLock()
    defer m.mu.RUnlock()
    
    return m.db.QueryRowContext(ctx, query, args...)
}

// ExecContext menjalankan query dengan context tanpa mengembalikan hasil
func (m *DatabaseManager) ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    return m.db.ExecContext(ctx, query, args...)
}

// BeginTxContext memulai transaksi dengan context
func (m *DatabaseManager) BeginTxContext(ctx context.Context, opts *sql.TxOptions) (*sql.Tx, error) {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    return m.db.BeginTxContext(ctx, opts)
}

// MonitorConnection memantau koneksi database
func (m *DatabaseManager) MonitorConnection(interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()
    
    for range ticker.C {
        stats := m.Stats()
        log.Printf("Database stats: MaxOpenConnections=%d, OpenConnections=%d, InUse=%d, Idle=%d, MaxIdleTime=%v, MaxLifetime=%v",
            stats.MaxOpenConnections, stats.OpenConnections, stats.InUse, stats.Idle, stats.MaxIdleTime, stats.MaxLifetime)
        
        err := m.HealthCheck()
        if err != nil {
            log.Printf("Database health check failed: %v", err)
        } else {
            log.Printf("Database health check passed")
        }
    }
}

func main() {
    // Membuat manager database
    manager, err := NewDatabaseManager("sqlite3", "users.db", 10, 5, 30*time.Minute)
    if err != nil {
        log.Fatal(err)
    }
    defer manager.Close()
    
    // Membuat tabel users
    ctx := context.Background()
    _, err = manager.ExecContext(ctx, `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Menjalankan monitor koneksi
    go manager.MonitorConnection(5 * time.Second)
    
    // Menambahkan data
    _, err = manager.ExecContext(ctx, "INSERT INTO users (username, email) VALUES (?, ?)", "john", "john@example.com")
    if err != nil {
        log.Fatal(err)
    }
    
    // Mengambil data
    rows, err := manager.QueryContext(ctx, "SELECT * FROM users")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Memproses hasil query
    for rows.Next() {
        var id int
        var username string
        var email string
        
        err := rows.Scan(&id, &username, &email)
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("ID: %d, Username: %s, Email: %s\n", id, username, email)
    }
    
    // Memeriksa error setelah iterasi
    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }
    
    // Menunggu beberapa detik untuk melihat monitor koneksi
    time.Sleep(15 * time.Second)
}
```

## Kesimpulan

Database basics adalah fondasi penting dalam pengembangan aplikasi backend. Go menyediakan package `database/sql` yang menyediakan antarmuka umum untuk berinteraksi dengan berbagai jenis database.

Dengan memahami dan mengimplementasikan konsep-konsep seperti koneksi database, connection pooling, transaction management, error handling, dan connection lifecycle, kita dapat mengembangkan aplikasi yang berinteraksi dengan database secara efisien dan andal.

Pilihan metode database basics yang tepat tergantung pada kebutuhan aplikasi dan jenis database yang digunakan. Pastikan untuk selalu menutup koneksi database setelah selesai digunakan untuk menghindari kebocoran sumber daya. 