# Race Conditions

Race condition adalah situasi di mana perilaku program bergantung pada urutan relatif eksekusi goroutines. Race condition dapat menyebabkan bug yang sulit dideteksi dan diperbaiki, terutama dalam aplikasi konkuren.

## Detecting Race Conditions

### Karakteristik Race Condition
- **Non-deterministic**: Hasil eksekusi dapat berbeda setiap kali program dijalankan
- **Timing-dependent**: Bergantung pada timing eksekusi goroutines
- **Data Corruption**: Dapat menyebabkan data corruption atau inkonsistensi
- **Heisenbug**: Bug yang sulit direproduksi dan di-debug

### Contoh Race Condition
```go
// Race condition pada counter
func main() {
    var counter int
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            // Race condition: multiple goroutines mengakses counter tanpa sinkronisasi
            counter++
            fmt.Println("Counter:", counter)
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    fmt.Println("Final counter:", counter)
}

// Race condition pada map
func main() {
    // Membuat map
    data := make(map[string]int)
    
    // Menjalankan goroutines yang mengakses map
    for i := 0; i < 10; i++ {
        go func(id int) {
            key := fmt.Sprintf("key%d", id%3)
            
            // Race condition: multiple goroutines mengakses map tanpa sinkronisasi
            data[key]++
            fmt.Printf("key: %s, value: %d\n", key, data[key])
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Menampilkan hasil akhir
    for i := 0; i < 3; i++ {
        key := fmt.Sprintf("key%d", i)
        fmt.Printf("Final value for %s: %d\n", key, data[key])
    }
}

// Race condition pada slice
func main() {
    // Membuat slice
    data := make([]int, 0, 10)
    
    // Menjalankan goroutines yang mengakses slice
    for i := 0; i < 10; i++ {
        go func(val int) {
            // Race condition: multiple goroutines mengakses slice tanpa sinkronisasi
            data = append(data, val)
            fmt.Println("Data:", data)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    fmt.Println("Final data:", data)
}
```

## Race Detector

### Go Race Detector
- **-race flag**: Mengaktifkan race detector saat kompilasi dan eksekusi
- **Deteksi**: Mendeteksi race condition pada memory access
- **Laporan**: Menghasilkan laporan yang menjelaskan race condition
- **Overhead**: Menambahkan overhead pada eksekusi program

### Contoh Penggunaan
```go
// Program dengan race condition
func main() {
    var counter int
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            counter++
            fmt.Println("Counter:", counter)
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    fmt.Println("Final counter:", counter)
}

// Menjalankan dengan race detector
// go run -race main.go
```

### Contoh Output Race Detector
```
==================
WARNING: DATA RACE
Read at 0x00c000018180 by goroutine 7:
  main.main.func1()
      /path/to/main.go:10 +0x38

Previous write at 0x00c000018180 by goroutine 6:
  main.main.func1()
      /path/to/main.go:9 +0x44

Goroutine 7 (running) created at:
  main.main()
      /path/to/main.go:8 +0x5e

Goroutine 6 (finished) created at:
  main.main()
      /path/to/main.go:8 +0x5e
==================
Final counter: 10
Found 1 data race(s)
```

## Preventing Race Conditions

### Teknik Pencegahan
- **Mutex**: Menggunakan mutex untuk mengunci resource
- **Channel**: Menggunakan channel untuk komunikasi antar goroutines
- **Atomic Operations**: Menggunakan operasi atomik untuk akses data
- **Immutable Data**: Menggunakan data yang tidak dapat diubah
- **Copy on Write**: Menggunakan teknik copy on write untuk data yang diubah

