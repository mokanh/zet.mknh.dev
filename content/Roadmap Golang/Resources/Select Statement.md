# Select Statement

Select statement adalah fitur Go yang memungkinkan goroutine untuk menunggu multiple operasi komunikasi secara bersamaan. Ini adalah mekanisme yang sangat powerful untuk mengimplementasikan pola konkurensi yang kompleks.

## Multiple Channel Operations

### Dasar Select Statement
- **Multiple Cases**: Select dapat menangani multiple operasi channel
- **Non-deterministic**: Case yang dieksekusi dipilih secara acak jika multiple case siap
- **Blocking**: Select memblokir sampai salah satu case siap atau default case dieksekusi

### Contoh Dasar
```go
// Select statement dasar
func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)
    
    // Mengirim ke channel pertama
    go func() {
        time.Sleep(100 * time.Millisecond)
        ch1 <- "Data dari channel 1"
    }()
    
    // Mengirim ke channel kedua
    go func() {
        time.Sleep(200 * time.Millisecond)
        ch2 <- "Data dari channel 2"
    }()
    
    // Menunggu data dari salah satu channel
    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-ch1:
            fmt.Println(msg1)
        case msg2 := <-ch2:
            fmt.Println(msg2)
        }
    }
}

// Select dengan multiple operasi
func main() {
    ch1 := make(chan int)
    ch2 := make(chan int)
    ch3 := make(chan int)
    
    // Mengirim data ke semua channel
    go func() {
        for i := 0; i < 5; i++ {
            ch1 <- i
            ch2 <- i * 2
            ch3 <- i * 3
            time.Sleep(100 * time.Millisecond)
        }
        close(ch1)
        close(ch2)
        close(ch3)
    }()
    
    // Menerima data dari semua channel
    for {
        select {
        case val, ok := <-ch1:
            if !ok {
                ch1 = nil // Set ke nil agar case ini tidak dipilih lagi
                continue
            }
            fmt.Printf("Channel 1: %d\n", val)
        case val, ok := <-ch2:
            if !ok {
                ch2 = nil
                continue
            }
            fmt.Printf("Channel 2: %d\n", val)
        case val, ok := <-ch3:
            if !ok {
                ch3 = nil
                continue
            }
            fmt.Printf("Channel 3: %d\n", val)
        default:
            if ch1 == nil && ch2 == nil && ch3 == nil {
                fmt.Println("Semua channel ditutup")
                return
            }
            time.Sleep(10 * time.Millisecond)
        }
    }
}
```

## Default Case

### Karakteristik Default Case
- **Non-blocking**: Select tidak memblokir jika default case ada
- **Polling**: Efektif untuk implementasi polling
- **Prioritas**: Default case hanya dieksekusi jika tidak ada case lain yang siap

### Contoh Penggunaan
```go
// Default case untuk non-blocking receive
func main() {
    ch := make(chan int)
    
    // Mengirim data setelah delay
    go func() {
        time.Sleep(100 * time.Millisecond)
        ch <- 42
    }()
    
    // Mencoba menerima data tanpa blocking
    select {
    case val := <-ch:
        fmt.Println("Data diterima:", val)
    default:
        fmt.Println("Tidak ada data yang siap")
    }
    
    // Menunggu sebentar agar data terkirim
    time.Sleep(150 * time.Millisecond)
    
    // Mencoba menerima data lagi
    select {
    case val := <-ch:
        fmt.Println("Data diterima:", val)
    default:
        fmt.Println("Tidak ada data yang siap")
    }
}

// Default case untuk polling
func main() {
    ch := make(chan int)
    done := make(chan bool)
    
    // Mengirim data secara periodik
    go func() {
        for i := 0; i < 5; i++ {
            ch <- i
            time.Sleep(100 * time.Millisecond)
        }
        done <- true
    }()
    
    // Polling untuk data
    for {
        select {
        case val := <-ch:
            fmt.Println("Data diterima:", val)
        case <-done:
            fmt.Println("Selesai")
            return
        default:
            fmt.Println("Polling...")
            time.Sleep(50 * time.Millisecond)
        }
    }
}
```

## Timeout Handling

### Timeout dengan Select
- **time.After**: Mengembalikan channel yang menerima nilai setelah durasi tertentu
- **Cancellation**: Efektif untuk implementasi timeout dan cancellation
- **Resource Management**: Penting untuk mencegah goroutine leaks

