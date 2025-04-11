# Fungsi

Fungsi adalah blok kode yang dapat dipanggil untuk melakukan tugas tertentu. Go memiliki sistem fungsi yang kuat dan fleksibel, mendukung berbagai fitur seperti multiple return values, named return values, dan fungsi sebagai first-class citizens.

## Deklarasi Fungsi

### Fungsi Dasar
- **Keyword**: Menggunakan `func`
- **Nama**: Mengikuti konvensi Go (CamelCase)
- **Parameter**: Tipe data harus dideklarasikan
- **Return value**: Tipe data return harus dideklarasikan

```go
// Fungsi dasar
func add(a int, b int) int {
    return a + b
}

// Fungsi dengan multiple parameters
func greet(name string, age int) string {
    return fmt.Sprintf("Hello, %s! You are %d years old.", name, age)
}

// Fungsi tanpa return value
func printMessage(msg string) {
    fmt.Println(msg)
}
```

### Multiple Return Values
- **Syntax**: Menggunakan kurung kurawal untuk multiple return values
- **Usage**: Umum digunakan untuk error handling

```go
// Multiple return values
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// Penggunaan
result, err := divide(10, 2)
if err != nil {
    log.Fatal(err)
}
fmt.Println(result)
```

### Named Return Values
- **Deklarasi**: Mendeklarasikan nama variabel return
- **Naked return**: Mengembalikan nilai variabel yang sudah dideklarasikan

```go
// Named return values
func rectangle(width, height float64) (area float64, perimeter float64) {
    area = width * height
    perimeter = 2 * (width + height)
    return // naked return
}

// Penggunaan
area, perimeter := rectangle(5, 3)
fmt.Printf("Area: %f, Perimeter: %f\n", area, perimeter)
```

## Variadic Functions

### Karakteristik
- **Parameter**: Menggunakan `...` untuk menerima jumlah parameter yang variabel
- **Slice**: Parameter variadic diterima sebagai slice
- **Multiple variadic**: Hanya satu parameter variadic yang diperbolehkan

```go
// Variadic function
func sum(numbers ...int) int {
    total := 0
    for _, num := range numbers {
        total += num
    }
    return total
}

// Penggunaan
fmt.Println(sum(1, 2, 3, 4, 5))
fmt.Println(sum(1, 2))
fmt.Println(sum()) // Returns 0

// Multiple types dengan interface{}
func printAll(args ...interface{}) {
    for _, arg := range args {
        fmt.Printf("%v ", arg)
    }
    fmt.Println()
}
```

## Anonymous Functions

### Fungsi Anonim
- **Deklarasi**: Mendefinisikan fungsi tanpa nama
- **Closure**: Dapat mengakses variabel di scope luarnya
- **Immediate invocation**: Dapat langsung dipanggil

```go
// Anonymous function
func main() {
    // Fungsi anonim
    add := func(a, b int) int {
        return a + b
    }
    fmt.Println(add(5, 3))

    // Immediate invocation
    result := func(x int) int {
        return x * x
    }(5)
    fmt.Println(result)
}
```

### Closure
- **Scope**: Mengakses variabel di scope luarnya
- **State**: Menyimpan state antara pemanggilan

```go
// Counter dengan closure
func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

// Penggunaan
c := counter()
fmt.Println(c()) // 1
fmt.Println(c()) // 2
fmt.Println(c()) // 3
```

## Function Types

### Function as Value
- **Type**: Fungsi dapat digunakan sebagai tipe data
- **Assignment**: Dapat diassign ke variabel
- **Parameters**: Dapat diteruskan sebagai parameter

```go
// Function type
type Operation func(int, int) int

// Function sebagai parameter
func calculate(a, b int, op Operation) int {
    return op(a, b)
}

// Penggunaan
add := func(a, b int) int { return a + b }
subtract := func(a, b int) int { return a - b }

fmt.Println(calculate(5, 3, add))      // 8
fmt.Println(calculate(5, 3, subtract)) // 2
```

## Method

### Method Definition
- **Receiver**: Mendefinisikan tipe yang menerima method
- **Value receiver**: Menggunakan copy dari value
- **Pointer receiver**: Menggunakan pointer ke value

```go
// Struct
type Rectangle struct {
    width  float64
    height float64
}

// Method dengan value receiver
func (r Rectangle) Area() float64 {
    return r.width * r.height
}

// Method dengan pointer receiver
func (r *Rectangle) Scale(factor float64) {
    r.width *= factor
    r.height *= factor
}

// Penggunaan
rect := Rectangle{width: 5, height: 3}
fmt.Println(rect.Area()) // 15
rect.Scale(2)
fmt.Println(rect.Area()) // 60
```

## Defer

### Karakteristik Defer
- **Execution**: Dieksekusi setelah fungsi selesai
- **Stack**: Menggunakan LIFO (Last In First Out)
- **Arguments**: Dievaluasi saat defer dipanggil

```go
// Defer dasar
func main() {
    defer fmt.Println("Cleanup")
    fmt.Println("Main logic")
}

// Multiple defers
func example() {
    defer fmt.Println("First")
    defer fmt.Println("Second")
    defer fmt.Println("Third")
    fmt.Println("Main")
}

// Defer dengan arguments
func example() {
    i := 0
    defer fmt.Println(i) // Prints 0
    i++
}
```

## Panic dan Recover

### Error Handling
- **Panic**: Menghentikan eksekusi normal
- **Recover**: Menangkap panic dan melanjutkan eksekusi
- **Best practices**: Gunakan untuk error yang tidak dapat dipulihkan

```go
// Panic
func riskyOperation() {
    panic("Something went wrong")
}

// Recover
func safeOperation() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered:", r)
        }
    }()
    riskyOperation()
}
```

## Kesimpulan

Fungsi adalah bagian fundamental dari pemrograman Go. Dengan memahami berbagai jenis fungsi dan fitur-fiturnya, kita dapat menulis kode yang lebih modular, reusable, dan maintainable. Penggunaan fungsi yang tepat akan membuat program lebih terstruktur dan mudah dipahami.