### Contoh dengan Mutex
```go
// Mencegah race condition dengan mutex
func main() {
    var counter int
    var mu sync.Mutex
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            mu.Lock() // Mengunci sebelum mengakses counter
            counter++
            fmt.Println("Counter:", counter)
            mu.Unlock() // Membuka kunci setelah selesai
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    fmt.Println("Final counter:", counter)
}

// Mencegah race condition pada map dengan mutex
func main() {
    // Membuat map dengan mutex
    type SafeMap struct {
        mu   sync.Mutex
        data map[string]int
    }
    
    safeMap := &SafeMap{
        data: make(map[string]int),
    }
    
    // Menjalankan goroutines yang mengakses map
    for i := 0; i < 10; i++ {
        go func(id int) {
            key := fmt.Sprintf("key%d", id%3)
            
            safeMap.mu.Lock() // Mengunci sebelum mengakses map
            safeMap.data[key]++
            value := safeMap.data[key]
            safeMap.mu.Unlock() // Membuka kunci setelah selesai
            
            fmt.Printf("key: %s, value: %d\n", key, value)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Menampilkan hasil akhir
    safeMap.mu.Lock()
    for i := 0; i < 3; i++ {
        key := fmt.Sprintf("key%d", i)
        fmt.Printf("Final value for %s: %d\n", key, safeMap.data[key])
    }
    safeMap.mu.Unlock()
}

// Mencegah race condition pada slice dengan mutex
func main() {
    // Membuat slice dengan mutex
    type SafeSlice struct {
        mu   sync.Mutex
        data []int
    }
    
    safeSlice := &SafeSlice{
        data: make([]int, 0, 10),
    }
    
    // Menjalankan goroutines yang mengakses slice
    for i := 0; i < 10; i++ {
        go func(val int) {
            safeSlice.mu.Lock() // Mengunci sebelum mengakses slice
            safeSlice.data = append(safeSlice.data, val)
            data := safeSlice.data
            safeSlice.mu.Unlock() // Membuka kunci setelah selesai
            
            fmt.Println("Data:", data)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    safeSlice.mu.Lock()
    fmt.Println("Final data:", safeSlice.data)
    safeSlice.mu.Unlock()
}
```

### Contoh dengan Channel
```go
// Mencegah race condition dengan channel
func main() {
    // Membuat channel untuk counter
    counterCh := make(chan int, 1)
    counterCh <- 0 // Inisialisasi counter
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            counter := <-counterCh // Mengambil counter dari channel
            counter++
            fmt.Println("Counter:", counter)
            counterCh <- counter // Mengembalikan counter ke channel
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Mengambil counter terakhir
    counter := <-counterCh
    fmt.Println("Final counter:", counter)
}

// Mencegah race condition pada map dengan channel
func main() {
    // Membuat channel untuk map
    mapCh := make(chan map[string]int, 1)
    mapCh <- make(map[string]int) // Inisialisasi map
    
    // Menjalankan goroutines yang mengakses map
    for i := 0; i < 10; i++ {
        go func(id int) {
            key := fmt.Sprintf("key%d", id%3)
            
            data := <-mapCh // Mengambil map dari channel
            data[key]++
            value := data[key]
            mapCh <- data // Mengembalikan map ke channel
            
            fmt.Printf("key: %s, value: %d\n", key, value)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Mengambil map terakhir
    data := <-mapCh
    
    // Menampilkan hasil akhir
    for i := 0; i < 3; i++ {
        key := fmt.Sprintf("key%d", i)
        fmt.Printf("Final value for %s: %d\n", key, data[key])
    }
}

// Mencegah race condition pada slice dengan channel
func main() {
    // Membuat channel untuk slice
    sliceCh := make(chan []int, 1)
    sliceCh <- make([]int, 0, 10) // Inisialisasi slice
    
    // Menjalankan goroutines yang mengakses slice
    for i := 0; i < 10; i++ {
        go func(val int) {
            data := <-sliceCh // Mengambil slice dari channel
            data = append(data, val)
            sliceCh <- data // Mengembalikan slice ke channel
            
            fmt.Println("Data:", data)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Mengambil slice terakhir
    data := <-sliceCh
    fmt.Println("Final data:", data)
}
```

## Atomic Operations

### Atomic Package
- **atomic.Value**: Menyimpan dan mengakses nilai secara atomik
- **atomic.Add**: Menambah nilai secara atomik
- **atomic.Load**: Mengambil nilai secara atomik
- **atomic.Store**: Menyimpan nilai secara atomik
- **atomic.Swap**: Menukar nilai secara atomik
- **atomic.CompareAndSwap**: Menukar nilai jika sama dengan nilai yang diharapkan

