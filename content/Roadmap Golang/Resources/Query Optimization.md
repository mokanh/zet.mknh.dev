# Query Optimization

Query optimization adalah proses meningkatkan efisiensi dan performa query database. Dalam aplikasi Go, query yang dioptimalkan dapat meningkatkan respons time, mengurangi beban server, dan meningkatkan throughput aplikasi secara keseluruhan.

## Indexing

Indexing adalah teknik untuk mempercepat pencarian data dalam database dengan membuat struktur data tambahan yang memungkinkan akses cepat ke data.

### Karakteristik Indexing
- **Single-column Index**: Index pada satu kolom
- **Composite Index**: Index pada beberapa kolom
- **Unique Index**: Index yang memastikan nilai unik
- **Partial Index**: Index pada subset data
- **Covered Query**: Query yang dapat dipenuhi sepenuhnya oleh index

### Implementasi Indexing
```go
// Implementasi dasar indexing
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "database/sql"
    _ "github.com/lib/pq"
)

// MongoDB Indexing
func mongoDBIndexing() {
    // Membuat client MongoDB
    client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(context.Background())
    
    // Memilih database dan collection
    db := client.Database("testdb")
    collection := db.Collection("users")
    
    // Membuat single-column index
    indexModel := mongo.IndexModel{
        Keys: bson.D{{"username", 1}},
        Options: options.Index().SetName("username_idx"),
    }
    
    _, err = collection.Indexes().CreateOne(context.Background(), indexModel)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Created single-column index on username")
    
    // Membuat composite index
    indexModel = mongo.IndexModel{
        Keys: bson.D{
            {"email", 1},
            {"created_at", -1},
        },
        Options: options.Index().SetName("email_created_at_idx"),
    }
    
    _, err = collection.Indexes().CreateOne(context.Background(), indexModel)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Created composite index on email and created_at")
    
    // Membuat unique index
    indexModel = mongo.IndexModel{
        Keys: bson.D{{"email", 1}},
        Options: options.Index().SetName("email_unique_idx").SetUnique(true),
    }
    
    _, err = collection.Indexes().CreateOne(context.Background(), indexModel)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Created unique index on email")
    
    // Membuat partial index
    indexModel = mongo.IndexModel{
        Keys: bson.D{{"age", 1}},
        Options: options.Index().SetName("age_partial_idx").SetPartialFilterExpression(bson.M{"age": bson.M{"$gt": 18}}),
    }
    
    _, err = collection.Indexes().CreateOne(context.Background(), indexModel)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Created partial index on age for users older than 18")
    
    // Menggunakan covered query
    opts := options.Find().SetProjection(bson.D{{"username", 1}}).SetHint("username_idx")
    
    cursor, err := collection.Find(context.Background(), bson.M{"username": bson.M{"$regex": "^j"}}, opts)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    var results []bson.M
    if err = cursor.All(context.Background(), &results); err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users with username starting with 'j'\n", len(results))
    for _, result := range results {
        fmt.Println(result)
    }
}

// PostgreSQL Indexing
func postgreSQLIndexing() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Membuat single-column index
    _, err = db.Exec(`CREATE INDEX IF NOT EXISTS username_idx ON users (username)`)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Created single-column index on username")
    
    // Membuat composite index
    _, err = db.Exec(`CREATE INDEX IF NOT EXISTS email_created_at_idx ON users (email, created_at DESC)`)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Created composite index on email and created_at")
    
    // Membuat unique index
    _, err = db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS email_unique_idx ON users (email)`)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Created unique index on email")
    
    // Membuat partial index
    _, err = db.Exec(`CREATE INDEX IF NOT EXISTS age_partial_idx ON users (age) WHERE age > 18`)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Created partial index on age for users older than 18")
    
    // Menggunakan covered query
    rows, err := db.Query(`SELECT username FROM users WHERE username LIKE 'j%'`)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    var usernames []string
    for rows.Next() {
        var username string
        if err := rows.Scan(&username); err != nil {
            log.Fatal(err)
        }
        usernames = append(usernames, username)
    }
    
    fmt.Printf("Found %d users with username starting with 'j'\n", len(usernames))
    for _, username := range usernames {
        fmt.Println(username)
    }
}

