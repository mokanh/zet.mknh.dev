# Database Security

Database security adalah praktik melindungi database dari akses yang tidak sah, manipulasi data, dan serangan keamanan. Dalam pengembangan aplikasi Go, implementasi keamanan database yang baik sangat penting untuk melindungi data sensitif dan memastikan integritas sistem.

## SQL Injection Prevention

SQL injection adalah serangan keamanan di mana penyerang menyisipkan kode SQL berbahaya ke dalam query database. Ini dapat menyebabkan akses data yang tidak sah, manipulasi data, atau bahkan penghapusan data.

### Karakteristik SQL Injection
- **Parameter Binding**: Menggunakan parameter binding untuk mencegah SQL injection
- **Input Validation**: Memvalidasi input pengguna sebelum digunakan dalam query
- **Escape Characters**: Melakukan escape karakter khusus dalam input
- **Least Privilege**: Memberikan hak akses minimal yang diperlukan
- **Prepared Statements**: Menggunakan prepared statements untuk query yang aman

### Implementasi SQL Injection Prevention
```go
// Implementasi dasar SQL injection prevention
package main

import (
    "database/sql"
    "fmt"
    "log"
    "regexp"
    "strings"
    _ "github.com/lib/pq"
)

// User struct untuk contoh
type User struct {
    ID       int
    Username string
    Email    string
    Password string
}

// UserRepository dengan SQL injection prevention
type UserRepository struct {
    db *sql.DB
}

// NewUserRepository membuat instance baru dari UserRepository
func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{
        db: db,
    }
}

// validateInput memvalidasi input untuk mencegah SQL injection
func validateInput(input string) (string, error) {
    // Hapus karakter berbahaya
    dangerousChars := regexp.MustCompile(`[;'"]`)
    if dangerousChars.MatchString(input) {
        return "", fmt.Errorf("input contains dangerous characters")
    }
    
    // Batasi panjang input
    if len(input) > 100 {
        return "", fmt.Errorf("input too long")
    }
    
    return input, nil
}

// GetUserByID mengambil user berdasarkan ID dengan parameter binding
func (r *UserRepository) GetUserByID(id int) (*User, error) {
    // Gunakan parameter binding untuk mencegah SQL injection
    user := &User{}
    err := r.db.QueryRow("SELECT id, username, email FROM users WHERE id = $1", id).Scan(&user.ID, &user.Username, &user.Email)
    if err != nil {
        return nil, err
    }
    
    return user, nil
}

// GetUserByUsername mengambil user berdasarkan username dengan parameter binding
func (r *UserRepository) GetUserByUsername(username string) (*User, error) {
    // Validasi input
    username, err := validateInput(username)
    if err != nil {
        return nil, err
    }
    
    // Gunakan parameter binding untuk mencegah SQL injection
    user := &User{}
    err = r.db.QueryRow("SELECT id, username, email FROM users WHERE username = $1", username).Scan(&user.ID, &user.Username, &user.Email)
    if err != nil {
        return nil, err
    }
    
    return user, nil
}

