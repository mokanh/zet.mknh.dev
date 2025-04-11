# Database Testing

Database testing adalah praktik memverifikasi bahwa operasi database berfungsi dengan benar dan menghasilkan hasil yang diharapkan. Dalam pengembangan aplikasi Go, pengujian database yang baik sangat penting untuk memastikan integritas data dan keandalan aplikasi.

## Unit Testing

Unit testing adalah pengujian komponen individual dari aplikasi dalam isolasi. Untuk database, ini melibatkan pengujian fungsi-fungsi yang berinteraksi dengan database tanpa benar-benar terhubung ke database produksi.

### Karakteristik Unit Testing Database
- **Mocking**: Menggunakan mock objects untuk mensimulasikan database
- **Isolation**: Pengujian dalam isolasi dari database asli
- **Deterministic**: Hasil pengujian yang konsisten dan dapat diprediksi
- **Fast**: Pengujian yang cepat tanpa ketergantungan eksternal
- **Repeatable**: Pengujian yang dapat dijalankan berulang kali

### Implementasi Unit Testing Database
```go
// Implementasi dasar unit testing database
package main

import (
    "database/sql"
    "errors"
    "testing"
)

// User struct untuk contoh
type User struct {
    ID       int
    Username string
    Email    string
}

// UserRepository adalah interface untuk operasi database
type UserRepository interface {
    GetUserByID(id int) (*User, error)
    CreateUser(username, email string) (*User, error)
    UpdateUser(id int, username, email string) error
    DeleteUser(id int) error
}

// SQLUserRepository adalah implementasi konkret dari UserRepository
type SQLUserRepository struct {
    db *sql.DB
}

// NewSQLUserRepository membuat instance baru dari SQLUserRepository
func NewSQLUserRepository(db *sql.DB) *SQLUserRepository {
    return &SQLUserRepository{
        db: db,
    }
}

// GetUserByID mengambil user berdasarkan ID
func (r *SQLUserRepository) GetUserByID(id int) (*User, error) {
    user := &User{}
    err := r.db.QueryRow("SELECT id, username, email FROM users WHERE id = $1", id).Scan(&user.ID, &user.Username, &user.Email)
    if err != nil {
        return nil, err
    }
    
    return user, nil
}

// CreateUser membuat user baru
func (r *SQLUserRepository) CreateUser(username, email string) (*User, error) {
    var id int
    err := r.db.QueryRow("INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id", username, email).Scan(&id)
    if err != nil {
        return nil, err
    }
    
    return &User{
        ID:       id,
        Username: username,
        Email:    email,
    }, nil
}

// UpdateUser memperbarui user
func (r *SQLUserRepository) UpdateUser(id int, username, email string) error {
    result, err := r.db.Exec("UPDATE users SET username = $1, email = $2 WHERE id = $3", username, email, id)
    if err != nil {
        return err
    }
    
    rows, err := result.RowsAffected()
    if err != nil {
        return err
    }
    
    if rows == 0 {
        return errors.New("user not found")
    }
    
    return nil
}

// DeleteUser menghapus user
func (r *SQLUserRepository) DeleteUser(id int) error {
    result, err := r.db.Exec("DELETE FROM users WHERE id = $1", id)
    if err != nil {
        return err
    }
    
    rows, err := result.RowsAffected()
    if err != nil {
        return err
    }
    
    if rows == 0 {
        return errors.New("user not found")
    }
    
    return nil
}

// MockUserRepository adalah implementasi mock dari UserRepository
type MockUserRepository struct {
    users map[int]*User
}

// NewMockUserRepository membuat instance baru dari MockUserRepository
func NewMockUserRepository() *MockUserRepository {
    return &MockUserRepository{
        users: make(map[int]*User),
    }
}

// GetUserByID mengambil user berdasarkan ID dari mock
func (r *MockUserRepository) GetUserByID(id int) (*User, error) {
    user, exists := r.users[id]
    if !exists {
        return nil, errors.New("user not found")
    }
    
    return user, nil
}

// CreateUser membuat user baru di mock
func (r *MockUserRepository) CreateUser(username, email string) (*User, error) {
    // Generate ID sederhana
    id := len(r.users) + 1
    
    user := &User{
        ID:       id,
        Username: username,
        Email:    email,
    }
    
    r.users[id] = user
    
    return user, nil
}

// UpdateUser memperbarui user di mock
func (r *MockUserRepository) UpdateUser(id int, username, email string) error {
    user, exists := r.users[id]
    if !exists {
        return errors.New("user not found")
    }
    
    user.Username = username
    user.Email = email
    
    return nil
}

// DeleteUser menghapus user dari mock
func (r *MockUserRepository) DeleteUser(id int) error {
    _, exists := r.users[id]
    if !exists {
        return errors.New("user not found")
    }
    
    delete(r.users, id)
    
    return nil
}

// UserService adalah service yang menggunakan UserRepository
type UserService struct {
    repo UserRepository
}

// NewUserService membuat instance baru dari UserService
func NewUserService(repo UserRepository) *UserService {
    return &UserService{
        repo: repo,
    }
}

// GetUser mengambil user berdasarkan ID
func (s *UserService) GetUser(id int) (*User, error) {
    return s.repo.GetUserByID(id)
}

// CreateUser membuat user baru
func (s *UserService) CreateUser(username, email string) (*User, error) {
    // Validasi input
    if username == "" {
        return nil, errors.New("username is required")
    }
    
    if email == "" {
        return nil, errors.New("email is required")
    }
    
    return s.repo.CreateUser(username, email)
}

// UpdateUser memperbarui user
func (s *UserService) UpdateUser(id int, username, email string) error {
    // Validasi input
    if username == "" {
        return errors.New("username is required")
    }
    
    if email == "" {
        return errors.New("email is required")
    }
    
    return s.repo.UpdateUser(id, username, email)
}

// DeleteUser menghapus user
func (s *UserService) DeleteUser(id int) error {
    return s.repo.DeleteUser(id)
}

// Unit test untuk UserService dengan mock repository
func TestUserService_GetUser(t *testing.T) {
    // Setup
    mockRepo := NewMockUserRepository()
    service := NewUserService(mockRepo)
    
    // Test case 1: User exists
    user, err := mockRepo.CreateUser("john", "john@example.com")
    if err != nil {
        t.Fatalf("Failed to create test user: %v", err)
    }
    
    result, err := service.GetUser(user.ID)
    if err != nil {
        t.Errorf("GetUser failed: %v", err)
    }
    
    if result.ID != user.ID || result.Username != user.Username || result.Email != user.Email {
        t.Errorf("GetUser returned incorrect user: got %+v, want %+v", result, user)
    }
    
    // Test case 2: User does not exist
    _, err = service.GetUser(999)
    if err == nil {
        t.Error("GetUser should return error for non-existent user")
    }
}

func TestUserService_CreateUser(t *testing.T) {
    // Setup
    mockRepo := NewMockUserRepository()
    service := NewUserService(mockRepo)
    
    // Test case 1: Valid input
    user, err := service.CreateUser("john", "john@example.com")
    if err != nil {
        t.Errorf("CreateUser failed: %v", err)
    }
    
    if user.Username != "john" || user.Email != "john@example.com" {
        t.Errorf("CreateUser returned incorrect user: got %+v", user)
    }
    
    // Test case 2: Empty username
    _, err = service.CreateUser("", "john@example.com")
    if err == nil {
        t.Error("CreateUser should return error for empty username")
    }
    
    // Test case 3: Empty email
    _, err = service.CreateUser("john", "")
    if err == nil {
        t.Error("CreateUser should return error for empty email")
    }
}

func TestUserService_UpdateUser(t *testing.T) {
    // Setup
    mockRepo := NewMockUserRepository()
    service := NewUserService(mockRepo)
    
    // Create test user
    user, err := mockRepo.CreateUser("john", "john@example.com")
    if err != nil {
        t.Fatalf("Failed to create test user: %v", err)
    }
    
    // Test case 1: Valid input
    err = service.UpdateUser(user.ID, "john_updated", "john_updated@example.com")
    if err != nil {
        t.Errorf("UpdateUser failed: %v", err)
    }
    
    updatedUser, err := service.GetUser(user.ID)
    if err != nil {
        t.Fatalf("Failed to get updated user: %v", err)
    }
    
    if updatedUser.Username != "john_updated" || updatedUser.Email != "john_updated@example.com" {
        t.Errorf("UpdateUser did not update user correctly: got %+v", updatedUser)
    }
    
    // Test case 2: Empty username
    err = service.UpdateUser(user.ID, "", "john@example.com")
    if err == nil {
        t.Error("UpdateUser should return error for empty username")
    }
    
    // Test case 3: Empty email
    err = service.UpdateUser(user.ID, "john", "")
    if err == nil {
        t.Error("UpdateUser should return error for empty email")
    }
    
    // Test case 4: Non-existent user
    err = service.UpdateUser(999, "john", "john@example.com")
    if err == nil {
        t.Error("UpdateUser should return error for non-existent user")
    }
}

func TestUserService_DeleteUser(t *testing.T) {
    // Setup
    mockRepo := NewMockUserRepository()
    service := NewUserService(mockRepo)
    
    // Create test user
    user, err := mockRepo.CreateUser("john", "john@example.com")
    if err != nil {
        t.Fatalf("Failed to create test user: %v", err)
    }
    
    // Test case 1: Valid input
    err = service.DeleteUser(user.ID)
    if err != nil {
        t.Errorf("DeleteUser failed: %v", err)
    }
    
    // Verify user is deleted
    _, err = service.GetUser(user.ID)
    if err == nil {
        t.Error("GetUser should return error for deleted user")
    }
    
    // Test case 2: Non-existent user
    err = service.DeleteUser(999)
    if err == nil {
        t.Error("DeleteUser should return error for non-existent user")
    }
}
```