func main() {
    // MongoDB Indexing
    mongoDBIndexing()
    
    // PostgreSQL Indexing
    postgreSQLIndexing()
}
```

## Query Planning

Query planning adalah proses di mana database menentukan cara terbaik untuk mengeksekusi query. Pemahaman tentang query planning dapat membantu mengoptimalkan query.

### Karakteristik Query Planning
- **Query Analyzer**: Analisis query untuk menentukan rencana eksekusi
- **Execution Plan**: Rencana detail tentang bagaimana query akan dieksekusi
- **Cost-based Optimization**: Optimasi berdasarkan estimasi biaya
- **Statistics**: Statistik data untuk membantu optimasi
- **Hints**: Petunjuk untuk database tentang cara mengeksekusi query

### Implementasi Query Planning
```go
// Implementasi dasar query planning
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "database/sql"
    _ "github.com/lib/pq"
)

// MongoDB Query Planning
func mongoDBQueryPlanning() {
    // Membuat client MongoDB
    client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(context.Background())
    
    // Memilih database dan collection
    db := client.Database("testdb")
    collection := db.Collection("users")
    
    // Menjalankan explain pada query
    filter := bson.M{"age": bson.M{"$gt": 18}}
    opts := options.Find().SetSort(bson.D{{"username", 1}})
    
    explainOpts := options.Explain().SetVerbosity("executionStats")
    
    cursor, err := collection.Find(context.Background(), filter, opts)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    explainResult, err := cursor.Explain(context.Background(), explainOpts)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("MongoDB Query Plan:")
    fmt.Println(explainResult)
    
    // Menggunakan hint untuk memaksa penggunaan index tertentu
    opts = options.Find().SetSort(bson.D{{"username", 1}}).SetHint("username_idx")
    
    cursor, err = collection.Find(context.Background(), filter, opts)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    explainResult, err = cursor.Explain(context.Background(), explainOpts)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("MongoDB Query Plan with Hint:")
    fmt.Println(explainResult)
}

// PostgreSQL Query Planning
func postgreSQLQueryPlanning() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Menjalankan EXPLAIN pada query
    rows, err := db.Query(`EXPLAIN ANALYZE SELECT * FROM users WHERE age > 18 ORDER BY username`)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    fmt.Println("PostgreSQL Query Plan:")
    for rows.Next() {
        var plan string
        if err := rows.Scan(&plan); err != nil {
            log.Fatal(err)
        }
        fmt.Println(plan)
    }
    
    // Menggunakan hint untuk memaksa penggunaan index tertentu
    rows, err = db.Query(`EXPLAIN ANALYZE SELECT * FROM users WHERE age > 18 ORDER BY username /*+ INDEX(users username_idx) */`)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    fmt.Println("PostgreSQL Query Plan with Hint:")
    for rows.Next() {
        var plan string
        if err := rows.Scan(&plan); err != nil {
            log.Fatal(err)
        }
        fmt.Println(plan)
    }
}

func main() {
    // MongoDB Query Planning
    mongoDBQueryPlanning()
    
    // PostgreSQL Query Planning
    postgreSQLQueryPlanning()
}
```

## Query Rewriting

Query rewriting adalah teknik untuk mengubah query menjadi bentuk yang lebih efisien tanpa mengubah hasilnya. Teknik ini dapat meningkatkan performa query secara signifikan.

### Karakteristik Query Rewriting
- **Subquery Elimination**: Menghilangkan subquery yang tidak perlu
- **Predicate Pushdown**: Memindahkan predikat ke level yang lebih rendah
- **Join Reordering**: Mengubah urutan join untuk performa yang lebih baik
- **View Expansion**: Mengekspansi view menjadi query aslinya
- **Constant Folding**: Menghitung ekspresi konstan saat kompilasi

### Implementasi Query Rewriting
```go
// Implementasi dasar query rewriting
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "database/sql"
    _ "github.com/lib/pq"
)

