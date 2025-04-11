# SQL Database

SQL Database adalah jenis database yang menggunakan Structured Query Language (SQL) untuk mengelola data. Go menyediakan berbagai driver untuk berinteraksi dengan database SQL populer seperti MySQL, PostgreSQL, dan SQLite.

## MySQL

MySQL adalah sistem manajemen database relasional open-source yang populer. Go menyediakan driver resmi `github.com/go-sql-driver/mysql` untuk berinteraksi dengan MySQL.

### Karakteristik MySQL di Go
- **Driver Resmi**: Driver resmi dari MySQL
- **Connection String**: Format koneksi MySQL
- **Prepared Statements**: Dukungan untuk prepared statements
- **Transaction Support**: Dukungan untuk transaksi
- **Connection Pooling**: Dukungan untuk connection pooling

### Implementasi MySQL
```go
// Koneksi MySQL dasar
package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"
    _ "github.com/go-sql-driver/mysql"
)

func main() {
    // Membuka koneksi MySQL
    // Format: username:password@tcp(host:port)/dbname?param=value
    db, err := sql.Open("mysql", "root:password@tcp(localhost:3306)/testdb?parseTime=true")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Memeriksa koneksi
    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Connected to MySQL database")
    
    // Mengatur opsi koneksi
    db.SetMaxOpenConns(10)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(30 * time.Minute)
    
    // Membuat tabel users
    _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Menambahkan data
    result, err := db.Exec("INSERT INTO users (username, email) VALUES (?, ?)", "john", "john@example.com")
    if err != nil {
        log.Fatal(err)
    }
    
    // Mengambil ID user yang baru dibuat
    id, err := result.LastInsertId()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created user with ID: %d\n", id)
    
    // Mengambil data
    rows, err := db.Query("SELECT id, username, email, created_at FROM users")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Memproses hasil query
    for rows.Next() {
        var id int
        var username string
        var email string
        var createdAt time.Time
        
        err := rows.Scan(&id, &username, &email, &createdAt)
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("ID: %d, Username: %s, Email: %s, Created At: %s\n", id, username, email, createdAt)
    }
    
    // Memeriksa error setelah iterasi
    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }
}
```

## PostgreSQL

PostgreSQL adalah sistem manajemen database relasional open-source yang kuat dan extensible. Go menyediakan driver resmi `github.com/lib/pq` untuk berinteraksi dengan PostgreSQL.

### Karakteristik PostgreSQL di Go
- **Driver Resmi**: Driver resmi dari PostgreSQL
- **Connection String**: Format koneksi PostgreSQL
- **Prepared Statements**: Dukungan untuk prepared statements
- **Transaction Support**: Dukungan untuk transaksi
- **Connection Pooling**: Dukungan untuk connection pooling

### Implementasi PostgreSQL
```go
// Koneksi PostgreSQL dasar
package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"
    _ "github.com/lib/pq"
)

func main() {
    // Membuka koneksi PostgreSQL
    // Format: postgres://username:password@host:port/dbname?sslmode=disable
    db, err := sql.Open("postgres", "postgres://postgres:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Memeriksa koneksi
    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Connected to PostgreSQL database")
    
    // Mengatur opsi koneksi
    db.SetMaxOpenConns(10)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(30 * time.Minute)
    
    // Membuat tabel users
    _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Menambahkan data
    result, err := db.Exec("INSERT INTO users (username, email) VALUES ($1, $2)", "john", "john@example.com")
    if err != nil {
        log.Fatal(err)
    }
    
    // Mengambil ID user yang baru dibuat
    id, err := result.LastInsertId()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created user with ID: %d\n", id)
    
    // Mengambil data
    rows, err := db.Query("SELECT id, username, email, created_at FROM users")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Memproses hasil query
    for rows.Next() {
        var id int
        var username string
        var email string
        var createdAt time.Time
        
        err := rows.Scan(&id, &username, &email, &createdAt)
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("ID: %d, Username: %s, Email: %s, Created At: %s\n", id, username, email, createdAt)
    }
    
    // Memeriksa error setelah iterasi
    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }
}
```

## SQLite

