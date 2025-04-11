# Map dan Struct

Map dan struct adalah dua struktur data penting dalam Go yang digunakan untuk mengorganisir dan menyimpan data. Map menyediakan cara untuk menyimpan data dalam bentuk key-value pairs, sementara struct memungkinkan kita membuat tipe data kustom yang dapat mengelompokkan data terkait.

## Map

### Karakteristik Map
- **Key-Value pairs**: Menyimpan data dalam bentuk pasangan key-value
- **Unordered**: Urutan elemen tidak dijamin
- **Reference type**: Map adalah reference type
- **Zero value**: `nil` untuk map kosong
- **Key uniqueness**: Key harus unik dalam satu map

```go
// Deklarasi map
var map1 map[string]int            // nil map
map2 := make(map[string]int)       // empty map
map3 := map[string]int{            // map dengan nilai awal
    "a": 1,
    "b": 2,
    "c": 3,
}

// Akses dan modifikasi
fmt.Println(map3["a"])            // 1
map3["d"] = 4                     // menambah elemen baru
map3["a"] = 10                    // mengubah nilai
delete(map3, "b")                 // menghapus elemen
```

### Map Operations
- **Check existence**: Menggunakan multiple assignment
- **Length**: Menggunakan `len()`
- **Iteration**: Menggunakan `for range`
- **Clear**: Menggunakan `make()` atau reassignment

```go
// Map operations
m := map[string]int{"a": 1, "b": 2, "c": 3}

// Check existence
value, exists := m["a"]
if exists {
    fmt.Printf("Value: %d\n", value)
}

// Length
fmt.Println(len(m))  // 3

// Iteration
for key, value := range m {
    fmt.Printf("%s: %d\n", key, value)
}

// Clear map
m = make(map[string]int)  // atau m = map[string]int{}
```

### Map Best Practices
- **Initialization**: Selalu inisialisasi map sebelum penggunaan
- **Concurrency**: Gunakan `sync.Map` untuk concurrent access
- **Memory**: Perhatikan penggunaan memori untuk map besar
- **Key type**: Gunakan tipe yang comparable sebagai key

```go
// Best practices
// Proper initialization
m := make(map[string]int)

// Concurrent access
var sm sync.Map
sm.Store("key", "value")
value, ok := sm.Load("key")

// Memory efficient
// Pre-allocate capacity if size is known
m := make(map[string]int, 100)

// Appropriate key type
type User struct {
    ID   int
    Name string
}
// Valid: map[int]User
// Invalid: map[User]string (User tidak comparable)
```

## Struct

### Karakteristik Struct
- **Custom type**: Tipe data yang dapat dikustomisasi
- **Value type**: Struct adalah value type
- **Field types**: Dapat memiliki field dengan tipe berbeda
- **Zero value**: Setiap field diinisialisasi dengan zero value

```go
// Deklarasi struct
type Person struct {
    Name    string
    Age     int
    Address string
}

// Inisialisasi struct
p1 := Person{"John", 30, "New York"}  // positional
p2 := Person{                         // named
    Name:    "Jane",
    Age:     25,
    Address: "London",
}
var p3 Person                         // zero value
```

### Struct Operations
- **Field access**: Menggunakan dot notation
- **Pointer**: Menggunakan pointer untuk efisiensi
- **Embedding**: Struct dapat di-embed dalam struct lain
- **Methods**: Menambahkan method ke struct

```go
// Struct operations
type Employee struct {
    Person              // embedding
    ID     int
    Salary float64
}

// Field access
e := Employee{
    Person: Person{Name: "John", Age: 30},
    ID:     1001,
    Salary: 50000,
}
fmt.Println(e.Name)    // "John"
fmt.Println(e.Salary)  // 50000

// Methods
func (p Person) SayHello() {
    fmt.Printf("Hello, I'm %s\n", p.Name)
}

// Pointer receiver
func (p *Person) UpdateAge(age int) {
    p.Age = age
}
```

### Struct Best Practices
- **Field naming**: Gunakan PascalCase untuk exported fields
- **Tags**: Gunakan struct tags untuk metadata
- **Composition**: Gunakan embedding untuk composition
- **Immutability**: Pertimbangkan immutability untuk thread safety

```go
// Best practices
// Field naming dan tags
type User struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    CreatedAt time.Time `json:"created_at"`
}

// Composition
type Animal struct {
    Name string
}

type Dog struct {
    Animal        // embedding
    Breed string
}

// Immutability
type ImmutablePerson struct {
    name string
    age  int
}

func NewImmutablePerson(name string, age int) ImmutablePerson {
    return ImmutablePerson{name: name, age: age}
}

func (p ImmutablePerson) GetName() string {
    return p.name
}
```

## Map vs Struct

### Perbedaan Utama
- **Type safety**: Struct lebih type-safe
- **Performance**: Struct lebih efisien untuk fixed fields
- **Flexibility**: Map lebih fleksibel untuk dynamic data
- **Memory**: Struct lebih efisien dalam penggunaan memori

```go
// Map vs Struct
// Map untuk dynamic data
config := map[string]interface{}{
    "name":    "app",
    "version": 1.0,
    "debug":   true,
}

// Struct untuk fixed data
type Config struct {
    Name    string
    Version float64
    Debug   bool
}
```

### Penggunaan
- **Map**: Untuk data dinamis atau konfigurasi
- **Struct**: Untuk data dengan struktur tetap
- **Combination**: Menggunakan keduanya sesuai kebutuhan

```go
// Usage examples
// Map untuk konfigurasi
type Config struct {
    Settings map[string]string
    Options  map[string]interface{}
}

// Struct untuk data model
type User struct {
    ID       int
    Name     string
    Settings map[string]string  // dynamic settings
}
```

## Kesimpulan

Map dan struct adalah struktur data fundamental dalam Go yang melayani tujuan berbeda. Map ideal untuk data dinamis dan key-value pairs, sementara struct lebih cocok untuk data dengan struktur tetap. Memahami kapan dan bagaimana menggunakan keduanya sangat penting untuk pengembangan yang efektif.