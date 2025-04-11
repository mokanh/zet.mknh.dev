# Sync Package

Sync package adalah bagian dari standard library Go yang menyediakan primitif sinkronisasi dasar seperti mutex, wait groups, dan once. Package ini sangat penting untuk mengimplementasikan sinkronisasi dalam program konkuren.

## WaitGroup

### Karakteristik WaitGroup
- **Counter**: Menghitung jumlah goroutines yang sedang berjalan
- **Add/Done**: Menambah/mengurangi counter
- **Wait**: Memblokir sampai counter mencapai nol
- **Thread-Safe**: Aman digunakan oleh multiple goroutines

### Contoh Penggunaan
```go
// WaitGroup dasar
func main() {
    var wg sync.WaitGroup
    
    // Menjalankan 3 goroutines
    for i := 0; i < 3; i++ {
        wg.Add(1) // Menambah counter
        go func(id int) {
            defer wg.Done() // Mengurangi counter saat selesai
            fmt.Printf("Goroutine %d: Selesai\n", id)
        }(i)
    }
    
    // Menunggu semua goroutines selesai
    wg.Wait()
    fmt.Println("Semua goroutines selesai")
}

// WaitGroup dengan error handling
func processItems(items []int) error {
    var wg sync.WaitGroup
    errCh := make(chan error, len(items))
    
    for _, item := range items {
        wg.Add(1)
        go func(i int) {
            defer wg.Done()
            
            // Simulasi pemrosesan yang mungkin error
            if i < 0 {
                errCh <- fmt.Errorf("item negatif tidak diizinkan: %d", i)
                return
            }
            
            fmt.Printf("Memproses item %d\n", i)
            time.Sleep(50 * time.Millisecond)
        }(item)
    }
    
    // Goroutine untuk menutup channel error setelah semua goroutines selesai
    go func() {
        wg.Wait()
        close(errCh)
    }()
    
    // Mengecek error
    for err := range errCh {
        if err != nil {
            return err
        }
    }
    
    return nil
}

func main() {
    items := []int{1, -2, 3, -4, 5}
    err := processItems(items)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("Semua items berhasil diproses")
}
```

## Mutex

### Karakteristik Mutex
- **Lock/Unlock**: Mengunci/membuka kunci resource
- **Reentrant**: Mutex tidak dapat di-lock dua kali oleh goroutine yang sama
- **Deadlock Prevention**: Panic jika unlock tanpa lock
- **Thread-Safe**: Aman digunakan oleh multiple goroutines

### Contoh Penggunaan
```go
// Mutex dasar
func main() {
    var counter int
    var mu sync.Mutex
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            mu.Lock() // Mengunci sebelum mengakses counter
            counter++
            mu.Unlock() // Membuka kunci setelah selesai
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    fmt.Println("Counter:", counter)
}

// Mutex dengan defer
func main() {
    var counter int
    var mu sync.Mutex
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            mu.Lock()
            defer mu.Unlock() // Membuka kunci saat fungsi selesai
            
            counter++
            fmt.Println("Counter:", counter)
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    fmt.Println("Final counter:", counter)
}

// Mutex dengan struct
type SafeCounter struct {
    mu    sync.Mutex
    count map[string]int
}

func NewSafeCounter() *SafeCounter {
    return &SafeCounter{
        count: make(map[string]int),
    }
}

func (c *SafeCounter) Increment(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count[key]++
}

func (c *SafeCounter) Value(key string) int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.count[key]
}

func main() {
    counter := NewSafeCounter()
    
    // Menjalankan goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func(id int) {
            key := fmt.Sprintf("key%d", id%3)
            counter.Increment(key)
            fmt.Printf("Incremented %s: %d\n", key, counter.Value(key))
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Menampilkan hasil akhir
    for i := 0; i < 3; i++ {
        key := fmt.Sprintf("key%d", i)
        fmt.Printf("Final value for %s: %d\n", key, counter.Value(key))
    }
}
```

## RWMutex

### Karakteristik RWMutex
- **Lock/Unlock**: Mengunci/membuka kunci resource untuk write
- **RLock/RUnlock**: Mengunci/membuka kunci resource untuk read
- **Multiple Readers**: Memungkinkan multiple goroutines membaca secara bersamaan
- **Writer Priority**: Writer memiliki prioritas lebih tinggi dari reader