SQLite adalah mesin database SQL yang ringan, serverless, dan self-contained. Go menyediakan driver `github.com/mattn/go-sqlite3` untuk berinteraksi dengan SQLite.

### Karakteristik SQLite di Go
- **Serverless**: Tidak memerlukan server database
- **File-based**: Database disimpan dalam file
- **Prepared Statements**: Dukungan untuk prepared statements
- **Transaction Support**: Dukungan untuk transaksi
- **Connection Pooling**: Dukungan untuk connection pooling

### Implementasi SQLite
```go
// Koneksi SQLite dasar
package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"
    _ "github.com/mattn/go-sqlite3"
)

func main() {
    // Membuka koneksi SQLite
    // Format: file:database.db
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
    
    fmt.Println("Connected to SQLite database")
    
    // Mengatur opsi koneksi
    db.SetMaxOpenConns(10)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(30 * time.Minute)
    
    // Membuat tabel users
    _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Menambahkan data
    result, err := db.Exec("INSERT INTO users (username, email) VALUES (?, ?)", "john", "john@example.com")
    if err != nil {
        log.Fatal(err)
    }
    
    // Mengambil ID user yang baru dibuat
    id, err := result.LastInsertId()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created user with ID: %d\n", id)
    
    // Mengambil data
    rows, err := db.Query("SELECT id, username, email, created_at FROM users")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Memproses hasil query
    for rows.Next() {
        var id int
        var username string
        var email string
        var createdAt string
        
        err := rows.Scan(&id, &username, &email, &createdAt)
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("ID: %d, Username: %s, Email: %s, Created At: %s\n", id, username, email, createdAt)
    }
    
    // Memeriksa error setelah iterasi
    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }
}
```

## Database Drivers

Database driver adalah komponen yang memungkinkan aplikasi Go berinteraksi dengan database. Go menyediakan antarmuka standar `database/sql` dan berbagai driver untuk database populer.

### Karakteristik Database Drivers di Go
- **Standard Interface**: Antarmuka standar `database/sql`
- **Driver Registration**: Pendaftaran driver database
- **Connection String**: Format koneksi database
- **Driver-specific Features**: Fitur khusus driver
- **Driver Options**: Opsi driver database

### Implementasi Database Drivers
```go
// Database drivers dasar
package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"
    _ "github.com/go-sql-driver/mysql"   // MySQL driver
    _ "github.com/lib/pq"                // PostgreSQL driver
    _ "github.com/mattn/go-sqlite3"      // SQLite driver
)

// DatabaseConfig adalah struct untuk menyimpan konfigurasi database
type DatabaseConfig struct {
    Driver   string
    DSN      string
    MaxOpen  int
    MaxIdle  int
    Lifetime time.Duration
}

// NewDatabase membuat koneksi database baru
func NewDatabase(config *DatabaseConfig) (*sql.DB, error) {
    // Membuka koneksi database
    db, err := sql.Open(config.Driver, config.DSN)
    if err != nil {
        return nil, err
    }
    
    // Mengatur opsi koneksi
    db.SetMaxOpenConns(config.MaxOpen)
    db.SetMaxIdleConns(config.MaxIdle)
    db.SetConnMaxLifetime(config.Lifetime)
    
    // Memeriksa koneksi
    err = db.Ping()
    if err != nil {
        return nil, err
    }
    
    return db, nil
}

func main() {
    // Konfigurasi MySQL
    mysqlConfig := &DatabaseConfig{
        Driver:   "mysql",
        DSN:      "root:password@tcp(localhost:3306)/testdb?parseTime=true",
        MaxOpen:  10,
        MaxIdle:  5,
        Lifetime: 30 * time.Minute,
    }
    
    // Konfigurasi PostgreSQL
    postgresConfig := &DatabaseConfig{
        Driver:   "postgres",
        DSN:      "postgres://postgres:password@localhost:5432/testdb?sslmode=disable",
        MaxOpen:  10,
        MaxIdle:  5,
        Lifetime: 30 * time.Minute,
    }
    
    // Konfigurasi SQLite
    sqliteConfig := &DatabaseConfig{
        Driver:   "sqlite3",
        DSN:      "users.db",
        MaxOpen:  10,
        MaxIdle:  5,
        Lifetime: 30 * time.Minute,
    }
    
    // Membuat koneksi MySQL
    mysqlDB, err := NewDatabase(mysqlConfig)
    if err != nil {
        log.Printf("MySQL connection error: %v", err)
    } else {
        defer mysqlDB.Close()
        fmt.Println("Connected to MySQL database")
    }
    
    // Membuat koneksi PostgreSQL
    postgresDB, err := NewDatabase(postgresConfig)
    if err != nil {
        log.Printf("PostgreSQL connection error: %v", err)
    } else {
        defer postgresDB.Close()
        fmt.Println("Connected to PostgreSQL database")
    }
    
    // Membuat koneksi SQLite
    sqliteDB, err := NewDatabase(sqliteConfig)
    if err != nil {
        log.Printf("SQLite connection error: %v", err)
    } else {
        defer sqliteDB.Close()
        fmt.Println("Connected to SQLite database")
    }
}
```

