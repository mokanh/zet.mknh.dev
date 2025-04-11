# Goroutines

Goroutines adalah unit eksekusi ringan yang dikelola oleh Go runtime. Mereka memungkinkan fungsi untuk berjalan secara konkuren dengan fungsi lain, memberikan kemampuan untuk melakukan pemrograman paralel dan konkuren dengan mudah.

## Pengenalan Goroutines

### Karakteristik Goroutines
- **Ringan**: Goroutine hanya menggunakan beberapa KB memori (2KB awal, dapat tumbuh hingga 1GB)
- **Mudah Dibuat**: Hanya perlu menambahkan keyword `go` sebelum pemanggilan fungsi
- **Efisien**: Dikelola oleh Go scheduler, bukan OS thread
- **Skalabel**: Ribuan goroutine dapat berjalan secara bersamaan
- **Komunikasi**: Berkomunikasi melalui channels, bukan shared memory

### Membuat Goroutine
```go
// Membuat goroutine sederhana
func main() {
    // Menjalankan fungsi dalam goroutine
    go func() {
        fmt.Println("Hello from goroutine!")
    }()
    
    // Menjalankan fungsi bernama dalam goroutine
    go printMessage("Hello from named function!")
    
    // Menunggu sebentar agar goroutine selesai
    time.Sleep(100 * time.Millisecond)
}

func printMessage(message string) {
    fmt.Println(message)
}

// Membuat multiple goroutines
func main() {
    for i := 0; i < 5; i++ {
        go func(id int) {
            fmt.Printf("Goroutine %d: Hello!\n", id)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
}
```

## Lifecycle Goroutine

### Tahapan Lifecycle
1. **Creation**: Goroutine dibuat dengan keyword `go`
2. **Execution**: Goroutine mulai dieksekusi oleh Go scheduler
3. **Blocking**: Goroutine dapat diblokir saat menunggu operasi I/O, channel, atau mutex
4. **Termination**: Goroutine berakhir ketika fungsi selesai dieksekusi

### Mengontrol Lifecycle
```go
// Menggunakan WaitGroup untuk menunggu goroutines selesai
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

// Menggunakan channel untuk sinyalisasi
func main() {
    done := make(chan bool)
    
    go func() {
        fmt.Println("Goroutine sedang bekerja...")
        time.Sleep(100 * time.Millisecond)
        fmt.Println("Goroutine selesai")
        done <- true // Mengirim sinyal selesai
    }()
    
    <-done // Menunggu sinyal selesai
    fmt.Println("Program utama selesai")
}
```

## Goroutine Scheduling

### Go Scheduler
- **G-M-P Model**: 
  - G: Goroutine
  - M: OS Thread (Machine)
  - P: Logical Processor (Context)
- **Work Stealing**: Scheduler dapat memindahkan goroutines antar logical processors
- **Preemptive**: Scheduler dapat menghentikan goroutine yang berjalan terlalu lama

### Scheduling Policies
- **Cooperative**: Goroutine secara sukarela melepaskan kontrol
- **Preemptive**: Scheduler dapat menghentikan goroutine yang berjalan terlalu lama
- **System Calls**: Goroutine diblokir saat melakukan system call

### Contoh Scheduling
```go
// Demonstrasi cooperative scheduling
func main() {
    go func() {
        for i := 0; i < 10; i++ {
            fmt.Printf("Goroutine: %d\n", i)
            // Tidak ada cooperative yield, tapi Go runtime dapat melakukan preemption
        }
    }()
    
    // Goroutine lain
    go func() {
        for i := 0; i < 10; i++ {
            fmt.Printf("Main: %d\n", i)
        }
    }()
    
    time.Sleep(100 * time.Millisecond)
}

// Demonstrasi blocking operations
func main() {
    go func() {
        fmt.Println("Goroutine mulai")
        // Operasi blocking
        time.Sleep(50 * time.Millisecond)
        fmt.Println("Goroutine selesai")
    }()
    
    fmt.Println("Main thread")
    time.Sleep(100 * time.Millisecond)
}
```