### Contoh Implementasi
```go
// Timeout dengan select
func main() {
    ch := make(chan string)
    
    // Simulasi operasi yang membutuhkan waktu
    go func() {
        time.Sleep(2 * time.Second)
        ch <- "Hasil operasi"
    }()
    
    // Menunggu hasil dengan timeout
    select {
    case result := <-ch:
        fmt.Println("Hasil:", result)
    case <-time.After(1 * time.Second):
        fmt.Println("Timeout: Operasi terlalu lama")
    }
}

// Timeout dengan context
func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
    
    ch := make(chan string)
    
    // Simulasi operasi yang membutuhkan waktu
    go func() {
        time.Sleep(2 * time.Second)
        ch <- "Hasil operasi"
    }()
    
    // Menunggu hasil dengan context timeout
    select {
    case result := <-ch:
        fmt.Println("Hasil:", result)
    case <-ctx.Done():
        fmt.Println("Timeout:", ctx.Err())
    }
}

// Timeout untuk multiple operasi
func fetchDataWithTimeout(timeout time.Duration) ([]string, error) {
    ch := make(chan []string)
    errCh := make(chan error)
    
    // Simulasi fetch data
    go func() {
        // Simulasi network delay
        time.Sleep(500 * time.Millisecond)
        ch <- []string{"Data 1", "Data 2", "Data 3"}
    }()
    
    // Menunggu hasil dengan timeout
    select {
    case data := <-ch:
        return data, nil
    case err := <-errCh:
        return nil, err
    case <-time.After(timeout):
        return nil, fmt.Errorf("timeout setelah %v", timeout)
    }
}

func main() {
    data, err := fetchDataWithTimeout(1 * time.Second)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("Data:", data)
}
```

## Non-blocking Operations

### Non-blocking Send dan Receive
- **Select dengan Default**: Menggunakan select dengan default case untuk operasi non-blocking
- **Resource Efficiency**: Mencegah goroutine dari blocking yang tidak perlu
- **Responsiveness**: Meningkatkan responsivitas aplikasi

### Contoh Implementasi
```go
// Non-blocking send
func main() {
    ch := make(chan int, 1) // Buffered channel dengan kapasitas 1
    
    // Mencoba mengirim tanpa blocking
    select {
    case ch <- 42:
        fmt.Println("Data terkirim")
    default:
        fmt.Println("Channel penuh, tidak bisa mengirim")
    }
    
    // Mencoba mengirim lagi
    select {
    case ch <- 43:
        fmt.Println("Data terkirim")
    default:
        fmt.Println("Channel penuh, tidak bisa mengirim")
    }
    
    // Menerima data
    fmt.Println(<-ch)
}

// Non-blocking receive
func main() {
    ch := make(chan int)
    
    // Mencoba menerima tanpa blocking
    select {
    case val := <-ch:
        fmt.Println("Data diterima:", val)
    default:
        fmt.Println("Tidak ada data yang siap")
    }
    
    // Mengirim data
    go func() {
        ch <- 42
    }()
    
    // Menunggu sebentar
    time.Sleep(100 * time.Millisecond)
    
    // Mencoba menerima lagi
    select {
    case val := <-ch:
        fmt.Println("Data diterima:", val)
    default:
        fmt.Println("Tidak ada data yang siap")
    }
}

// Non-blocking multiple operations
func main() {
    ch1 := make(chan int, 1)
    ch2 := make(chan int, 1)
    
    // Mencoba operasi pada kedua channel
    select {
    case ch1 <- 1:
        fmt.Println("Data terkirim ke channel 1")
    case ch2 <- 2:
        fmt.Println("Data terkirim ke channel 2")
    case val := <-ch1:
        fmt.Println("Data diterima dari channel 1:", val)
    case val := <-ch2:
        fmt.Println("Data diterima dari channel 2:", val)
    default:
        fmt.Println("Tidak ada operasi yang siap")
    }
}
```

## Select dengan Context

### Context dan Select
- **Cancellation**: Context dapat digunakan untuk cancellation
- **Timeout**: Context dengan timeout untuk membatasi waktu operasi
- **Values**: Context dapat membawa nilai-nilai yang dapat diakses oleh goroutines

