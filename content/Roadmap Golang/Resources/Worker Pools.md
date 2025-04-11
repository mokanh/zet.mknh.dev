# Worker Pools

Worker pool adalah pola desain yang memungkinkan kita untuk mengelola sejumlah goroutine yang bekerja secara paralel untuk memproses tugas-tugas dari antrian. Worker pool sangat berguna untuk mengontrol penggunaan resource dan mengoptimalkan performa aplikasi.

## Worker Pool Pattern

### Karakteristik Worker Pool
- **Fixed Size**: Jumlah worker tetap dan terbatas
- **Job Queue**: Antrian tugas yang akan diproses
- **Load Balancing**: Distribusi tugas yang merata
- **Resource Control**: Kontrol penggunaan resource
- **Graceful Shutdown**: Penutupan worker pool yang rapi

### Implementasi Dasar
```go
// Worker pool sederhana
func main() {
    // Membuat channel untuk jobs dan results
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    
    // Membuat worker pool
    numWorkers := 3
    for i := 0; i < numWorkers; i++ {
        go worker(i, jobs, results)
    }
    
    // Mengirim jobs ke worker pool
    for i := 0; i < 10; i++ {
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
        fmt.Printf("Worker %d processing job %d\n", id, job)
        
        // Mengirim hasil ke channel results
        results <- result
    }
}

// Worker pool dengan WaitGroup
func main() {
    // Membuat channel untuk jobs dan results
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    
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
    for i := 0; i < 10; i++ {
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

// Worker function
func worker(id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        // Memproses job
        result := job * 2
        fmt.Printf("Worker %d processing job %d\n", id, job)
        
        // Mengirim hasil ke channel results
        results <- result
    }
}
```

## Job Queues

### Karakteristik Job Queue
- **FIFO**: First In First Out
- **Buffered**: Dapat menyimpan sejumlah job
- **Priority**: Dapat mengimplementasikan antrian prioritas
- **Timeout**: Dapat menambahkan timeout untuk job
- **Retry**: Dapat mengimplementasikan mekanisme retry

### Implementasi Job Queue
```go
// Job queue dengan prioritas
type Job struct {
    ID       int
    Priority int
    Data     interface{}
}

func main() {
    // Membuat channel untuk jobs dan results
    jobs := make(chan Job, 100)
    results := make(chan interface{}, 100)
    
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
    jobs <- Job{ID: 1, Priority: 1, Data: "Low priority"}
    jobs <- Job{ID: 2, Priority: 2, Data: "Medium priority"}
    jobs <- Job{ID: 3, Priority: 3, Data: "High priority"}
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

// Worker function
func worker(id int, jobs <-chan Job, results chan<- interface{}) {
    for job := range jobs {
        // Memproses job
        fmt.Printf("Worker %d processing job %d with priority %d\n", id, job.ID, job.Priority)
        
        // Mengirim hasil ke channel results
        results <- job.Data
    }
}

// Job queue dengan timeout
func main() {
    // Membuat channel untuk jobs dan results
    jobs := make(chan Job, 100)
    results := make(chan interface{}, 100)
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Membuat worker pool
    numWorkers := 3
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            workerWithTimeout(id, jobs, results)
        }(i)
    }
    
    // Mengirim jobs ke worker pool
    jobs <- Job{ID: 1, Priority: 1, Data: "Job 1"}
    jobs <- Job{ID: 2, Priority: 2, Data: "Job 2"}
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

// Worker function dengan timeout
func workerWithTimeout(id int, jobs <-chan Job, results chan<- interface{}) {
    for job := range jobs {
        // Membuat context dengan timeout
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()
        
        // Membuat channel untuk hasil
        done := make(chan interface{})
        
        // Memproses job dalam goroutine terpisah
        go func() {
            // Simulasi pemrosesan job
            time.Sleep(2 * time.Second)
            done <- job.Data
        }()
        
        // Menunggu hasil atau timeout
        select {
        case result := <-done:
            fmt.Printf("Worker %d completed job %d\n", id, job.ID)
            results <- result
        case <-ctx.Done():
            fmt.Printf("Worker %d timed out on job %d\n", id, job.ID)
            results <- fmt.Sprintf("Timeout processing job %d", job.ID)
        }
    }
}

// Job queue dengan retry
func main() {
    // Membuat channel untuk jobs dan results
    jobs := make(chan Job, 100)
    results := make(chan interface{}, 100)
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Membuat worker pool
    numWorkers := 3
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            workerWithRetry(id, jobs, results)
        }(i)
    }
    
    // Mengirim jobs ke worker pool
    jobs <- Job{ID: 1, Priority: 1, Data: "Job 1"}
    jobs <- Job{ID: 2, Priority: 2, Data: "Job 2"}
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

// Worker function dengan retry
func workerWithRetry(id int, jobs <-chan Job, results chan<- interface{}) {
    for job := range jobs {
        // Mencoba memproses job dengan retry
        var result interface{}
        var err error
        
        for attempt := 1; attempt <= 3; attempt++ {
            result, err = processJob(job)
            if err == nil {
                break
            }
            fmt.Printf("Worker %d failed to process job %d (attempt %d): %v\n", id, job.ID, attempt, err)
            time.Sleep(time.Duration(attempt) * time.Second)
        }
        
        if err != nil {
            fmt.Printf("Worker %d failed to process job %d after 3 attempts\n", id, job.ID)
            results <- fmt.Sprintf("Failed to process job %d", job.ID)
        } else {
            fmt.Printf("Worker %d completed job %d\n", id, job.ID)
            results <- result
        }
    }
}

// Fungsi untuk memproses job
func processJob(job Job) (interface{}, error) {
    // Simulasi pemrosesan job yang mungkin gagal
    if rand.Float64() < 0.5 {
        return nil, fmt.Errorf("random error")
    }
    return job.Data, nil
}
```

