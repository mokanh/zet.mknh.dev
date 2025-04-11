# Pointer

Pointer adalah konsep penting dalam Go yang memungkinkan kita bekerja dengan referensi ke data daripada data itu sendiri. Memahami pointer sangat penting untuk pengembangan yang efisien dan efektif dalam Go.

## Pointer Basics

### Deklarasi dan Penggunaan
- **Operator &**: Mendapatkan alamat memori
- **Operator ***: Mendereferensikan pointer
- **Zero value**: Nil pointer adalah `nil`

```go
// Pointer dasar
var p *int
i := 42
p = &i
fmt.Println(*p) // 42

// Pointer dengan new
p := new(int)
*p = 42
fmt.Println(*p) // 42

// Multiple pointers
x := 10
p1 := &x
p2 := &x
*p1 = 20
fmt.Println(*p2) // 20
```

### Pointer vs Value
- **Value semantics**: Menggunakan copy dari data
- **Pointer semantics**: Menggunakan referensi ke data
- **Memory efficiency**: Pointer lebih efisien untuk data besar

```go
// Value semantics
func incrementValue(x int) {
    x++
}

// Pointer semantics
func incrementPointer(x *int) {
    *x++
}

// Penggunaan
x := 10
incrementValue(x)
fmt.Println(x) // 10 (tidak berubah)

incrementPointer(&x)
fmt.Println(x) // 11 (berubah)
```

## Pointer Receivers

### Method dengan Pointer Receiver
- **Syntax**: `func (p *Type) Method()`
- **Mutability**: Dapat mengubah nilai struct
- **Efficiency**: Menghindari copy data besar

```go
// Struct
type Person struct {
    Name string
    Age  int
}

// Method dengan pointer receiver
func (p *Person) SetAge(age int) {
    p.Age = age
}

// Method dengan value receiver
func (p Person) GetAge() int {
    return p.Age
}

// Penggunaan
person := Person{Name: "John", Age: 30}
person.SetAge(31)
fmt.Println(person.GetAge()) // 31
```

### Value vs Pointer Receiver
- **Value receiver**: Menggunakan copy dari struct
- **Pointer receiver**: Menggunakan referensi ke struct
- **Consistency**: Gunakan tipe receiver yang konsisten

```go
// Value receiver
func (p Person) String() string {
    return fmt.Sprintf("%s (%d years)", p.Name, p.Age)
}

// Pointer receiver
func (p *Person) Birthday() {
    p.Age++
}

// Penggunaan
person := &Person{Name: "John", Age: 30}
fmt.Println(person.String()) // John (30 years)
person.Birthday()
fmt.Println(person.String()) // John (31 years)
```

## Nil Pointers

### Handling Nil Pointers
- **Panic**: Dereferencing nil pointer menyebabkan panic
- **Checking**: Selalu cek pointer sebelum dereferencing
- **Initialization**: Inisialisasi pointer sebelum penggunaan

```go
// Nil pointer handling
func processPointer(p *int) error {
    if p == nil {
        return errors.New("nil pointer")
    }
    *p = 42
    return nil
}

// Safe dereferencing
func safeDereference(p *int) int {
    if p == nil {
        return 0
    }
    return *p
}
```

### Zero Value vs Nil
- **Zero value**: Nilai default untuk tipe data
- **Nil**: Ketiadaan nilai untuk pointer
- **Comparison**: Perbandingan dengan nil

```go
// Zero value vs nil
var (
    p1 *int        // nil
    p2 *int = nil  // nil
    p3 *int = &0   // pointer ke 0
)

// Checking
if p1 == nil {
    fmt.Println("p1 is nil")
}
```

## Pointer Arithmetic

### Pointer Operations
- **Increment**: Tidak ada pointer arithmetic di Go
- **Comparison**: Dapat membandingkan pointer
- **Conversion**: Dapat mengkonversi antara tipe pointer

```go
// Pointer comparison
p1 := &x
p2 := &x
fmt.Println(p1 == p2) // true

// Pointer conversion
type MyInt int
var x MyInt = 42
p1 := &x
p2 := (*int)(unsafe.Pointer(p1))
fmt.Println(*p2) // 42
```

### unsafe.Pointer
- **Usage**: Untuk pointer arithmetic yang tidak aman
- **Conversion**: Mengkonversi antara tipe pointer
- **Caution**: Gunakan dengan hati-hati

```go
// unsafe.Pointer
type MyStruct struct {
    x int
    y int
}

func main() {
    s := MyStruct{1, 2}
    p := &s
    // Mengakses field dengan offset
    y := *(*int)(unsafe.Pointer(uintptr(unsafe.Pointer(p)) + unsafe.Offsetof(s.y)))
    fmt.Println(y) // 2
}
```

## Pointer Best Practices

### Guidelines
- **Clarity**: Gunakan pointer ketika perlu mengubah data
- **Efficiency**: Gunakan pointer untuk data besar
- **Safety**: Selalu cek nil pointer
- **Consistency**: Gunakan tipe receiver yang konsisten

```go
// Good pointer usage
type User struct {
    ID   int
    Name string
}

// Constructor
func NewUser(id int, name string) *User {
    return &User{
        ID:   id,
        Name: name,
    }
}

// Method dengan pointer receiver
func (u *User) UpdateName(name string) {
    u.Name = name
}

// Method dengan value receiver
func (u User) String() string {
    return fmt.Sprintf("User{ID: %d, Name: %s}", u.ID, u.Name)
}
```

### Common Patterns
- **Constructor**: Mengembalikan pointer ke struct
- **Builder**: Menggunakan pointer untuk method chaining
- **Option pattern**: Menggunakan pointer untuk optional parameters

```go
// Builder pattern
type UserBuilder struct {
    user *User
}

func NewUserBuilder() *UserBuilder {
    return &UserBuilder{user: &User{}}
}

func (b *UserBuilder) SetID(id int) *UserBuilder {
    b.user.ID = id
    return b
}

func (b *UserBuilder) SetName(name string) *UserBuilder {
    b.user.Name = name
    return b
}

func (b *UserBuilder) Build() *User {
    return b.user
}

// Usage
user := NewUserBuilder().
    SetID(1).
    SetName("John").
    Build()
```

## Kesimpulan

Pointer adalah fitur penting dalam Go yang memungkinkan kita bekerja dengan data secara efisien. Dengan memahami dan menggunakan pointer dengan tepat, kita dapat menulis kode yang lebih efisien dan efektif.