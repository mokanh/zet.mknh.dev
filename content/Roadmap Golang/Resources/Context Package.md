# Context Package

Context package adalah bagian dari standard library Go yang menyediakan mekanisme untuk membawa nilai, sinyal pembatalan, dan deadline ke seluruh aplikasi. Package ini sangat penting untuk mengelola lifecycle dan komunikasi antar goroutines.

## Context Basics

### Karakteristik Context
- **Immutable**: Context tidak dapat diubah setelah dibuat
- **Hierarchical**: Context dapat memiliki parent dan child
- **Cancellation**: Menyediakan mekanisme untuk membatalkan operasi
- **Deadline**: Menyediakan mekanisme untuk membatasi waktu operasi
- **Values**: Menyediakan mekanisme untuk membawa nilai-nilai

### Context Types
- **Background**: Context kosong yang tidak pernah dibatalkan
- **TODO**: Context kosong yang digunakan ketika context yang tepat belum tersedia
- **WithCancel**: Context dengan fungsi pembatalan
- **WithTimeout**: Context dengan timeout
- **WithDeadline**: Context dengan deadline
- **WithValue**: Context dengan nilai-nilai

### Contoh Dasar
```go
// Context dasar
func main() {
    // Membuat context dari Background
    ctx := context.Background()
    fmt.Println("Context dibuat:", ctx)
    
    // Membuat context dari TODO
    todoCtx := context.TODO()
    fmt.Println("TODO context dibuat:", todoCtx)
    
    // Membuat context dengan cancel
    ctx, cancel := context.WithCancel(ctx)
    defer cancel() // Membatalkan context saat fungsi selesai
    
    fmt.Println("Context dengan cancel dibuat:", ctx)
    
    // Membatalkan context
    cancel()
    fmt.Println("Context dibatalkan")
    
    // Mengecek apakah context dibatalkan
    select {
    case <-ctx.Done():
        fmt.Println("Context telah dibatalkan")
    default:
        fmt.Println("Context masih aktif")
    }
}

// Context dengan goroutine
func main() {
    // Membuat context dengan cancel
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    // Menjalankan goroutine
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine dibatalkan")
                return
            default:
                fmt.Println("Goroutine berjalan...")
                time.Sleep(100 * time.Millisecond)
            }
        }
    }()
    
    // Menunggu sebentar
    time.Sleep(300 * time.Millisecond)
    
    // Membatalkan context
    fmt.Println("Membatalkan context")
    cancel()
    
    // Menunggu sebentar agar goroutine selesai
    time.Sleep(100 * time.Millisecond)
}
```

## Context dengan Timeout

### Timeout Context
- **WithTimeout**: Membuat context dengan timeout
- **WithDeadline**: Membuat context dengan deadline
- **time.After**: Alternatif untuk timeout tanpa context
- **Resource Management**: Penting untuk mencegah goroutine leaks

### Contoh Implementasi
```go
// Context dengan timeout
func main() {
    // Membuat context dengan timeout 500ms
    ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
    defer cancel()
    
    // Menjalankan goroutine
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine dibatalkan:", ctx.Err())
                return
            default:
                fmt.Println("Goroutine berjalan...")
                time.Sleep(100 * time.Millisecond)
            }
        }
    }()
    
    // Menunggu context selesai
    <-ctx.Done()
    fmt.Println("Context selesai:", ctx.Err())
}

// Context dengan deadline
func main() {
    // Membuat context dengan deadline 1 detik dari sekarang
    deadline := time.Now().Add(1 * time.Second)
    ctx, cancel := context.WithDeadline(context.Background(), deadline)
    defer cancel()
    
    // Menjalankan goroutine
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine dibatalkan:", ctx.Err())
                return
            default:
                fmt.Println("Goroutine berjalan...")
                time.Sleep(100 * time.Millisecond)
            }
        }
    }()
    
    // Menunggu context selesai
    <-ctx.Done()
    fmt.Println("Context selesai:", ctx.Err())
}

// Timeout dengan operasi
func fetchData(ctx context.Context) (string, error) {
    // Simulasi operasi yang membutuhkan waktu
    time.Sleep(2 * time.Second)
    
    // Mengecek apakah context dibatalkan
    select {
    case <-ctx.Done():
        return "", ctx.Err()
    default:
        return "Data berhasil diambil", nil
    }
}

func main() {
    // Membuat context dengan timeout 1 detik
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
    
    // Mencoba mengambil data
    data, err := fetchData(ctx)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    
    fmt.Println("Data:", data)
}

// Timeout dengan multiple operasi
func fetchDataWithTimeout(ctx context.Context, id int) (string, error) {
    // Simulasi operasi yang membutuhkan waktu
    time.Sleep(time.Duration(id) * 500 * time.Millisecond)
    
    // Mengecek apakah context dibatalkan
    select {
    case <-ctx.Done():
        return "", ctx.Err()
    default:
        return fmt.Sprintf("Data %d berhasil diambil", id), nil
    }
}

func main() {
    // Membuat context dengan timeout 1 detik
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
    
    // Channel untuk hasil
    results := make(chan string, 3)
    errors := make(chan error, 3)
    
    // Menjalankan 3 operasi
    for i := 1; i <= 3; i++ {
        go func(id int) {
            data, err := fetchDataWithTimeout(ctx, id)
            if err != nil {
                errors <- err
                return
            }
            results <- data
        }(i)
    }
    
    // Mengumpulkan hasil
    for i := 0; i < 3; i++ {
        select {
        case result := <-results:
            fmt.Println(result)
        case err := <-errors:
            fmt.Println("Error:", err)
        }
    }
}
```