// MongoDB Query Rewriting
func mongoDBQueryRewriting() {
    // Membuat client MongoDB
    client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(context.Background())
    
    // Memilih database dan collection
    db := client.Database("testdb")
    usersCollection := db.Collection("users")
    postsCollection := db.Collection("posts")
    
    // Subquery Elimination
    // Query asli: Find users who have posts with more than 10 likes
    // Query yang dioptimalkan: Find posts with more than 10 likes, then get unique user IDs
    filter := bson.M{"likes": bson.M{"$gt": 10}}
    opts := options.Find().SetProjection(bson.D{{"user_id", 1}}).SetSort(bson.D{{"user_id", 1}})
    
    cursor, err := postsCollection.Find(context.Background(), filter, opts)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    var postResults []bson.M
    if err = cursor.All(context.Background(), &postResults); err != nil {
        log.Fatal(err)
    }
    
    // Extract unique user IDs
    userIDs := make(map[primitive.ObjectID]bool)
    for _, post := range postResults {
        userID := post["user_id"].(primitive.ObjectID)
        userIDs[userID] = true
    }
    
    // Convert map keys to slice
    var uniqueUserIDs []primitive.ObjectID
    for userID := range userIDs {
        uniqueUserIDs = append(uniqueUserIDs, userID)
    }
    
    // Find users by IDs
    userFilter := bson.M{"_id": bson.M{"$in": uniqueUserIDs}}
    
    cursor, err = usersCollection.Find(context.Background(), userFilter)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    var users []bson.M
    if err = cursor.All(context.Background(), &users); err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users with posts having more than 10 likes\n", len(users))
    
    // Predicate Pushdown
    // Query asli: Find users who are older than 18 and have posts with more than 10 likes
    // Query yang dioptimalkan: First filter users by age, then check their posts
    userFilter = bson.M{"age": bson.M{"$gt": 18}}
    
    cursor, err = usersCollection.Find(context.Background(), userFilter)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    var adultUsers []bson.M
    if err = cursor.All(context.Background(), &adultUsers); err != nil {
        log.Fatal(err)
    }
    
    // Extract user IDs
    var adultUserIDs []primitive.ObjectID
    for _, user := range adultUsers {
        userID := user["_id"].(primitive.ObjectID)
        adultUserIDs = append(adultUserIDs, userID)
    }
    
    // Find posts by these users with more than 10 likes
    postFilter := bson.M{
        "user_id": bson.M{"$in": adultUserIDs},
        "likes": bson.M{"$gt": 10},
    }
    
    cursor, err = postsCollection.Find(context.Background(), postFilter)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    var posts []bson.M
    if err = cursor.All(context.Background(), &posts); err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d posts with more than 10 likes from users older than 18\n", len(posts))
}