## Best Practices

### 1. Selalu Bersihkan Resources
```go
// Menggunakan defer untuk membersihkan resources
func worker(id int, done chan<- bool) {
    defer func() {
        fmt.Printf("Worker %d: Membersihkan resources\n", id)
        done <- true
    }()
    
    fmt.Printf("Worker %d: Bekerja\n", id)
    time.Sleep(50 * time.Millisecond)
}

func main() {
    done := make(chan bool)
    go worker(1, done)
    <-done
}
```

### 2. Hindari Goroutine Leaks
```go
// Contoh goroutine leak
func leakyFunction() {
    ch := make(chan int)
    go func() {
        val := <-ch // Blokir sampai ada data
        fmt.Println(val)
    }()
    // Tidak pernah mengirim data ke channel
    // Goroutine akan leak
}

// Solusi: Gunakan context untuk cancellation
func nonLeakyFunction(ctx context.Context) {
    ch := make(chan int)
    go func() {
        select {
        case val := <-ch:
            fmt.Println(val)
        case <-ctx.Done():
            fmt.Println("Goroutine dibatalkan")
            return
        }
    }()
    
    // Simulasi pembatalan
    time.Sleep(50 * time.Millisecond)
    // Goroutine akan berhenti ketika context dibatalkan
}
```

### 3. Gunakan WaitGroup untuk Sinkronisasi
```go
func processItems(items []int) {
    var wg sync.WaitGroup
    
    for _, item := range items {
        wg.Add(1)
        go func(i int) {
            defer wg.Done()
            processItem(i)
        }(item)
    }
    
    wg.Wait()
    fmt.Println("Semua items selesai diproses")
}

func processItem(item int) {
    fmt.Printf("Memproses item %d\n", item)
    time.Sleep(50 * time.Millisecond)
}
```

### 4. Batasi Jumlah Goroutines
```go
// Menggunakan worker pool untuk membatasi jumlah goroutines
func processWithWorkerPool(items []int, numWorkers int) {
    jobs := make(chan int, len(items))
    results := make(chan int, len(items))
    
    // Memulai workers
    for i := 0; i < numWorkers; i++ {
        go worker(i, jobs, results)
    }
    
    // Mengirim jobs
    for _, item := range items {
        jobs <- item
    }
    close(jobs)
    
    // Mengumpulkan results
    for i := 0; i < len(items); i++ {
        <-results
    }
    close(results)
}

func worker(id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        fmt.Printf("Worker %d: Memproses job %d\n", id, job)
        time.Sleep(50 * time.Millisecond)
        results <- job * 2
    }
}
```

### 5. Gunakan Context untuk Cancellation
```go
func processWithContext(ctx context.Context, items []int) {
    for _, item := range items {
        select {
        case <-ctx.Done():
            fmt.Println("Pemrosesan dibatalkan")
            return
        default:
            processItemWithContext(ctx, item)
        }
    }
}

func processItemWithContext(ctx context.Context, item int) {
    // Simulasi pemrosesan
    select {
    case <-ctx.Done():
        return
    case <-time.After(50 * time.Millisecond):
        fmt.Printf("Item %d selesai diproses\n", item)
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
    defer cancel()
    
    items := []int{1, 2, 3, 4, 5}
    processWithContext(ctx, items)
}
```

## Kesimpulan

Goroutines adalah fitur kuat dalam Go yang memungkinkan pemrograman konkuren dengan mudah. Dengan memahami lifecycle, scheduling, dan best practices, kita dapat mengembangkan aplikasi yang efisien dan skalabel. Penting untuk diingat bahwa goroutines adalah unit eksekusi ringan, tetapi tetap perlu dikelola dengan baik untuk menghindari resource leaks dan masalah konkurensi lainnya.