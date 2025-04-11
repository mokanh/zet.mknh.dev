# Channels

Channels adalah mekanisme komunikasi yang memungkinkan goroutines untuk berkomunikasi dan menyinkronkan eksekusi mereka. Mereka adalah fitur fundamental dalam Go untuk implementasi model komunikasi "Don't communicate by sharing memory; share memory by communicating."

## Channel Basics

### Karakteristik Channels
- **Thread-Safe**: Channels aman digunakan oleh multiple goroutines
- **First-In-First-Out (FIFO)**: Data dikirim dan diterima dalam urutan yang sama
- **Blocking**: Operasi pengiriman dan penerimaan dapat memblokir goroutine
- **Bidirectional**: Channels dapat digunakan untuk mengirim dan menerima data

### Membuat dan Menggunakan Channels
```go
// Membuat channel
func main() {
    // Membuat unbuffered channel
    ch := make(chan int)
    
    // Mengirim data ke channel (dalam goroutine)
    go func() {
        ch <- 42 // Mengirim nilai 42 ke channel
    }()
    
    // Menerima data dari channel
    value := <-ch // Menerima nilai dari channel
    fmt.Println("Nilai diterima:", value)
}

// Channel dengan tipe data tertentu
func main() {
    // Channel untuk string
    strCh := make(chan string)
    
    // Channel untuk struct
    type Person struct {
        Name string
        Age  int
    }
    personCh := make(chan Person)
    
    // Mengirim data
    go func() {
        strCh <- "Hello"
        personCh <- Person{Name: "Alice", Age: 30}
    }()
    
    // Menerima data
    str := <-strCh
    person := <-personCh
    
    fmt.Println(str, person)
}
```

## Buffered vs Unbuffered Channels

### Unbuffered Channels
- **Karakteristik**: Tidak memiliki buffer, pengiriman dan penerimaan harus terjadi secara bersamaan
- **Blocking**: Pengiriman memblokir sampai ada penerima, penerimaan memblokir sampai ada pengirim
- **Sinkronisasi**: Efektif untuk sinkronisasi antar goroutines

```go
// Unbuffered channel
func main() {
    ch := make(chan int) // Unbuffered channel
    
    go func() {
        fmt.Println("Mengirim data...")
        ch <- 42 // Blokir sampai ada penerima
        fmt.Println("Data terkirim!")
    }()
    
    time.Sleep(100 * time.Millisecond) // Memberikan waktu untuk goroutine mulai
    
    fmt.Println("Menerima data...")
    value := <-ch // Blokir sampai ada pengirim
    fmt.Println("Data diterima:", value)
}
```

### Buffered Channels
- **Karakteristik**: Memiliki buffer dengan kapasitas tertentu
- **Blocking**: Pengiriman memblokir hanya jika buffer penuh, penerimaan memblokir hanya jika buffer kosong
- **Asinkronisasi**: Efektif untuk komunikasi asinkron

```go
// Buffered channel
func main() {
    ch := make(chan int, 3) // Buffered channel dengan kapasitas 3
    
    // Mengirim data (tidak memblokir sampai buffer penuh)
    ch <- 1
    ch <- 2
    ch <- 3
    
    fmt.Println("Buffer penuh, mengirim data keempat akan memblokir")
    
    // Menerima data
    fmt.Println(<-ch) // 1
    fmt.Println(<-ch) // 2
    fmt.Println(<-ch) // 3
    
    fmt.Println("Buffer kosong, menerima data akan memblokir")
}
```

## Channel Operations

### Pengiriman dan Penerimaan
```go
// Operasi dasar channel
func main() {
    ch := make(chan int)
    
    // Pengiriman
    go sendData(ch)
    
    // Penerimaan
    receiveData(ch)
}

func sendData(ch chan<- int) {
    for i := 0; i < 5; i++ {
        ch <- i
        fmt.Printf("Mengirim: %d\n", i)
        time.Sleep(100 * time.Millisecond)
    }
    close(ch) // Menutup channel setelah selesai mengirim
}

func receiveData(ch <-chan int) {
    for {
        value, ok := <-ch
        if !ok {
            fmt.Println("Channel ditutup")
            break
        }
        fmt.Printf("Menerima: %d\n", value)
    }
}
```

### Iterasi Channel
```go
// Menggunakan for-range untuk iterasi channel
func main() {
    ch := make(chan int)
    
    go func() {
        for i := 0; i < 5; i++ {
            ch <- i
            time.Sleep(100 * time.Millisecond)
        }
        close(ch)
    }()
    
    // Iterasi channel
    for value := range ch {
        fmt.Printf("Menerima: %d\n", value)
    }
    
    fmt.Println("Iterasi selesai")
}
```