// SearchUsers mencari user berdasarkan keyword dengan parameter binding
func (r *UserRepository) SearchUsers(keyword string) ([]*User, error) {
    // Validasi input
    keyword, err := validateInput(keyword)
    if err != nil {
        return nil, err
    }
    
    // Gunakan parameter binding untuk mencegah SQL injection
    rows, err := r.db.Query("SELECT id, username, email FROM users WHERE username LIKE $1 OR email LIKE $1", "%"+keyword+"%")
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

// CreateUser membuat user baru dengan parameter binding
func (r *UserRepository) CreateUser(username, email, password string) error {
    // Validasi input
    username, err := validateInput(username)
    if err != nil {
        return err
    }
    
    email, err = validateInput(email)
    if err != nil {
        return err
    }
    
    // Gunakan parameter binding untuk mencegah SQL injection
    _, err = r.db.Exec("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", username, email, password)
    if err != nil {
        return err
    }
    
    return nil
}

// UpdateUser memperbarui user dengan parameter binding
func (r *UserRepository) UpdateUser(id int, username, email string) error {
    // Validasi input
    username, err := validateInput(username)
    if err != nil {
        return err
    }
    
    email, err = validateInput(email)
    if err != nil {
        return err
    }
    
    // Gunakan parameter binding untuk mencegah SQL injection
    _, err = r.db.Exec("UPDATE users SET username = $1, email = $2 WHERE id = $3", username, email, id)
    if err != nil {
        return err
    }
    
    return nil
}

// DeleteUser menghapus user dengan parameter binding
func (r *UserRepository) DeleteUser(id int) error {
    // Gunakan parameter binding untuk mencegah SQL injection
    _, err := r.db.Exec("DELETE FROM users WHERE id = $1", id)
    if err != nil {
        return err
    }
    
    return nil
}

// DynamicQueryBuilder adalah contoh cara yang aman untuk membuat query dinamis
type DynamicQueryBuilder struct {
    conditions []string
    args       []interface{}
    argCount   int
}

// NewDynamicQueryBuilder membuat instance baru dari DynamicQueryBuilder
func NewDynamicQueryBuilder() *DynamicQueryBuilder {
    return &DynamicQueryBuilder{
        conditions: make([]string, 0),
        args:       make([]interface{}, 0),
        argCount:   0,
    }
}

// AddCondition menambahkan kondisi ke query
func (b *DynamicQueryBuilder) AddCondition(condition string, value interface{}) {
    b.argCount++
    b.conditions = append(b.conditions, fmt.Sprintf("%s = $%d", condition, b.argCount))
    b.args = append(b.args, value)
}

// BuildQuery membuat query SQL yang aman
func (b *DynamicQueryBuilder) BuildQuery(baseQuery string) (string, []interface{}) {
    if len(b.conditions) == 0 {
        return baseQuery, b.args
    }
    
    return baseQuery + " WHERE " + strings.Join(b.conditions, " AND "), b.args
}

// SearchUsersAdvanced mencari user dengan query dinamis yang aman
func (r *UserRepository) SearchUsersAdvanced(username, email, role string) ([]*User, error) {
    builder := NewDynamicQueryBuilder()
    
    if username != "" {
        username, err := validateInput(username)
        if err != nil {
            return nil, err
        }
        builder.AddCondition("username", username)
    }
    
    if email != "" {
        email, err := validateInput(email)
        if err != nil {
            return nil, err
        }
        builder.AddCondition("email", email)
    }
    
    if role != "" {
        role, err := validateInput(role)
        if err != nil {
            return nil, err
        }
        builder.AddCondition("role", role)
    }
    
    query, args := builder.BuildQuery("SELECT id, username, email FROM users")
    
    rows, err := r.db.Query(query, args...)
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
    
    // Contoh pencarian user
    users, err := repo.SearchUsers("john")
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users\n", len(users))
    for _, u := range users {
        fmt.Printf("User: %+v\n", u)
    }
    
    // Contoh pencarian user dengan query dinamis
    users, err = repo.SearchUsersAdvanced("john", "john@example.com", "user")
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users with advanced search\n", len(users))
    for _, u := range users {
        fmt.Printf("User: %+v\n", u)
    }
}
```

## Data Encryption

Data encryption adalah proses mengubah data menjadi format yang tidak dapat dibaca tanpa kunci dekripsi yang tepat. Ini melindungi data sensitif dari akses yang tidak sah.

### Karakteristik Data Encryption
- **Encryption at Rest**: Data dienkripsi saat disimpan di database
- **Encryption in Transit**: Data dienkripsi saat dikirim antara aplikasi dan database
- **Key Management**: Pengelolaan kunci enkripsi yang aman
- **Transparent Encryption**: Enkripsi yang transparan bagi aplikasi
- **Selective Encryption**: Hanya mengenkripsi data sensitif

### Implementasi Data Encryption
```go
// Implementasi dasar data encryption
package main

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "database/sql"
    "encoding/base64"
    "fmt"
    "io"
    "log"
    _ "github.com/lib/pq"
)