### Contoh Penggunaan
```go
// RWMutex dasar
func main() {
    var data map[string]string
    var mu sync.RWMutex
    
    // Inisialisasi data
    data = make(map[string]string)
    data["key1"] = "value1"
    data["key2"] = "value2"
    
    // Menjalankan goroutines yang membaca data
    for i := 0; i < 5; i++ {
        go func(id int) {
            for j := 0; j < 3; j++ {
                mu.RLock() // Read lock
                fmt.Printf("Reader %d: key1=%s, key2=%s\n", id, data["key1"], data["key2"])
                mu.RUnlock()
                time.Sleep(10 * time.Millisecond)
            }
        }(i)
    }
    
    // Menjalankan goroutine yang menulis data
    go func() {
        time.Sleep(50 * time.Millisecond)
        mu.Lock() // Write lock
        data["key1"] = "new value1"
        data["key2"] = "new value2"
        fmt.Println("Data updated")
        mu.Unlock()
    }()
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(200 * time.Millisecond)
}

// RWMutex dengan struct
type SafeCache struct {
    mu    sync.RWMutex
    cache map[string]interface{}
}

func NewSafeCache() *SafeCache {
    return &SafeCache{
        cache: make(map[string]interface{}),
    }
}

func (c *SafeCache) Set(key string, value interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.cache[key] = value
}

func (c *SafeCache) Get(key string) (interface{}, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    value, ok := c.cache[key]
    return value, ok
}

func (c *SafeCache) Delete(key string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    delete(c.cache, key)
}

func main() {
    cache := NewSafeCache()
    
    // Menambahkan data ke cache
    cache.Set("key1", "value1")
    cache.Set("key2", 42)
    
    // Menjalankan goroutines yang membaca cache
    for i := 0; i < 5; i++ {
        go func(id int) {
            for j := 0; j < 3; j++ {
                if value, ok := cache.Get("key1"); ok {
                    fmt.Printf("Reader %d: key1=%v\n", id, value)
                }
                time.Sleep(10 * time.Millisecond)
            }
        }(i)
    }
    
    // Menjalankan goroutine yang mengubah cache
    go func() {
        time.Sleep(50 * time.Millisecond)
        cache.Set("key1", "new value1")
        fmt.Println("Cache updated")
    }()
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(200 * time.Millisecond)
}
```

## Once

### Karakteristik Once
- **Single Execution**: Memastikan fungsi dieksekusi hanya sekali
- **Thread-Safe**: Aman digunakan oleh multiple goroutines
- **Initialization**: Efektif untuk inisialisasi yang mahal

### Contoh Penggunaan
```go
// Once dasar
func main() {
    var once sync.Once
    
    // Menjalankan 5 goroutines yang mencoba mengeksekusi fungsi
    for i := 0; i < 5; i++ {
        go func(id int) {
            once.Do(func() {
                fmt.Printf("Fungsi dieksekusi oleh goroutine %d\n", id)
            })
            fmt.Printf("Goroutine %d selesai\n", id)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
}

// Once untuk inisialisasi
type Database struct {
    connected bool
    data     map[string]string
}

func NewDatabase() *Database {
    return &Database{
        data: make(map[string]string),
    }
}

func (db *Database) Connect() {
    fmt.Println("Menghubungkan ke database...")
    time.Sleep(100 * time.Millisecond)
    db.connected = true
    fmt.Println("Terhubung ke database")
}

func (db *Database) Query(key string) (string, error) {
    if !db.connected {
        return "", fmt.Errorf("database belum terhubung")
    }
    value, ok := db.data[key]
    if !ok {
        return "", fmt.Errorf("key tidak ditemukan: %s", key)
    }
    return value, nil
}

func main() {
    db := NewDatabase()
    var once sync.Once
    
    // Menjalankan 5 goroutines yang mencoba mengakses database
    for i := 0; i < 5; i++ {
        go func(id int) {
            // Memastikan database terhubung
            once.Do(func() {
                db.Connect()
            })
            
            // Mencoba query
            value, err := db.Query("key1")
            if err != nil {
                fmt.Printf("Goroutine %d: Error: %v\n", id, err)
                return
            }
            fmt.Printf("Goroutine %d: %s\n", id, value)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(200 * time.Millisecond)
}
```

## Pool

### Karakteristik Pool
- **Object Reuse**: Menyimpan dan menggunakan ulang objek untuk mengurangi alokasi memori
- **Thread-Safe**: Aman digunakan oleh multiple goroutines
- **Automatic Cleanup**: Objek yang tidak digunakan dapat dibersihkan oleh garbage collector