### Menutup Channel
```go
// Menutup channel
func main() {
    ch := make(chan int)
    
    go func() {
        ch <- 1
        ch <- 2
        close(ch) // Menutup channel
        // ch <- 3 // Panic: mengirim ke channel yang sudah ditutup
    }()
    
    // Menerima data
    fmt.Println(<-ch) // 1
    fmt.Println(<-ch) // 2
    
    // Mengecek apakah channel ditutup
    value, ok := <-ch
    if !ok {
        fmt.Println("Channel ditutup, tidak ada data lagi")
    } else {
        fmt.Println("Nilai:", value)
    }
}
```

## Channel Direction

### Channel Direction
- **Bidirectional**: `chan T` - dapat mengirim dan menerima
- **Send-only**: `chan<- T` - hanya dapat mengirim
- **Receive-only**: `<-chan T` - hanya dapat menerima

### Contoh Penggunaan
```go
// Channel direction
func main() {
    ch := make(chan int)
    
    // Mengirim data
    go sendOnly(ch)
    
    // Menerima data
    receiveOnly(ch)
}

// Fungsi yang hanya dapat mengirim ke channel
func sendOnly(ch chan<- int) {
    for i := 0; i < 5; i++ {
        ch <- i
        fmt.Printf("Mengirim: %d\n", i)
        time.Sleep(100 * time.Millisecond)
    }
    close(ch)
}

// Fungsi yang hanya dapat menerima dari channel
func receiveOnly(ch <-chan int) {
    for value := range ch {
        fmt.Printf("Menerima: %d\n", value)
    }
    fmt.Println("Channel ditutup")
}
```

### Manfaat Channel Direction
```go
// Manfaat channel direction untuk keamanan tipe
func processData(data []int, results chan<- int, errors chan<- error) {
    for _, value := range data {
        if value < 0 {
            errors <- fmt.Errorf("nilai negatif tidak diizinkan: %d", value)
            continue
        }
        results <- value * 2
    }
    close(results)
    close(errors)
}

func main() {
    data := []int{1, -2, 3, -4, 5}
    results := make(chan int)
    errors := make(chan error)
    
    go processData(data, results, errors)
    
    // Menerima hasil
    for {
        select {
        case result, ok := <-results:
            if !ok {
                results = nil
                continue
            }
            fmt.Printf("Hasil: %d\n", result)
        case err, ok := <-errors:
            if !ok {
                errors = nil
                continue
            }
            fmt.Printf("Error: %v\n", err)
        default:
            if results == nil && errors == nil {
                return
            }
        }
    }
}
```

## Channel Patterns

### Pipeline Pattern
```go
// Pipeline pattern
func main() {
    // Generate numbers
    numbers := make(chan int)
    go func() {
        defer close(numbers)
        for i := 0; i < 10; i++ {
            numbers <- i
        }
    }()
    
    // Square numbers
    squares := make(chan int)
    go func() {
        defer close(squares)
        for n := range numbers {
            squares <- n * n
        }
    }()
    
    // Filter even squares
    evenSquares := make(chan int)
    go func() {
        defer close(evenSquares)
        for s := range squares {
            if s%2 == 0 {
                evenSquares <- s
            }
        }
    }()
    
    // Print results
    for s := range evenSquares {
        fmt.Println(s)
    }
}
```

### Fan-Out, Fan-In Pattern
```go
// Fan-Out, Fan-In pattern
func main() {
    // Generate numbers
    numbers := make(chan int)
    go func() {
        defer close(numbers)
        for i := 0; i < 20; i++ {
            numbers <- i
        }
    }()
    
    // Fan-Out: Distribute work to multiple goroutines
    workers := 3
    results := make(chan int)
    var wg sync.WaitGroup
    
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for n := range numbers {
                // Simulate work
                time.Sleep(50 * time.Millisecond)
                results <- n * n
            }
        }(i)
    }
    
    // Fan-In: Collect results
    go func() {
        wg.Wait()
        close(results)
    }()
    
    // Print results
    for r := range results {
        fmt.Println(r)
    }
}
```

### Timeout Pattern
```go
// Timeout pattern
func main() {
    ch := make(chan string)
    
    // Simulate work
    go func() {
        time.Sleep(2 * time.Second)
        ch <- "Hasil"
    }()
    
    // Wait for result with timeout
    select {
    case result := <-ch:
        fmt.Println("Hasil:", result)
    case <-time.After(1 * time.Second):
        fmt.Println("Timeout!")
    }
}
```

## Kesimpulan

Channels adalah mekanisme komunikasi yang kuat dalam Go yang memungkinkan goroutines untuk berkomunikasi dan menyinkronkan eksekusi mereka. Dengan memahami berbagai jenis channel, operasi channel, dan pola-pola umum, kita dapat mengembangkan aplikasi konkuren yang efisien dan aman. Penting untuk diingat bahwa channels adalah fitur fundamental dalam Go dan merupakan bagian integral dari model konkurensi Go.