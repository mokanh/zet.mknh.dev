# NoSQL Database

NoSQL (Not Only SQL) adalah istilah yang digunakan untuk mendeskripsikan database yang tidak menggunakan model relasional tradisional. Database NoSQL dirancang untuk menangani data dalam jumlah besar dan mendukung skema yang fleksibel. Go memiliki dukungan yang baik untuk berbagai jenis database NoSQL seperti MongoDB, Redis, dan Cassandra.

## MongoDB

MongoDB adalah database NoSQL berbasis dokumen yang menyimpan data dalam format BSON (Binary JSON). MongoDB mendukung skema yang fleksibel dan query yang kuat.

### Karakteristik MongoDB
- **Document-based**: Data disimpan dalam format dokumen (BSON)
- **Schema-less**: Tidak memerlukan skema yang tetap
- **High Performance**: Performa tinggi untuk operasi read dan write
- **Scalability**: Mudah untuk di-scale secara horizontal
- **Rich Query Language**: Mendukung query yang kompleks

### Implementasi MongoDB
```go
// Implementasi dasar MongoDB
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

// User adalah struct untuk menyimpan data user
type User struct {
    ID        primitive.ObjectID `bson:"_id,omitempty"`
    Username  string             `bson:"username"`
    Email     string             `bson:"email"`
    CreatedAt time.Time          `bson:"created_at"`
}

// Post adalah struct untuk menyimpan data post
type Post struct {
    ID        primitive.ObjectID `bson:"_id,omitempty"`
    Title     string             `bson:"title"`
    Content   string             `bson:"content"`
    UserID    primitive.ObjectID `bson:"user_id"`
    Tags      []string           `bson:"tags"`
    CreatedAt time.Time          `bson:"created_at"`
}

func main() {
    // Membuat context dengan timeout
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    // Membuka koneksi ke MongoDB
    client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }
    defer func() {
        if err := client.Disconnect(ctx); err != nil {
            log.Fatal(err)
        }
    }()
    
    // Memeriksa koneksi
    err = client.Ping(ctx, nil)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Connected to MongoDB!")
    
    // Memilih database
    db := client.Database("testdb")
    
    // Memilih collection
    usersCollection := db.Collection("users")
    postsCollection := db.Collection("posts")
    
    // Membuat user baru
    user := User{
        Username:  "john",
        Email:     "john@example.com",
        CreatedAt: time.Now(),
    }
    
    result, err := usersCollection.InsertOne(ctx, user)
    if err != nil {
        log.Fatal(err)
    }
    
    userID := result.InsertedID.(primitive.ObjectID)
    fmt.Printf("Created user with ID: %s\n", userID.Hex())
    
    // Membuat post baru
    post := Post{
        Title:     "Hello World",
        Content:   "This is my first post",
        UserID:    userID,
        Tags:      []string{"golang", "mongodb"},
        CreatedAt: time.Now(),
    }
    
    result, err = postsCollection.InsertOne(ctx, post)
    if err != nil {
        log.Fatal(err)
    }
    
    postID := result.InsertedID.(primitive.ObjectID)
    fmt.Printf("Created post with ID: %s\n", postID.Hex())
    
    // Mengambil user dengan ID tertentu
    var retrievedUser User
    err = usersCollection.FindOne(ctx, bson.M{"_id": userID}).Decode(&retrievedUser)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Retrieved user: ID=%s, Username=%s, Email=%s\n", retrievedUser.ID.Hex(), retrievedUser.Username, retrievedUser.Email)
    
    // Mengambil semua users
    cursor, err := usersCollection.Find(ctx, bson.M{})
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(ctx)
    
    var users []User
    if err = cursor.All(ctx, &users); err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users\n", len(users))
    for _, user := range users {
        fmt.Printf("User: ID=%s, Username=%s, Email=%s\n", user.ID.Hex(), user.Username, user.Email)
    }
    
    // Mengambil posts untuk user tertentu
    cursor, err = postsCollection.Find(ctx, bson.M{"user_id": userID})
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(ctx)
    
    var posts []Post
    if err = cursor.All(ctx, &posts); err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d posts for user ID %s\n", len(posts), userID.Hex())
    for _, post := range posts {
        fmt.Printf("Post: ID=%s, Title=%s, Content=%s\n", post.ID.Hex(), post.Title, post.Content)
    }
    
    // Mengambil user dengan posts menggunakan aggregation
    pipeline := []bson.M{
        {
            "$match": bson.M{
                "_id": userID,
            },
        },
        {
            "$lookup": bson.M{
                "from":         "posts",
                "localField":   "_id",
                "foreignField": "user_id",
                "as":           "posts",
            },
        },
    }
    
    cursor, err = usersCollection.Aggregate(ctx, pipeline)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(ctx)
    
    type UserWithPosts struct {
        User  User   `bson:"_id"`
        Posts []Post `bson:"posts"`
    }
    
    var userWithPosts []UserWithPosts
    if err = cursor.All(ctx, &userWithPosts); err != nil {
        log.Fatal(err)
    }
    
    if len(userWithPosts) > 0 {
        fmt.Printf("User: ID=%s, Username=%s, Email=%s\n", userWithPosts[0].User.ID.Hex(), userWithPosts[0].User.Username, userWithPosts[0].User.Email)
        fmt.Printf("Posts count: %d\n", len(userWithPosts[0].Posts))
        for _, post := range userWithPosts[0].Posts {
            fmt.Printf("Post: ID=%s, Title=%s, Content=%s\n", post.ID.Hex(), post.Title, post.Content)
        }
    }
    
    // Memperbarui user
    filter := bson.M{"_id": userID}
    update := bson.M{
        "$set": bson.M{
            "username": "jane",
            "email":    "jane@example.com",
        },
    }
    
    result, err = usersCollection.UpdateOne(ctx, filter, update)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Updated user: ID=%s, Modified count: %d\n", userID.Hex(), result.ModifiedCount)
    
    // Menghapus user
    result, err = usersCollection.DeleteOne(ctx, bson.M{"_id": userID})
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Deleted user: ID=%s, Deleted count: %d\n", userID.Hex(), result.DeletedCount)
    
    // Transaksi MongoDB
    session, err := client.StartSession()
    if err != nil {
        log.Fatal(err)
    }
    defer session.EndSession(ctx)
    
    _, err = session.WithTransaction(ctx, func(sessCtx mongo.SessionContext) (interface{}, error) {
        // Membuat user baru dalam transaksi
        newUser := User{
            Username:  "alice",
            Email:     "alice@example.com",
            CreatedAt: time.Now(),
        }
        
        result, err := usersCollection.InsertOne(sessCtx, newUser)
        if err != nil {
            return nil, err
        }
        
        newUserID := result.InsertedID.(primitive.ObjectID)
        
        // Membuat post baru dalam transaksi
        newPost := Post{
            Title:     "Transaction Test",
            Content:   "This post was created in a transaction",
            UserID:    newUserID,
            Tags:      []string{"transaction", "mongodb"},
            CreatedAt: time.Now(),
        }
        
        _, err = postsCollection.InsertOne(sessCtx, newPost)
        if err != nil {
            return nil, err
        }
        
        return nil, nil
    })
    
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Transaction completed successfully")
}
```