## Integration Testing

Integration testing adalah pengujian interaksi antara komponen aplikasi, termasuk interaksi dengan database. Ini melibatkan pengujian dengan database yang sebenarnya (biasanya database test).

### Karakteristik Integration Testing Database
- **Real Database**: Menggunakan database yang sebenarnya (biasanya database test)
- **Test Data**: Data khusus untuk pengujian
- **Cleanup**: Membersihkan data setelah pengujian
- **Transactions**: Menggunakan transaksi untuk isolasi pengujian
- **Environment**: Konfigurasi khusus untuk lingkungan pengujian

### Implementasi Integration Testing Database
```go
// Implementasi dasar integration testing database
package main

import (
    "context"
    "database/sql"
    "fmt"
    "os"
    "testing"
    _ "github.com/lib/pq"
)

// TestMain adalah entry point untuk pengujian
func TestMain(m *testing.M) {
    // Setup
    db, err := setupTestDB()
    if err != nil {
        fmt.Printf("Failed to setup test database: %v\n", err)
        os.Exit(1)
    }
    defer db.Close()
    
    // Run tests
    code := m.Run()
    
    // Cleanup
    cleanupTestDB(db)
    
    os.Exit(code)
}

// setupTestDB menyiapkan database untuk pengujian
func setupTestDB() (*sql.DB, error) {
    // Buka koneksi ke database test
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        return nil, err
    }
    
    // Buat tabel users jika belum ada
    _, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL
        )
    `)
    if err != nil {
        return nil, err
    }
    
    return db, nil
}