// EncryptedUser struct untuk contoh
type EncryptedUser struct {
    ID       int
    Username string
    Email    string
    Password string // Akan dienkripsi
}

// EncryptionService mengelola enkripsi dan dekripsi data
type EncryptionService struct {
    key []byte
}

// NewEncryptionService membuat instance baru dari EncryptionService
func NewEncryptionService(key []byte) (*EncryptionService, error) {
    // Pastikan key memiliki panjang yang tepat (32 bytes untuk AES-256)
    if len(key) != 32 {
        return nil, fmt.Errorf("encryption key must be 32 bytes")
    }
    
    return &EncryptionService{
        key: key,
    }, nil
}

// encrypt mengenkripsi data
func (s *EncryptionService) encrypt(plaintext string) (string, error) {
    block, err := aes.NewCipher(s.key)
    if err != nil {
        return "", err
    }
    
    // Buat GCM mode
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }
    
    // Buat nonce
    nonce := make([]byte, gcm.NonceSize())
    if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
        return "", err
    }
    
    // Enkripsi data
    ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
    
    // Encode ke base64
    return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// decrypt mendekripsi data
func (s *EncryptionService) decrypt(encrypted string) (string, error) {
    // Decode dari base64
    ciphertext, err := base64.StdEncoding.DecodeString(encrypted)
    if err != nil {
        return "", err
    }
    
    block, err := aes.NewCipher(s.key)
    if err != nil {
        return "", err
    }
    
    // Buat GCM mode
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }
    
    // Ekstrak nonce
    nonceSize := gcm.NonceSize()
    if len(ciphertext) < nonceSize {
        return "", fmt.Errorf("ciphertext too short")
    }
    
    nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
    
    // Dekripsi data
    plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
    if err != nil {
        return "", err
    }
    
    return string(plaintext), nil
}

// EncryptedUserRepository dengan data encryption
type EncryptedUserRepository struct {
    db      *sql.DB
    encrypt *EncryptionService
}

// NewEncryptedUserRepository membuat instance baru dari EncryptedUserRepository
func NewEncryptedUserRepository(db *sql.DB, key []byte) (*EncryptedUserRepository, error) {
    encrypt, err := NewEncryptionService(key)
    if err != nil {
        return nil, err
    }
    
    return &EncryptedUserRepository{
        db:      db,
        encrypt: encrypt,
    }, nil
}

// CreateEncryptedUser membuat user baru dengan password terenkripsi
func (r *EncryptedUserRepository) CreateEncryptedUser(username, email, password string) error {
    // Enkripsi password
    encryptedPassword, err := r.encrypt.encrypt(password)
    if err != nil {
        return err
    }
    
    // Simpan user dengan password terenkripsi
    _, err = r.db.Exec("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", username, email, encryptedPassword)
    if err != nil {
        return err
    }
    
    return nil
}

// GetEncryptedUser mengambil user dengan password terenkripsi
func (r *EncryptedUserRepository) GetEncryptedUser(id int) (*EncryptedUser, error) {
    user := &EncryptedUser{}
    var encryptedPassword string
    
    err := r.db.QueryRow("SELECT id, username, email, password FROM users WHERE id = $1", id).Scan(&user.ID, &user.Username, &user.Email, &encryptedPassword)
    if err != nil {
        return nil, err
    }
    
    // Dekripsi password
    password, err := r.encrypt.decrypt(encryptedPassword)
    if err != nil {
        return nil, err
    }
    
    user.Password = password
    
    return user, nil
}

// UpdateEncryptedUser memperbarui user dengan password terenkripsi
func (r *EncryptedUserRepository) UpdateEncryptedUser(id int, username, email, password string) error {
    // Enkripsi password jika disediakan
    var encryptedPassword string
    var err error
    
    if password != "" {
        encryptedPassword, err = r.encrypt.encrypt(password)
        if err != nil {
            return err
        }
        
        // Update dengan password baru
        _, err = r.db.Exec("UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4", username, email, encryptedPassword, id)
    } else {
        // Update tanpa mengubah password
        _, err = r.db.Exec("UPDATE users SET username = $1, email = $2 WHERE id = $3", username, email, id)
    }
    
    if err != nil {
        return err
    }
    
    return nil
}