## Redis

Redis adalah database NoSQL berbasis in-memory yang dapat digunakan sebagai database, cache, message broker, dan queue. Redis mendukung berbagai struktur data seperti string, hash, list, set, dan sorted set.

### Karakteristik Redis
- **In-memory**: Data disimpan di memori untuk akses cepat
- **Persistence**: Dukungan untuk menyimpan data ke disk
- **Data Structures**: Mendukung berbagai struktur data
- **Atomic Operations**: Operasi atomik untuk konsistensi data
- **Pub/Sub**: Dukungan untuk publish/subscribe messaging

### Implementasi Redis
```go
// Implementasi dasar Redis
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "github.com/go-redis/redis/v8"
)

func main() {
    // Membuat client Redis
    rdb := redis.NewClient(&redis.Options{
        Addr:     "localhost:6379",
        Password: "", // no password set
        DB:       0,  // use default DB
    })
    defer rdb.Close()
    
    // Membuat context
    ctx := context.Background()
    
    // Memeriksa koneksi
    _, err := rdb.Ping(ctx).Result()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Connected to Redis!")
    
    // String operations
    // Set string
    err = rdb.Set(ctx, "key", "value", 0).Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Get string
    val, err := rdb.Get(ctx, "key").Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("key:", val)
    
    // Set string with expiration
    err = rdb.Set(ctx, "key-with-ttl", "value", 10*time.Second).Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Check if key exists
    exists, err := rdb.Exists(ctx, "key").Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("key exists:", exists)
    
    // Delete key
    err = rdb.Del(ctx, "key").Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Hash operations
    // Set hash
    err = rdb.HSet(ctx, "user:1", map[string]interface{}{
        "username": "john",
        "email":    "john@example.com",
        "age":      30,
    }).Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Get hash field
    val, err = rdb.HGet(ctx, "user:1", "username").Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("user:1 username:", val)
    
    // Get all hash fields
    vals, err := rdb.HGetAll(ctx, "user:1").Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("user:1 all fields:", vals)
    
    // List operations
    // Push to list
    err = rdb.RPush(ctx, "list", "item1", "item2", "item3").Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Get list range
    vals, err = rdb.LRange(ctx, "list", 0, -1).Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("list:", vals)
    
    // Set operations
    // Add to set
    err = rdb.SAdd(ctx, "set", "member1", "member2", "member3").Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Get set members
    vals, err = rdb.SMembers(ctx, "set").Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("set:", vals)
    
    // Check if member exists in set
    exists, err = rdb.SIsMember(ctx, "set", "member1").Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("member1 exists in set:", exists)
    
    // Sorted set operations
    // Add to sorted set
    err = rdb.ZAdd(ctx, "sorted-set", &redis.Z{
        Score:  1,
        Member: "member1",
    }, &redis.Z{
        Score:  2,
        Member: "member2",
    }, &redis.Z{
        Score:  3,
        Member: "member3",
    }).Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Get sorted set range
    vals, err = rdb.ZRange(ctx, "sorted-set", 0, -1).Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("sorted-set:", vals)
    
    // Get sorted set range with scores
    zvals, err := rdb.ZRangeWithScores(ctx, "sorted-set", 0, -1).Result()
    if err != nil {
        log.Fatal(err)
    }
    for _, z := range zvals {
        fmt.Printf("member: %s, score: %f\n", z.Member, z.Score)
    }
    
    // Transaction
    tx := rdb.TxPipeline()
    
    // Set string in transaction
    tx.Set(ctx, "tx-key", "tx-value", 0)
    
    // Set hash in transaction
    tx.HSet(ctx, "tx-user:1", map[string]interface{}{
        "username": "alice",
        "email":    "alice@example.com",
    })
    
    // Execute transaction
    _, err = tx.Exec(ctx)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Transaction completed successfully")
    
    // Pub/Sub
    // Create a new pubsub client
    pubsub := rdb.Subscribe(ctx, "channel")
    defer pubsub.Close()
    
    // Create a goroutine to publish messages
    go func() {
        time.Sleep(time.Second)
        err := rdb.Publish(ctx, "channel", "hello").Err()
        if err != nil {
            log.Fatal(err)
        }
    }()
    
    // Listen for messages
    ch := pubsub.Channel()
    msg := <-ch
    fmt.Println("Received message:", msg.Payload)
}
```