// PostgreSQL Query Rewriting
func postgreSQLQueryRewriting() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Subquery Elimination
    // Query asli: SELECT * FROM users WHERE id IN (SELECT user_id FROM posts WHERE likes > 10)
    // Query yang dioptimalkan: SELECT DISTINCT u.* FROM users u JOIN posts p ON u.id = p.user_id WHERE p.likes > 10
    rows, err := db.Query(`
        SELECT DISTINCT u.* 
        FROM users u 
        JOIN posts p ON u.id = p.user_id 
        WHERE p.likes > 10
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    var users []User
    for rows.Next() {
        var user User
        if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Age, &user.CreatedAt); err != nil {
            log.Fatal(err)
        }
        users = append(users, user)
    }
    
    fmt.Printf("Found %d users with posts having more than 10 likes\n", len(users))
    
    // Predicate Pushdown
    // Query asli: SELECT * FROM users WHERE age > 18 AND id IN (SELECT user_id FROM posts WHERE likes > 10)
    // Query yang dioptimalkan: SELECT DISTINCT u.* FROM users u JOIN posts p ON u.id = p.user_id WHERE u.age > 18 AND p.likes > 10
    rows, err = db.Query(`
        SELECT DISTINCT u.* 
        FROM users u 
        JOIN posts p ON u.id = p.user_id 
        WHERE u.age > 18 AND p.likes > 10
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    users = nil
    for rows.Next() {
        var user User
        if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Age, &user.CreatedAt); err != nil {
            log.Fatal(err)
        }
        users = append(users, user)
    }
    
    fmt.Printf("Found %d users older than 18 with posts having more than 10 likes\n", len(users))
    
    // Join Reordering
    // Query asli: SELECT * FROM users u JOIN posts p ON u.id = p.user_id JOIN comments c ON p.id = c.post_id WHERE c.content LIKE '%golang%'
    // Query yang dioptimalkan: Start with comments table, then join with posts, then join with users
    rows, err = db.Query(`
        SELECT u.*, p.title, c.content 
        FROM comments c 
        JOIN posts p ON c.post_id = p.id 
        JOIN users u ON p.user_id = u.id 
        WHERE c.content LIKE '%golang%'
    `)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()
    
    var results []struct {
        User    User
        PostTitle string
        CommentContent string
    }
    
    for rows.Next() {
        var result struct {
            User    User
            PostTitle string
            CommentContent string
        }
        if err := rows.Scan(&result.User.ID, &result.User.Username, &result.User.Email, &result.User.Age, &result.User.CreatedAt, &result.PostTitle, &result.CommentContent); err != nil {
            log.Fatal(err)
        }
        results = append(results, result)
    }
    
    fmt.Printf("Found %d comments containing 'golang'\n", len(results))
}

// User struct untuk PostgreSQL
type User struct {
    ID        int
    Username  string
    Email     string
    Age       int
    CreatedAt time.Time
}

func main() {
    // MongoDB Query Rewriting
    mongoDBQueryRewriting()
    
    // PostgreSQL Query Rewriting
    postgreSQLQueryRewriting()
}
```

## Connection Pooling

Connection pooling adalah teknik untuk mengelola dan menggunakan kembali koneksi database, yang dapat meningkatkan performa aplikasi dengan mengurangi overhead pembuatan koneksi baru.

### Karakteristik Connection Pooling
- **Connection Reuse**: Menggunakan kembali koneksi yang sudah ada
- **Connection Limits**: Membatasi jumlah koneksi yang dapat dibuat
- **Connection Timeouts**: Mengatur timeout untuk koneksi yang tidak digunakan
- **Health Checks**: Memeriksa kesehatan koneksi sebelum digunakan
- **Connection Leaks**: Mencegah kebocoran koneksi

### Implementasi Connection Pooling
```go
// Implementasi dasar connection pooling
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "database/sql"
    _ "github.com/lib/pq"
)

// MongoDB Connection Pooling
func mongoDBConnectionPooling() {
    // Mengatur opsi koneksi dengan connection pooling
    clientOptions := options.Client().ApplyURI("mongodb://localhost:27017").
        SetMaxPoolSize(100).                // Maksimum jumlah koneksi dalam pool
        SetMinPoolSize(5).                  // Minimum jumlah koneksi dalam pool
        SetMaxConnIdleTime(30 * time.Minute). // Waktu maksimum koneksi tidak digunakan
        SetMaxConnecting(10).               // Maksimum jumlah koneksi yang sedang dibuat
        SetMaxConnIdleTime(30 * time.Minute) // Waktu maksimum koneksi tidak digunakan
    
    // Membuat client MongoDB
    client, err := mongo.Connect(context.Background(), clientOptions)
    if err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(context.Background())
    
    // Memeriksa koneksi
    err = client.Ping(context.Background(), nil)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Connected to MongoDB with connection pooling!")
    
    // Menggunakan koneksi dari pool
    db := client.Database("testdb")
    collection := db.Collection("users")
    
    // Melakukan beberapa operasi untuk menunjukkan penggunaan koneksi dari pool
    for i := 0; i < 10; i++ {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()
        
        _, err := collection.CountDocuments(ctx, map[string]interface{}{})
        if err != nil {
            log.Fatal(err)
        }
        
        fmt.Printf("Operation %d completed successfully\n", i+1)
    }
    
    // Mendapatkan statistik koneksi
    stats := client.NumberSessionsInUse()
    fmt.Printf("Number of sessions in use: %d\n", stats)
}