## Context dengan Cancellation

### Cancellation Context
- **WithCancel**: Membuat context dengan fungsi pembatalan
- **cancel()**: Fungsi untuk membatalkan context
- **ctx.Done()**: Channel yang ditutup ketika context dibatalkan
- **ctx.Err()**: Error yang menjelaskan mengapa context dibatalkan

### Contoh Implementasi
```go
// Context dengan cancellation
func main() {
    // Membuat context dengan cancel
    ctx, cancel := context.WithCancel(context.Background())
    
    // Menjalankan goroutine
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine dibatalkan:", ctx.Err())
                return
            default:
                fmt.Println("Goroutine berjalan...")
                time.Sleep(100 * time.Millisecond)
            }
        }
    }()
    
    // Menunggu sebentar
    time.Sleep(300 * time.Millisecond)
    
    // Membatalkan context
    fmt.Println("Membatalkan context")
    cancel()
    
    // Menunggu sebentar agar goroutine selesai
    time.Sleep(100 * time.Millisecond)
}

// Cancellation dengan operasi
func processWithCancellation(ctx context.Context, data []int) ([]int, error) {
    result := make([]int, 0, len(data))
    
    for _, val := range data {
        // Mengecek apakah context dibatalkan
        select {
        case <-ctx.Done():
            return nil, ctx.Err()
        default:
            // Simulasi pemrosesan
            time.Sleep(100 * time.Millisecond)
            result = append(result, val*2)
        }
    }
    
    return result, nil
}

func main() {
    data := []int{1, 2, 3, 4, 5}
    
    // Membuat context dengan cancel
    ctx, cancel := context.WithCancel(context.Background())
    
    // Menjalankan goroutine untuk membatalkan context setelah 300ms
    go func() {
        time.Sleep(300 * time.Millisecond)
        fmt.Println("Membatalkan context")
        cancel()
    }()
    
    // Memproses data
    result, err := processWithCancellation(ctx, data)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    
    fmt.Println("Hasil:", result)
}

// Cancellation dengan multiple goroutines
func worker(ctx context.Context, id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        // Mengecek apakah context dibatalkan
        select {
        case <-ctx.Done():
            fmt.Printf("Worker %d dibatalkan: %v\n", id, ctx.Err())
            return
        default:
            // Simulasi pemrosesan
            time.Sleep(100 * time.Millisecond)
            results <- job * 2
            fmt.Printf("Worker %d menyelesaikan job %d\n", id, job)
        }
    }
}

func main() {
    // Membuat context dengan cancel
    ctx, cancel := context.WithCancel(context.Background())
    
    // Membuat channel
    jobs := make(chan int, 10)
    results := make(chan int, 10)
    
    // Menjalankan workers
    for i := 1; i <= 3; i++ {
        go worker(ctx, i, jobs, results)
    }
    
    // Mengirim jobs
    go func() {
        for i := 1; i <= 10; i++ {
            select {
            case <-ctx.Done():
                close(jobs)
                return
            default:
                jobs <- i
                fmt.Printf("Job %d dikirim\n", i)
            }
        }
        close(jobs)
    }()
    
    // Menjalankan goroutine untuk membatalkan context setelah 500ms
    go func() {
        time.Sleep(500 * time.Millisecond)
        fmt.Println("Membatalkan context")
        cancel()
    }()
    
    // Mengumpulkan hasil
    count := 0
    for i := 0; i < 10; i++ {
        select {
        case result := <-results:
            fmt.Printf("Hasil: %d\n", result)
            count++
        case <-ctx.Done():
            fmt.Println("Context dibatalkan, menghentikan pengumpulan hasil")
            goto Done
        }
    }
    
Done:
    fmt.Printf("Total hasil yang dikumpulkan: %d\n", count)
}
```