// VerifyPassword memverifikasi password
func (r *EncryptedUserRepository) VerifyPassword(id int, password string) (bool, error) {
    // Ambil password terenkripsi
    var encryptedPassword string
    err := r.db.QueryRow("SELECT password FROM users WHERE id = $1", id).Scan(&encryptedPassword)
    if err != nil {
        return false, err
    }
    
    // Dekripsi password
    decryptedPassword, err := r.encrypt.decrypt(encryptedPassword)
    if err != nil {
        return false, err
    }
    
    // Bandingkan password
    return decryptedPassword == password, nil
}

func main() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Buat encryption key (32 bytes untuk AES-256)
    key := make([]byte, 32)
    if _, err := io.ReadFull(rand.Reader, key); err != nil {
        log.Fatal(err)
    }
    
    // Membuat repository
    repo, err := NewEncryptedUserRepository(db, key)
    if err != nil {
        log.Fatal(err)
    }
    
    // Contoh penggunaan
    err = repo.CreateEncryptedUser("john", "john@example.com", "secretpassword")
    if err != nil {
        log.Fatal(err)
    }
    
    user, err := repo.GetEncryptedUser(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User: %+v\n", user)
    
    // Verifikasi password
    valid, err := repo.VerifyPassword(1, "secretpassword")
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Password valid: %v\n", valid)
    
    // Update user
    err = repo.UpdateEncryptedUser(1, "john_updated", "john_updated@example.com", "newpassword")
    if err != nil {
        log.Fatal(err)
    }
    
    user, err = repo.GetEncryptedUser(1)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Updated user: %+v\n", user)
}
```

## Access Control

Access control adalah mekanisme untuk membatasi akses ke database berdasarkan peran pengguna atau hak akses.

### Karakteristik Access Control
- **Role-Based Access Control (RBAC)**: Akses berdasarkan peran pengguna
- **Row-Level Security**: Membatasi akses ke baris data tertentu
- **Column-Level Security**: Membatasi akses ke kolom data tertentu
- **Audit Logging**: Mencatat aktivitas akses database
- **Least Privilege**: Memberikan hak akses minimal yang diperlukan

### Implementasi Access Control
```go
// Implementasi dasar access control
package main

import (
    "context"
    "database/sql"
    "fmt"
    "log"
    "time"
    _ "github.com/lib/pq"
)

// User struct untuk contoh
type User struct {
    ID       int
    Username string
    Email    string
    Role     string
}

// Document struct untuk contoh
type Document struct {
    ID        int
    Title     string
    Content   string
    OwnerID   int
    IsPublic  bool
    CreatedAt time.Time
}

// AccessControl mengelola akses ke database
type AccessControl struct {
    db *sql.DB
}

// NewAccessControl membuat instance baru dari AccessControl
func NewAccessControl(db *sql.DB) *AccessControl {
    return &AccessControl{
        db: db,
    }
}

// GetUserRole mendapatkan peran pengguna
func (ac *AccessControl) GetUserRole(userID int) (string, error) {
    var role string
    err := ac.db.QueryRow("SELECT role FROM users WHERE id = $1", userID).Scan(&role)
    if err != nil {
        return "", err
    }
    
    return role, nil
}

// CanAccessDocument memeriksa apakah pengguna dapat mengakses dokumen
func (ac *AccessControl) CanAccessDocument(userID int, documentID int) (bool, error) {
    // Dapatkan peran pengguna
    role, err := ac.GetUserRole(userID)
    if err != nil {
        return false, err
    }
    
    // Admin dapat mengakses semua dokumen
    if role == "admin" {
        return true, nil
    }
    
    // Dapatkan informasi dokumen
    var ownerID int
    var isPublic bool
    err = ac.db.QueryRow("SELECT owner_id, is_public FROM documents WHERE id = $1", documentID).Scan(&ownerID, &isPublic)
    if err != nil {
        return false, err
    }
    
    // Pengguna dapat mengakses dokumen publik
    if isPublic {
        return true, nil
    }
    
    // Pengguna dapat mengakses dokumen miliknya
    if ownerID == userID {
        return true, nil
    }
    
    return false, nil
}