## Rate Limiting

### Karakteristik Rate Limiting
- **Fixed Rate**: Membatasi jumlah job per waktu
- **Burst**: Mengizinkan burst dalam batas tertentu
- **Token Bucket**: Menggunakan algoritma token bucket
- **Leaky Bucket**: Menggunakan algoritma leaky bucket
- **Adaptive**: Menyesuaikan rate berdasarkan beban

### Implementasi Rate Limiting
```go
// Rate limiting dengan time.Ticker
func main() {
    // Membuat channel untuk jobs dan results
    jobs := make(chan Job, 100)
    results := make(chan interface{}, 100)
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Membuat worker pool dengan rate limiting
    numWorkers := 3
    rateLimiter := time.NewTicker(100 * time.Millisecond)
    defer rateLimiter.Stop()
    
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            workerWithRateLimit(id, jobs, results, rateLimiter)
        }(i)
    }
    
    // Mengirim jobs ke worker pool
    for i := 0; i < 10; i++ {
        jobs <- Job{ID: i, Priority: 1, Data: fmt.Sprintf("Job %d", i)}
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

// Worker function dengan rate limiting
func workerWithRateLimit(id int, jobs <-chan Job, results chan<- interface{}, rateLimiter *time.Ticker) {
    for job := range jobs {
        // Menunggu rate limiter
        <-rateLimiter.C
        
        // Memproses job
        fmt.Printf("Worker %d processing job %d\n", id, job.ID)
        results <- job.Data
    }
}

// Rate limiting dengan token bucket
type TokenBucket struct {
    tokens         int
    capacity       int
    refillRate     time.Duration
    refillAmount   int
    lastRefillTime time.Time
    mu             sync.Mutex
}

func NewTokenBucket(capacity int, refillRate time.Duration, refillAmount int) *TokenBucket {
    return &TokenBucket{
        tokens:         capacity,
        capacity:       capacity,
        refillRate:     refillRate,
        refillAmount:   refillAmount,
        lastRefillTime: time.Now(),
    }
}

func (tb *TokenBucket) Take() bool {
    tb.mu.Lock()
    defer tb.mu.Unlock()
    
    // Mengisi token
    now := time.Now()
    elapsed := now.Sub(tb.lastRefillTime)
    if elapsed >= tb.refillRate {
        tb.tokens = min(tb.capacity, tb.tokens+tb.refillAmount)
        tb.lastRefillTime = now
    }
    
    // Mengambil token
    if tb.tokens > 0 {
        tb.tokens--
        return true
    }
    return false
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}

func main() {
    // Membuat channel untuk jobs dan results
    jobs := make(chan Job, 100)
    results := make(chan interface{}, 100)
    
    // Membuat WaitGroup untuk sinkronisasi
    var wg sync.WaitGroup
    
    // Membuat token bucket
    bucket := NewTokenBucket(5, time.Second, 1)
    
    // Membuat worker pool dengan token bucket
    numWorkers := 3
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            workerWithTokenBucket(id, jobs, results, bucket)
        }(i)
    }
    
    // Mengirim jobs ke worker pool
    for i := 0; i < 10; i++ {
        jobs <- Job{ID: i, Priority: 1, Data: fmt.Sprintf("Job %d", i)}
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

// Worker function dengan token bucket
func workerWithTokenBucket(id int, jobs <-chan Job, results chan<- interface{}, bucket *TokenBucket) {
    for job := range jobs {
        // Menunggu token
        for !bucket.Take() {
            time.Sleep(100 * time.Millisecond)
        }
        
        // Memproses job
        fmt.Printf("Worker %d processing job %d\n", id, job.ID)
        results <- job.Data
    }
}
```

## Load Balancing

### Karakteristik Load Balancing
- **Round Robin**: Distribusi tugas secara bergantian
- **Least Load**: Distribusi ke worker dengan beban terkecil
- **Weighted**: Distribusi berdasarkan bobot worker
- **Adaptive**: Menyesuaikan distribusi berdasarkan performa
- **Sticky**: Mempertahankan tugas ke worker yang sama

