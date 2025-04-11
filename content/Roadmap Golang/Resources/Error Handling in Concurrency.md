# Error Handling in Concurrency

Error handling dalam aplikasi konkuren adalah aspek penting yang perlu diperhatikan dengan baik. Dalam aplikasi konkuren, error dapat terjadi di berbagai goroutine dan perlu ditangani dengan tepat untuk mencegah kebocoran goroutine, resource leak, dan masalah lainnya.

## Error Propagation

Error propagation adalah proses menyebarkan error dari goroutine yang mengalami error ke goroutine lain yang perlu mengetahuinya.

### Karakteristik Error Propagation
- **Channel-based**: Menggunakan channel untuk menyebarkan error
- **Context-based**: Menggunakan context untuk menyebarkan error
- **Error Groups**: Menggunakan error groups untuk mengelola error dari beberapa goroutine
- **Graceful Shutdown**: Menutup aplikasi dengan rapi ketika terjadi error fatal

### Implementasi Error Propagation
```go
// Error propagation dengan channel
func main() {
    // Membuat channel untuk error
    errChan := make(chan error, 1)
    
    // Menjalankan goroutine yang mungkin menghasilkan error
    go func() {
        // Simulasi operasi yang mungkin menghasilkan error
        if rand.Float64() < 0.5 {
            errChan <- fmt.Errorf("random error occurred")
            return
        }
        
        // Operasi normal
        fmt.Println("Operation completed successfully")
        errChan <- nil
    }()
    
    // Menunggu hasil dari goroutine
    if err := <-errChan; err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Println("Main function completed")
}

// Error propagation dengan multiple channels
func main() {
    // Membuat channel untuk data dan error
    dataChan := make(chan int, 10)
    errChan := make(chan error, 1)
    
    // Menjalankan goroutine untuk menghasilkan data
    go func() {
        defer close(dataChan)
        defer close(errChan)
        
        for i := 1; i <= 10; i++ {
            // Simulasi operasi yang mungkin menghasilkan error
            if i == 5 {
                errChan <- fmt.Errorf("error at iteration %d", i)
                return
            }
            
            // Mengirim data ke channel
            dataChan <- i
            time.Sleep(100 * time.Millisecond)
        }
    }()
    
    // Membaca data dan error
    for {
        select {
        case data, ok := <-dataChan:
            if !ok {
                return
            }
            fmt.Printf("Received data: %d\n", data)
        case err, ok := <-errChan:
            if !ok {
                return
            }
            fmt.Printf("Error occurred: %v\n", err)
            return
        }
    }
}

// Error propagation dengan context
func main() {
    // Membuat context dengan timeout
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
    
    // Membuat channel untuk error
    errChan := make(chan error, 1)
    
    // Menjalankan goroutine yang mungkin menghasilkan error
    go func() {
        defer close(errChan)
        
        // Simulasi operasi yang memakan waktu
        time.Sleep(2 * time.Second)
        
        // Cek apakah context sudah dibatalkan
        if ctx.Err() != nil {
            errChan <- ctx.Err()
            return
        }
        
        // Operasi normal
        fmt.Println("Operation completed successfully")
        errChan <- nil
    }()
    
    // Menunggu hasil dari goroutine
    select {
    case err := <-errChan:
        if err != nil {
            fmt.Printf("Error: %v\n", err)
            return
        }
        fmt.Println("Operation successful")
    case <-ctx.Done():
        fmt.Printf("Context canceled: %v\n", ctx.Err())
    }
}

// Error propagation dengan select dan timeout
func main() {
    // Membuat channel untuk error
    errChan := make(chan error, 1)
    
    // Menjalankan goroutine yang mungkin menghasilkan error
    go func() {
        defer close(errChan)
        
        // Simulasi operasi yang memakan waktu
        time.Sleep(2 * time.Second)
        
        // Operasi normal
        fmt.Println("Operation completed successfully")
        errChan <- nil
    }()
    
    // Menunggu hasil dari goroutine dengan timeout
    select {
    case err := <-errChan:
        if err != nil {
            fmt.Printf("Error: %v\n", err)
            return
        }
        fmt.Println("Operation successful")
    case <-time.After(1 * time.Second):
        fmt.Println("Operation timed out")
    }
}
```

## Error Groups

Error groups adalah mekanisme untuk mengelola error dari beberapa goroutine secara bersamaan. Package `errgroup` dari Go menyediakan implementasi error groups.