// GetAccessibleDocuments mendapatkan dokumen yang dapat diakses oleh pengguna
func (ac *AccessControl) GetAccessibleDocuments(userID int) ([]*Document, error) {
    // Dapatkan peran pengguna
    role, err := ac.GetUserRole(userID)
    if err != nil {
        return nil, err
    }
    
    var rows *sql.Rows
    
    // Admin dapat mengakses semua dokumen
    if role == "admin" {
        rows, err = ac.db.Query("SELECT id, title, content, owner_id, is_public, created_at FROM documents")
    } else {
        // Pengguna dapat mengakses dokumen publik dan miliknya
        rows, err = ac.db.Query("SELECT id, title, content, owner_id, is_public, created_at FROM documents WHERE is_public = true OR owner_id = $1", userID)
    }
    
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var documents []*Document
    for rows.Next() {
        doc := &Document{}
        err := rows.Scan(&doc.ID, &doc.Title, &doc.Content, &doc.OwnerID, &doc.IsPublic, &doc.CreatedAt)
        if err != nil {
            return nil, err
        }
        documents = append(documents, doc)
    }
    
    return documents, nil
}

// LogAccess mencatat akses ke database
func (ac *AccessControl) LogAccess(userID int, action, resource string) error {
    _, err := ac.db.Exec("INSERT INTO access_logs (user_id, action, resource, timestamp) VALUES ($1, $2, $3, $4)", userID, action, resource, time.Now())
    if err != nil {
        return err
    }
    
    return nil
}

// DocumentRepository dengan access control
type DocumentRepository struct {
    db    *sql.DB
    ac    *AccessControl
    ctx   context.Context
    userID int
}

// NewDocumentRepository membuat instance baru dari DocumentRepository
func NewDocumentRepository(db *sql.DB, userID int) *DocumentRepository {
    return &DocumentRepository{
        db:    db,
        ac:    NewAccessControl(db),
        ctx:   context.Background(),
        userID: userID,
    }
}

// GetDocument mendapatkan dokumen dengan access control
func (r *DocumentRepository) GetDocument(id int) (*Document, error) {
    // Periksa akses
    canAccess, err := r.ac.CanAccessDocument(r.userID, id)
    if err != nil {
        return nil, err
    }
    
    if !canAccess {
        return nil, fmt.Errorf("access denied")
    }
    
    // Dapatkan dokumen
    doc := &Document{}
    err = r.db.QueryRow("SELECT id, title, content, owner_id, is_public, created_at FROM documents WHERE id = $1", id).Scan(&doc.ID, &doc.Title, &doc.Content, &doc.OwnerID, &doc.IsPublic, &doc.CreatedAt)
    if err != nil {
        return nil, err
    }
    
    // Log akses
    err = r.ac.LogAccess(r.userID, "read", fmt.Sprintf("document:%d", id))
    if err != nil {
        log.Printf("Error logging access: %v", err)
    }
    
    return doc, nil
}

// CreateDocument membuat dokumen baru
func (r *DocumentRepository) CreateDocument(title, content string, isPublic bool) (*Document, error) {
    // Dapatkan peran pengguna
    role, err := r.ac.GetUserRole(r.userID)
    if err != nil {
        return nil, err
    }
    
    // Hanya admin dan user biasa yang dapat membuat dokumen
    if role != "admin" && role != "user" {
        return nil, fmt.Errorf("access denied")
    }
    
    // Buat dokumen
    var id int
    err = r.db.QueryRow("INSERT INTO documents (title, content, owner_id, is_public, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id", title, content, r.userID, isPublic, time.Now()).Scan(&id)
    if err != nil {
        return nil, err
    }
    
    // Log akses
    err = r.ac.LogAccess(r.userID, "create", fmt.Sprintf("document:%d", id))
    if err != nil {
        log.Printf("Error logging access: %v", err)
    }
    
    // Dapatkan dokumen yang baru dibuat
    return r.GetDocument(id)
}