// cleanupTestDB membersihkan database setelah pengujian
func cleanupTestDB(db *sql.DB) {
    // Hapus semua data dari tabel users
    _, err := db.Exec("DELETE FROM users")
    if err != nil {
        fmt.Printf("Failed to cleanup test database: %v\n", err)
    }
}

// TestUserRepository_Integration adalah pengujian integrasi untuk UserRepository
func TestUserRepository_Integration(t *testing.T) {
    // Setup
    db, err := setupTestDB()
    if err != nil {
        t.Fatalf("Failed to setup test database: %v", err)
    }
    defer db.Close()
    
    repo := NewSQLUserRepository(db)
    
    // Test case 1: Create and get user
    user, err := repo.CreateUser("john", "john@example.com")
    if err != nil {
        t.Fatalf("CreateUser failed: %v", err)
    }
    
    if user.Username != "john" || user.Email != "john@example.com" {
        t.Errorf("CreateUser returned incorrect user: got %+v", user)
    }
    
    retrievedUser, err := repo.GetUserByID(user.ID)
    if err != nil {
        t.Fatalf("GetUserByID failed: %v", err)
    }
    
    if retrievedUser.ID != user.ID || retrievedUser.Username != user.Username || retrievedUser.Email != user.Email {
        t.Errorf("GetUserByID returned incorrect user: got %+v, want %+v", retrievedUser, user)
    }
    
    // Test case 2: Update user
    err = repo.UpdateUser(user.ID, "john_updated", "john_updated@example.com")
    if err != nil {
        t.Fatalf("UpdateUser failed: %v", err)
    }
    
    updatedUser, err := repo.GetUserByID(user.ID)
    if err != nil {
        t.Fatalf("GetUserByID failed: %v", err)
    }
    
    if updatedUser.Username != "john_updated" || updatedUser.Email != "john_updated@example.com" {
        t.Errorf("UpdateUser did not update user correctly: got %+v", updatedUser)
    }
    
    // Test case 3: Delete user
    err = repo.DeleteUser(user.ID)
    if err != nil {
        t.Fatalf("DeleteUser failed: %v", err)
    }
    
    _, err = repo.GetUserByID(user.ID)
    if err == nil {
        t.Error("GetUserByID should return error for deleted user")
    }
}

