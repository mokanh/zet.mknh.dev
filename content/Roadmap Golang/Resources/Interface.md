# Interface

Interface adalah salah satu fitur paling powerful dalam Go. Interface mendefinisikan kontrak yang harus diimplementasikan oleh tipe data lain. Dengan interface, Go mencapai polimorfisme dan loose coupling antara komponen.

## Interface Dasar

### Definisi Interface
- **Method set**: Kumpulan method yang harus diimplementasikan
- **Implicit implementation**: Implementasi interface bersifat implisit
- **Duck typing**: "If it walks like a duck and quacks like a duck, it's a duck"

```go
// Interface dasar
type Writer interface {
    Write([]byte) (int, error)
}

// Implementasi interface
type FileWriter struct {
    file *os.File
}

func (f *FileWriter) Write(data []byte) (int, error) {
    return f.file.Write(data)
}
```

### Interface Kosong
- **interface{}**: Dapat menampung tipe data apapun
- **Type assertion**: Mengkonversi interface{} ke tipe spesifik
- **Type switch**: Menangani berbagai tipe data

```go
// Interface kosong
func printValue(v interface{}) {
    fmt.Printf("Value: %v, Type: %T\n", v, v)
}

// Type assertion
func processValue(v interface{}) {
    if str, ok := v.(string); ok {
        fmt.Println("String:", str)
    }
}

// Type switch
func handleValue(v interface{}) {
    switch val := v.(type) {
    case string:
        fmt.Println("String:", val)
    case int:
        fmt.Println("Integer:", val)
    default:
        fmt.Println("Unknown type")
    }
}
```

## Interface Composition

### Interface Embedding
- **Composition**: Menggabungkan beberapa interface
- **Method set**: Gabungan dari semua method
- **Nesting**: Interface dapat di-embed dalam interface lain

```go
// Interface composition
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type ReadWriter interface {
    Reader
    Writer
}

// Implementasi
type FileReadWriter struct {
    file *os.File
}

func (f *FileReadWriter) Read(p []byte) (n int, err error) {
    return f.file.Read(p)
}

func (f *FileReadWriter) Write(p []byte) (n int, err error) {
    return f.file.Write(p)
}
```

### Interface Segregation
- **Small interfaces**: Interface yang fokus pada satu tanggung jawab
- **Composition**: Menggabungkan interface kecil menjadi lebih besar
- **Flexibility**: Memungkinkan implementasi yang lebih fleksibel

```go
// Interface segregation
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

// Composition
type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}
```

## Type Assertions

### Type Assertion Dasar
- **Syntax**: `value.(Type)`
- **Safety**: Menggunakan `ok` untuk mengecek keberhasilan
- **Usage**: Mengkonversi interface ke tipe spesifik

```go
// Type assertion
func processInterface(v interface{}) {
    // Safe assertion
    if str, ok := v.(string); ok {
        fmt.Println("String:", str)
    }

    // Unsafe assertion (will panic if wrong)
    str := v.(string)
    fmt.Println("String:", str)
}
```

### Type Switch
- **Pattern**: Menggunakan `switch` dengan `.(type)`
- **Cases**: Menangani berbagai tipe data
- **Default**: Menangani tipe yang tidak dikenal

```go
// Type switch
func handleInterface(v interface{}) {
    switch val := v.(type) {
    case string:
        fmt.Println("String:", val)
    case int:
        fmt.Println("Integer:", val)
    case float64:
        fmt.Println("Float:", val)
    case []int:
        fmt.Println("Slice:", val)
    default:
        fmt.Printf("Unknown type: %T\n", val)
    }
}
```

## Interface Best Practices

### Design Guidelines
- **Small interfaces**: Buat interface yang kecil dan fokus
- **Accept interfaces**: Terima interface sebagai parameter
- **Return structs**: Kembalikan struct konkret
- **Interface segregation**: Pisahkan interface berdasarkan tanggung jawab

```go
// Good interface design
type Logger interface {
    Log(level string, message string)
}

type FileLogger struct {
    file *os.File
}

func (l *FileLogger) Log(level string, message string) {
    fmt.Fprintf(l.file, "[%s] %s\n", level, message)
}

// Function accepting interface
func processWithLogging(logger Logger, data []byte) error {
    logger.Log("INFO", "Processing data")
    // Process data
    return nil
}
```

### Common Interfaces
- **io.Reader**: Interface untuk membaca data
- **io.Writer**: Interface untuk menulis data
- **fmt.Stringer**: Interface untuk string representation
- **error**: Interface untuk error handling

```go
// Common interfaces
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Stringer interface {
    String() string
}

// Implementasi
type Person struct {
    Name string
    Age  int
}

func (p Person) String() string {
    return fmt.Sprintf("%s (%d years)", p.Name, p.Age)
}
```

## Interface Patterns

### Dependency Injection
- **Constructor injection**: Menerima interface melalui constructor
- **Method injection**: Menerima interface melalui method
- **Interface-based design**: Menggunakan interface untuk loose coupling

```go
// Dependency injection
type UserService struct {
    logger Logger
    db     Database
}

func NewUserService(logger Logger, db Database) *UserService {
    return &UserService{
        logger: logger,
        db:     db,
    }
}

func (s *UserService) CreateUser(user User) error {
    s.logger.Log("INFO", "Creating user")
    return s.db.Save(user)
}
```

### Interface Adapters
- **Adapter pattern**: Mengadaptasi interface yang tidak kompatibel
- **Wrapper**: Membungkus implementasi yang ada
- **Conversion**: Mengkonversi antara interface yang berbeda

```go
// Interface adapter
type OldLogger struct {
    // Old implementation
}

type LoggerAdapter struct {
    oldLogger *OldLogger
}

func (a *LoggerAdapter) Log(level string, message string) {
    // Adapt old logger to new interface
    a.oldLogger.LogMessage(level + ": " + message)
}
```

## Kesimpulan

Interface adalah fitur fundamental dalam Go yang memungkinkan loose coupling dan polimorfisme. Dengan memahami dan menggunakan interface dengan baik, kita dapat menulis kode yang lebih modular, testable, dan maintainable.