## Cassandra

Cassandra adalah database NoSQL berbasis kolom yang dirancang untuk menangani data dalam jumlah besar di banyak server. Cassandra mendukung skema yang fleksibel dan query yang kuat.

### Karakteristik Cassandra
- **Column-based**: Data disimpan dalam format kolom
- **Distributed**: Data didistribusikan di banyak node
- **High Availability**: Toleransi terhadap kegagalan node
- **Linear Scalability**: Skalabilitas linear dengan penambahan node
- **CQL**: Query language yang mirip dengan SQL

### Implementasi Cassandra
```go
// Implementasi dasar Cassandra
package main

import (
    "fmt"
    "log"
    "time"
    "github.com/gocql/gocql"
)

// User adalah struct untuk menyimpan data user
type User struct {
    ID        gocql.UUID
    Username  string
    Email     string
    CreatedAt time.Time
}

// Post adalah struct untuk menyimpan data post
type Post struct {
    ID        gocql.UUID
    Title     string
    Content   string
    UserID    gocql.UUID
    Tags      []string
    CreatedAt time.Time
}

func main() {
    // Membuat cluster
    cluster := gocql.NewCluster("127.0.0.1")
    cluster.Keyspace = "testdb"
    cluster.Consistency = gocql.Quorum
    
    // Membuat session
    session, err := cluster.CreateSession()
    if err != nil {
        log.Fatal(err)
    }
    defer session.Close()
    
    // Membuat keyspace
    err = session.Query(`CREATE KEYSPACE IF NOT EXISTS testdb WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}`).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat table users
    err = session.Query(`
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    username text,
    email text,
    created_at timestamp
)`).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat table posts
    err = session.Query(`
