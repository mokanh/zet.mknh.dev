# Data Migration

Data migration adalah proses memindahkan data dari satu sistem database ke sistem database lainnya, atau dari satu skema ke skema lainnya dalam database yang sama. Dalam pengembangan aplikasi Go, data migration sering diperlukan saat melakukan upgrade database, mengubah struktur data, atau mengganti sistem database.

## Schema Migration

Schema migration adalah proses mengubah struktur database, seperti menambah, mengubah, atau menghapus tabel, kolom, indeks, atau constraint.

### Karakteristik Schema Migration
- **Versioning**: Melacak versi skema database
- **Up/Down Migration**: Mendukung migrasi maju (up) dan mundur (down)
- **Transaction Support**: Menjalankan migrasi dalam transaksi
- **Dependency Management**: Mengelola dependensi antar migrasi
- **Rollback Support**: Mendukung rollback jika migrasi gagal

### Implementasi Schema Migration
```go
// Implementasi dasar schema migration
package main

import (
    "database/sql"
    "fmt"
    "log"
    "time"
    _ "github.com/lib/pq"
    "github.com/golang-migrate/migrate/v4"
    _ "github.com/golang-migrate/migrate/v4/database/postgres"
    _ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Membuat instance migrate
    m, err := migrate.New(
        "file://migrations", // Path ke file migrasi
        "postgres://username:password@localhost:5432/testdb?sslmode=disable",
    )
    if err != nil {
        log.Fatal(err)
    }
    defer m.Close()
    
    // Menjalankan migrasi
    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        log.Fatal(err)
    }
    
    fmt.Println("Migration completed successfully")
    
    // Melihat versi migrasi saat ini
    version, dirty, err := m.Version()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Current migration version: %d, Dirty: %v\n", version, dirty)
    
    // Rollback migrasi
    if err := m.Steps(-1); err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Rollback completed successfully")
}
```

### File Migrasi
File migrasi biasanya disimpan dalam format SQL atau menggunakan format khusus seperti yang digunakan oleh library golang-migrate. Berikut adalah contoh file migrasi:

```sql
-- migrations/000001_create_users_table.up.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);

-- migrations/000001_create_users_table.down.sql
DROP TABLE IF EXISTS users;

-- migrations/000002_add_role_to_users.up.sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

-- migrations/000002_add_role_to_users.down.sql
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- migrations/000003_create_posts_table.up.sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    likes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts (user_id);
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);

-- migrations/000003_create_posts_table.down.sql
DROP TABLE IF EXISTS posts;
```

## Data Transfer

Data transfer adalah proses memindahkan data dari satu database ke database lainnya, atau dari satu format ke format lainnya.

### Karakteristik Data Transfer
- **Batch Processing**: Memproses data dalam batch untuk efisiensi
- **Incremental Transfer**: Memindahkan hanya data yang berubah
- **Error Handling**: Menangani error saat transfer data
- **Validation**: Memvalidasi data yang ditransfer
- **Logging**: Mencatat proses transfer data

