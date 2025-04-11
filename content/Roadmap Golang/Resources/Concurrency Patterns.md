# Concurrency Patterns

Concurrency patterns adalah pola-pola desain yang digunakan untuk mengelola goroutines dan komunikasi antar goroutines dalam aplikasi Go. Pola-pola ini membantu kita mengembangkan aplikasi konkuren yang aman, efisien, dan mudah dipelihara.

## Pipeline Pattern

Pipeline pattern adalah pola yang memungkinkan kita untuk memproses data melalui serangkaian tahapan, di mana setiap tahapan dijalankan oleh goroutine terpisah dan data mengalir melalui channel.

### Karakteristik Pipeline
- **Stages**: Serangkaian tahapan pemrosesan
- **Channels**: Komunikasi antar tahapan
- **Data Flow**: Data mengalir dari satu tahapan ke tahapan berikutnya
- **Parallelism**: Tahapan dapat berjalan secara paralel
- **Error Handling**: Penanganan error di setiap tahapan

### Implementasi Pipeline
```go
// Pipeline sederhana
func main() {
    // Membuat channel untuk setiap tahapan
    numbers := make(chan int, 10)
    squares := make(chan int, 10)
    cubes := make(chan int, 10)
    
    // Tahapan 1: Generate numbers
    go func() {
        defer close(numbers)
        for i := 1; i <= 10; i++ {
            numbers <- i
        }
    }()
    
    // Tahapan 2: Square numbers
    go func() {
        defer close(squares)
        for n := range numbers {
            squares <- n * n
        }
    }()
    
    // Tahapan 3: Cube numbers
    go func() {
        defer close(cubes)
        for n := range squares {
            cubes <- n * n * n
        }
    }()
    
    // Mengumpulkan hasil
    for result := range cubes {
        fmt.Println(result)
    }
}

// Pipeline dengan error handling
func main() {
    // Membuat channel untuk setiap tahapan
    numbers := make(chan int, 10)
    squares := make(chan int, 10)
    cubes := make(chan int, 10)
    errors := make(chan error, 10)
    
    // Tahapan 1: Generate numbers
    go func() {
        defer close(numbers)
        for i := 1; i <= 10; i++ {
            numbers <- i
        }
    }()
    
    // Tahapan 2: Square numbers
    go func() {
        defer close(squares)
        for n := range numbers {
            if n < 0 {
                errors <- fmt.Errorf("negative number: %d", n)
                continue
            }
            squares <- n * n
        }
    }()
    
    // Tahapan 3: Cube numbers
    go func() {
        defer close(cubes)
        for n := range squares {
            cubes <- n * n * n
        }
    }()
    
    // Mengumpulkan hasil dan error
    for {
        select {
        case result, ok := <-cubes:
            if !ok {
                return
            }
            fmt.Println(result)
        case err := <-errors:
            fmt.Println("Error:", err)
        }
    }
}

// Pipeline dengan context
func main() {
    // Membuat context dengan timeout
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
    
    // Membuat channel untuk setiap tahapan
    numbers := make(chan int, 10)
    squares := make(chan int, 10)
    cubes := make(chan int, 10)
    
    // Tahapan 1: Generate numbers
    go func() {
        defer close(numbers)
        for i := 1; i <= 10; i++ {
            select {
            case <-ctx.Done():
                return
            case numbers <- i:
                fmt.Printf("Generated: %d\n", i)
            }
        }
    }()
    
    // Tahapan 2: Square numbers
    go func() {
        defer close(squares)
        for n := range numbers {
            select {
            case <-ctx.Done():
                return
            case squares <- n * n:
                fmt.Printf("Squared: %d\n", n * n)
            }
        }
    }()
    
    // Tahapan 3: Cube numbers
    go func() {
        defer close(cubes)
        for n := range squares {
            select {
            case <-ctx.Done():
                return
            case cubes <- n * n * n:
                fmt.Printf("Cubed: %d\n", n * n * n)
            }
        }
    }()
    
    // Mengumpulkan hasil
    for result := range cubes {
        fmt.Println("Result:", result)
    }
}

// Pipeline dengan worker pool
func main() {
    // Membuat channel untuk setiap tahapan
    numbers := make(chan int, 10)
    squares := make(chan int, 10)
    cubes := make(chan int, 10)
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Tahapan 1: Generate numbers
    go func() {
        defer close(numbers)
        for i := 1; i <= 10; i++ {
            numbers <- i
        }
    }()
    
    // Tahapan 2: Square numbers dengan worker pool
    numWorkers := 3
    wg.Add(numWorkers)
    for i := 0; i < numWorkers; i++ {
        go func(id int) {
            defer wg.Done()
            for n := range numbers {
                squares <- n * n
                fmt.Printf("Worker %d squared: %d\n", id, n * n)
            }
        }(i)
    }
    
    // Menutup channel squares setelah semua worker selesai
    go func() {
        wg.Wait()
        close(squares)
    }()
    
    // Tahapan 3: Cube numbers
    go func() {
        defer close(cubes)
        for n := range squares {
            cubes <- n * n * n
        }
    }()
    
    // Mengumpulkan hasil
    for result := range cubes {
        fmt.Println("Result:", result)
    }
}
```