// UpdateDocument memperbarui dokumen dengan access control
func (r *DocumentRepository) UpdateDocument(id int, title, content string, isPublic bool) error {
    // Periksa akses
    canAccess, err := r.ac.CanAccessDocument(r.userID, id)
    if err != nil {
        return err
    }
    
    if !canAccess {
        return fmt.Errorf("access denied")
    }
    
    // Dapatkan peran pengguna
    role, err := r.ac.GetUserRole(r.userID)
    if err != nil {
        return err
    }
    
    // Dapatkan informasi dokumen
    var ownerID int
    err = r.db.QueryRow("SELECT owner_id FROM documents WHERE id = $1", id).Scan(&ownerID)
    if err != nil {
        return err
    }
    
    // Hanya admin dan pemilik dokumen yang dapat memperbarui dokumen
    if role != "admin" && ownerID != r.userID {
        return fmt.Errorf("access denied")
    }
    
    // Perbarui dokumen
    _, err = r.db.Exec("UPDATE documents SET title = $1, content = $2, is_public = $3 WHERE id = $4", title, content, isPublic, id)
    if err != nil {
        return err
    }
    
    // Log akses
    err = r.ac.LogAccess(r.userID, "update", fmt.Sprintf("document:%d", id))
    if err != nil {
        log.Printf("Error logging access: %v", err)
    }
    
    return nil
}

// DeleteDocument menghapus dokumen dengan access control
func (r *DocumentRepository) DeleteDocument(id int) error {
    // Periksa akses
    canAccess, err := r.ac.CanAccessDocument(r.userID, id)
    if err != nil {
        return err
    }
    
    if !canAccess {
        return fmt.Errorf("access denied")
    }
    
    // Dapatkan peran pengguna
    role, err := r.ac.GetUserRole(r.userID)
    if err != nil {
        return err
    }
    
    // Dapatkan informasi dokumen
    var ownerID int
    err = r.db.QueryRow("SELECT owner_id FROM documents WHERE id = $1", id).Scan(&ownerID)
    if err != nil {
        return err
    }
    
    // Hanya admin dan pemilik dokumen yang dapat menghapus dokumen
    if role != "admin" && ownerID != r.userID {
        return fmt.Errorf("access denied")
    }
    
    // Hapus dokumen
    _, err = r.db.Exec("DELETE FROM documents WHERE id = $1", id)
    if err != nil {
        return err
    }
    
    // Log akses
    err = r.ac.LogAccess(r.userID, "delete", fmt.Sprintf("document:%d", id))
    if err != nil {
        log.Printf("Error logging access: %v", err)
    }
    
    return nil
}

// GetMyDocuments mendapatkan dokumen milik pengguna
func (r *DocumentRepository) GetMyDocuments() ([]*Document, error) {
    // Dapatkan dokumen yang dapat diakses
    return r.ac.GetAccessibleDocuments(r.userID)
}

func main() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Contoh penggunaan dengan user biasa
    userRepo := NewDocumentRepository(db, 1)
    
    // Buat dokumen
    doc, err := userRepo.CreateDocument("My Document", "This is my document content", false)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created document: %+v\n", doc)
    
    // Dapatkan dokumen
    doc, err = userRepo.GetDocument(doc.ID)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Retrieved document: %+v\n", doc)
    
    // Perbarui dokumen
    err = userRepo.UpdateDocument(doc.ID, "Updated Document", "This is updated content", true)
    if err != nil {
        log.Fatal(err)
    }
    
    // Dapatkan dokumen yang diperbarui
    doc, err = userRepo.GetDocument(doc.ID)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Updated document: %+v\n", doc)
    
    // Dapatkan semua dokumen yang dapat diakses
    docs, err := userRepo.GetMyDocuments()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d accessible documents\n", len(docs))
    for _, d := range docs {
        fmt.Printf("Document: %+v\n", d)
    }
    
    // Hapus dokumen
    err = userRepo.DeleteDocument(doc.ID)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Document deleted")
}