### Karakteristik Error Groups
- **Group Management**: Mengelola sekelompok goroutine
- **Error Collection**: Mengumpulkan error dari semua goroutine
- **Cancellation**: Membatalkan semua goroutine ketika salah satu goroutine mengalami error
- **Wait**: Menunggu semua goroutine selesai

### Implementasi Error Groups
```go
// Error groups sederhana
func main() {
    // Membuat error group
    g := new(errgroup.Group)
    
    // Menambahkan goroutine ke error group
    for i := 1; i <= 3; i++ {
        id := i // Capture loop variable
        g.Go(func() error {
            // Simulasi operasi yang mungkin menghasilkan error
            if id == 2 {
                return fmt.Errorf("error in goroutine %d", id)
            }
            
            // Operasi normal
            fmt.Printf("Goroutine %d completed successfully\n", id)
            return nil
        })
    }
    
    // Menunggu semua goroutine selesai
    if err := g.Wait(); err != nil {
        fmt.Printf("Error occurred: %v\n", err)
        return
    }
    
    fmt.Println("All goroutines completed successfully")
}

// Error groups dengan context
func main() {
    // Membuat context dengan timeout
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
    
    // Membuat error group dengan context
    g, ctx := errgroup.WithContext(ctx)
    
    // Menambahkan goroutine ke error group
    for i := 1; i <= 3; i++ {
        id := i // Capture loop variable
        g.Go(func() error {
            // Simulasi operasi yang memakan waktu
            time.Sleep(2 * time.Second)
            
            // Cek apakah context sudah dibatalkan
            if ctx.Err() != nil {
                return ctx.Err()
            }
            
            // Operasi normal
            fmt.Printf("Goroutine %d completed successfully\n", id)
            return nil
        })
    }
    
    // Menunggu semua goroutine selesai
    if err := g.Wait(); err != nil {
        fmt.Printf("Error occurred: %v\n", err)
        return
    }
    
    fmt.Println("All goroutines completed successfully")
}

// Error groups dengan worker pool
func main() {
    // Membuat error group
    g := new(errgroup.Group)
    
    // Membuat channel untuk jobs
    jobs := make(chan int, 10)
    
    // Menjalankan worker pool
    numWorkers := 3
    for i := 0; i < numWorkers; i++ {
        id := i // Capture loop variable
        g.Go(func() error {
            for job := range jobs {
                // Simulasi operasi yang mungkin menghasilkan error
                if job == 5 {
                    return fmt.Errorf("error processing job %d", job)
                }
                
                // Operasi normal
                fmt.Printf("Worker %d processed job %d successfully\n", id, job)
                time.Sleep(100 * time.Millisecond)
            }
            return nil
        })
    }
    
    // Mengirim jobs ke worker pool
    go func() {
        defer close(jobs)
        for i := 1; i <= 10; i++ {
            jobs <- i
        }
    }()
    
    // Menunggu semua goroutine selesai
    if err := g.Wait(); err != nil {
        fmt.Printf("Error occurred: %v\n", err)
        return
    }
    
    fmt.Println("All workers completed successfully")
}

// Error groups dengan fan-out, fan-in
func main() {
    // Membuat error group
    g := new(errgroup.Group)
    
    // Membuat channel untuk input dan output
    input := make(chan int, 10)
    output := make(chan int, 10)
    
    // Mengirim input
    go func() {
        defer close(input)
        for i := 1; i <= 10; i++ {
            input <- i
        }
    }()
    
    // Fan-out: Mendistribusikan pekerjaan ke beberapa goroutine
    numWorkers := 3
    for i := 0; i < numWorkers; i++ {
        id := i // Capture loop variable
        g.Go(func() error {
            for n := range input {
                // Simulasi operasi yang mungkin menghasilkan error
                if n == 5 {
                    return fmt.Errorf("error processing input %d", n)
                }
                
                // Memproses input
                result := n * n
                fmt.Printf("Worker %d processed: %d\n", id, result)
                
                // Fan-in: Mengirim hasil ke channel output
                output <- result
            }
            return nil
        })
    }
    
    // Menutup channel output setelah semua worker selesai
    go func() {
        g.Wait()
        close(output)
    }()
    
    // Mengumpulkan hasil
    for result := range output {
        fmt.Println("Result:", result)
    }
}
```