### Contoh Penggunaan
```go
// Pool dasar
func main() {
    // Membuat pool untuk string
    var pool sync.Pool
    
    // Menambahkan objek ke pool
    pool.Put("objek1")
    pool.Put("objek2")
    
    // Mengambil objek dari pool
    obj1 := pool.Get()
    obj2 := pool.Get()
    obj3 := pool.Get() // Akan mengembalikan nil jika pool kosong
    
    fmt.Println(obj1) // "objek1"
    fmt.Println(obj2) // "objek2"
    fmt.Println(obj3) // nil
    
    // Mengembalikan objek ke pool
    pool.Put(obj1)
    pool.Put(obj2)
    
    // Mengambil objek lagi
    obj4 := pool.Get()
    fmt.Println(obj4) // "objek1" atau "objek2" (tidak deterministik)
}

// Pool untuk buffer
func main() {
    // Membuat pool untuk buffer
    var bufferPool sync.Pool
    
    // Menambahkan buffer ke pool
    bufferPool.Put(bytes.NewBuffer(make([]byte, 0, 1024)))
    bufferPool.Put(bytes.NewBuffer(make([]byte, 0, 1024)))
    
    // Mengambil buffer dari pool
    buf1 := bufferPool.Get().(*bytes.Buffer)
    buf2 := bufferPool.Get().(*bytes.Buffer)
    
    // Menggunakan buffer
    buf1.WriteString("Hello")
    buf2.WriteString("World")
    
    fmt.Println(buf1.String()) // "Hello"
    fmt.Println(buf2.String()) // "World"
    
    // Mengembalikan buffer ke pool
    buf1.Reset() // Reset buffer sebelum mengembalikan ke pool
    buf2.Reset()
    bufferPool.Put(buf1)
    bufferPool.Put(buf2)
    
    // Mengambil buffer lagi
    buf3 := bufferPool.Get().(*bytes.Buffer)
    fmt.Println(buf3.String()) // "" (kosong karena direset)
}

// Pool dengan New function
func main() {
    // Membuat pool dengan New function
    pool := sync.Pool{
        New: func() interface{} {
            return make([]byte, 0, 1024)
        },
    }
    
    // Mengambil objek dari pool (akan menggunakan New function jika pool kosong)
    obj1 := pool.Get().([]byte)
    obj2 := pool.Get().([]byte)
    
    // Menggunakan objek
    obj1 = append(obj1, "Hello"...)
    obj2 = append(obj2, "World"...)
    
    fmt.Println(string(obj1)) // "Hello"
    fmt.Println(string(obj2)) // "World"
    
    // Mengembalikan objek ke pool
    pool.Put(obj1)
    pool.Put(obj2)
    
    // Mengambil objek lagi
    obj3 := pool.Get().([]byte)
    fmt.Println(string(obj3)) // "Hello" atau "World" (tidak deterministik)
}
```

## Kombinasi Sync Primitives

### Kombinasi WaitGroup dan Mutex
```go
// Kombinasi WaitGroup dan Mutex
func main() {
    var counter int
    var mu sync.Mutex
    var wg sync.WaitGroup
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            
            mu.Lock()
            counter++
            fmt.Printf("Goroutine %d: Counter = %d\n", id, counter)
            mu.Unlock()
        }(i)
    }
    
    // Menunggu semua goroutines selesai
    wg.Wait()
    fmt.Println("Final counter:", counter)
}
```

### Kombinasi WaitGroup dan RWMutex
```go
// Kombinasi WaitGroup dan RWMutex
func main() {
    var data map[string]int
    var mu sync.RWMutex
    var wg sync.WaitGroup
    
    // Inisialisasi data
    data = make(map[string]int)
    data["counter"] = 0
    
    // Menjalankan goroutines yang membaca data
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            
            for j := 0; j < 3; j++ {
                mu.RLock()
                value := data["counter"]
                fmt.Printf("Reader %d: Counter = %d\n", id, value)
                mu.RUnlock()
                time.Sleep(10 * time.Millisecond)
            }
        }(i)
    }
    
    // Menjalankan goroutines yang menulis data
    for i := 0; i < 3; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            
            for j := 0; j < 2; j++ {
                mu.Lock()
                data["counter"]++
                fmt.Printf("Writer %d: Counter = %d\n", id, data["counter"])
                mu.Unlock()
                time.Sleep(20 * time.Millisecond)
            }
        }(i)
    }
    
    // Menunggu semua goroutines selesai
    wg.Wait()
    fmt.Println("Final counter:", data["counter"])
}
```

### Kombinasi WaitGroup, Mutex, dan Once
```go
// Kombinasi WaitGroup, Mutex, dan Once
func main() {
    var counter int
    var mu sync.Mutex
    var wg sync.WaitGroup
    var once sync.Once
    
    // Menjalankan 10 goroutines
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            
            // Memastikan inisialisasi dilakukan hanya sekali
            once.Do(func() {
                fmt.Printf("Inisialisasi dilakukan oleh goroutine %d\n", id)
                counter = 100
            })
            
            // Mengakses counter
            mu.Lock()
            counter++
            fmt.Printf("Goroutine %d: Counter = %d\n", id, counter)
            mu.Unlock()
        }(i)
    }
    
    // Menunggu semua goroutines selesai
    wg.Wait()
    fmt.Println("Final counter:", counter)
}
```

## Kesimpulan

Sync package adalah bagian penting dari Go standard library yang menyediakan primitif sinkronisasi dasar. Dengan memahami WaitGroup, Mutex, RWMutex, Once, dan Pool, kita dapat mengembangkan aplikasi konkuren yang aman dan efisien. Kombinasi primitif-primitif ini memungkinkan implementasi pola sinkronisasi yang kompleks.