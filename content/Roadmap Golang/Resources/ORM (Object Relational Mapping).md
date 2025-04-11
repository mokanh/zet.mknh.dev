# ORM (Object Relational Mapping)

Object Relational Mapping (ORM) adalah teknik pemrograman yang memungkinkan pengembang untuk bekerja dengan database menggunakan konsep pemrograman berorientasi objek, tanpa perlu menulis SQL secara langsung. Go memiliki beberapa library ORM populer seperti GORM, SQLx, dan XORM.

## GORM

GORM adalah ORM library yang paling populer untuk Go. GORM menyediakan antarmuka yang intuitif untuk berinteraksi dengan database SQL.

### Karakteristik GORM
- **Auto Migration**: Migrasi otomatis skema database
- **Hooks**: Callback sebelum dan sesudah operasi database
- **Associations**: Dukungan untuk relasi antar model
- **Validation**: Validasi data sebelum disimpan
- **Transactions**: Dukungan untuk transaksi database

### Implementasi GORM
```go
// Implementasi dasar GORM
package main

import (
    "fmt"
    "log"
    "time"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

// User adalah model untuk tabel users
type User struct {
    ID        uint      `gorm:"primaryKey"`
    Username  string    `gorm:"size:50;not null"`
    Email     string    `gorm:"size:100;not null;unique"`
    CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

// Post adalah model untuk tabel posts
type Post struct {
    ID        uint      `gorm:"primaryKey"`
    Title     string    `gorm:"size:100;not null"`
    Content   string    `gorm:"type:text"`
    UserID    uint      `gorm:"not null"`
    User      User      `gorm:"foreignKey:UserID"`
    CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

// BeforeCreate adalah hook yang dijalankan sebelum membuat record baru
func (u *User) BeforeCreate(tx *gorm.DB) error {
    log.Println("Before creating user:", u.Username)
    return nil
}

// AfterCreate adalah hook yang dijalankan setelah membuat record baru
func (u *User) AfterCreate(tx *gorm.DB) error {
    log.Println("After creating user:", u.Username)
    return nil
}

func main() {
    // Konfigurasi logger
    newLogger := logger.New(
        log.New(log.Writer(), "\r\n", log.LstdFlags),
        logger.Config{
            SlowThreshold:             time.Second,
            LogLevel:                  logger.Info,
            IgnoreRecordNotFoundError: true,
            Colorful:                  true,
        },
    )
    
    // Membuka koneksi database
    dsn := "root:password@tcp(localhost:3306)/testdb?charset=utf8mb4&parseTime=True&loc=Local"
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
        Logger: newLogger,
    })
    if err != nil {
        log.Fatal(err)
    }
    
    // Migrasi otomatis skema database
    err = db.AutoMigrate(&User{}, &Post{})
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat user baru
    user := &User{
        Username: "john",
        Email:    "john@example.com",
    }
    
    result := db.Create(user)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    
    // Membuat post baru
    post := &Post{
        Title:   "Hello World",
        Content: "This is my first post",
        UserID:  user.ID,
    }
    
    result = db.Create(post)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created post: ID=%d, Title=%s, UserID=%d\n", post.ID, post.Title, post.UserID)
    
    // Mengambil user dengan posts
    var userWithPosts User
    result = db.Preload("Posts").First(&userWithPosts, user.ID)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", userWithPosts.ID, userWithPosts.Username, userWithPosts.Email)
    fmt.Printf("Posts count: %d\n", len(userWithPosts.Posts))
    for _, post := range userWithPosts.Posts {
        fmt.Printf("Post: ID=%d, Title=%s, Content=%s\n", post.ID, post.Title, post.Content)
    }
    
    // Mengambil semua users
    var users []User
    result = db.Find(&users)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Found %d users\n", len(users))
    for _, user := range users {
        fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    }
    
    // Mengambil user berdasarkan username
    var userByUsername User
    result = db.Where("username = ?", "john").First(&userByUsername)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Found user by username: ID=%d, Username=%s, Email=%s\n", userByUsername.ID, userByUsername.Username, userByUsername.Email)
    
    // Memperbarui user
    result = db.Model(&userByUsername).Updates(map[string]interface{}{
        "username": "jane",
        "email":    "jane@example.com",
    })
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Updated user: ID=%d, Username=%s, Email=%s\n", userByUsername.ID, userByUsername.Username, userByUsername.Email)
    
    // Menghapus user
    result = db.Delete(&userByUsername)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Deleted user: ID=%d\n", userByUsername.ID)
    
    // Transaksi database
    err = db.Transaction(func(tx *gorm.DB) error {
        // Membuat user baru dalam transaksi
        newUser := &User{
            Username: "alice",
            Email:    "alice@example.com",
        }
        
        if err := tx.Create(newUser).Error; err != nil {
            return err
        }
        
        // Membuat post baru dalam transaksi
        newPost := &Post{
            Title:   "Transaction Test",
            Content: "This post was created in a transaction",
            UserID:  newUser.ID,
        }
        
        if err := tx.Create(newPost).Error; err != nil {
            return err
        }
        
        return nil
    })
    
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Transaction completed successfully")
}
```