## Query Building

Query building adalah proses membangun query SQL secara dinamis. Go menyediakan berbagai library untuk membantu dalam membangun query SQL, seperti `github.com/Masterminds/squirrel` dan `github.com/doug-martin/goqu`.

### Karakteristik Query Building di Go
- **Dynamic Queries**: Pembuatan query secara dinamis
- **Parameter Binding**: Pengikatan parameter query
- **Query Composition**: Komposisi query
- **Query Validation**: Validasi query
- **Query Execution**: Eksekusi query

### Implementasi Query Building
```go
// Query building dasar dengan Squirrel
package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"
    _ "github.com/go-sql-driver/mysql"
    "github.com/Masterminds/squirrel"
)

// User adalah struct untuk menyimpan data user
type User struct {
    ID        int
    Username  string
    Email     string
    CreatedAt time.Time
}

// UserRepository adalah struct untuk menyimpan repository user
type UserRepository struct {
    db *sql.DB
    qb squirrel.StatementBuilderType
}

// NewUserRepository membuat UserRepository baru
func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{
        db: db,
        qb: squirrel.StatementBuilder.PlaceholderFormat(squirrel.Question),
    }
}

// CreateUser membuat user baru
func (r *UserRepository) CreateUser(user *User) error {
    // Membuat query insert
    query, args, err := r.qb.Insert("users").
        Columns("username", "email").
        Values(user.Username, user.Email).
        ToSql()
    if err != nil {
        return err
    }
    
    // Menjalankan query
    result, err := r.db.Exec(query, args...)
    if err != nil {
        return err
    }
    
    // Mengambil ID user yang baru dibuat
    id, err := result.LastInsertId()
    if err != nil {
        return err
    }
    
    user.ID = int(id)
    
    return nil
}

// GetUserByID mengambil user berdasarkan ID
func (r *UserRepository) GetUserByID(id int) (*User, error) {
    // Membuat query select
    query, args, err := r.qb.Select("id", "username", "email", "created_at").
        From("users").
        Where(squirrel.Eq{"id": id}).
        ToSql()
    if err != nil {
        return nil, err
    }
    
    // Menjalankan query
    row := r.db.QueryRow(query, args...)
    
    // Memproses hasil query
    user := &User{}
    err = row.Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("user not found")
        }
        return nil, err
    }
    
    return user, nil
}

// GetUsers mengambil semua user
func (r *UserRepository) GetUsers() ([]*User, error) {
    // Membuat query select
    query, args, err := r.qb.Select("id", "username", "email", "created_at").
        From("users").
        OrderBy("id ASC").
        ToSql()
    if err != nil {
        return nil, err
    }
    
    // Menjalankan query
    rows, err := r.db.Query(query, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    // Memproses hasil query
    var users []*User
    for rows.Next() {
        user := &User{}
        err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt)
        if err != nil {
            return nil, err
        }
        users = append(users, user)
    }
    
    // Memeriksa error setelah iterasi
    if err := rows.Err(); err != nil {
        return nil, err
    }
    
    return users, nil
}

// UpdateUser memperbarui user
func (r *UserRepository) UpdateUser(user *User) error {
    // Membuat query update
    query, args, err := r.qb.Update("users").
        Set("username", user.Username).
        Set("email", user.Email).
        Where(squirrel.Eq{"id": user.ID}).
        ToSql()
    if err != nil {
        return err
    }
    
    // Menjalankan query
    result, err := r.db.Exec(query, args...)
    if err != nil {
        return err
    }
    
    // Memeriksa apakah ada baris yang diperbarui
    rows, err := result.RowsAffected()
    if err != nil {
        return err
    }
    
    if rows == 0 {
        return fmt.Errorf("user not found")
    }
    
    return nil
}

// DeleteUser menghapus user
func (r *UserRepository) DeleteUser(id int) error {
    // Membuat query delete
    query, args, err := r.qb.Delete("users").
        Where(squirrel.Eq{"id": id}).
        ToSql()
    if err != nil {
        return err
    }
    
    // Menjalankan query
    result, err := r.db.Exec(query, args...)
    if err != nil {
        return err
    }
    
    // Memeriksa apakah ada baris yang dihapus
    rows, err := result.RowsAffected()
    if err != nil {
        return err
    }
    
    if rows == 0 {
        return fmt.Errorf("user not found")
    }
    
    return nil
}

// SearchUsers mencari user berdasarkan kriteria
func (r *UserRepository) SearchUsers(username, email string) ([]*User, error) {
    // Membuat query select
    builder := r.qb.Select("id", "username", "email", "created_at").
        From("users")
    
    // Menambahkan kondisi pencarian
    if username != "" {
        builder = builder.Where(squirrel.Like{"username": "%" + username + "%"})
    }
    
    if email != "" {
        builder = builder.Where(squirrel.Like{"email": "%" + email + "%"})
    }
    
    // Menambahkan pengurutan
    builder = builder.OrderBy("id ASC")
    
    // Membuat query
    query, args, err := builder.ToSql()
    if err != nil {
        return nil, err
    }
    
    // Menjalankan query
    rows, err := r.db.Query(query, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    // Memproses hasil query
    var users []*User
    for rows.Next() {
        user := &User{}
        err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt)
        if err != nil {
            return nil, err
        }
        users = append(users, user)
    }
    
    // Memeriksa error setelah iterasi
    if err := rows.Err(); err != nil {
        return nil, err
    }
    
    return users, nil
}

func main() {
    // Membuka koneksi MySQL
    db, err := sql.Open("mysql", "root:password@tcp(localhost:3306)/testdb?parseTime=true")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Memeriksa koneksi
    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Connected to MySQL database")
    
    // Membuat tabel users
    _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat repository
    repo := NewUserRepository(db)
    
    // Membuat user
    user := &User{
        Username: "john",
        Email:    "john@example.com",
    }
    
    err = repo.CreateUser(user)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    
    // Mengambil user
    user, err = repo.GetUserByID(user.ID)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Retrieved user: ID=%d, Username=%s, Email=%s, Created At=%s\n", user.ID, user.Username, user.Email, user.CreatedAt)
    
    // Memperbarui user
    user.Username = "jane"
    user.Email = "jane@example.com"
    
    err = repo.UpdateUser(user)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Updated user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    
    // Mencari user
    users, err := repo.SearchUsers("jane", "")
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users\n", len(users))
    for _, user := range users {
        fmt.Printf("ID=%d, Username=%s, Email=%s, Created At=%s\n", user.ID, user.Username, user.Email, user.CreatedAt)
    }
    
    // Menghapus user
    err = repo.DeleteUser(user.ID)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Deleted user: ID=%d\n", user.ID)
}
```

## Kesimpulan

SQL Database adalah jenis database yang menggunakan Structured Query Language (SQL) untuk mengelola data. Go menyediakan berbagai driver untuk berinteraksi dengan database SQL populer seperti MySQL, PostgreSQL, dan SQLite.

Dengan memahami dan mengimplementasikan konsep-konsep seperti koneksi database, query building, dan driver database, kita dapat mengembangkan aplikasi yang berinteraksi dengan database SQL secara efisien dan andal.

Pilihan database SQL yang tepat tergantung pada kebutuhan aplikasi. MySQL cocok untuk aplikasi web sederhana, PostgreSQL cocok untuk aplikasi yang memerlukan fitur lanjutan, dan SQLite cocok untuk aplikasi yang memerlukan database ringan dan serverless. 