### Implementasi Data Transfer
```go
// Implementasi dasar data transfer
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "database/sql"
    _ "github.com/lib/pq"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

// User struct untuk PostgreSQL dan MongoDB
type User struct {
    ID           int       `bson:"id,omitempty" json:"id"`
    Username     string    `bson:"username" json:"username"`
    Email        string    `bson:"email" json:"email"`
    PasswordHash string    `bson:"password_hash" json:"password_hash"`
    Age          int       `bson:"age" json:"age"`
    Role         string    `bson:"role" json:"role"`
    CreatedAt    time.Time `bson:"created_at" json:"created_at"`
    UpdatedAt    time.Time `bson:"updated_at" json:"updated_at"`
}

// Post struct untuk PostgreSQL dan MongoDB
type Post struct {
    ID        int       `bson:"id,omitempty" json:"id"`
    UserID    int       `bson:"user_id" json:"user_id"`
    Title     string    `bson:"title" json:"title"`
    Content   string    `bson:"content" json:"content"`
    Likes     int       `bson:"likes" json:"likes"`
    CreatedAt time.Time `bson:"created_at" json:"created_at"`
    UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

// PostgreSQL ke MongoDB
func postgreSQLToMongoDB() {
    // Membuka koneksi ke PostgreSQL
    pgDB, err := sql.Open("postgres", "postgres://username:password@localhost:5432/sourcedb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer pgDB.Close()
    
    // Membuat client MongoDB
    mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }
    defer mongoClient.Disconnect(context.Background())
    
    // Memilih database MongoDB
    mongoDB := mongoClient.Database("targetdb")
    
    // Transfer users
    transferUsers(pgDB, mongoDB)
    
    // Transfer posts
    transferPosts(pgDB, mongoDB)
    
    fmt.Println("Data transfer from PostgreSQL to MongoDB completed successfully")
}

// Transfer users dari PostgreSQL ke MongoDB
func transferUsers(pgDB *sql.DB, mongoDB *mongo.Database) {
    // Mengambil users dari PostgreSQL
    rows, err := pgDB.Query(`
        SELECT id, username, email, password_hash, age, role, created_at, updated_at
        FROM users
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Menyiapkan collection MongoDB
    collection := mongoDB.Collection("users")
    
    // Menghapus data yang ada di collection
    _, err = collection.DeleteMany(context.Background(), bson.M{})
    if err != nil {
        log.Fatal(err)
    }
    
    // Memproses data dalam batch
    var users []interface{}
    batchSize := 100
    count := 0
    
    for rows.Next() {
        var user User
        err := rows.Scan(
            &user.ID,
            &user.Username,
            &user.Email,
            &user.PasswordHash,
            &user.Age,
            &user.Role,
            &user.CreatedAt,
            &user.UpdatedAt,
        )
        if err != nil {
            log.Fatal(err)
        }
        
        users = append(users, user)
        count++
        
        // Insert batch jika sudah mencapai batchSize
        if len(users) >= batchSize {
            _, err := collection.InsertMany(context.Background(), users)
            if err != nil {
                log.Fatal(err)
            }
            
            fmt.Printf("Inserted %d users\n", len(users))
            users = nil
        }
    }
    
    // Insert sisa data
    if len(users) > 0 {
        _, err := collection.InsertMany(context.Background(), users)
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("Inserted %d users\n", len(users))
    }
    
    fmt.Printf("Total users transferred: %d\n", count)
}