## SQLx

SQLx adalah library yang memperluas `database/sql` standar Go dengan fitur tambahan seperti pemetaan struct ke query dan named parameters.

### Karakteristik SQLx
- **Struct Scanning**: Pemetaan hasil query ke struct
- **Named Parameters**: Dukungan untuk named parameters
- **Transaction Support**: Dukungan untuk transaksi database
- **Query Building**: Pembuatan query secara dinamis
- **Connection Pooling**: Dukungan untuk connection pooling

### Implementasi SQLx
```go
// Implementasi dasar SQLx
package main

import (
    "fmt"
    "log"
    "time"
    "github.com/jmoiron/sqlx"
    _ "github.com/go-sql-driver/mysql"
)

// User adalah struct untuk menyimpan data user
type User struct {
    ID        int       `db:"id"`
    Username  string    `db:"username"`
    Email     string    `db:"email"`
    CreatedAt time.Time `db:"created_at"`
}

// Post adalah struct untuk menyimpan data post
type Post struct {
    ID        int       `db:"id"`
    Title     string    `db:"title"`
    Content   string    `db:"content"`
    UserID    int       `db:"user_id"`
    CreatedAt time.Time `db:"created_at"`
}

func main() {
    // Membuka koneksi database
    db, err := sqlx.Connect("mysql", "root:password@tcp(localhost:3306)/testdb?parseTime=true")
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
    
    // Membuat tabel posts
    _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
`)
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat user baru
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
    
    // Membuat post baru
    _, err = db.Exec("INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)", "Hello World", "This is my first post", id)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created post for user ID: %d\n", id)
    
    // Mengambil user dengan ID tertentu
    var user User
    err = db.Get(&user, "SELECT * FROM users WHERE id = ?", id)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Retrieved user: ID=%d, Username=%s, Email=%s, Created At=%s\n", user.ID, user.Username, user.Email, user.CreatedAt)
    
    // Mengambil semua users
    var users []User
    err = db.Select(&users, "SELECT * FROM users")
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users\n", len(users))
    for _, user := range users {
        fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    }
    
    // Mengambil posts untuk user tertentu
    var posts []Post
    err = db.Select(&posts, "SELECT * FROM posts WHERE user_id = ?", id)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d posts for user ID %d\n", len(posts), id)
    for _, post := range posts {
        fmt.Printf("Post: ID=%d, Title=%s, Content=%s\n", post.ID, post.Title, post.Content)
    }
    
    // Mengambil user dengan posts menggunakan named query
    type UserWithPosts struct {
        User  User   `db:"user"`
        Posts []Post `db:"posts"`
    }
    
    var userWithPosts UserWithPosts
    userWithPosts.User = user
    
    err = db.Select(&userWithPosts.Posts, "SELECT * FROM posts WHERE user_id = :user_id", sqlx.Named("user_id", id))
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", userWithPosts.User.ID, userWithPosts.User.Username, userWithPosts.User.Email)
    fmt.Printf("Posts count: %d\n", len(userWithPosts.Posts))
    for _, post := range userWithPosts.Posts {
        fmt.Printf("Post: ID=%d, Title=%s, Content=%s\n", post.ID, post.Title, post.Content)
    }
    
    // Memperbarui user
    _, err = db.Exec("UPDATE users SET username = ?, email = ? WHERE id = ?", "jane", "jane@example.com", id)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Updated user: ID=%d\n", id)
    
    // Menghapus user
    _, err = db.Exec("DELETE FROM users WHERE id = ?", id)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Deleted user: ID=%d\n", id)
    
    // Transaksi database
    tx, err := db.Beginx()
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat user baru dalam transaksi
    result, err = tx.Exec("INSERT INTO users (username, email) VALUES (?, ?)", "alice", "alice@example.com")
    if err != nil {
        tx.Rollback()
        log.Fatal(err)
    }
    
    // Mengambil ID user yang baru dibuat
    newID, err := result.LastInsertId()
    if err != nil {
        tx.Rollback()
        log.Fatal(err)
    }
    
    // Membuat post baru dalam transaksi
    _, err = tx.Exec("INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)", "Transaction Test", "This post was created in a transaction", newID)
    if err != nil {
        tx.Rollback()
        log.Fatal(err)
    }
    
    // Commit transaksi
    err = tx.Commit()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Transaction completed successfully")
}
```

## XORM

XORM adalah ORM library yang ringan dan mudah digunakan untuk Go. XORM mendukung berbagai database SQL dan menyediakan fitur seperti auto migration, hooks, dan caching.

### Karakteristik XORM
- **Auto Migration**: Migrasi otomatis skema database
- **Hooks**: Callback sebelum dan sesudah operasi database
- **Caching**: Dukungan untuk caching hasil query
- **Transaction Support**: Dukungan untuk transaksi database
- **Multiple Database Support**: Dukungan untuk berbagai database SQL

### Implementasi XORM
```go
// Implementasi dasar XORM
package main

