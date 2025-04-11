# Control Flow

Control flow adalah mekanisme yang mengatur bagaimana program dieksekusi. Go menyediakan beberapa struktur kontrol yang memungkinkan kita membuat keputusan dan mengulangi operasi. Memahami control flow sangat penting untuk membuat program yang logis dan efisien.

## If-Else

### If Statement Dasar
- **Kondisi**: Harus berupa ekspresi boolean
- **Kurung kurawal**: Wajib digunakan
- **Initializer**: Dapat mendeklarasikan variabel dalam if statement

```go
// If dasar
if x > 0 {
    fmt.Println("Positif")
}

// If dengan initializer
if x := 10; x > 0 {
    fmt.Println("Positif")
}

// If-else
if x > 0 {
    fmt.Println("Positif")
} else {
    fmt.Println("Negatif atau nol")
}

// If-else if-else
if x > 0 {
    fmt.Println("Positif")
} else if x < 0 {
    fmt.Println("Negatif")
} else {
    fmt.Println("Nol")
}
```

### If dengan Error Handling
- **Pattern umum**: Menggunakan if untuk menangani error
- **Multiple return values**: Memanfaatkan multiple return values untuk error handling

```go
// Error handling
if err := doSomething(); err != nil {
    log.Fatal(err)
}

// Multiple return values
if value, err := getValue(); err != nil {
    log.Printf("Error: %v", err)
} else {
    fmt.Printf("Value: %v", value)
}
```

## Switch

### Switch Dasar
- **Expression switch**: Membandingkan nilai ekspresi
- **Type switch**: Membandingkan tipe data
- **Fallthrough**: Melanjutkan ke case berikutnya
- **Default case**: Dieksekusi jika tidak ada case yang cocok

```go
// Switch dasar
switch x {
case 1:
    fmt.Println("Satu")
case 2:
    fmt.Println("Dua")
default:
    fmt.Println("Lainnya")
}

// Switch dengan expression
switch {
case x < 0:
    fmt.Println("Negatif")
case x > 0:
    fmt.Println("Positif")
default:
    fmt.Println("Nol")
}

// Switch dengan initializer
switch x := 10; x {
case 10:
    fmt.Println("Sepuluh")
}

// Switch dengan fallthrough
switch x {
case 1:
    fmt.Println("Satu")
    fallthrough
case 2:
    fmt.Println("Dua")
}
```

### Type Switch
- **Type assertion**: Menggunakan `.(type)` untuk type switching
- **Interface{}**: Bekerja dengan interface kosong

```go
// Type switch
var i interface{} = "hello"

switch v := i.(type) {
case int:
    fmt.Printf("Integer: %v\n", v)
case string:
    fmt.Printf("String: %v\n", v)
default:
    fmt.Printf("Tipe lain: %T\n", v)
}
```

## For Loops

### For Dasar
- **Tiga komponen**: Initializer, condition, dan post statement
- **Infinite loop**: Menggunakan `for` tanpa kondisi
- **While-style**: Menggunakan `for` dengan satu kondisi

```go
// For dasar
for i := 0; i < 5; i++ {
    fmt.Println(i)
}

// Infinite loop
for {
    fmt.Println("Loop forever")
    break // Untuk menghentikan loop
}

// While-style
i := 0
for i < 5 {
    fmt.Println(i)
    i++
}
```

### For Range
- **Iterasi**: Menggunakan `range` untuk iterasi
- **Collections**: Bekerja dengan array, slice, map, string, channel
- **Multiple values**: Mendapatkan index/key dan value

```go
// Array/Slice
numbers := []int{1, 2, 3, 4, 5}
for i, v := range numbers {
    fmt.Printf("index: %d, value: %d\n", i, v)
}

// Map
m := map[string]int{"a": 1, "b": 2}
for k, v := range m {
    fmt.Printf("key: %s, value: %d\n", k, v)
}

// String
for i, r := range "Hello" {
    fmt.Printf("index: %d, rune: %c\n", i, r)
}

// Channel
ch := make(chan int)
go func() {
    ch <- 1
    ch <- 2
    close(ch)
}()
for v := range ch {
    fmt.Println(v)
}
```

## Break dan Continue

### Break
- **Loop termination**: Menghentikan loop saat ini
- **Labeled break**: Menghentikan loop terluar yang dilabeli

```go
// Break dasar
for i := 0; i < 10; i++ {
    if i == 5 {
        break
    }
    fmt.Println(i)
}

// Labeled break
OuterLoop:
    for i := 0; i < 5; i++ {
        for j := 0; j < 5; j++ {
            if i*j == 10 {
                break OuterLoop
            }
        }
    }
```

### Continue
- **Skip iteration**: Melanjutkan ke iterasi berikutnya
- **Labeled continue**: Melanjutkan ke iterasi berikutnya dari loop terluar yang dilabeli

```go
// Continue dasar
for i := 0; i < 5; i++ {
    if i == 2 {
        continue
    }
    fmt.Println(i)
}

// Labeled continue
OuterLoop:
    for i := 0; i < 5; i++ {
        for j := 0; j < 5; j++ {
            if i*j == 0 {
                continue OuterLoop
            }
        }
    }
```

## Goto

### Penggunaan Goto
- **Label**: Mendefinisikan titik lompatan
- **Jump**: Melompat ke label yang ditentukan
- **Best practices**: Gunakan dengan hati-hati, hindari untuk flow control yang kompleks

```go
// Goto dasar
func main() {
    i := 0
start:
    if i < 5 {
        fmt.Println(i)
        i++
        goto start
    }
}

// Goto untuk error handling
func process() error {
    if err := step1(); err != nil {
        goto cleanup
    }
    if err := step2(); err != nil {
        goto cleanup
    }
    return nil
cleanup:
    // Cleanup code
    return err
}
```

## Kesimpulan

Control flow adalah bagian fundamental dari pemrograman Go. Dengan memahami dan menggunakan struktur kontrol dengan tepat, kita dapat membuat program yang lebih terstruktur, mudah dibaca, dan efisien. Setiap struktur kontrol memiliki penggunaan yang spesifik, dan pemilihan yang tepat akan membuat kode lebih maintainable.