## Fan-Out, Fan-In Pattern

Fan-out, fan-in pattern adalah pola yang memungkinkan kita untuk mendistribusikan pekerjaan ke beberapa goroutine (fan-out) dan kemudian menggabungkan hasilnya (fan-in).

### Karakteristik Fan-Out, Fan-In
- **Fan-Out**: Mendistribusikan pekerjaan ke beberapa goroutine
- **Fan-In**: Menggabungkan hasil dari beberapa goroutine
- **Load Balancing**: Distribusi pekerjaan yang merata
- **Result Aggregation**: Penggabungan hasil dari beberapa goroutine
- **Error Handling**: Penanganan error dari beberapa goroutine

### Implementasi Fan-Out, Fan-In
```go
// Fan-out, fan-in sederhana
func main() {
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
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Fan-out: Mendistribusikan pekerjaan ke beberapa goroutine
    numWorkers := 3
    wg.Add(numWorkers)
    for i := 0; i < numWorkers; i++ {
        go func(id int) {
            defer wg.Done()
            for n := range input {
                // Memproses input
                result := n * n
                fmt.Printf("Worker %d processed: %d\n", id, result)
                
                // Fan-in: Mengirim hasil ke channel output
                output <- result
            }
        }(i)
    }
    
    // Menutup channel output setelah semua worker selesai
    go func() {
        wg.Wait()
        close(output)
    }()
    
    // Mengumpulkan hasil
    for result := range output {
        fmt.Println("Result:", result)
    }
}

// Fan-out, fan-in dengan error handling
func main() {
    // Membuat channel untuk input, output, dan error
    input := make(chan int, 10)
    output := make(chan int, 10)
    errors := make(chan error, 10)
    
    // Mengirim input
    go func() {
        defer close(input)
        for i := 1; i <= 10; i++ {
            input <- i
        }
    }()
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Fan-out: Mendistribusikan pekerjaan ke beberapa goroutine
    numWorkers := 3
    wg.Add(numWorkers)
    for i := 0; i < numWorkers; i++ {
        go func(id int) {
            defer wg.Done()
            for n := range input {
                // Memproses input
                if n < 0 {
                    errors <- fmt.Errorf("negative number: %d", n)
                    continue
                }
                
                result := n * n
                fmt.Printf("Worker %d processed: %d\n", id, result)
                
                // Fan-in: Mengirim hasil ke channel output
                output <- result
            }
        }(i)
    }
    
    // Menutup channel output dan errors setelah semua worker selesai
    go func() {
        wg.Wait()
        close(output)
        close(errors)
    }()
    
    // Mengumpulkan hasil dan error
    for {
        select {
        case result, ok := <-output:
            if !ok {
                return
            }
            fmt.Println("Result:", result)
        case err, ok := <-errors:
            if !ok {
                return
            }
            fmt.Println("Error:", err)
        }
    }
}

// Fan-out, fan-in dengan context
func main() {
    // Membuat context dengan timeout
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
    
    // Membuat channel untuk input dan output
    input := make(chan int, 10)
    output := make(chan int, 10)
    
    // Mengirim input
    go func() {
        defer close(input)
        for i := 1; i <= 10; i++ {
            select {
            case <-ctx.Done():
                return
            case input <- i:
                fmt.Printf("Sent: %d\n", i)
            }
        }
    }()
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Fan-out: Mendistribusikan pekerjaan ke beberapa goroutine
    numWorkers := 3
    wg.Add(numWorkers)
    for i := 0; i < numWorkers; i++ {
        go func(id int) {
            defer wg.Done()
            for n := range input {
                // Memproses input
                result := n * n
                fmt.Printf("Worker %d processed: %d\n", id, result)
                
                // Fan-in: Mengirim hasil ke channel output
                select {
                case <-ctx.Done():
                    return
                case output <- result:
                }
            }
        }(i)
    }
    
    // Menutup channel output setelah semua worker selesai
    go func() {
        wg.Wait()
        close(output)
    }()
    
    // Mengumpulkan hasil
    for result := range output {
        fmt.Println("Result:", result)
    }
}

// Fan-out, fan-in dengan worker pool
func main() {
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
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Fan-out: Mendistribusikan pekerjaan ke beberapa goroutine
    numWorkers := 3
    wg.Add(numWorkers)
    for i := 0; i < numWorkers; i++ {
        go func(id int) {
            defer wg.Done()
            for n := range input {
                // Memproses input
                result := n * n
                fmt.Printf("Worker %d processed: %d\n", id, result)
                
                // Fan-in: Mengirim hasil ke channel output
                output <- result
            }
        }(i)
    }
    
    // Menutup channel output setelah semua worker selesai
    go func() {
        wg.Wait()
        close(output)
    }()
    
    // Mengumpulkan hasil
    for result := range output {
        fmt.Println("Result:", result)
    }
}
```