CREATE TABLE IF NOT EXISTS posts (
    id uuid PRIMARY KEY,
    title text,
    content text,
    user_id uuid,
    tags list<text>,
    created_at timestamp
)`).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat index pada user_id di table posts
    err = session.Query(`CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts (user_id)`).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat user baru
    userID := gocql.TimeUUID()
    user := User{
        ID:        userID,
        Username:  "john",
        Email:     "john@example.com",
        CreatedAt: time.Now(),
    }
    
    err = session.Query(`
INSERT INTO users (id, username, email, created_at)
VALUES (?, ?, ?, ?)`,
        user.ID, user.Username, user.Email, user.CreatedAt).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created user with ID: %s\n", user.ID)
    
    // Membuat post baru
    postID := gocql.TimeUUID()
    post := Post{
        ID:        postID,
        Title:     "Hello World",
        Content:   "This is my first post",
        UserID:    userID,
        Tags:      []string{"golang", "cassandra"},
        CreatedAt: time.Now(),
    }
    
    err = session.Query(`
INSERT INTO posts (id, title, content, user_id, tags, created_at)
VALUES (?, ?, ?, ?, ?, ?)`,
        post.ID, post.Title, post.Content, post.UserID, post.Tags, post.CreatedAt).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Created post with ID: %s\n", post.ID)
    
    // Mengambil user dengan ID tertentu
    var retrievedUser User
    err = session.Query(`
SELECT id, username, email, created_at
FROM users
WHERE id = ?`,
        userID).Scan(&retrievedUser.ID, &retrievedUser.Username, &retrievedUser.Email, &retrievedUser.CreatedAt)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Retrieved user: ID=%s, Username=%s, Email=%s\n", retrievedUser.ID, retrievedUser.Username, retrievedUser.Email)
    
    // Mengambil semua users
    iter := session.Query(`SELECT id, username, email, created_at FROM users`).Iter()
    
    var users []User
    var user User
    for iter.Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt) {
        users = append(users, user)
    }
    
    if err := iter.Close(); err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d users\n", len(users))
    for _, user := range users {
        fmt.Printf("User: ID=%s, Username=%s, Email=%s\n", user.ID, user.Username, user.Email)
    }
    
    // Mengambil posts untuk user tertentu
    iter = session.Query(`
SELECT id, title, content, user_id, tags, created_at
FROM posts
WHERE user_id = ?`,
        userID).Iter()
    
    var posts []Post
    var p Post
    for iter.Scan(&p.ID, &p.Title, &p.Content, &p.UserID, &p.Tags, &p.CreatedAt) {
        posts = append(posts, p)
    }
    
    if err := iter.Close(); err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d posts for user ID %s\n", len(posts), userID)
    for _, post := range posts {
        fmt.Printf("Post: ID=%s, Title=%s, Content=%s\n", post.ID, post.Title, post.Content)
    }
    
    // Memperbarui user
    err = session.Query(`
UPDATE users
SET username = ?, email = ?
WHERE id = ?`,
        "jane", "jane@example.com", userID).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Updated user: ID=%s\n", userID)
    
    // Menghapus user
    err = session.Query(`DELETE FROM users WHERE id = ?`, userID).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Deleted user: ID=%s\n", userID)
    
    // Batch operation
    batch := session.NewBatch(gocql.LoggedBatch)
    
    // Membuat user baru dalam batch
    newUserID := gocql.TimeUUID()
    batch.Query(`
INSERT INTO users (id, username, email, created_at)
VALUES (?, ?, ?, ?)`,
        newUserID, "alice", "alice@example.com", time.Now())
    
    // Membuat post baru dalam batch
    newPostID := gocql.TimeUUID()
    batch.Query(`
INSERT INTO posts (id, title, content, user_id, tags, created_at)
VALUES (?, ?, ?, ?, ?, ?)`,
        newPostID, "Batch Test", "This post was created in a batch", newUserID, []string{"batch", "cassandra"}, time.Now())
    
    // Execute batch
    err = session.ExecuteBatch(batch)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Batch operation completed successfully")
}
```

## Database Drivers

Database drivers adalah library yang memungkinkan aplikasi Go untuk berinteraksi dengan database NoSQL. Go memiliki dukungan yang baik untuk berbagai database NoSQL melalui driver resmi atau komunitas.