## Context Cancellation

Context cancellation adalah mekanisme untuk membatalkan operasi yang sedang berjalan di goroutine. Context dapat dibatalkan secara manual atau secara otomatis ketika timeout tercapai.

### Karakteristik Context Cancellation
- **Manual Cancellation**: Membatalkan context secara manual dengan memanggil fungsi cancel
- **Timeout Cancellation**: Membatalkan context secara otomatis ketika timeout tercapai
- **Deadline Cancellation**: Membatalkan context secara otomatis ketika deadline tercapai
- **Propagation**: Context cancellation dapat disebarkan ke goroutine lain

### Implementasi Context Cancellation
```go
// Context cancellation manual
func main() {
    // Membuat context yang dapat dibatalkan
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    // Menjalankan goroutine yang dapat dibatalkan
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine canceled:", ctx.Err())
                return
            default:
                fmt.Println("Goroutine running...")
                time.Sleep(500 * time.Millisecond)
            }
        }
    }()
    
    // Menunggu sebentar sebelum membatalkan context
    time.Sleep(2 * time.Second)
    fmt.Println("Canceling context...")
    cancel()
    
    // Menunggu sebentar agar goroutine selesai
    time.Sleep(1 * time.Second)
}

// Context cancellation dengan timeout
func main() {
    // Membuat context dengan timeout
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()
    
    // Menjalankan goroutine yang dapat dibatalkan
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine canceled:", ctx.Err())
                return
            default:
                fmt.Println("Goroutine running...")
                time.Sleep(500 * time.Millisecond)
            }
        }
    }()
    
    // Menunggu context selesai
    <-ctx.Done()
    fmt.Println("Context canceled:", ctx.Err())
}

// Context cancellation dengan deadline
func main() {
    // Membuat context dengan deadline
    deadline := time.Now().Add(2 * time.Second)
    ctx, cancel := context.WithDeadline(context.Background(), deadline)
    defer cancel()
    
    // Menjalankan goroutine yang dapat dibatalkan
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine canceled:", ctx.Err())
                return
            default:
                fmt.Println("Goroutine running...")
                time.Sleep(500 * time.Millisecond)
            }
        }
    }()
    
    // Menunggu context selesai
    <-ctx.Done()
    fmt.Println("Context canceled:", ctx.Err())
}

// Context cancellation dengan propagation
func main() {
    // Membuat context yang dapat dibatalkan
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    // Menjalankan goroutine parent
    go func() {
        // Membuat context child
        childCtx, childCancel := context.WithCancel(ctx)
        defer childCancel()
        
        // Menjalankan goroutine child
        go func() {
            for {
                select {
                case <-childCtx.Done():
                    fmt.Println("Child goroutine canceled:", childCtx.Err())
                    return
                default:
                    fmt.Println("Child goroutine running...")
                    time.Sleep(500 * time.Millisecond)
                }
            }
        }()
        
        // Menunggu sebentar sebelum membatalkan context child
        time.Sleep(1 * time.Second)
        fmt.Println("Canceling child context...")
        childCancel()
    }()
    
    // Menunggu sebentar sebelum membatalkan context parent
    time.Sleep(2 * time.Second)
    fmt.Println("Canceling parent context...")
    cancel()
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(1 * time.Second)
}
```

## Graceful Shutdown

Graceful shutdown adalah proses menutup aplikasi dengan rapi, memastikan semua goroutine selesai dan semua resource dibersihkan dengan benar.

### Karakteristik Graceful Shutdown
- **Signal Handling**: Menangani sinyal sistem seperti SIGINT dan SIGTERM
- **Resource Cleanup**: Membersihkan resource seperti file, koneksi database, dll.
- **Timeout**: Memberikan batas waktu untuk shutdown
- **Ordered Shutdown**: Menutup komponen aplikasi secara berurutan