## Pub/Sub Pattern

Pub/Sub (Publisher/Subscriber) pattern adalah pola yang memungkinkan kita untuk mengimplementasikan komunikasi satu-ke-banyak, di mana publisher mengirim pesan ke beberapa subscriber.

### Karakteristik Pub/Sub
- **Publisher**: Mengirim pesan ke channel
- **Subscriber**: Menerima pesan dari channel
- **Topic**: Kategori pesan
- **Filtering**: Subscriber dapat memfilter pesan berdasarkan topic
- **Asynchronous**: Publisher dan subscriber berjalan secara asynchronous

### Implementasi Pub/Sub
```go
// Pub/Sub sederhana
func main() {
    // Membuat channel untuk pesan
    messages := make(chan string, 10)
    
    // Publisher
    go func() {
        defer close(messages)
        for i := 1; i <= 5; i++ {
            messages <- fmt.Sprintf("Message %d", i)
            fmt.Printf("Published: Message %d\n", i)
            time.Sleep(100 * time.Millisecond)
        }
    }()
    
    // Subscriber 1
    go func() {
        for msg := range messages {
            fmt.Printf("Subscriber 1 received: %s\n", msg)
        }
    }()
    
    // Subscriber 2
    go func() {
        for msg := range messages {
            fmt.Printf("Subscriber 2 received: %s\n", msg)
        }
    }()
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(1 * time.Second)
}

// Pub/Sub dengan topic
type Message struct {
    Topic   string
    Content string
}

func main() {
    // Membuat channel untuk pesan
    messages := make(chan Message, 10)
    
    // Publisher
    go func() {
        defer close(messages)
        topics := []string{"news", "sports", "tech"}
        for i := 1; i <= 9; i++ {
            topic := topics[(i-1)%3]
            messages <- Message{
                Topic:   topic,
                Content: fmt.Sprintf("%s message %d", topic, i),
            }
            fmt.Printf("Published: %s message %d\n", topic, i)
            time.Sleep(100 * time.Millisecond)
        }
    }()
    
    // Subscriber untuk topic "news"
    go func() {
        for msg := range messages {
            if msg.Topic == "news" {
                fmt.Printf("News subscriber received: %s\n", msg.Content)
            }
        }
    }()
    
    // Subscriber untuk topic "sports"
    go func() {
        for msg := range messages {
            if msg.Topic == "sports" {
                fmt.Printf("Sports subscriber received: %s\n", msg.Content)
            }
        }
    }()
    
    // Subscriber untuk topic "tech"
    go func() {
        for msg := range messages {
            if msg.Topic == "tech" {
                fmt.Printf("Tech subscriber received: %s\n", msg.Content)
            }
        }
    }()
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(1 * time.Second)
}

// Pub/Sub dengan multiple channels
func main() {
    // Membuat channel untuk setiap topic
    newsChan := make(chan string, 10)
    sportsChan := make(chan string, 10)
    techChan := make(chan string, 10)
    
    // Publisher
    go func() {
        defer func() {
            close(newsChan)
            close(sportsChan)
            close(techChan)
        }()
        
        for i := 1; i <= 9; i++ {
            switch i % 3 {
            case 0:
                newsChan <- fmt.Sprintf("News message %d", i)
                fmt.Printf("Published: News message %d\n", i)
            case 1:
                sportsChan <- fmt.Sprintf("Sports message %d", i)
                fmt.Printf("Published: Sports message %d\n", i)
            case 2:
                techChan <- fmt.Sprintf("Tech message %d", i)
                fmt.Printf("Published: Tech message %d\n", i)
            }
            time.Sleep(100 * time.Millisecond)
        }
    }()
    
    // Subscriber untuk news
    go func() {
        for msg := range newsChan {
            fmt.Printf("News subscriber received: %s\n", msg)
        }
    }()
    
    // Subscriber untuk sports
    go func() {
        for msg := range sportsChan {
            fmt.Printf("Sports subscriber received: %s\n", msg)
        }
    }()
    
    // Subscriber untuk tech
    go func() {
        for msg := range techChan {
            fmt.Printf("Tech subscriber received: %s\n", msg)
        }
    }()
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(1 * time.Second)
}

// Pub/Sub dengan select
func main() {
    // Membuat channel untuk pesan
    messages := make(chan Message, 10)
    
    // Publisher
    go func() {
        defer close(messages)
        topics := []string{"news", "sports", "tech"}
        for i := 1; i <= 9; i++ {
            topic := topics[(i-1)%3]
            messages <- Message{
                Topic:   topic,
                Content: fmt.Sprintf("%s message %d", topic, i),
            }
            fmt.Printf("Published: %s message %d\n", topic, i)
            time.Sleep(100 * time.Millisecond)
        }
    }()
    
    // Subscriber dengan select
    go func() {
        for {
            select {
            case msg, ok := <-messages:
                if !ok {
                    return
                }
                fmt.Printf("Subscriber received: %s\n", msg.Content)
            case <-time.After(500 * time.Millisecond):
                fmt.Println("Subscriber timeout")
                return
            }
        }
    }()
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(1 * time.Second)
}
```