// PostgreSQL Connection Pooling
func postgreSQLConnectionPooling() {
    // Membuka koneksi ke PostgreSQL dengan connection pooling
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Mengatur connection pool
    db.SetMaxOpenConns(25)                  // Maksimum jumlah koneksi terbuka
    db.SetMaxIdleConns(5)                   // Maksimum jumlah koneksi idle
    db.SetConnMaxLifetime(30 * time.Minute) // Waktu maksimum koneksi dapat digunakan
    
    // Memeriksa koneksi
    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Connected to PostgreSQL with connection pooling!")
    
    // Menggunakan koneksi dari pool
    for i := 0; i < 10; i++ {
        rows, err := db.Query("SELECT COUNT(*) FROM users")
        if err != nil {
            log.Fatal(err)
        }
        defer rows.Close()
        
        var count int
        for rows.Next() {
            if err := rows.Scan(&count); err != nil {
                log.Fatal(err)
            }
        }
        
        fmt.Printf("Operation %d completed successfully, count: %d\n", i+1, count)
    }
    
    // Mendapatkan statistik koneksi
    stats := db.Stats()
    fmt.Printf("Open connections: %d, In use: %d, Idle: %d\n", stats.OpenConnections, stats.InUse, stats.Idle)
}

func main() {
    // MongoDB Connection Pooling
    mongoDBConnectionPooling()
    
    // PostgreSQL Connection Pooling
    postgreSQLConnectionPooling()
}
```

## Query Caching

Query caching adalah teknik untuk menyimpan hasil query di memori untuk digunakan kembali, yang dapat meningkatkan performa aplikasi dengan mengurangi beban database.

### Karakteristik Query Caching
- **Result Caching**: Menyimpan hasil query untuk digunakan kembali
- **Cache Invalidation**: Menghapus cache ketika data berubah
- **Cache Expiration**: Mengatur waktu kadaluarsa cache
- **Cache Size**: Membatasi ukuran cache
- **Cache Statistics**: Memantau statistik cache

### Implementasi Query Caching
```go
// Implementasi dasar query caching
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "database/sql"
    _ "github.com/lib/pq"
    "github.com/patrickmn/go-cache"
)

// MongoDB Query Caching
func mongoDBQueryCaching() {
    // Membuat client MongoDB
    client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(context.Background())
    
    // Memilih database dan collection
    db := client.Database("testdb")
    collection := db.Collection("users")
    
    // Membuat cache
    c := cache.New(5*time.Minute, 10*time.Minute)
    
    // Fungsi untuk mendapatkan users dengan caching
    getUsers := func() ([]bson.M, error) {
        // Cek cache terlebih dahulu
        if cached, found := c.Get("users"); found {
            fmt.Println("Cache hit for users")
            return cached.([]bson.M), nil
        }
        
        fmt.Println("Cache miss for users, querying database")
        
        // Query database
        cursor, err := collection.Find(context.Background(), bson.M{})
        if err != nil {
            return nil, err
        }
        defer cursor.Close(context.Background())
        
        var users []bson.M
        if err = cursor.All(context.Background(), &users); err != nil {
            return nil, err
        }
        
        // Simpan hasil di cache
        c.Set("users", users, cache.DefaultExpiration)
        
        return users, nil
    }
    
    // Menggunakan fungsi getUsers
    users, err := getUsers()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users\n", len(users))
    
    // Menggunakan fungsi getUsers lagi (seharusnya menggunakan cache)
    users, err = getUsers()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users (from cache)\n", len(users))
    
    // Menambahkan user baru
    newUser := bson.M{
        "username": "alice",
        "email":    "alice@example.com",
        "age":      25,
        "created_at": time.Now(),
    }
    
    _, err = collection.InsertOne(context.Background(), newUser)
    if err != nil {
        log.Fatal(err)
    }
    
    // Invalidate cache
    c.Delete("users")
    
    fmt.Println("Cache invalidated after adding new user")
    
    // Menggunakan fungsi getUsers lagi (seharusnya query database lagi)
    users, err = getUsers()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users (after cache invalidation)\n", len(users))
}