### Implementasi Graceful Shutdown
```go
// Graceful shutdown sederhana
func main() {
    // Membuat channel untuk sinyal
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    
    // Membuat channel untuk shutdown
    shutdownChan := make(chan struct{})
    
    // Menjalankan goroutine yang dapat dihentikan
    go func() {
        for {
            select {
            case <-shutdownChan:
                fmt.Println("Goroutine shutting down...")
                return
            default:
                fmt.Println("Goroutine running...")
                time.Sleep(500 * time.Millisecond)
            }
        }
    }()
    
    // Menunggu sinyal
    sig := <-sigChan
    fmt.Printf("Received signal: %v\n", sig)
    
    // Memulai proses shutdown
    fmt.Println("Starting graceful shutdown...")
    close(shutdownChan)
    
    // Menunggu sebentar agar goroutine selesai
    time.Sleep(1 * time.Second)
    fmt.Println("Shutdown complete")
}

// Graceful shutdown dengan timeout
func main() {
    // Membuat channel untuk sinyal
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    
    // Membuat channel untuk shutdown
    shutdownChan := make(chan struct{})
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Menjalankan beberapa goroutine yang dapat dihentikan
    for i := 0; i < 3; i++ {
        id := i // Capture loop variable
        wg.Add(1)
        go func() {
            defer wg.Done()
            for {
                select {
                case <-shutdownChan:
                    fmt.Printf("Goroutine %d shutting down...\n", id)
                    return
                default:
                    fmt.Printf("Goroutine %d running...\n", id)
                    time.Sleep(500 * time.Millisecond)
                }
            }
        }()
    }
    
    // Menunggu sinyal
    sig := <-sigChan
    fmt.Printf("Received signal: %v\n", sig)
    
    // Memulai proses shutdown
    fmt.Println("Starting graceful shutdown...")
    close(shutdownChan)
    
    // Menunggu semua goroutine selesai dengan timeout
    done := make(chan struct{})
    go func() {
        wg.Wait()
        close(done)
    }()
    
    select {
    case <-done:
        fmt.Println("All goroutines shut down successfully")
    case <-time.After(2 * time.Second):
        fmt.Println("Shutdown timed out")
    }
}

// Graceful shutdown dengan context
func main() {
    // Membuat channel untuk sinyal
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    
    // Membuat context yang dapat dibatalkan
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    // Menjalankan goroutine yang dapat dihentikan
    go func() {
        for {
            select {
            case <-ctx.Done():
                fmt.Println("Goroutine canceled:", ctx.Err())
                return
            default:
                fmt.Println("Goroutine running...")
                time.Sleep(500 * time.Millisecond)
            }
        }
    }()
    
    // Menunggu sinyal
    sig := <-sigChan
    fmt.Printf("Received signal: %v\n", sig)
    
    // Memulai proses shutdown
    fmt.Println("Starting graceful shutdown...")
    cancel()
    
    // Menunggu sebentar agar goroutine selesai
    time.Sleep(1 * time.Second)
    fmt.Println("Shutdown complete")
}

// Graceful shutdown dengan ordered shutdown
func main() {
    // Membuat channel untuk sinyal
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
    
    // Membuat channel untuk shutdown
    shutdownChan := make(chan struct{})
    
    // Simulasi komponen aplikasi
    components := []string{"database", "cache", "api", "logger"}
    
    // Menjalankan goroutine untuk setiap komponen
    for _, component := range components {
        name := component // Capture loop variable
        go func() {
            for {
                select {
                case <-shutdownChan:
                    fmt.Printf("%s shutting down...\n", name)
                    return
                default:
                    fmt.Printf("%s running...\n", name)
                    time.Sleep(500 * time.Millisecond)
                }
            }
        }()
    }
    
    // Menunggu sinyal
    sig := <-sigChan
    fmt.Printf("Received signal: %v\n", sig)
    
    // Memulai proses shutdown
    fmt.Println("Starting graceful shutdown...")
    
    // Menutup komponen secara berurutan
    for i := len(components) - 1; i >= 0; i-- {
        component := components[i]
        fmt.Printf("Shutting down %s...\n", component)
        // Simulasi proses shutdown
        time.Sleep(200 * time.Millisecond)
    }
    
    // Menutup semua goroutine
    close(shutdownChan)
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(1 * time.Second)
    fmt.Println("Shutdown complete")
}
```

## Kesimpulan

Error handling dalam aplikasi konkuren adalah aspek penting yang perlu diperhatikan dengan baik. Dengan memahami dan mengimplementasikan teknik-teknik seperti error propagation, error groups, context cancellation, dan graceful shutdown, kita dapat mengembangkan aplikasi konkuren yang lebih robust dan mudah dipelihara. Teknik-teknik ini membantu kita mengelola error dengan lebih baik dan mencegah kebocoran goroutine dan resource leak.