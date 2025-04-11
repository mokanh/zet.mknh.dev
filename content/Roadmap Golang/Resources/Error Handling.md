# Error Handling

Error handling adalah aspek penting dalam pengembangan aplikasi Go. Go menggunakan pendekatan eksplisit untuk menangani error, di mana error harus ditangani secara langsung oleh kode. Memahami cara menangani error dengan baik sangat penting untuk membuat aplikasi yang robust dan reliable.

## Error Interface

### Definisi Error
- **Interface**: Error adalah interface bawaan Go
- **Method**: Hanya memiliki satu method `Error() string`
- **Implementasi**: Setiap tipe yang mengimplementasikan method ini adalah error

```go
// Error interface
type error interface {
    Error() string
}

// Custom error
type ValidationError struct {
    Field string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Message)
}
```

### Error Bawaan
- **errors.New()**: Membuat error sederhana
- **fmt.Errorf()**: Membuat error dengan format string
- **Sentinel errors**: Error yang didefinisikan sebagai variabel

```go
// Error sederhana
err := errors.New("something went wrong")

// Error dengan format
err := fmt.Errorf("invalid input: %s", input)

// Sentinel error
var (
    ErrNotFound = errors.New("not found")
    ErrTimeout  = errors.New("operation timed out")
)
```

## Error Handling Patterns

### Multiple Return Values
- **Pattern**: Fungsi mengembalikan value dan error
- **Checking**: Error harus dicek setelah setiap operasi
- **Propagation**: Error diteruskan ke caller

```go
// Fungsi dengan error handling
func readFile(path string) ([]byte, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("failed to read file: %w", err)
    }
    return data, nil
}

// Penggunaan
data, err := readFile("config.json")
if err != nil {
    log.Fatal(err)
}
```

### Error Wrapping
- **fmt.Errorf**: Menggunakan `%w` untuk wrapping error
- **errors.Unwrap**: Membuka wrapped error
- **errors.Is**: Mengecek error type
- **errors.As**: Type assertion untuk error

```go
// Error wrapping
func processData(data []byte) error {
    if err := validate(data); err != nil {
        return fmt.Errorf("validation failed: %w", err)
    }
    return nil
}

// Error checking
if errors.Is(err, ErrNotFound) {
    // Handle not found error
}

// Error type assertion
var validationErr *ValidationError
if errors.As(err, &validationErr) {
    // Handle validation error
}
```

## Custom Errors

### Error Types
- **Struct**: Mendefinisikan error sebagai struct
- **Fields**: Menyimpan informasi tambahan
- **Methods**: Mengimplementasikan interface error

```go
// Custom error type
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// Penggunaan
func validateUser(user User) error {
    if user.Age < 0 {
        return &ValidationError{
            Field:   "age",
            Message: "age cannot be negative",
        }
    }
    return nil
}
```

### Error Groups
- **Multiple errors**: Mengumpulkan beberapa error
- **errgroup**: Package untuk concurrent error handling
- **errors.Join**: Menggabungkan multiple errors

```go
// Error group
var errs []error

func validateAll(data []byte) error {
    if err := validateFormat(data); err != nil {
        errs = append(errs, err)
    }
    if err := validateContent(data); err != nil {
        errs = append(errs, err)
    }
    if len(errs) > 0 {
        return errors.Join(errs...)
    }
    return nil
}
```

## Panic dan Recover

### Panic
- **Usage**: Untuk error yang tidak dapat dipulihkan
- **Stack trace**: Menampilkan stack trace
- **Defer**: Dieksekusi sebelum panic

```go
// Panic
func mustParse(s string) int {
    i, err := strconv.Atoi(s)
    if err != nil {
        panic(fmt.Sprintf("invalid number: %s", s))
    }
    return i
}
```

### Recover
- **Defer**: Harus digunakan dalam defer function
- **Scope**: Hanya menangkap panic dalam goroutine yang sama
- **Best practices**: Gunakan dengan hati-hati

```go
// Recover
func safeOperation() {
    defer func() {
        if r := recover(); r != nil {
            log.Printf("Recovered from panic: %v", r)
        }
    }()
    // Potentially panicking code
}
```

## Error Handling Best Practices

### Guidelines
- **Explicit**: Tangani error secara eksplisit
- **Context**: Tambahkan konteks ke error
- **Logging**: Log error dengan level yang tepat
- **Recovery**: Sediakan mekanisme recovery
- **Documentation**: Dokumentasikan error yang mungkin terjadi

```go
// Best practice example
func processUser(id string) (*User, error) {
    // Validate input
    if id == "" {
        return nil, &ValidationError{
            Field:   "id",
            Message: "id cannot be empty",
        }
    }

    // Database operation
    user, err := db.GetUser(id)
    if err != nil {
        if errors.Is(err, db.ErrNotFound) {
            return nil, fmt.Errorf("user not found: %w", err)
        }
        return nil, fmt.Errorf("database error: %w", err)
    }

    // Business logic
    if err := validateUser(user); err != nil {
        return nil, fmt.Errorf("validation failed: %w", err)
    }

    return user, nil
}
```

### Error Handling in HTTP Handlers
- **Status codes**: Gunakan status code yang tepat
- **Response format**: Format error response secara konsisten
- **Logging**: Log error dengan detail yang cukup

```go
// HTTP error handling
func handleUser(w http.ResponseWriter, r *http.Request) {
    user, err := processUser(r.URL.Query().Get("id"))
    if err != nil {
        var validationErr *ValidationError
        if errors.As(err, &validationErr) {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        log.Printf("Error processing user: %v", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(user)
}
```

## Kesimpulan

Error handling yang baik adalah kunci untuk membuat aplikasi Go yang reliable dan maintainable. Dengan memahami berbagai mekanisme error handling dan best practices, kita dapat menulis kode yang lebih robust dan mudah di-debug.