### Karakteristik Database Drivers
- **Official Support**: Dukungan resmi dari pengembang database
- **Community Support**: Dukungan dari komunitas
- **Connection Pooling**: Dukungan untuk connection pooling
- **Transaction Support**: Dukungan untuk transaksi database
- **Query Building**: Pembuatan query secara dinamis

### Implementasi Database Drivers
```go
// Implementasi dasar database drivers
package main

import (
    "fmt"
    "log"
    "time"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "github.com/go-redis/redis/v8"
    "github.com/gocql/gocql"
)

// MongoDBDriver adalah wrapper untuk MongoDB driver
type MongoDBDriver struct {
    client *mongo.Client
}

// NewMongoDBDriver membuat instance baru dari MongoDBDriver
func NewMongoDBDriver(uri string) (*MongoDBDriver, error) {
    client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
    if err != nil {
        return nil, err
    }
    
    return &MongoDBDriver{
        client: client,
    }, nil
}

// Close menutup koneksi MongoDB
func (d *MongoDBDriver) Close() error {
    return d.client.Disconnect(context.Background())
}

// RedisDriver adalah wrapper untuk Redis driver
type RedisDriver struct {
    client *redis.Client
}

// NewRedisDriver membuat instance baru dari RedisDriver
func NewRedisDriver(addr string, password string, db int) *RedisDriver {
    client := redis.NewClient(&redis.Options{
        Addr:     addr,
        Password: password,
        DB:       db,
    })
    
    return &RedisDriver{
        client: client,
    }
}

// Close menutup koneksi Redis
func (d *RedisDriver) Close() error {
    return d.client.Close()
}

// CassandraDriver adalah wrapper untuk Cassandra driver
type CassandraDriver struct {
    session *gocql.Session
}

// NewCassandraDriver membuat instance baru dari CassandraDriver
func NewCassandraDriver(hosts []string, keyspace string) (*CassandraDriver, error) {
    cluster := gocql.NewCluster(hosts...)
    cluster.Keyspace = keyspace
    cluster.Consistency = gocql.Quorum
    
    session, err := cluster.CreateSession()
    if err != nil {
        return nil, err
    }
    
    return &CassandraDriver{
        session: session,
    }, nil
}

// Close menutup koneksi Cassandra
func (d *CassandraDriver) Close() {
    d.session.Close()
}

func main() {
    // MongoDB
    mongoDriver, err := NewMongoDBDriver("mongodb://localhost:27017")
    if err != nil {
        log.Fatal(err)
    }
    defer mongoDriver.Close()
    
    fmt.Println("Connected to MongoDB!")
    
    // Redis
    redisDriver := NewRedisDriver("localhost:6379", "", 0)
    defer redisDriver.Close()
    
    ctx := context.Background()
    _, err = redisDriver.client.Ping(ctx).Result()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("Connected to Redis!")
    
    // Cassandra
    cassandraDriver, err := NewCassandraDriver([]string{"127.0.0.1"}, "testdb")
    if err != nil {
        log.Fatal(err)
    }
    defer cassandraDriver.Close()
    
    fmt.Println("Connected to Cassandra!")
}
```

## Query Patterns

Query patterns adalah pola yang digunakan untuk mengakses dan memanipulasi data dalam database NoSQL. Setiap jenis database NoSQL memiliki pola query yang berbeda.

### Karakteristik Query Patterns
- **Document-based**: Query untuk database berbasis dokumen
- **Key-value**: Query untuk database berbasis key-value
- **Column-based**: Query untuk database berbasis kolom
- **Graph-based**: Query untuk database berbasis graph
- **Time-series**: Query untuk database berbasis time-series

