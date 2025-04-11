# Tipe Data Dasar

Tipe data adalah fondasi penting dalam pemrograman Go. Go menyediakan berbagai tipe data bawaan yang dapat digunakan untuk menyimpan dan memanipulasi data. Memahami tipe data dasar sangat penting untuk pengembangan yang efektif.

## Tipe Data Primitif

### Tipe Numerik
- **Integer**:
  - `int8`, `int16`, `int32`, `int64`: Integer bertanda
  - `uint8`, `uint16`, `uint32`, `uint64`: Integer tidak bertanda
  - `int`, `uint`: Ukuran tergantung platform (32/64 bit)
  - `byte`: Alias untuk `uint8`
  - `rune`: Alias untuk `int32` (untuk Unicode)

```go
var (
    a int    = 42
    b int8   = 127
    c uint16 = 65535
    d byte   = 255
    e rune   = 'A'
)
```

- **Floating Point**:
  - `float32`: Presisi tunggal (32 bit)
  - `float64`: Presisi ganda (64 bit)

```go
var (
    f float32 = 3.14
    g float64 = 3.14159265359
)
```

- **Complex**:
  - `complex64`: Kompleks dengan float32
  - `complex128`: Kompleks dengan float64

```go
var (
    c1 complex64  = 1 + 2i
    c2 complex128 = 1 + 2i
)
```

### Boolean
- Tipe `bool` dengan nilai `true` atau `false`

```go
var isActive bool = true
```

## String

### Karakteristik String
- **Immutable**: String tidak dapat diubah setelah dibuat
- **UTF-8**: Mendukung encoding Unicode
- **Raw string**: Menggunakan backtick (`) untuk string mentah

```go
var (
    s1 string = "Hello, 世界"
    s2 string = `Ini adalah
    raw string
    dengan multiple lines`
)
```

### Operasi String
- **Concatenation**: Menggunakan operator `+`
- **Length**: Menggunakan `len()`
- **Substring**: Menggunakan slice `[:]`
- **Iteration**: Menggunakan `range`

```go
s := "Hello"
// Concatenation
s = s + " World"

// Length
length := len(s)

// Substring
sub := s[1:5]

// Iteration
for i, r := range s {
    fmt.Printf("index: %d, rune: %c\n", i, r)
}
```

## Array dan Slice

### Array
- **Fixed size**: Ukuran harus ditentukan saat deklarasi
- **Value type**: Dikirim sebagai copy saat passing ke fungsi
- **Comparison**: Dapat dibandingkan dengan `==`

```go
// Deklarasi array
var arr1 [5]int
arr2 := [3]string{"a", "b", "c"}
arr3 := [...]int{1, 2, 3} // Ukuran dihitung otomatis

// Akses dan modifikasi
arr1[0] = 10
value := arr1[0]

// Length
length := len(arr1)
```

### Slice
- **Dynamic size**: Ukuran dapat berubah
- **Reference type**: Dikirim sebagai reference
- **Built on array**: Dibangun di atas array

```go
// Deklarasi slice
var slice1 []int
slice2 := []string{"a", "b", "c"}
slice3 := make([]int, 5, 10) // length=5, capacity=10

// Append
slice1 = append(slice1, 1, 2, 3)

// Slice operations
sub := slice2[1:3]
copy(slice1, slice2)

// Length dan capacity
len := len(slice1)
cap := cap(slice1)
```

## Map

### Karakteristik Map
- **Key-value pairs**: Menyimpan data dalam bentuk pasangan kunci-nilai
- **Unordered**: Urutan tidak dijamin
- **Reference type**: Dikirim sebagai reference

```go
// Deklarasi map
var m1 map[string]int
m2 := map[string]int{"a": 1, "b": 2}
m3 := make(map[string]int)

// Operasi map
m3["key"] = 100
value, exists := m3["key"]
delete(m3, "key")

// Iteration
for key, value := range m2 {
    fmt.Printf("key: %s, value: %d\n", key, value)
}
```

## Struct

### Karakteristik Struct
- **Custom type**: Tipe data yang dapat dikustomisasi
- **Value type**: Dikirim sebagai copy (kecuali pointer)
- **Fields**: Dapat memiliki berbagai tipe data

```go
// Deklarasi struct
type Person struct {
    Name    string
    Age     int
    Address struct {
        Street  string
        City    string
        Country string
    }
}

// Membuat instance
p1 := Person{
    Name: "John",
    Age:  30,
    Address: struct {
        Street  string
        City    string
        Country string
    }{
        Street:  "123 Main St",
        City:    "New York",
        Country: "USA",
    },
}

// Akses fields
name := p1.Name
city := p1.Address.City

// Pointer to struct
p2 := &Person{Name: "Jane", Age: 25}
```

### Struct Tags
- **Metadata**: Informasi tambahan untuk field
- **Serialization**: Digunakan untuk JSON, XML, dll.

```go
type User struct {
    ID        int    `json:"id"`
    Name      string `json:"name"`
    Email     string `json:"email,omitempty"`
    Password  string `json:"-"`
}
```

## Kesimpulan

Memahami tipe data dasar Go adalah langkah penting dalam pengembangan. Setiap tipe data memiliki karakteristik dan penggunaan yang spesifik. Pemilihan tipe data yang tepat akan membuat kode lebih efisien dan mudah dipahami.

Related Docs: [[Map dan Struct]]