// TestWithTransaction adalah helper untuk menjalankan pengujian dalam transaksi
func TestWithTransaction(t *testing.T, db *sql.DB, fn func(*sql.Tx) error) {
    // Mulai transaksi
    tx, err := db.Begin()
    if err != nil {
        t.Fatalf("Failed to begin transaction: %v", err)
    }
    defer tx.Rollback() // Rollback jika pengujian gagal
    
    // Jalankan fungsi pengujian
    err = fn(tx)
    if err != nil {
        t.Fatalf("Test function failed: %v", err)
    }
    
    // Commit transaksi
    err = tx.Commit()
    if err != nil {
        t.Fatalf("Failed to commit transaction: %v", err)
    }
}

// TestUserRepository_Transaction adalah pengujian integrasi dengan transaksi
func TestUserRepository_Transaction(t *testing.T) {
    // Setup
    db, err := setupTestDB()
    if err != nil {
        t.Fatalf("Failed to setup test database: %v", err)
    }
    defer db.Close()
    
    // Test case: Create user in transaction
    TestWithTransaction(t, db, func(tx *sql.Tx) error {
        // Buat repository dengan transaksi
        repo := &SQLUserRepository{db: tx.DB()}
        
        // Buat user
        user, err := repo.CreateUser("john", "john@example.com")
        if err != nil {
            return err
        }
        
        // Verifikasi user
        if user.Username != "john" || user.Email != "john@example.com" {
            return fmt.Errorf("CreateUser returned incorrect user: %+v", user)
        }
        
        return nil
    })
    
    // Verifikasi user ada di database setelah transaksi
    repo := NewSQLUserRepository(db)
    users, err := repo.GetAllUsers()
    if err != nil {
        t.Fatalf("GetAllUsers failed: %v", err)
    }
    
    if len(users) != 1 {
        t.Errorf("Expected 1 user, got %d", len(users))
    }
    
    if users[0].Username != "john" || users[0].Email != "john@example.com" {
        t.Errorf("User in database is incorrect: %+v", users[0])
    }
}

// GetAllUsers mengambil semua user (tambahan untuk pengujian)
func (r *SQLUserRepository) GetAllUsers() ([]*User, error) {
    rows, err := r.db.Query("SELECT id, username, email FROM users")
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
    
    return users, nil
}
```

## Test Database Setup

Test database setup adalah proses menyiapkan database khusus untuk pengujian. Ini melibatkan pembuatan skema, data awal, dan konfigurasi khusus untuk lingkungan pengujian.

### Karakteristik Test Database Setup
- **Isolation**: Database terpisah dari database produksi
- **Automation**: Proses otomatis untuk setup dan cleanup
- **Reproducibility**: Hasil yang konsisten setiap kali pengujian dijalankan
- **Migration**: Menggunakan migrasi database untuk setup
- **Seeding**: Mengisi database dengan data awal

### Implementasi Test Database Setup
```go
// Implementasi dasar test database setup
package main