// PostgreSQL Query Caching
func postgreSQLQueryCaching() {
    // Membuka koneksi ke PostgreSQL
    db, err := sql.Open("postgres", "postgres://username:password@localhost:5432/testdb?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Membuat cache
    c := cache.New(5*time.Minute, 10*time.Minute)
    
    // Fungsi untuk mendapatkan users dengan caching
    getUsers := func() ([]User, error) {
        // Cek cache terlebih dahulu
        if cached, found := c.Get("users"); found {
            fmt.Println("Cache hit for users")
            return cached.([]User), nil
        }
        
        fmt.Println("Cache miss for users, querying database")
        
        // Query database
        rows, err := db.Query("SELECT id, username, email, age, created_at FROM users")
        if err != nil {
            return nil, err
        }
        defer rows.Close()
        
        var users []User
        for rows.Next() {
            var user User
            if err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Age, &user.CreatedAt); err != nil {
                return nil, err
            }
            users = append(users, user)
        }
        
        // Simpan hasil di cache
        c.Set("users", users, cache.DefaultExpiration)
        
        return users, nil
    }
    
    // Menggunakan fungsi getUsers
    users, err := getUsers()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users\n", len(users))
    
    // Menggunakan fungsi getUsers lagi (seharusnya menggunakan cache)
    users, err = getUsers()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users (from cache)\n", len(users))
    
    // Menambahkan user baru
    _, err = db.Exec(`
        INSERT INTO users (username, email, age, created_at)
        VALUES ($1, $2, $3, $4)
    `, "bob", "bob@example.com", 30, time.Now())
    if err != nil {
        log.Fatal(err)
    }
    
    // Invalidate cache
    c.Delete("users")
    
    fmt.Println("Cache invalidated after adding new user")
    
    // Menggunakan fungsi getUsers lagi (seharusnya query database lagi)
    users, err = getUsers()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users (after cache invalidation)\n", len(users))
}

// User struct untuk PostgreSQL
type User struct {
    ID        int
    Username  string
    Email     string
    Age       int
    CreatedAt time.Time
}

func main() {
    // MongoDB Query Caching
    mongoDBQueryCaching()
    
    // PostgreSQL Query Caching
    postgreSQLQueryCaching()
}
```

## Kesimpulan

Query optimization adalah proses penting dalam pengembangan aplikasi database. Dengan mengoptimalkan query, kita dapat meningkatkan performa aplikasi, mengurangi beban server, dan meningkatkan throughput.

Teknik-teknik seperti indexing, query planning, query rewriting, connection pooling, dan query caching dapat digunakan untuk mengoptimalkan query database. Pemilihan teknik yang tepat tergantung pada kebutuhan aplikasi dan karakteristik database yang digunakan.

Dalam Go, kita dapat mengimplementasikan teknik-teknik ini menggunakan driver database yang sesuai dan library tambahan seperti connection pool dan cache. Dengan memahami dan mengimplementasikan teknik-teknik ini, kita dapat mengembangkan aplikasi database yang efisien dan andal. 