import (
    "fmt"
    "log"
    "time"
    "xorm.io/xorm"
    _ "github.com/go-sql-driver/mysql"
)

// User adalah model untuk tabel users
type User struct {
    ID        int64     `xorm:"pk autoincr 'id'"`
    Username  string    `xorm:"varchar(50) notnull 'username'"`
    Email     string    `xorm:"varchar(100) notnull unique 'email'"`
    CreatedAt time.Time `xorm:"created 'created_at'"`
    UpdatedAt time.Time `xorm:"updated 'updated_at'"`
}

// Post adalah model untuk tabel posts
type Post struct {
    ID        int64     `xorm:"pk autoincr 'id'"`
    Title     string    `xorm:"varchar(100) notnull 'title'"`
    Content   string    `xorm:"text 'content'"`
    UserID    int64     `xorm:"notnull 'user_id'"`
    User      User      `xorm:"-"`
    CreatedAt time.Time `xorm:"created 'created_at'"`
    UpdatedAt time.Time `xorm:"updated 'updated_at'"`
}

// AfterInsert adalah hook yang dijalankan setelah membuat record baru
func (u *User) AfterInsert() {
    log.Println("After inserting user:", u.Username)
}

// BeforeInsert adalah hook yang dijalankan sebelum membuat record baru
func (u *User) BeforeInsert() {
    log.Println("Before inserting user:", u.Username)
}