import (
    "context"
    "database/sql"
    "fmt"
    "os"
    "path/filepath"
    "testing"
    _ "github.com/lib/pq"
    "github.com/golang-migrate/migrate/v4"
    _ "github.com/golang-migrate/migrate/v4/database/postgres"
    _ "github.com/golang-migrate/migrate/v4/source/file"
)

// TestDB adalah wrapper untuk database test
type TestDB struct {
    DB *sql.DB
    Migrate *migrate.Migrate
}

// SetupTestDB menyiapkan database test
func SetupTestDB(t *testing.T) *TestDB {
    // Konfigurasi database test
    dbURL := "postgres://username:password@localhost:5432/testdb?sslmode=disable"
    
    // Buka koneksi ke database test
    db, err := sql.Open("postgres", dbURL)
    if err != nil {
        t.Fatalf("Failed to open test database: %v", err)
    }
    
    // Buat migrasi
    migrationsPath := filepath.Join("..", "migrations")
    m, err := migrate.New(
        fmt.Sprintf("file://%s", migrationsPath),
        dbURL,
    )
    if err != nil {
        t.Fatalf("Failed to create migrate instance: %v", err)
    }
    
    // Jalankan migrasi
    err = m.Up()
    if err != nil && err != migrate.ErrNoChange {
        t.Fatalf("Failed to run migrations: %v", err)
    }
    
    return &TestDB{
        DB: db,
        Migrate: m,
    }
}

// CleanupTestDB membersihkan database test
func (tdb *TestDB) CleanupTestDB(t *testing.T) {
    // Rollback migrasi
    err := tdb.Migrate.Down()
    if err != nil && err != migrate.ErrNoChange {
        t.Errorf("Failed to rollback migrations: %v", err)
    }
    
    // Tutup koneksi
    err = tdb.DB.Close()
    if err != nil {
        t.Errorf("Failed to close database connection: %v", err)
    }
}

// SeedTestData mengisi database test dengan data awal
func (tdb *TestDB) SeedTestData(t *testing.T) {
    // Buat data awal
    users := []struct {
        username string
        email    string
    }{
        {"user1", "user1@example.com"},
        {"user2", "user2@example.com"},
        {"user3", "user3@example.com"},
    }
    
    // Masukkan data ke database
    for _, u := range users {
        _, err := tdb.DB.Exec("INSERT INTO users (username, email) VALUES ($1, $2)", u.username, u.email)
        if err != nil {
            t.Fatalf("Failed to seed test data: %v", err)
        }
    }
}

// TestUserRepository_WithSetup adalah pengujian dengan setup database
func TestUserRepository_WithSetup(t *testing.T) {
    // Setup database test
    testDB := SetupTestDB(t)
    defer testDB.CleanupTestDB(t)
    
    // Seed data awal
    testDB.SeedTestData(t)
    
    // Buat repository
    repo := NewSQLUserRepository(testDB.DB)
    
    // Test case: Get all users
    users, err := repo.GetAllUsers()
    if err != nil {
        t.Fatalf("GetAllUsers failed: %v", err)
    }
    
    // Verifikasi jumlah user
    if len(users) != 3 {
        t.Errorf("Expected 3 users, got %d", len(users))
    }
    
    // Test case: Create new user
    user, err := repo.CreateUser("newuser", "newuser@example.com")
    if err != nil {
        t.Fatalf("CreateUser failed: %v", err)
    }
    
    // Verifikasi user baru
    if user.Username != "newuser" || user.Email != "newuser@example.com" {
        t.Errorf("CreateUser returned incorrect user: %+v", user)
    }
    
    // Verifikasi jumlah user setelah penambahan
    users, err = repo.GetAllUsers()
    if err != nil {
        t.Fatalf("GetAllUsers failed: %v", err)
    }
    
    if len(users) != 4 {
        t.Errorf("Expected 4 users, got %d", len(users))
    }
}