## Worker Pool Pattern

Worker pool pattern adalah pola yang memungkinkan kita untuk mengelola sejumlah goroutine yang bekerja secara paralel untuk memproses tugas-tugas dari antrian.

### Karakteristik Worker Pool
- **Fixed Size**: Jumlah worker tetap dan terbatas
- **Job Queue**: Antrian tugas yang akan diproses
- **Load Balancing**: Distribusi tugas yang merata
- **Resource Control**: Kontrol penggunaan resource
- **Graceful Shutdown**: Penutupan worker pool yang rapi

### Implementasi Worker Pool
```go
// Worker pool sederhana
func main() {
    // Membuat channel untuk jobs dan results
    jobs := make(chan int, 10)
    results := make(chan int, 10)
    
    // Membuat worker pool
    numWorkers := 3
    for i := 0; i < numWorkers; i++ {
        go worker(i, jobs, results)
    }
    
    // Mengirim jobs ke worker pool
    for i := 1; i <= 10; i++ {
        jobs <- i
    }
    close(jobs)
    
    // Mengumpulkan results
    for i := 0; i < 10; i++ {
        result := <-results
        fmt.Println("Result:", result)
    }
}

// Worker function
func worker(id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        // Memproses job
        result := job * 2
        fmt.Printf("Worker %d processed job %d: %d\n", id, job, result)
        
        // Mengirim hasil ke channel results
        results <- result
    }
}

// Worker pool dengan WaitGroup
func main() {
    // Membuat channel untuk jobs dan results
    jobs := make(chan int, 10)
    results := make(chan int, 10)
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Membuat worker pool
    numWorkers := 3
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            worker(id, jobs, results)
        }(i)
    }
    
    // Mengirim jobs ke worker pool
    for i := 1; i <= 10; i++ {
        jobs <- i
    }
    close(jobs)
    
    // Menunggu semua worker selesai
    go func() {
        wg.Wait()
        close(results)
    }()
    
    // Mengumpulkan results
    for result := range results {
        fmt.Println("Result:", result)
    }
}

// Worker pool dengan context
func main() {
    // Membuat context dengan timeout
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
    
    // Membuat channel untuk jobs dan results
    jobs := make(chan int, 10)
    results := make(chan int, 10)
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Membuat worker pool
    numWorkers := 3
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            workerWithContext(ctx, id, jobs, results)
        }(i)
    }
    
    // Mengirim jobs ke worker pool
    go func() {
        defer close(jobs)
        for i := 1; i <= 10; i++ {
            select {
            case <-ctx.Done():
                return
            case jobs <- i:
                fmt.Printf("Sent job %d\n", i)
            }
        }
    }()
    
    // Menunggu semua worker selesai
    go func() {
        wg.Wait()
        close(results)
    }()
    
    // Mengumpulkan results
    for result := range results {
        fmt.Println("Result:", result)
    }
}

// Worker function dengan context
func workerWithContext(ctx context.Context, id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        // Memproses job
        result := job * 2
        fmt.Printf("Worker %d processed job %d: %d\n", id, job, result)
        
        // Mengirim hasil ke channel results
        select {
        case <-ctx.Done():
            return
        case results <- result:
        }
    }
}
```

## Kesimpulan

Concurrency patterns adalah bagian penting dari pengembangan aplikasi konkuren di Go. Dengan memahami dan mengimplementasikan pola-pola seperti pipeline, fan-out/fan-in, pub/sub, dan worker pool, kita dapat mengembangkan aplikasi konkuren yang aman, efisien, dan mudah dipelihara. Pola-pola ini membantu kita mengelola goroutines dan komunikasi antar goroutines dengan lebih baik.