### Contoh Penggunaan
```go
// Mencegah race condition dengan atomic.Value
func main() {
    // Membuat atomic.Value untuk counter
    var counter atomic.Value
    counter.Store(0) // Inisialisasi counter
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            for {
                // Mengambil counter secara atomik
                oldValue := counter.Load().(int)
                newValue := oldValue + 1
                
                // Menyimpan counter secara atomik
                if counter.CompareAndSwap(oldValue, newValue) {
                    fmt.Println("Counter:", newValue)
                    break
                }
            }
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Mengambil counter terakhir
    fmt.Println("Final counter:", counter.Load())
}

// Mencegah race condition dengan atomic.Add
func main() {
    // Membuat counter dengan atomic.Add
    var counter int64
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            // Menambah counter secara atomik
            newValue := atomic.AddInt64(&counter, 1)
            fmt.Println("Counter:", newValue)
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Mengambil counter terakhir
    fmt.Println("Final counter:", atomic.LoadInt64(&counter))
}

// Mencegah race condition dengan atomic.CompareAndSwap
func main() {
    // Membuat counter dengan atomic.CompareAndSwap
    var counter int64
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            for {
                // Mengambil counter secara atomik
                oldValue := atomic.LoadInt64(&counter)
                newValue := oldValue + 1
                
                // Menukar counter secara atomik jika sama dengan nilai yang diharapkan
                if atomic.CompareAndSwapInt64(&counter, oldValue, newValue) {
                    fmt.Println("Counter:", newValue)
                    break
                }
            }
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Mengambil counter terakhir
    fmt.Println("Final counter:", atomic.LoadInt64(&counter))
}
```

## Immutable Data

### Teknik Immutable Data
- **Copy on Write**: Membuat salinan data saat diubah
- **Functional Programming**: Menggunakan pendekatan functional programming
- **Value Semantics**: Menggunakan value semantics daripada reference semantics
- **Immutability**: Memastikan data tidak dapat diubah setelah dibuat

### Contoh Penggunaan
```go
// Mencegah race condition dengan immutable data
func main() {
    // Membuat channel untuk counter
    counterCh := make(chan int, 1)
    counterCh <- 0 // Inisialisasi counter
    
    // Menjalankan 10 goroutines yang mengakses counter
    for i := 0; i < 10; i++ {
        go func() {
            counter := <-counterCh // Mengambil counter dari channel
            newCounter := counter + 1 // Membuat salinan counter
            counterCh <- newCounter // Mengembalikan salinan counter ke channel
            
            fmt.Println("Counter:", newCounter)
        }()
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Mengambil counter terakhir
    counter := <-counterCh
    fmt.Println("Final counter:", counter)
}

// Mencegah race condition pada map dengan immutable data
func main() {
    // Membuat channel untuk map
    mapCh := make(chan map[string]int, 1)
    mapCh <- make(map[string]int) // Inisialisasi map
    
    // Menjalankan goroutines yang mengakses map
    for i := 0; i < 10; i++ {
        go func(id int) {
            key := fmt.Sprintf("key%d", id%3)
            
            data := <-mapCh // Mengambil map dari channel
            newData := make(map[string]int) // Membuat salinan map
            
            // Menyalin data dari map lama ke map baru
            for k, v := range data {
                newData[k] = v
            }
            
            // Mengubah salinan map
            newData[key]++
            value := newData[key]
            mapCh <- newData // Mengembalikan salinan map ke channel
            
            fmt.Printf("key: %s, value: %d\n", key, value)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Mengambil map terakhir
    data := <-mapCh
    
    // Menampilkan hasil akhir
    for i := 0; i < 3; i++ {
        key := fmt.Sprintf("key%d", i)
        fmt.Printf("Final value for %s: %d\n", key, data[key])
    }
}

// Mencegah race condition pada slice dengan immutable data
func main() {
    // Membuat channel untuk slice
    sliceCh := make(chan []int, 1)
    sliceCh <- make([]int, 0, 10) // Inisialisasi slice
    
    // Menjalankan goroutines yang mengakses slice
    for i := 0; i < 10; i++ {
        go func(val int) {
            data := <-sliceCh // Mengambil slice dari channel
            newData := make([]int, len(data), cap(data)) // Membuat salinan slice
            
            // Menyalin data dari slice lama ke slice baru
            copy(newData, data)
            
            // Mengubah salinan slice
            newData = append(newData, val)
            sliceCh <- newData // Mengembalikan salinan slice ke channel
            
            fmt.Println("Data:", newData)
        }(i)
    }
    
    // Menunggu sebentar agar goroutines selesai
    time.Sleep(100 * time.Millisecond)
    
    // Mengambil slice terakhir
    data := <-sliceCh
    fmt.Println("Final data:", data)
}
```

## Kesimpulan

Race condition adalah masalah serius dalam aplikasi konkuren yang dapat menyebabkan bug yang sulit dideteksi dan diperbaiki. Dengan menggunakan teknik seperti mutex, channel, atomic operations, dan immutable data, kita dapat mencegah race condition dan mengembangkan aplikasi konkuren yang aman dan efisien. Race detector adalah alat yang sangat berguna untuk mendeteksi race condition dalam aplikasi Go.