// TestMain adalah entry point untuk pengujian
func TestMain(m *testing.M) {
    // Jalankan pengujian
    code := m.Run()
    
    // Keluar dengan kode yang sesuai
    os.Exit(code)
}
```

## Performance Testing

Performance testing adalah pengujian untuk mengukur kinerja operasi database, seperti kecepatan query, throughput, dan penggunaan sumber daya.

### Karakteristik Performance Testing Database
- **Query Performance**: Mengukur waktu eksekusi query
- **Concurrency**: Menguji kinerja dengan banyak koneksi bersamaan
- **Load Testing**: Menguji kinerja di bawah beban tinggi
- **Benchmarking**: Membandingkan kinerja dengan baseline
- **Resource Usage**: Mengukur penggunaan CPU, memori, dan I/O

### Implementasi Performance Testing Database
```go
// Implementasi dasar performance testing database
package main

import (
    "context"
    "database/sql"
    "fmt"
    "sync"
    "testing"
    "time"
    _ "github.com/lib/pq"
)

// BenchmarkUserRepository_GetUserByID adalah benchmark untuk GetUserByID
func BenchmarkUserRepository_GetUserByID(b *testing.B) {
    // Setup
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        b.Fatalf("Failed to open database: %v", err)
    }
    defer db.Close()
    
    repo := NewSQLUserRepository(db)
    
    // Buat user untuk diuji
    user, err := repo.CreateUser("benchmark_user", "benchmark@example.com")
    if err != nil {
        b.Fatalf("Failed to create test user: %v", err)
    }
    
    // Reset timer
    b.ResetTimer()
    
    // Jalankan benchmark
    for i := 0; i < b.N; i++ {
        _, err := repo.GetUserByID(user.ID)
        if err != nil {
            b.Fatalf("GetUserByID failed: %v", err)
        }
    }
}

// BenchmarkUserRepository_CreateUser adalah benchmark untuk CreateUser
func BenchmarkUserRepository_CreateUser(b *testing.B) {
    // Setup
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        b.Fatalf("Failed to open database: %v", err)
    }
    defer db.Close()
    
    repo := NewSQLUserRepository(db)
    
    // Reset timer
    b.ResetTimer()
    
    // Jalankan benchmark
    for i := 0; i < b.N; i++ {
        username := fmt.Sprintf("benchmark_user_%d", i)
        email := fmt.Sprintf("benchmark_%d@example.com", i)
        
        _, err := repo.CreateUser(username, email)
        if err != nil {
            b.Fatalf("CreateUser failed: %v", err)
        }
    }
}

// TestUserRepository_Concurrency adalah pengujian konkurensi
func TestUserRepository_Concurrency(t *testing.T) {
    // Setup
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        t.Fatalf("Failed to open database: %v", err)
    }
    defer db.Close()
    
    repo := NewSQLUserRepository(db)
    
    // Buat user untuk diuji
    user, err := repo.CreateUser("concurrency_user", "concurrency@example.com")
    if err != nil {
        t.Fatalf("Failed to create test user: %v", err)
    }
    
    // Jumlah goroutine
    numGoroutines := 10
    
    // WaitGroup untuk menunggu semua goroutine selesai
    var wg sync.WaitGroup
    wg.Add(numGoroutines)
    
    // Jalankan goroutine
    for i := 0; i < numGoroutines; i++ {
        go func(id int) {
            defer wg.Done()
            
            // Ambil user
            retrievedUser, err := repo.GetUserByID(user.ID)
            if err != nil {
                t.Errorf("Goroutine %d: GetUserByID failed: %v", id, err)
                return
            }
            
            // Verifikasi user
            if retrievedUser.ID != user.ID || retrievedUser.Username != user.Username || retrievedUser.Email != user.Email {
                t.Errorf("Goroutine %d: GetUserByID returned incorrect user: got %+v, want %+v", id, retrievedUser, user)
            }
        }(i)
    }
    
    // Tunggu semua goroutine selesai
    wg.Wait()
}

