# Array dan Slice

Array dan slice adalah struktur data fundamental dalam Go. Array adalah koleksi elemen dengan ukuran tetap, sementara slice adalah referensi ke array yang lebih fleksibel. Memahami perbedaan dan penggunaan keduanya sangat penting untuk pengembangan yang efektif.

## Array

### Karakteristik Array
- **Fixed size**: Ukuran array harus ditentukan saat deklarasi
- **Value type**: Array adalah value type, dikopi saat diassign
- **Zero value**: Array diinisialisasi dengan zero value dari tipe elemennya
- **Index**: Menggunakan index berbasis 0

```go
// Deklarasi array
var arr1 [5]int                    // [0 0 0 0 0]
arr2 := [3]string{"a", "b", "c"}  // ["a" "b" "c"]
arr3 := [...]int{1, 2, 3}         // [1 2 3]

// Akses dan modifikasi
fmt.Println(arr2[0])  // "a"
arr2[1] = "x"         // ["a" "x" "c"]

// Array sebagai value type
arr4 := arr2          // Copy array
arr4[0] = "z"         // arr2 tidak berubah
```

### Array Operations
- **Length**: Menggunakan `len()`
- **Iteration**: Menggunakan `for` loop
- **Comparison**: Membandingkan array dengan `==`
- **Multi-dimensional**: Array dengan multiple dimensi

```go
// Array operations
arr := [5]int{1, 2, 3, 4, 5}

// Length
fmt.Println(len(arr))  // 5

// Iteration
for i := 0; i < len(arr); i++ {
    fmt.Println(arr[i])
}

// Range iteration
for i, v := range arr {
    fmt.Printf("arr[%d] = %d\n", i, v)
}

// Comparison
arr1 := [3]int{1, 2, 3}
arr2 := [3]int{1, 2, 3}
fmt.Println(arr1 == arr2)  // true

// Multi-dimensional
matrix := [2][3]int{
    {1, 2, 3},
    {4, 5, 6},
}
```

## Slice

### Karakteristik Slice
- **Dynamic size**: Ukuran slice dapat berubah
- **Reference type**: Slice adalah referensi ke array
- **Three components**: Pointer, length, dan capacity
- **Zero value**: `nil` untuk slice kosong

```go
// Deklarasi slice
var slice1 []int                    // nil
slice2 := []int{1, 2, 3}           // [1 2 3]
slice3 := make([]int, 5)           // [0 0 0 0 0]
slice4 := make([]int, 5, 10)       // length=5, capacity=10

// Slice dari array
arr := [5]int{1, 2, 3, 4, 5}
slice5 := arr[1:4]                 // [2 3 4]
```

### Slice Operations
- **Append**: Menambah elemen ke slice
- **Copy**: Menyalin elemen antar slice
- **Slicing**: Membuat slice baru dari slice yang ada
- **Capacity**: Menggunakan `cap()` untuk melihat kapasitas

```go
// Slice operations
slice := []int{1, 2, 3}

// Append
slice = append(slice, 4)           // [1 2 3 4]
slice = append(slice, 5, 6, 7)     // [1 2 3 4 5 6 7]

// Copy
src := []int{1, 2, 3}
dst := make([]int, len(src))
n := copy(dst, src)                // n = 3

// Slicing
slice = slice[1:4]                 // [2 3 4]
slice = slice[:2]                  // [2 3]
slice = slice[1:]                  // [3]

// Capacity
fmt.Println(cap(slice))            // melihat kapasitas
```

### Slice Best Practices
- **Pre-allocation**: Alokasikan kapasitas awal jika ukuran diketahui
- **Reuse**: Reuse slice untuk menghindari alokasi berlebihan
- **Nil check**: Selalu cek slice nil sebelum operasi
- **Bounds check**: Hindari index out of bounds

```go
// Best practices
// Pre-allocation
slice := make([]int, 0, 100)       // length=0, capacity=100

// Reuse
slice = slice[:0]                  // clear slice, keep capacity

// Nil check
if slice != nil {
    // operasi pada slice
}

// Bounds check
if i >= 0 && i < len(slice) {
    // akses slice[i]
}
```

## Array vs Slice

### Perbedaan Utama
- **Size**: Array fixed, slice dynamic
- **Type**: Array value type, slice reference type
- **Memory**: Array contiguous, slice reference
- **Usage**: Array untuk fixed size, slice untuk dynamic

```go
// Array vs Slice
// Array
arr := [3]int{1, 2, 3}
arrCopy := arr      // Copy array
arrCopy[0] = 10     // arr tidak berubah

// Slice
slice := []int{1, 2, 3}
sliceRef := slice   // Reference slice
sliceRef[0] = 10    // slice berubah
```

### Penggunaan
- **Array**: Untuk data dengan ukuran tetap
- **Slice**: Untuk data yang dinamis
- **Function parameters**: Gunakan slice untuk parameter
- **Return values**: Gunakan slice untuk return value

```go
// Usage examples
// Array untuk fixed size data
type Point struct {
    x, y float64
}
type Triangle struct {
    vertices [3]Point  // Fixed size array
}

// Slice untuk dynamic data
func processItems(items []int) []int {
    result := make([]int, 0, len(items))
    for _, item := range items {
        if item > 0 {
            result = append(result, item)
        }
    }
    return result
}
```

## Kesimpulan

Array dan slice adalah struktur data fundamental dalam Go. Array cocok untuk data dengan ukuran tetap, sementara slice lebih fleksibel untuk data dinamis. Memahami karakteristik dan penggunaan keduanya sangat penting untuk pengembangan yang efektif.