### Implementasi Load Balancing
```go
// Load balancing dengan round robin
type WorkerPool struct {
    workers []chan Job
    current int
    mu      sync.Mutex
}

func NewWorkerPool(numWorkers int, bufferSize int) *WorkerPool {
    pool := &WorkerPool{
        workers: make([]chan Job, numWorkers),
    }
    
    for i := 0; i < numWorkers; i++ {
        pool.workers[i] = make(chan Job, bufferSize)
    }
    
    return pool
}

func (p *WorkerPool) Start(results chan<- interface{}) {
    for i, workerChan := range p.workers {
        go worker(i, workerChan, results)
    }
}

func (p *WorkerPool) Submit(job Job) {
    p.mu.Lock()
    p.workers[p.current] <- job
    p.current = (p.current + 1) % len(p.workers)
    p.mu.Unlock()
}

func (p *WorkerPool) Stop() {
    for _, workerChan := range p.workers {
        close(workerChan)
    }
}

func main() {
    // Membuat worker pool
    pool := NewWorkerPool(3, 10)
    results := make(chan interface{}, 100)
    
    // Memulai worker pool
    pool.Start(results)
    
    // Mengirim jobs ke worker pool
    for i := 0; i < 10; i++ {
        pool.Submit(Job{ID: i, Priority: 1, Data: fmt.Sprintf("Job %d", i)})
    }
    
    // Mengumpulkan results
    for i := 0; i < 10; i++ {
        result := <-results
        fmt.Println("Result:", result)
    }
    
    // Menghentikan worker pool
    pool.Stop()
}

// Worker function
func worker(id int, jobs <-chan Job, results chan<- interface{}) {
    for job := range jobs {
        // Memproses job
        fmt.Printf("Worker %d processing job %d\n", id, job.ID)
        results <- job.Data
    }
}

// Load balancing dengan least load
type WorkerPool struct {
    workers []*Worker
    mu      sync.Mutex
}

type Worker struct {
    jobs    chan Job
    load    int
    mu      sync.Mutex
}

func NewWorkerPool(numWorkers int, bufferSize int) *WorkerPool {
    pool := &WorkerPool{
        workers: make([]*Worker, numWorkers),
    }
    
    for i := 0; i < numWorkers; i++ {
        pool.workers[i] = &Worker{
            jobs: make(chan Job, bufferSize),
            load: 0,
        }
    }
    
    return pool
}

func (p *WorkerPool) Start(results chan<- interface{}) {
    for i, worker := range p.workers {
        go worker.process(i, results)
    }
}

func (p *WorkerPool) Submit(job Job) {
    p.mu.Lock()
    defer p.mu.Unlock()
    
    // Mencari worker dengan beban terkecil
    minLoad := math.MaxInt32
    var selectedWorker *Worker
    
    for _, worker := range p.workers {
        worker.mu.Lock()
        if worker.load < minLoad {
            minLoad = worker.load
            selectedWorker = worker
        }
        worker.mu.Unlock()
    }
    
    // Mengirim job ke worker yang dipilih
    selectedWorker.mu.Lock()
    selectedWorker.load++
    selectedWorker.mu.Unlock()
    selectedWorker.jobs <- job
}

func (p *WorkerPool) Stop() {
    for _, worker := range p.workers {
        close(worker.jobs)
    }
}

func (w *Worker) process(id int, results chan<- interface{}) {
    for job := range w.jobs {
        // Memproses job
        fmt.Printf("Worker %d processing job %d\n", id, job.ID)
        results <- job.Data
        
        // Mengurangi beban
        w.mu.Lock()
        w.load--
        w.mu.Unlock()
    }
}

func main() {
    // Membuat worker pool
    pool := NewWorkerPool(3, 10)
    results := make(chan interface{}, 100)
    
    // Memulai worker pool
    pool.Start(results)
    
    // Mengirim jobs ke worker pool
    for i := 0; i < 10; i++ {
        pool.Submit(Job{ID: i, Priority: 1, Data: fmt.Sprintf("Job %d", i)})
    }
    
    // Mengumpulkan results
    for i := 0; i < 10; i++ {
        result := <-results
        fmt.Println("Result:", result)
    }
    
    // Menghentikan worker pool
    pool.Stop()
}
```

## Kesimpulan

Worker pool adalah pola desain yang sangat berguna untuk mengelola goroutine dalam aplikasi Go. Dengan menggunakan worker pool, kita dapat mengontrol penggunaan resource, mengoptimalkan performa, dan mengimplementasikan berbagai fitur seperti job queue, rate limiting, dan load balancing. Worker pool juga memungkinkan kita untuk mengembangkan aplikasi konkuren yang lebih aman dan efisien.