## Context dengan Values

### Value Context
- **WithValue**: Membuat context dengan nilai-nilai
- **ctx.Value(key)**: Mengambil nilai dari context
- **Key Types**: Key harus dapat dibandingkan (comparable)
- **Value Types**: Value dapat berupa tipe apapun

### Contoh Implementasi
```go
// Context dengan values
func main() {
    // Membuat context dengan nilai
    ctx := context.WithValue(context.Background(), "user", "alice")
    ctx = context.WithValue(ctx, "role", "admin")
    
    // Mengambil nilai dari context
    user := ctx.Value("user")
    role := ctx.Value("role")
    
    fmt.Println("User:", user)
    fmt.Println("Role:", role)
    
    // Context tidak memiliki nilai
    value := ctx.Value("unknown")
    fmt.Println("Unknown value:", value)
}

// Context dengan struct key
type contextKey string

const (
    userKey  contextKey = "user"
    roleKey  contextKey = "role"
    tokenKey contextKey = "token"
)

func main() {
    // Membuat context dengan nilai
    ctx := context.WithValue(context.Background(), userKey, "alice")
    ctx = context.WithValue(ctx, roleKey, "admin")
    ctx = context.WithValue(ctx, tokenKey, "abc123")
    
    // Mengambil nilai dari context
    user := ctx.Value(userKey)
    role := ctx.Value(roleKey)
    token := ctx.Value(tokenKey)
    
    fmt.Println("User:", user)
    fmt.Println("Role:", role)
    fmt.Println("Token:", token)
}

// Context dengan values dan goroutines
func processWithContext(ctx context.Context, id int) {
    // Mengambil nilai dari context
    user := ctx.Value("user").(string)
    role := ctx.Value("role").(string)
    
    fmt.Printf("Goroutine %d: Memproses untuk user %s dengan role %s\n", id, user, role)
    
    // Simulasi pemrosesan
    time.Sleep(100 * time.Millisecond)
    
    fmt.Printf("Goroutine %d: Selesai\n", id)
}

func main() {
    // Membuat context dengan nilai
    ctx := context.WithValue(context.Background(), "user", "alice")
    ctx = context.WithValue(ctx, "role", "admin")
    
    // Menjalankan goroutines
    for i := 1; i <= 3; i++ {
        go func(id int) {
            processWithContext(ctx, id)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(200 * time.Millisecond)
}

// Context dengan values dan cancellation
func processWithContextAndCancellation(ctx context.Context, id int) {
    // Mengambil nilai dari context
    user := ctx.Value("user").(string)
    role := ctx.Value("role").(string)
    
    fmt.Printf("Goroutine %d: Memproses untuk user %s dengan role %s\n", id, user, role)
    
    // Simulasi pemrosesan dengan cancellation
    for i := 0; i < 5; i++ {
        select {
        case <-ctx.Done():
            fmt.Printf("Goroutine %d dibatalkan: %v\n", id, ctx.Err())
            return
        default:
            fmt.Printf("Goroutine %d: Langkah %d\n", id, i+1)
            time.Sleep(100 * time.Millisecond)
        }
    }
    
    fmt.Printf("Goroutine %d: Selesai\n", id)
}

func main() {
    // Membuat context dengan nilai dan cancel
    ctx, cancel := context.WithCancel(context.Background())
    ctx = context.WithValue(ctx, "user", "alice")
    ctx = context.WithValue(ctx, "role", "admin")
    
    // Menjalankan goroutines
    for i := 1; i <= 3; i++ {
        go func(id int) {
            processWithContextAndCancellation(ctx, id)
        }(i)
    }
    
    // Menunggu sebentar
    time.Sleep(300 * time.Millisecond)
    
    // Membatalkan context
    fmt.Println("Membatalkan context")
    cancel()
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(200 * time.Millisecond)
}
```

## Context Patterns