func main() {
    // Membuat engine XORM
    engine, err := xorm.NewEngine("mysql", "root:password@tcp(localhost:3306)/testdb?charset=utf8mb4&parseTime=True&loc=Local")
    if err != nil {
        log.Fatal(err)
    }
    defer engine.Close()
    
    // Mengatur log level
    engine.ShowSQL(true)
    
    // Migrasi otomatis skema database
    err = engine.Sync2(new(User), new(Post))
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat user baru
    user := &User{
        Username: "john",
        Email:    "john@example.com",
    }
    
    affected, err := engine.Insert(user)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created user: ID=%d, Username=%s, Email=%s, Affected rows: %d\n", user.ID, user.Username, user.Email, affected)
    
    // Membuat post baru
    post := &Post{
        Title:   "Hello World",
        Content: "This is my first post",
        UserID:  user.ID,
    }
    
    affected, err = engine.Insert(post)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created post: ID=%d, Title=%s, UserID=%d, Affected rows: %d\n", post.ID, post.Title, post.UserID, affected)
    
    // Mengambil user dengan ID tertentu
    has, err := engine.ID(user.ID).Get(user)
    if err != nil {
        log.Fatal(err)
    }
    
    if has {
        fmt.Printf("Retrieved user: ID=%d, Username=%s, Email=%s, Created At=%s\n", user.ID, user.Username, user.Email, user.CreatedAt)
    } else {
        fmt.Println("User not found")
    }
    
    // Mengambil semua users
    var users []User
    err = engine.Find(&users)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users\n", len(users))
    for _, user := range users {
        fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    }
    
    // Mengambil posts untuk user tertentu
    var posts []Post
    err = engine.Where("user_id = ?", user.ID).Find(&posts)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d posts for user ID %d\n", len(posts), user.ID)
    for _, post := range posts {
        fmt.Printf("Post: ID=%d, Title=%s, Content=%s\n", post.ID, post.Title, post.Content)
    }
    
    // Mengambil user dengan posts
    var userWithPosts []struct {
        User  User   `xorm:"extends"`
        Posts []Post `xorm:"-"`
    }
    
    err = engine.Table("users").Find(&userWithPosts)
    if err != nil {
        log.Fatal(err)
    }
    
    for i := range userWithPosts {
        err = engine.Where("user_id = ?", userWithPosts[i].User.ID).Find(&userWithPosts[i].Posts)
        if err != nil {
            log.Fatal(err)
        }
    }
    
    fmt.Printf("Found %d users with posts\n", len(userWithPosts))
    for _, uwp := range userWithPosts {
        fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", uwp.User.ID, uwp.User.Username, uwp.User.Email)
        fmt.Printf("Posts count: %d\n", len(uwp.Posts))
        for _, post := range uwp.Posts {
            fmt.Printf("Post: ID=%d, Title=%s, Content=%s\n", post.ID, post.Title, post.Content)
        }
    }
    
    // Memperbarui user
    affected, err = engine.ID(user.ID).Update(&User{
        Username: "jane",
        Email:    "jane@example.com",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Updated user: ID=%d, Affected rows: %d\n", user.ID, affected)
    
    // Menghapus user
    affected, err = engine.ID(user.ID).Delete(new(User))
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Deleted user: ID=%d, Affected rows: %d\n", user.ID, affected)
    
    // Transaksi database
    session := engine.NewSession()
    defer session.Close()
    
    err = session.Begin()
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat user baru dalam transaksi
    newUser := &User{
        Username: "alice",
        Email:    "alice@example.com",
    }
    
    affected, err = session.Insert(newUser)
    if err != nil {
        session.Rollback()
        log.Fatal(err)
    }
    
    // Membuat post baru dalam transaksi
    newPost := &Post{
        Title:   "Transaction Test",
        Content: "This post was created in a transaction",
        UserID:  newUser.ID,
    }
    
    affected, err = session.Insert(newPost)
    if err != nil {
        session.Rollback()
        log.Fatal(err)
    }
    
    // Commit transaksi
    err = session.Commit()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Transaction completed successfully")
}
```

## Model Definition

Model definition adalah proses mendefinisikan struktur data yang akan disimpan di database. Dalam Go, model biasanya didefinisikan sebagai struct dengan tag untuk menentukan bagaimana struct tersebut dipetakan ke tabel database.

### Karakteristik Model Definition
- **Struct Tags**: Tag untuk menentukan pemetaan struct ke tabel database
- **Field Types**: Tipe data field yang sesuai dengan tipe data di database
- **Relationships**: Relasi antar model
- **Validation**: Validasi data sebelum disimpan
- **Custom Methods**: Metode khusus untuk model

### Implementasi Model Definition
```go
// Model definition dasar
package main

import (
    "fmt"
    "log"
    "time"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

// BaseModel adalah model dasar yang digunakan oleh model lain
type BaseModel struct {
    ID        uint      `gorm:"primaryKey"`
    CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

// User adalah model untuk tabel users
type User struct {
    BaseModel
    Username  string    `gorm:"size:50;not null;uniqueIndex"`
    Email     string    `gorm:"size:100;not null;uniqueIndex"`
    Password  string    `gorm:"size:100;not null"`
    IsActive  bool      `gorm:"default:true"`
    LastLogin time.Time `gorm:"default:NULL"`
    Posts     []Post    `gorm:"foreignKey:UserID"`
}

// Post adalah model untuk tabel posts
type Post struct {
    BaseModel
    Title     string    `gorm:"size:100;not null"`
    Content   string    `gorm:"type:text"`
    UserID    uint      `gorm:"not null;index"`
    User      User      `gorm:"foreignKey:UserID"`
    Tags      []Tag     `gorm:"many2many:post_tags;"`
    Comments  []Comment `gorm:"foreignKey:PostID"`
}

// Tag adalah model untuk tabel tags
type Tag struct {
    BaseModel
    Name  string `gorm:"size:50;not null;uniqueIndex"`
    Posts []Post `gorm:"many2many:post_tags;"`
}

// Comment adalah model untuk tabel comments
type Comment struct {
    BaseModel
    Content string `gorm:"type:text;not null"`
    UserID  uint   `gorm:"not null;index"`
    User    User   `gorm:"foreignKey:UserID"`
    PostID  uint   `gorm:"not null;index"`
    Post    Post   `gorm:"foreignKey:PostID"`
}

// TableName menentukan nama tabel untuk model User
func (User) TableName() string {
    return "users"
}

// TableName menentukan nama tabel untuk model Post
func (Post) TableName() string {
    return "posts"
}

// TableName menentukan nama tabel untuk model Tag
func (Tag) TableName() string {
    return "tags"
}

// TableName menentukan nama tabel untuk model Comment
func (Comment) TableName() string {
    return "comments"
}

// BeforeCreate adalah hook yang dijalankan sebelum membuat record baru
func (u *User) BeforeCreate(tx *gorm.DB) error {
    // Validasi data
    if u.Username == "" {
        return fmt.Errorf("username is required")
    }
    
    if u.Email == "" {
        return fmt.Errorf("email is required")
    }
    
    if u.Password == "" {
        return fmt.Errorf("password is required")
    }
    
    return nil
}

// AfterCreate adalah hook yang dijalankan setelah membuat record baru
func (u *User) AfterCreate(tx *gorm.DB) error {
    log.Println("User created:", u.Username)
    return nil
}

// GetFullName mengembalikan nama lengkap user
func (u *User) GetFullName() string {
    return u.Username
}

func main() {
    // Membuka koneksi database
    dsn := "root:password@tcp(localhost:3306)/testdb?charset=utf8mb4&parseTime=True&loc=Local"
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal(err)
    }
    
    // Migrasi otomatis skema database
    err = db.AutoMigrate(&User{}, &Post{}, &Tag{}, &Comment{})
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat user baru
    user := &User{
        Username: "john",
        Email:    "john@example.com",
        Password: "password123",
    }
    
    result := db.Create(user)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    
    // Membuat tag baru
    tag := &Tag{
        Name: "golang",
    }
    
    result = db.Create(tag)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created tag: ID=%d, Name=%s\n", tag.ID, tag.Name)
    
    // Membuat post baru
    post := &Post{
        Title:   "Hello World",
        Content: "This is my first post",
        UserID:  user.ID,
        Tags:    []Tag{*tag},
    }
    
    result = db.Create(post)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created post: ID=%d, Title=%s, UserID=%d\n", post.ID, post.Title, post.UserID)
    
    // Membuat comment baru
    comment := &Comment{
        Content: "Great post!",
        UserID:  user.ID,
        PostID:  post.ID,
    }
    
    result = db.Create(comment)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created comment: ID=%d, Content=%s, UserID=%d, PostID=%d\n", comment.ID, comment.Content, comment.UserID, comment.PostID)
    
    // Mengambil user dengan posts, tags, dan comments
    var userWithRelations User
    result = db.Preload("Posts.Tags").Preload("Posts.Comments").First(&userWithRelations, user.ID)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", userWithRelations.ID, userWithRelations.Username, userWithRelations.Email)
    fmt.Printf("Posts count: %d\n", len(userWithRelations.Posts))
    for _, post := range userWithRelations.Posts {
        fmt.Printf("Post: ID=%d, Title=%s, Content=%s\n", post.ID, post.Title, post.Content)
        fmt.Printf("Tags count: %d\n", len(post.Tags))
        for _, tag := range post.Tags {
            fmt.Printf("Tag: ID=%d, Name=%s\n", tag.ID, tag.Name)
        }
        fmt.Printf("Comments count: %d\n", len(post.Comments))
        for _, comment := range post.Comments {
            fmt.Printf("Comment: ID=%d, Content=%s\n", comment.ID, comment.Content)
        }
    }
}
```

## Relationship Mapping

Relationship mapping adalah proses mendefinisikan relasi antar model. Dalam Go, relasi antar model dapat didefinisikan menggunakan tag dan struct embedding.

### Karakteristik Relationship Mapping
- **One-to-One**: Relasi satu-ke-satu antar model
- **One-to-Many**: Relasi satu-ke-banyak antar model
- **Many-to-Many**: Relasi banyak-ke-banyak antar model
- **Eager Loading**: Memuat relasi secara otomatis
- **Lazy Loading**: Memuat relasi saat dibutuhkan

### Implementasi Relationship Mapping
```go
// Relationship mapping dasar
package main

import (
    "fmt"
    "log"
    "time"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

// User adalah model untuk tabel users
type User struct {
    ID        uint      `gorm:"primaryKey"`
    Username  string    `gorm:"size:50;not null"`
    Email     string    `gorm:"size:100;not null;unique"`
    Profile   Profile   `gorm:"foreignKey:UserID"`
    Posts     []Post    `gorm:"foreignKey:UserID"`
    CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

// Profile adalah model untuk tabel profiles
type Profile struct {
    ID        uint      `gorm:"primaryKey"`
    UserID    uint      `gorm:"uniqueIndex"`
    FirstName string    `gorm:"size:50"`
    LastName  string    `gorm:"size:50"`
    Bio       string    `gorm:"type:text"`
    User      User      `gorm:"foreignKey:UserID"`
    CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

// Post adalah model untuk tabel posts
type Post struct {
    ID        uint      `gorm:"primaryKey"`
    Title     string    `gorm:"size:100;not null"`
    Content   string    `gorm:"type:text"`
    UserID    uint      `gorm:"not null;index"`
    User      User      `gorm:"foreignKey:UserID"`
    Tags      []Tag     `gorm:"many2many:post_tags;"`
    Comments  []Comment `gorm:"foreignKey:PostID"`
    CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

// Tag adalah model untuk tabel tags
type Tag struct {
    ID        uint      `gorm:"primaryKey"`
    Name      string    `gorm:"size:50;not null;uniqueIndex"`
    Posts     []Post    `gorm:"many2many:post_tags;"`
    CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

// Comment adalah model untuk tabel comments
type Comment struct {
    ID        uint      `gorm:"primaryKey"`
    Content   string    `gorm:"type:text;not null"`
    UserID    uint      `gorm:"not null;index"`
    User      User      `gorm:"foreignKey:UserID"`
    PostID    uint      `gorm:"not null;index"`
    Post      Post      `gorm:"foreignKey:PostID"`
    CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"`
}

func main() {
    // Membuka koneksi database
    dsn := "root:password@tcp(localhost:3306)/testdb?charset=utf8mb4&parseTime=True&loc=Local"
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal(err)
    }
    
    // Migrasi otomatis skema database
    err = db.AutoMigrate(&User{}, &Profile{}, &Post{}, &Tag{}, &Comment{})
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat user baru
    user := &User{
        Username: "john",
        Email:    "john@example.com",
    }
    
    result := db.Create(user)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created user: ID=%d, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    
    // Membuat profile untuk user
    profile := &Profile{
        UserID:    user.ID,
        FirstName: "John",
        LastName:  "Doe",
        Bio:       "Software developer",
    }
    
    result = db.Create(profile)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created profile: ID=%d, UserID=%d, FirstName=%s, LastName=%s\n", profile.ID, profile.UserID, profile.FirstName, profile.LastName)
    
    // Membuat tag baru
    tag := &Tag{
        Name: "golang",
    }
    
    result = db.Create(tag)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created tag: ID=%d, Name=%s\n", tag.ID, tag.Name)
    
    // Membuat post baru
    post := &Post{
        Title:   "Hello World",
        Content: "This is my first post",
        UserID:  user.ID,
        Tags:    []Tag{*tag},
    }
    
    result = db.Create(post)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created post: ID=%d, Title=%s, UserID=%d\n", post.ID, post.Title, post.UserID)
    
    // Membuat comment baru
    comment := &Comment{
        Content: "Great post!",
        UserID:  user.ID,
        PostID:  post.ID,
    }
    
    result = db.Create(comment)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Created comment: ID=%d, Content=%s, UserID=%d, PostID=%d\n", comment.ID, comment.Content, comment.UserID, comment.PostID)
    
    // One-to-One: Mengambil user dengan profile
    var userWithProfile User
    result = db.Preload("Profile").First(&userWithProfile, user.ID)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", userWithProfile.ID, userWithProfile.Username, userWithProfile.Email)
    fmt.Printf("Profile: ID=%d, FirstName=%s, LastName=%s, Bio=%s\n", userWithProfile.Profile.ID, userWithProfile.Profile.FirstName, userWithProfile.Profile.LastName, userWithProfile.Profile.Bio)
    
    // One-to-Many: Mengambil user dengan posts
    var userWithPosts User
    result = db.Preload("Posts").First(&userWithPosts, user.ID)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", userWithPosts.ID, userWithPosts.Username, userWithPosts.Email)
    fmt.Printf("Posts count: %d\n", len(userWithPosts.Posts))
    for _, post := range userWithPosts.Posts {
        fmt.Printf("Post: ID=%d, Title=%s, Content=%s\n", post.ID, post.Title, post.Content)
    }
    
    // Many-to-Many: Mengambil post dengan tags
    var postWithTags Post
    result = db.Preload("Tags").First(&postWithTags, post.ID)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("Post: ID=%d, Title=%s, Content=%s\n", postWithTags.ID, postWithTags.Title, postWithTags.Content)
    fmt.Printf("Tags count: %d\n", len(postWithTags.Tags))
    for _, tag := range postWithTags.Tags {
        fmt.Printf("Tag: ID=%d, Name=%s\n", tag.ID, tag.Name)
    }
    
    // Nested Relationships: Mengambil user dengan posts, tags, dan comments
    var userWithRelations User
    result = db.Preload("Posts.Tags").Preload("Posts.Comments").First(&userWithRelations, user.ID)
    if result.Error != nil {
        log.Fatal(result.Error)
    }
    
    fmt.Printf("User: ID=%d, Username=%s, Email=%s\n", userWithRelations.ID, userWithRelations.Username, userWithRelations.Email)
    fmt.Printf("Posts count: %d\n", len(userWithRelations.Posts))
    for _, post := range userWithRelations.Posts {
        fmt.Printf("Post: ID=%d, Title=%s, Content=%s\n", post.ID, post.Title, post.Content)
        fmt.Printf("Tags count: %d\n", len(post.Tags))
        for _, tag := range post.Tags {
            fmt.Printf("Tag: ID=%d, Name=%s\n", tag.ID, tag.Name)
        }
        fmt.Printf("Comments count: %d\n", len(post.Comments))
        for _, comment := range post.Comments {
            fmt.Printf("Comment: ID=%d, Content=%s\n", comment.ID, comment.Content)
        }
    }
}
```

## Kesimpulan

ORM (Object Relational Mapping) adalah teknik pemrograman yang memungkinkan pengembang untuk bekerja dengan database menggunakan konsep pemrograman berorientasi objek. Go memiliki beberapa library ORM populer seperti GORM, SQLx, dan XORM.

Dengan memahami dan mengimplementasikan konsep-konsep seperti model definition, relationship mapping, dan fitur-fitur ORM, kita dapat mengembangkan aplikasi yang berinteraksi dengan database secara efisien dan andal.

Pilihan ORM yang tepat tergantung pada kebutuhan aplikasi. GORM cocok untuk aplikasi yang memerlukan fitur ORM lengkap, SQLx cocok untuk aplikasi yang memerlukan kontrol lebih besar terhadap query SQL, dan XORM cocok untuk aplikasi yang memerlukan ORM ringan dan mudah digunakan. 