### Contoh Implementasi
```go
// Select dengan context cancellation
func main() {
    ctx, cancel := context.WithCancel(context.Background())
    
    ch := make(chan string)
    
    // Goroutine yang akan dibatalkan
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine dibatalkan:", ctx.Err())
                return
            default:
                fmt.Println("Bekerja...")
                time.Sleep(100 * time.Millisecond)
            }
        }
    }()
    
    // Membatalkan goroutine setelah 500ms
    time.Sleep(500 * time.Millisecond)
    cancel()
    
    // Menunggu sebentar agar goroutine selesai
    time.Sleep(100 * time.Millisecond)
}

// Select dengan context timeout
func processWithTimeout(ctx context.Context, data []int) ([]int, error) {
    resultCh := make(chan []int)
    errCh := make(chan error)
    
    // Memproses data dalam goroutine
    go func() {
        result := make([]int, 0, len(data))
        for _, val := range data {
            // Simulasi pemrosesan
            time.Sleep(100 * time.Millisecond)
            result = append(result, val*2)
        }
        resultCh <- result
    }()
    
    // Menunggu hasil dengan context
    select {
    case result := <-resultCh:
        return result, nil
    case err := <-errCh:
        return nil, err
    case <-ctx.Done():
        return nil, ctx.Err()
    }
}

func main() {
    data := []int{1, 2, 3, 4, 5}
    
    // Context dengan timeout 300ms
    ctx, cancel := context.WithTimeout(context.Background(), 300*time.Millisecond)
    defer cancel()
    
    result, err := processWithTimeout(ctx, data)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("Hasil:", result)
}

// Select dengan context values
func main() {
    // Context dengan nilai
    ctx := context.WithValue(context.Background(), "user", "alice")
    
    ch := make(chan string)
    
    // Goroutine yang menggunakan nilai dari context
    go func(ctx context.Context) {
        user := ctx.Value("user").(string)
        fmt.Printf("User: %s\n", user)
        ch <- "Selesai"
    }(ctx)
    
    <-ch
}
```

## Select Patterns

### Select dalam Loop
```go
// Select dalam loop
func main() {
    ch1 := make(chan int)
    ch2 := make(chan int)
    done := make(chan bool)
    
    // Mengirim data ke channel
    go func() {
        for i := 0; i < 5; i++ {
            ch1 <- i
            ch2 <- i * 2
            time.Sleep(100 * time.Millisecond)
        }
        done <- true
    }()
    
    // Menerima data dari channel dalam loop
    for {
        select {
        case val := <-ch1:
            fmt.Printf("Channel 1: %d\n", val)
        case val := <-ch2:
            fmt.Printf("Channel 2: %d\n", val)
        case <-done:
            fmt.Println("Selesai")
            return
        }
    }
}
```

### Select dengan Prioritas
```go
// Select dengan prioritas
func main() {
    highPriority := make(chan int)
    lowPriority := make(chan int)
    
    // Mengirim data ke channel
    go func() {
        for i := 0; i < 5; i++ {
            lowPriority <- i
            time.Sleep(50 * time.Millisecond)
        }
    }()
    
    go func() {
        time.Sleep(200 * time.Millisecond)
        highPriority <- 100
    }()
    
    // Menerima data dengan prioritas
    for i := 0; i < 6; i++ {
        select {
        case val := <-highPriority:
            fmt.Printf("High priority: %d\n", val)
        case val := <-lowPriority:
            fmt.Printf("Low priority: %d\n", val)
        }
    }
}
```

### Select dengan Error Handling
```go
// Select dengan error handling
func fetchData() (string, error) {
    resultCh := make(chan string)
    errorCh := make(chan error)
    
    // Simulasi fetch data
    go func() {
        // Simulasi random error
        if rand.Float64() < 0.5 {
            errorCh <- fmt.Errorf("random error")
            return
        }
        
        time.Sleep(100 * time.Millisecond)
        resultCh <- "Data berhasil diambil"
    }()
    
    // Menunggu hasil atau error
    select {
    case result := <-resultCh:
        return result, nil
    case err := <-errorCh:
        return "", err
    case <-time.After(200 * time.Millisecond):
        return "", fmt.Errorf("timeout")
    }
}

func main() {
    result, err := fetchData()
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("Hasil:", result)
}
```

## Kesimpulan

Select statement adalah fitur powerful dalam Go yang memungkinkan implementasi pola konkurensi yang kompleks. Dengan memahami multiple channel operations, default case, timeout handling, dan non-blocking operations, kita dapat mengembangkan aplikasi konkuren yang efisien dan responsif. Select statement adalah bagian integral dari model konkurensi Go dan sangat penting untuk dikuasai dalam pengembangan aplikasi konkuren.