### Context dengan Timeout dan Values
```go
// Context dengan timeout dan values
func fetchDataWithContext(ctx context.Context, id int) (string, error) {
    // Mengambil nilai dari context
    user := ctx.Value("user").(string)
    
    fmt.Printf("Fetching data %d for user %s\n", id, user)
    
    // Simulasi operasi yang membutuhkan waktu
    time.Sleep(time.Duration(id) * 200 * time.Millisecond)
    
    // Mengecek apakah context dibatalkan
    select {
    case <-ctx.Done():
        return "", ctx.Err()
    default:
        return fmt.Sprintf("Data %d untuk user %s", id, user), nil
    }
}

func main() {
    // Membuat context dengan timeout dan values
    ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
    defer cancel()
    
    ctx = context.WithValue(ctx, "user", "alice")
    
    // Menjalankan operasi
    data, err := fetchDataWithContext(ctx, 1)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    
    fmt.Println("Data:", data)
    
    // Mencoba operasi lain yang mungkin timeout
    data, err = fetchDataWithContext(ctx, 3)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    
    fmt.Println("Data:", data)
}
```

### Context dengan Parent-Child
```go
// Context dengan parent-child
func childProcess(ctx context.Context, id int) {
    // Membuat child context dengan nilai tambahan
    childCtx := context.WithValue(ctx, "child_id", id)
    
    // Mengambil nilai dari parent dan child context
    user := childCtx.Value("user").(string)
    childID := childCtx.Value("child_id").(int)
    
    fmt.Printf("Child %d: Memproses untuk user %s\n", childID, user)
    
    // Simulasi pemrosesan
    time.Sleep(100 * time.Millisecond)
    
    fmt.Printf("Child %d: Selesai\n", childID)
}

func parentProcess(ctx context.Context) {
    // Mengambil nilai dari context
    user := ctx.Value("user").(string)
    
    fmt.Printf("Parent: Memproses untuk user %s\n", user)
    
    // Menjalankan child processes
    for i := 1; i <= 3; i++ {
        go childProcess(ctx, i)
    }
    
    // Simulasi pemrosesan
    time.Sleep(200 * time.Millisecond)
    
    fmt.Println("Parent: Selesai")
}

func main() {
    // Membuat parent context dengan nilai
    parentCtx := context.WithValue(context.Background(), "user", "alice")
    
    // Menjalankan parent process
    parentProcess(parentCtx)
    
    // Menunggu sebentar agar processes selesai
    time.Sleep(300 * time.Millisecond)
}
```

### Context dengan Cancellation Propagation
```go
// Context dengan cancellation propagation
func childProcess(ctx context.Context, id int) {
    // Mengambil nilai dari context
    user := ctx.Value("user").(string)
    
    fmt.Printf("Child %d: Memproses untuk user %s\n", id, user)
    
    // Simulasi pemrosesan dengan cancellation
    for i := 0; i < 5; i++ {
        select {
        case <-ctx.Done():
            fmt.Printf("Child %d dibatalkan: %v\n", id, ctx.Err())
            return
        default:
            fmt.Printf("Child %d: Langkah %d\n", id, i+1)
            time.Sleep(100 * time.Millisecond)
        }
    }
    
    fmt.Printf("Child %d: Selesai\n", id)
}

func parentProcess(ctx context.Context) {
    // Mengambil nilai dari context
    user := ctx.Value("user").(string)
    
    fmt.Printf("Parent: Memproses untuk user %s\n", user)
    
    // Menjalankan child processes
    for i := 1; i <= 3; i++ {
        go childProcess(ctx, i)
    }
    
    // Simulasi pemrosesan dengan cancellation
    for i := 0; i < 3; i++ {
        select {
        case <-ctx.Done():
            fmt.Printf("Parent dibatalkan: %v\n", ctx.Err())
            return
        default:
            fmt.Printf("Parent: Langkah %d\n", i+1)
            time.Sleep(100 * time.Millisecond)
        }
    }
    
    fmt.Println("Parent: Selesai")
}

func main() {
    // Membuat context dengan cancel
    ctx, cancel := context.WithCancel(context.Background())
    ctx = context.WithValue(ctx, "user", "alice")
    
    // Menjalankan parent process
    go parentProcess(ctx)
    
    // Menunggu sebentar
    time.Sleep(200 * time.Millisecond)
    
    // Membatalkan context
    fmt.Println("Membatalkan context")
    cancel()
    
    // Menunggu sebentar agar processes selesai
    time.Sleep(300 * time.Millisecond)
}
```

## Kesimpulan

Context package adalah bagian penting dari Go standard library yang menyediakan mekanisme untuk membawa nilai, sinyal pembatalan, dan deadline ke seluruh aplikasi. Dengan memahami context basics, timeout, cancellation, dan values, kita dapat mengembangkan aplikasi konkuren yang aman dan efisien. Context adalah bagian integral dari model konkurensi Go dan sangat penting untuk dikuasai dalam pengembangan aplikasi konkuren.