// TestUserRepository_Load adalah pengujian beban
func TestUserRepository_Load(t *testing.T) {
    // Setup
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        t.Fatalf("Failed to open database: %v", err)
    }
    defer db.Close()
    
    repo := NewSQLUserRepository(db)
    
    // Jumlah operasi
    numOperations := 100
    
    // Waktu mulai
    startTime := time.Now()
    
    // Jalankan operasi
    for i := 0; i < numOperations; i++ {
        username := fmt.Sprintf("load_user_%d", i)
        email := fmt.Sprintf("load_%d@example.com", i)
        
        // Buat user
        user, err := repo.CreateUser(username, email)
        if err != nil {
            t.Fatalf("CreateUser failed: %v", err)
        }
        
        // Ambil user
        retrievedUser, err := repo.GetUserByID(user.ID)
        if err != nil {
            t.Fatalf("GetUserByID failed: %v", err)
        }
        
        // Verifikasi user
        if retrievedUser.ID != user.ID || retrievedUser.Username != user.Username || retrievedUser.Email != user.Email {
            t.Errorf("GetUserByID returned incorrect user: got %+v, want %+v", retrievedUser, user)
        }
        
        // Update user
        err = repo.UpdateUser(user.ID, username+"_updated", email+"_updated")
        if err != nil {
            t.Fatalf("UpdateUser failed: %v", err)
        }
        
        // Verifikasi update
        updatedUser, err := repo.GetUserByID(user.ID)
        if err != nil {
            t.Fatalf("GetUserByID failed: %v", err)
        }
        
        if updatedUser.Username != username+"_updated" || updatedUser.Email != email+"_updated" {
            t.Errorf("UpdateUser did not update user correctly: got %+v", updatedUser)
        }
        
        // Hapus user
        err = repo.DeleteUser(user.ID)
        if err != nil {
            t.Fatalf("DeleteUser failed: %v", err)
        }
    }
    
    // Waktu selesai
    endTime := time.Now()
    
    // Hitung durasi
    duration := endTime.Sub(startTime)
    
    // Hitung throughput
    throughput := float64(numOperations) / duration.Seconds()
    
    // Log hasil
    t.Logf("Completed %d operations in %v (%.2f ops/sec)", numOperations, duration, throughput)
}

// TestUserRepository_QueryPerformance adalah pengujian kinerja query
func TestUserRepository_QueryPerformance(t *testing.T) {
    // Setup
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        t.Fatalf("Failed to open database: %v", err)
    }
    defer db.Close()
    
    repo := NewSQLUserRepository(db)
    
    // Buat data untuk diuji
    for i := 0; i < 1000; i++ {
        username := fmt.Sprintf("perf_user_%d", i)
        email := fmt.Sprintf("perf_%d@example.com", i)
        
        _, err := repo.CreateUser(username, email)
        if err != nil {
            t.Fatalf("Failed to create test user: %v", err)
        }
    }
    
    // Test case 1: Query sederhana
    startTime := time.Now()
    
    users, err := repo.GetAllUsers()
    if err != nil {
        t.Fatalf("GetAllUsers failed: %v", err)
    }
    
    duration := time.Since(startTime)
    t.Logf("GetAllUsers: %d users in %v", len(users), duration)
    
    // Test case 2: Query dengan filter
    startTime = time.Now()
    
    // Tambahkan metode SearchUsersByUsername ke SQLUserRepository
    users, err = repo.SearchUsersByUsername("perf_user")
    if err != nil {
        t.Fatalf("SearchUsersByUsername failed: %v", err)
    }
    
    duration = time.Since(startTime)
    t.Logf("SearchUsersByUsername: %d users in %v", len(users), duration)
}

// SearchUsersByUsername mencari user berdasarkan username (tambahan untuk pengujian)
func (r *SQLUserRepository) SearchUsersByUsername(username string) ([]*User, error) {
    rows, err := r.db.Query("SELECT id, username, email FROM users WHERE username LIKE $1", "%"+username+"%")
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
    
    return users, nil
}