### Implementasi Query Patterns
```go
// Implementasi dasar query patterns
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "github.com/go-redis/redis/v8"
    "github.com/gocql/gocql"
)

// Document-based query pattern (MongoDB)
func documentBasedQueryPattern() {
    // Membuat client MongoDB
    client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
    if err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(context.Background())
    
    // Memilih database dan collection
    db := client.Database("testdb")
    collection := db.Collection("users")
    
    // Find query
    filter := bson.M{"age": bson.M{"$gt": 18}}
    opts := options.Find().SetSort(bson.D{{"name", 1}})
    
    cursor, err := collection.Find(context.Background(), filter, opts)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    // Process results
    var results []bson.M
    if err = cursor.All(context.Background(), &results); err != nil {
        log.Fatal(err)
    }
    
    for _, result := range results {
        fmt.Println(result)
    }
    
    // Aggregation query
    pipeline := []bson.M{
        {
            "$match": bson.M{
                "age": bson.M{"$gt": 18},
            },
        },
        {
            "$group": bson.M{
                "_id": "$city",
                "count": bson.M{"$sum": 1},
            },
        },
        {
            "$sort": bson.M{
                "count": -1,
            },
        },
    }
    
    cursor, err = collection.Aggregate(context.Background(), pipeline)
    if err != nil {
        log.Fatal(err)
    }
    defer cursor.Close(context.Background())
    
    // Process results
    var aggResults []bson.M
    if err = cursor.All(context.Background(), &aggResults); err != nil {
        log.Fatal(err)
    }
    
    for _, result := range aggResults {
        fmt.Println(result)
    }
}

// Key-value query pattern (Redis)
func keyValueQueryPattern() {
    // Membuat client Redis
    rdb := redis.NewClient(&redis.Options{
        Addr:     "localhost:6379",
        Password: "",
        DB:       0,
    })
    defer rdb.Close()
    
    ctx := context.Background()
    
    // Set key-value
    err := rdb.Set(ctx, "key", "value", 0).Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Get value
    val, err := rdb.Get(ctx, "key").Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("key:", val)
    
    // Set multiple keys
    err = rdb.MSet(ctx, "key1", "value1", "key2", "value2", "key3", "value3").Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Get multiple values
    vals, err := rdb.MGet(ctx, "key1", "key2", "key3").Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("keys:", vals)
    
    // Delete key
    err = rdb.Del(ctx, "key").Err()
    if err != nil {
        log.Fatal(err)
    }
    
    // Check if key exists
    exists, err := rdb.Exists(ctx, "key").Result()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("key exists:", exists)
}

// Column-based query pattern (Cassandra)
func columnBasedQueryPattern() {
    // Membuat cluster Cassandra
    cluster := gocql.NewCluster("127.0.0.1")
    cluster.Keyspace = "testdb"
    cluster.Consistency = gocql.Quorum
    
    // Membuat session
    session, err := cluster.CreateSession()
    if err != nil {
        log.Fatal(err)
    }
    defer session.Close()
    
    // Select query
    iter := session.Query(`
SELECT id, username, email, created_at
FROM users
WHERE age > ?`,
        18).Iter()
    
    var id gocql.UUID
    var username, email string
    var createdAt time.Time
    
    for iter.Scan(&id, &username, &email, &createdAt) {
        fmt.Printf("User: ID=%s, Username=%s, Email=%s, Created At=%s\n", id, username, email, createdAt)
    }
    
    if err := iter.Close(); err != nil {
        log.Fatal(err)
    }
    
    // Insert query
    userID := gocql.TimeUUID()
    err = session.Query(`
INSERT INTO users (id, username, email, created_at)
VALUES (?, ?, ?, ?)`,
        userID, "john", "john@example.com", time.Now()).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    // Update query
    err = session.Query(`
UPDATE users
SET username = ?, email = ?
WHERE id = ?`,
        "jane", "jane@example.com", userID).Exec()
    if err != nil {
        log.Fatal(err)
    }
    
    // Delete query
    err = session.Query(`DELETE FROM users WHERE id = ?`, userID).Exec()
    if err != nil {
        log.Fatal(err)
    }
}

func main() {
    // Document-based query pattern
    documentBasedQueryPattern()
    
    // Key-value query pattern
    keyValueQueryPattern()
    
    // Column-based query pattern
    columnBasedQueryPattern()
}
```

## Kesimpulan

NoSQL Database adalah alternatif untuk database relasional tradisional yang dirancang untuk menangani data dalam jumlah besar dan mendukung skema yang fleksibel. Go memiliki dukungan yang baik untuk berbagai jenis database NoSQL seperti MongoDB, Redis, dan Cassandra.

Dengan memahami dan mengimplementasikan konsep-konsep seperti database drivers, query patterns, dan fitur-fitur NoSQL, kita dapat mengembangkan aplikasi yang berinteraksi dengan database NoSQL secara efisien dan andal.

Pilihan database NoSQL yang tepat tergantung pada kebutuhan aplikasi. MongoDB cocok untuk aplikasi yang memerlukan skema yang fleksibel, Redis cocok untuk aplikasi yang memerlukan akses data yang cepat, dan Cassandra cocok untuk aplikasi yang memerlukan skalabilitas yang tinggi. 