// Transfer posts dari PostgreSQL ke MongoDB
func transferPosts(pgDB *sql.DB, mongoDB *mongo.Database) {
    // Mengambil posts dari PostgreSQL
    rows, err := pgDB.Query(`
        SELECT id, user_id, title, content, likes, created_at, updated_at
        FROM posts
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Menyiapkan collection MongoDB
    collection := mongoDB.Collection("posts")
    
    // Menghapus data yang ada di collection
    _, err = collection.DeleteMany(context.Background(), bson.M{})
    if err != nil {
        log.Fatal(err)
    }
    
    // Memproses data dalam batch
    var posts []interface{}
    batchSize := 100
    count := 0
    
    for rows.Next() {
        var post Post
        err := rows.Scan(
            &post.ID,
            &post.UserID,
            &post.Title,
            &post.Content,
            &post.Likes,
            &post.CreatedAt,
            &post.UpdatedAt,
        )
        if err != nil {
            log.Fatal(err)
        }
        
        posts = append(posts, post)
        count++
        
        // Insert batch jika sudah mencapai batchSize
        if len(posts) >= batchSize {
            _, err := collection.InsertMany(context.Background(), posts)
            if err != nil {
                log.Fatal(err)
            }
            
            fmt.Printf("Inserted %d posts\n", len(posts))
            posts = nil
        }
    }
    
    // Insert sisa data
    if len(posts) > 0 {
        _, err := collection.InsertMany(context.Background(), posts)
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("Inserted %d posts\n", len(posts))
    }
    
    fmt.Printf("Total posts transferred: %d\n", count)
}

// MongoDB ke PostgreSQL
func mongoDBToPostgreSQL() {
    // Membuat client MongoDB
    mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }
    defer mongoClient.Disconnect(context.Background())
    
    // Memilih database MongoDB
    mongoDB := mongoClient.Database("sourcedb")
    
    // Membuka koneksi ke PostgreSQL
    pgDB, err := sql.Open("postgres", "postgres://username:password@localhost:5432/targetdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer pgDB.Close()
    
    // Transfer users
    transferUsersFromMongoDB(mongoDB, pgDB)
    
    // Transfer posts
    transferPostsFromMongoDB(mongoDB, pgDB)
    
    fmt.Println("Data transfer from MongoDB to PostgreSQL completed successfully")
}

// Transfer users dari MongoDB ke PostgreSQL
func transferUsersFromMongoDB(mongoDB *mongo.Database, pgDB *sql.DB) {
    // Mengambil users dari MongoDB
    collection := mongoDB.Collection("users")
    cursor, err := collection.Find(context.Background(), bson.M{})
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    // Menghapus data yang ada di tabel
    _, err = pgDB.Exec("TRUNCATE TABLE users CASCADE")
    if err != nil {
        log.Fatal(err)
    }
    
    // Memproses data dalam batch
    var users []User
    if err = cursor.All(context.Background(), &users); err != nil {
        log.Fatal(err)
    }
    
    // Insert data ke PostgreSQL
    stmt, err := pgDB.Prepare(`
        INSERT INTO users (id, username, email, password_hash, age, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer stmt.Close()
    
    count := 0
    for _, user := range users {
        _, err := stmt.Exec(
            user.ID,
            user.Username,
            user.Email,
            user.PasswordHash,
            user.Age,
            user.Role,
            user.CreatedAt,
            user.UpdatedAt,
        )
        if err != nil {
            log.Printf("Error inserting user %d: %v\n", user.ID, err)
            continue
        }
        
        count++
        if count%100 == 0 {
            fmt.Printf("Inserted %d users\n", count)
        }
    }
    
    fmt.Printf("Total users transferred: %d\n", count)
}

// Transfer posts dari MongoDB ke PostgreSQL
func transferPostsFromMongoDB(mongoDB *mongo.Database, pgDB *sql.DB) {
    // Mengambil posts dari MongoDB
    collection := mongoDB.Collection("posts")
    cursor, err := collection.Find(context.Background(), bson.M{})
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    // Menghapus data yang ada di tabel
    _, err = pgDB.Exec("TRUNCATE TABLE posts")
    if err != nil {
        log.Fatal(err)
    }
    
    // Memproses data dalam batch
    var posts []Post
    if err = cursor.All(context.Background(), &posts); err != nil {
        log.Fatal(err)
    }
    
    // Insert data ke PostgreSQL
    stmt, err := pgDB.Prepare(`
        INSERT INTO posts (id, user_id, title, content, likes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer stmt.Close()
    
    count := 0
    for _, post := range posts {
        _, err := stmt.Exec(
            post.ID,
            post.UserID,
            post.Title,
            post.Content,
            post.Likes,
            post.CreatedAt,
            post.UpdatedAt,
        )
        if err != nil {
            log.Printf("Error inserting post %d: %v\n", post.ID, err)
            continue
        }
        
        count++
        if count%100 == 0 {
            fmt.Printf("Inserted %d posts\n", count)
        }
    }
    
    fmt.Printf("Total posts transferred: %d\n", count)
}

func main() {
    // PostgreSQL ke MongoDB
    postgreSQLToMongoDB()
    
    // MongoDB ke PostgreSQL
    mongoDBToPostgreSQL()
}
```

## Data Transformation

Data transformation adalah proses mengubah format atau struktur data saat melakukan migrasi.

### Karakteristik Data Transformation
- **Type Conversion**: Mengubah tipe data
- **Data Cleaning**: Membersihkan data yang tidak valid
- **Data Enrichment**: Menambahkan informasi tambahan ke data
- **Data Aggregation**: Menggabungkan data dari berbagai sumber
- **Data Filtering**: Memfilter data berdasarkan kriteria tertentu

### Implementasi Data Transformation
```go
// Implementasi dasar data transformation
package main

import (
    "context"
    "fmt"
    "log"
    "strings"
    "time"
    "database/sql"
    _ "github.com/lib/pq"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

// User struct untuk PostgreSQL
type User struct {
    ID           int
    Username     string
    Email        string
    PasswordHash string
    Age          int
    Role         string
    CreatedAt    time.Time
    UpdatedAt    time.Time
}

// TransformedUser struct untuk MongoDB
type TransformedUser struct {
    ID           int       `bson:"id,omitempty"`
    Username     string    `bson:"username"`
    Email        string    `bson:"email"`
    PasswordHash string    `bson:"password_hash"`
    Age          int       `bson:"age"`
    Role         string    `bson:"role"`
    CreatedAt    time.Time `bson:"created_at"`
    UpdatedAt    time.Time `bson:"updated_at"`
    IsActive     bool      `bson:"is_active"`
    LastLoginAt  time.Time `bson:"last_login_at"`
    Profile      struct {
        FirstName string `bson:"first_name"`
        LastName  string `bson:"last_name"`
        Bio       string `bson:"bio"`
    } `bson:"profile"`
}

// Transform dan transfer users
func transformAndTransferUsers() {
    // Membuka koneksi ke PostgreSQL
    pgDB, err := sql.Open("postgres", "postgres://username:password@localhost:5432/sourcedb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer pgDB.Close()
    
    // Membuat client MongoDB
    mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }
    defer mongoClient.Disconnect(context.Background())
    
    // Memilih database MongoDB
    mongoDB := mongoClient.Database("targetdb")
    collection := mongoDB.Collection("users")
    
    // Menghapus data yang ada di collection
    _, err = collection.DeleteMany(context.Background(), bson.M{})
    if err != nil {
        log.Fatal(err)
    }
    
    // Mengambil users dari PostgreSQL
    rows, err := pgDB.Query(`
        SELECT id, username, email, password_hash, age, role, created_at, updated_at
        FROM users
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    // Memproses data dalam batch
    var transformedUsers []interface{}
    batchSize := 100
    count := 0
    
    for rows.Next() {
        var user User
        err := rows.Scan(
            &user.ID,
            &user.Username,
            &user.Email,
            &user.PasswordHash,
            &user.Age,
            &user.Role,
            &user.CreatedAt,
            &user.UpdatedAt,
        )
        if err != nil {
            log.Fatal(err)
        }
        
        // Transform data
        transformedUser := transformUser(user)
        
        // Validasi data
        if !validateTransformedUser(transformedUser) {
            log.Printf("Skipping invalid user: %d\n", user.ID)
            continue
        }
        
        transformedUsers = append(transformedUsers, transformedUser)
        count++
        
        // Insert batch jika sudah mencapai batchSize
        if len(transformedUsers) >= batchSize {
            _, err := collection.InsertMany(context.Background(), transformedUsers)
            if err != nil {
                log.Fatal(err)
            }
            
            fmt.Printf("Inserted %d transformed users\n", len(transformedUsers))
            transformedUsers = nil
        }
    }
    
    // Insert sisa data
    if len(transformedUsers) > 0 {
        _, err := collection.InsertMany(context.Background(), transformedUsers)
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("Inserted %d transformed users\n", len(transformedUsers))
    }
    
    fmt.Printf("Total users transformed and transferred: %d\n", count)
}

// Transform user
func transformUser(user User) TransformedUser {
    var transformed TransformedUser
    
    // Copy data dasar
    transformed.ID = user.ID
    transformed.Username = user.Username
    transformed.Email = user.Email
    transformed.PasswordHash = user.PasswordHash
    transformed.Age = user.Age
    transformed.Role = user.Role
    transformed.CreatedAt = user.CreatedAt
    transformed.UpdatedAt = user.UpdatedAt
    
    // Data enrichment
    transformed.IsActive = true
    transformed.LastLoginAt = time.Now().Add(-24 * time.Hour) // Contoh: login 24 jam yang lalu
    
    // Parse username untuk mendapatkan first name dan last name
    nameParts := strings.Split(user.Username, ".")
    if len(nameParts) >= 2 {
        transformed.Profile.FirstName = strings.Title(nameParts[0])
        transformed.Profile.LastName = strings.Title(nameParts[1])
    } else {
        transformed.Profile.FirstName = strings.Title(user.Username)
        transformed.Profile.LastName = ""
    }
    
    // Data enrichment untuk bio
    transformed.Profile.Bio = fmt.Sprintf("User since %s", user.CreatedAt.Format("January 2006"))
    
    return transformed
}

// Validasi transformed user
func validateTransformedUser(user TransformedUser) bool {
    // Validasi email
    if !strings.Contains(user.Email, "@") {
        return false
    }
    
    // Validasi age
    if user.Age < 0 || user.Age > 150 {
        return false
    }
    
    // Validasi role
    validRoles := map[string]bool{
        "user":  true,
        "admin": true,
        "mod":   true,
    }
    
    if !validRoles[user.Role] {
        return false
    }
    
    return true
}

func main() {
    transformAndTransferUsers()
}
```

## Migration Tools

Migration tools adalah library atau framework yang memudahkan proses migrasi data.

### Karakteristik Migration Tools
- **Schema Management**: Mengelola skema database
- **Data Migration**: Memindahkan data antar database
- **Version Control**: Melacak versi migrasi
- **Automation**: Mengotomatisasi proses migrasi
- **Rollback Support**: Mendukung rollback jika migrasi gagal

### Implementasi Migration Tools
```go
// Implementasi dasar migration tools
package main

import (
    "fmt"
    "log"
    "github.com/golang-migrate/migrate/v4"
    _ "github.com/golang-migrate/migrate/v4/database/postgres"
    _ "github.com/golang-migrate/migrate/v4/source/file"
    "github.com/go-pg/migrations/v8"
    _ "github.com/go-pg/pg/v10"
    "github.com/pressly/goose"
    _ "github.com/lib/pq"
)

// Golang-migrate
func golangMigrate() {
    // Membuat instance migrate
    m, err := migrate.New(
        "file://migrations", // Path ke file migrasi
        "postgres://username:password@localhost:5432/testdb?sslmode=disable",
    )
    if err != nil {
        log.Fatal(err)
    }
    defer m.Close()
    
    // Menjalankan migrasi
    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        log.Fatal(err)
    }
    
    fmt.Println("Migration completed successfully with golang-migrate")
    
    // Melihat versi migrasi saat ini
    version, dirty, err := m.Version()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Current migration version: %d, Dirty: %v\n", version, dirty)
}

// Go-pg/migrations
func goPgMigrations() {
    // Membuka koneksi ke PostgreSQL
    db := pg.Connect(&pg.Options{
        Addr:     "localhost:5432",
        User:     "username",
        Password: "password",
        Database: "testdb",
    })
    defer db.Close()
    
    // Mendaftarkan migrasi
    migrations.MustRegisterTx(func(ctx context.Context, db migrations.DB) error {
        _, err := db.ExecContext(ctx, `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                age INT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `)
        return err
    }, func(ctx context.Context, db migrations.DB) error {
        _, err := db.ExecContext(ctx, `DROP TABLE IF EXISTS users`)
        return err
    })
    
    // Menjalankan migrasi
    oldVersion, newVersion, err := migrations.Run(db, "up")
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Migration completed successfully with go-pg/migrations: %d -> %d\n", oldVersion, newVersion)
}

// Goose
func goose() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Menjalankan migrasi
    if err := goose.Run("up", db, "migrations", "postgres"); err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Migration completed successfully with goose")
    
    // Melihat status migrasi
    if err := goose.Status(db, "migrations", "postgres"); err != nil {
        log.Fatal(err)
    }
}

func main() {
    // Golang-migrate
    golangMigrate()
    
    // Go-pg/migrations
    goPgMigrations()
    
    // Goose
    goose()
}
```

## Kesimpulan

Data migration adalah proses penting dalam pengembangan aplikasi database. Dengan memahami dan mengimplementasikan teknik-teknik migrasi data, kita dapat memindahkan data dari satu sistem ke sistem lainnya dengan efisien dan aman.

Teknik-teknik seperti schema migration, data transfer, data transformation, dan penggunaan migration tools dapat digunakan untuk melakukan migrasi data. Pemilihan teknik yang tepat tergantung pada kebutuhan aplikasi dan karakteristik data yang akan dimigrasi.

Dalam Go, kita dapat mengimplementasikan teknik-teknik ini menggunakan driver database yang sesuai dan library tambahan seperti golang-migrate, go-pg/migrations, dan goose. Dengan memahami dan mengimplementasikan teknik-teknik ini, kita dapat mengembangkan aplikasi database yang fleksibel dan dapat diupgrade dengan mudah. 