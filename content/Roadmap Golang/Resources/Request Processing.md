# Request Processing

Request processing adalah proses menangani dan memproses data yang dikirim oleh client melalui HTTP request. Dalam pengembangan web dengan Go, kita perlu memahami berbagai cara untuk memproses request, termasuk parsing request body, menangani form data, file uploads, dan memproses data dalam format JSON atau XML.

## Request Parsing

Request parsing adalah proses mengambil dan menginterpretasi data dari HTTP request. Go menyediakan berbagai cara untuk melakukan request parsing, tergantung pada tipe data yang dikirim.

### Karakteristik Request Parsing di Go
- **Method-specific**: Parsing berbeda untuk setiap method HTTP (GET, POST, PUT, dll.)
- **Content Type**: Parsing berdasarkan Content-Type header
- **Body Reading**: Membaca request body dengan berbagai cara
- **Error Handling**: Menangani error saat parsing
- **Validation**: Validasi data yang di-parse

### Implementasi Request Parsing
```go
// Request parsing dasar
package main

import (
    "fmt"
    "io"
    "log"
    "net/http"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/parse"
    mux.HandleFunc("/parse", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Membaca request body
        body, err := io.ReadAll(r.Body)
        if err != nil {
            http.Error(w, "Error reading request body", http.StatusBadRequest)
            return
        }
        defer r.Body.Close()
        
        // Menulis response
        fmt.Fprintf(w, "Request body: %s", body)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Request parsing dengan Content-Type
package main

import (
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "strings"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
    Age  int    `json:"age"`
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/parse"
    mux.HandleFunc("/parse", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Cek Content-Type
        contentType := r.Header.Get("Content-Type")
        
        // Parsing berdasarkan Content-Type
        switch {
        case strings.Contains(contentType, "application/json"):
            // Parsing JSON
            var user User
            if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
                http.Error(w, "Error parsing JSON", http.StatusBadRequest)
                return
            }
            defer r.Body.Close()
            
            // Menulis response
            fmt.Fprintf(w, "User: %+v", user)
            
        case strings.Contains(contentType, "application/x-www-form-urlencoded"):
            // Parsing form
            if err := r.ParseForm(); err != nil {
                http.Error(w, "Error parsing form", http.StatusBadRequest)
                return
            }
            
            // Mengambil nilai form
            id := r.FormValue("id")
            name := r.FormValue("name")
            age := r.FormValue("age")
            
            // Menulis response
            fmt.Fprintf(w, "Form data: id=%s, name=%s, age=%s", id, name, age)
            
        case strings.Contains(contentType, "multipart/form-data"):
            // Parsing multipart form
            if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB
                http.Error(w, "Error parsing multipart form", http.StatusBadRequest)
                return
            }
            defer r.MultipartForm.RemoveAll()
            
            // Mengambil nilai form
            id := r.FormValue("id")
            name := r.FormValue("name")
            age := r.FormValue("age")
            
            // Mengambil file
            file, header, err := r.FormFile("file")
            if err == nil {
                defer file.Close()
                
                // Membaca file
                fileData, err := io.ReadAll(file)
                if err != nil {
                    http.Error(w, "Error reading file", http.StatusInternalServerError)
                    return
                }
                
                // Menulis response
                fmt.Fprintf(w, "Form data: id=%s, name=%s, age=%s\n", id, name, age)
                fmt.Fprintf(w, "File: %s, Size: %d bytes, Content: %s", header.Filename, len(fileData), fileData)
                return
            }
            
            // Menulis response
            fmt.Fprintf(w, "Form data: id=%s, name=%s, age=%s", id, name, age)
            
        default:
            // Content-Type tidak didukung
            http.Error(w, "Unsupported Content-Type", http.StatusUnsupportedMediaType)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Form Handling

Form handling adalah proses menangani data yang dikirim melalui HTML form. Go menyediakan berbagai cara untuk menangani form data, termasuk form biasa dan multipart form.

### Karakteristik Form Handling di Go
- **Form Parsing**: Parsing form data dengan `ParseForm` atau `ParseMultipartForm`
- **Form Values**: Mengambil nilai form dengan `FormValue` atau `Form`
- **File Uploads**: Menangani file uploads dengan `FormFile`
- **Validation**: Validasi form data
- **Security**: Keamanan saat menangani form data

### Implementasi Form Handling
```go
// Form handling sederhana
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    Name string
    Age  string
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Form</title>
</head>
<body>
    <h1>User Form</h1>
    <form action="/submit" method="post">
        <div>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
        </div>
        <div>
            <label for="age">Age:</label>
            <input type="number" id="age" name="age" required>
        </div>
        <div>
            <button type="submit">Submit</button>
        </div>
    </form>
</body>
</html>
`
        t := template.Must(template.New("form").Parse(tmpl))
        t.Execute(w, nil)
    })
    
    // Mendefinisikan handler untuk route "/submit"
    mux.HandleFunc("/submit", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Parsing form
        if err := r.ParseForm(); err != nil {
            http.Error(w, "Error parsing form", http.StatusBadRequest)
            return
        }
        
        // Mengambil nilai form
        name := r.FormValue("name")
        age := r.FormValue("age")
        
        // Membuat user
        user := User{
            Name: name,
            Age:  age,
        }
        
        // Menampilkan hasil
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>Form Result</title>
</head>
<body>
    <h1>Form Result</h1>
    <p>Name: {{.Name}}</p>
    <p>Age: {{.Age}}</p>
    <p><a href="/">Back to Form</a></p>
</body>
</html>
`
        t := template.Must(template.New("result").Parse(tmpl))
        t.Execute(w, user)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Form handling dengan validasi
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
    "strconv"
)

// User adalah struct untuk data user
type User struct {
    Name  string
    Age   int
    Email string
}

// FormData adalah struct untuk data form
type FormData struct {
    User   User
    Errors map[string]string
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Form</title>
    <style>
        .error {
            color: red;
            font-size: 0.8em;
        }
    </style>
</head>
<body>
    <h1>User Form</h1>
    <form action="/submit" method="post">
        <div>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="{{.User.Name}}" required>
            {{if .Errors.name}}<p class="error">{{.Errors.name}}</p>{{end}}
        </div>
        <div>
            <label for="age">Age:</label>
            <input type="number" id="age" name="age" value="{{.User.Age}}" required>
            {{if .Errors.age}}<p class="error">{{.Errors.age}}</p>{{end}}
        </div>
        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="{{.User.Email}}" required>
            {{if .Errors.email}}<p class="error">{{.Errors.email}}</p>{{end}}
        </div>
        <div>
            <button type="submit">Submit</button>
        </div>
    </form>
</body>
</html>
`
        t := template.Must(template.New("form").Parse(tmpl))
        t.Execute(w, FormData{
            User:   User{},
            Errors: make(map[string]string),
        })
    })
    
    // Mendefinisikan handler untuk route "/submit"
    mux.HandleFunc("/submit", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Parsing form
        if err := r.ParseForm(); err != nil {
            http.Error(w, "Error parsing form", http.StatusBadRequest)
            return
        }
        
        // Mengambil nilai form
        name := r.FormValue("name")
        ageStr := r.FormValue("age")
        email := r.FormValue("email")
        
        // Validasi
        errors := make(map[string]string)
        
        if name == "" {
            errors["name"] = "Name is required"
        }
        
        age, err := strconv.Atoi(ageStr)
        if err != nil {
            errors["age"] = "Age must be a number"
        } else if age < 0 || age > 150 {
            errors["age"] = "Age must be between 0 and 150"
        }
        
        if email == "" {
            errors["email"] = "Email is required"
        } else if !strings.Contains(email, "@") {
            errors["email"] = "Email must be valid"
        }
        
        // Jika ada error, tampilkan form dengan error
        if len(errors) > 0 {
            tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Form</title>
    <style>
        .error {
            color: red;
            font-size: 0.8em;
        }
    </style>
</head>
<body>
    <h1>User Form</h1>
    <form action="/submit" method="post">
        <div>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="{{.User.Name}}" required>
            {{if .Errors.name}}<p class="error">{{.Errors.name}}</p>{{end}}
        </div>
        <div>
            <label for="age">Age:</label>
            <input type="number" id="age" name="age" value="{{.User.Age}}" required>
            {{if .Errors.age}}<p class="error">{{.Errors.age}}</p>{{end}}
        </div>
        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="{{.User.Email}}" required>
            {{if .Errors.email}}<p class="error">{{.Errors.email}}</p>{{end}}
        </div>
        <div>
            <button type="submit">Submit</button>
        </div>
    </form>
</body>
</html>
`
            t := template.Must(template.New("form").Parse(tmpl))
            t.Execute(w, FormData{
                User: User{
                    Name:  name,
                    Age:   age,
                    Email: email,
                },
                Errors: errors,
            })
            return
        }
        
        // Membuat user
        user := User{
            Name:  name,
            Age:   age,
            Email: email,
        }
        
        // Menampilkan hasil
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>Form Result</title>
</head>
<body>
    <h1>Form Result</h1>
    <p>Name: {{.Name}}</p>
    <p>Age: {{.Age}}</p>
    <p>Email: {{.Email}}</p>
    <p><a href="/">Back to Form</a></p>
</body>
</html>
`
        t := template.Must(template.New("result").Parse(tmpl))
        t.Execute(w, user)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## File Uploads

File uploads adalah proses mengunggah file dari client ke server. Go menyediakan berbagai cara untuk menangani file uploads, termasuk single file upload dan multiple file uploads.

### Karakteristik File Uploads di Go
- **Multipart Form**: File uploads menggunakan multipart/form-data
- **File Handling**: Menangani file dengan `FormFile` atau `MultipartForm`
- **File Storage**: Menyimpan file di disk atau database
- **File Validation**: Validasi tipe file, ukuran file, dll.
- **Security**: Keamanan saat menangani file uploads

### Implementasi File Uploads
```go
// File upload sederhana
package main

import (
    "fmt"
    "html/template"
    "io"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>File Upload</title>
</head>
<body>
    <h1>File Upload</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
        <div>
            <label for="file">File:</label>
            <input type="file" id="file" name="file" required>
        </div>
        <div>
            <button type="submit">Upload</button>
        </div>
    </form>
</body>
</html>
`
        t := template.Must(template.New("upload").Parse(tmpl))
        t.Execute(w, nil)
    })
    
    // Mendefinisikan handler untuk route "/upload"
    mux.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Parsing multipart form
        if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB
            http.Error(w, "Error parsing multipart form", http.StatusBadRequest)
            return
        }
        defer r.MultipartForm.RemoveAll()
        
        // Mengambil file
        file, header, err := r.FormFile("file")
        if err != nil {
            http.Error(w, "Error retrieving file", http.StatusBadRequest)
            return
        }
        defer file.Close()
        
        // Membuat direktori uploads jika belum ada
        if err := os.MkdirAll("uploads", 0755); err != nil {
            http.Error(w, "Error creating uploads directory", http.StatusInternalServerError)
            return
        }
        
        // Membuat file di server
        dst, err := os.Create(filepath.Join("uploads", header.Filename))
        if err != nil {
            http.Error(w, "Error creating file", http.StatusInternalServerError)
            return
        }
        defer dst.Close()
        
        // Menyalin file
        if _, err := io.Copy(dst, file); err != nil {
            http.Error(w, "Error copying file", http.StatusInternalServerError)
            return
        }
        
        // Menampilkan hasil
        fmt.Fprintf(w, "File %s uploaded successfully", header.Filename)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Multiple file uploads
package main

import (
    "fmt"
    "html/template"
    "io"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>Multiple File Upload</title>
</head>
<body>
    <h1>Multiple File Upload</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
        <div>
            <label for="files">Files:</label>
            <input type="file" id="files" name="files" multiple required>
        </div>
        <div>
            <button type="submit">Upload</button>
        </div>
    </form>
</body>
</html>
`
        t := template.Must(template.New("upload").Parse(tmpl))
        t.Execute(w, nil)
    })
    
    // Mendefinisikan handler untuk route "/upload"
    mux.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Parsing multipart form
        if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB
            http.Error(w, "Error parsing multipart form", http.StatusBadRequest)
            return
        }
        defer r.MultipartForm.RemoveAll()
        
        // Mengambil files
        files := r.MultipartForm.File["files"]
        
        // Membuat direktori uploads jika belum ada
        if err := os.MkdirAll("uploads", 0755); err != nil {
            http.Error(w, "Error creating uploads directory", http.StatusInternalServerError)
            return
        }
        
        // Menampilkan hasil
        fmt.Fprintf(w, "<h1>Uploaded Files</h1>")
        
        // Menyalin files
        for _, header := range files {
            // Membuka file
            file, err := header.Open()
            if err != nil {
                fmt.Fprintf(w, "Error opening file %s: %v<br>", header.Filename, err)
                continue
            }
            defer file.Close()
            
            // Membuat file di server
            dst, err := os.Create(filepath.Join("uploads", header.Filename))
            if err != nil {
                fmt.Fprintf(w, "Error creating file %s: %v<br>", header.Filename, err)
                continue
            }
            defer dst.Close()
            
            // Menyalin file
            if _, err := io.Copy(dst, file); err != nil {
                fmt.Fprintf(w, "Error copying file %s: %v<br>", header.Filename, err)
                continue
            }
            
            // Menampilkan hasil
            fmt.Fprintf(w, "File %s uploaded successfully<br>", header.Filename)
        }
        
        // Menampilkan link kembali
        fmt.Fprintf(w, "<br><a href=\"/\">Back to Upload</a>")
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// File upload dengan validasi
package main

import (
    "fmt"
    "html/template"
    "io"
    "log"
    "mime/multipart"
    "net/http"
    "os"
    "path/filepath"
    "strings"
)

// UploadResult adalah struct untuk hasil upload
type UploadResult struct {
    Success bool
    Message string
    Files   []string
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>File Upload with Validation</title>
    <style>
        .error {
            color: red;
            font-size: 0.8em;
        }
    </style>
</head>
<body>
    <h1>File Upload with Validation</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
        <div>
            <label for="files">Files:</label>
            <input type="file" id="files" name="files" multiple required>
            <p>Allowed file types: .jpg, .jpeg, .png, .gif</p>
            <p>Maximum file size: 5 MB</p>
        </div>
        <div>
            <button type="submit">Upload</button>
        </div>
    </form>
</body>
</html>
`
        t := template.Must(template.New("upload").Parse(tmpl))
        t.Execute(w, nil)
    })
    
    // Mendefinisikan handler untuk route "/upload"
    mux.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Parsing multipart form
        if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB
            http.Error(w, "Error parsing multipart form", http.StatusBadRequest)
            return
        }
        defer r.MultipartForm.RemoveAll()
        
        // Mengambil files
        files := r.MultipartForm.File["files"]
        
        // Membuat direktori uploads jika belum ada
        if err := os.MkdirAll("uploads", 0755); err != nil {
            http.Error(w, "Error creating uploads directory", http.StatusInternalServerError)
            return
        }
        
        // Menampilkan hasil
        result := UploadResult{
            Success: true,
            Message: "All files uploaded successfully",
            Files:   []string{},
        }
        
        // Menyalin files
        for _, header := range files {
            // Validasi tipe file
            if !isAllowedFileType(header.Filename) {
                result.Success = false
                result.Message = "Some files have invalid type"
                continue
            }
            
            // Validasi ukuran file
            if header.Size > 5<<20 { // 5 MB
                result.Success = false
                result.Message = "Some files exceed the maximum size"
                continue
            }
            
            // Membuka file
            file, err := header.Open()
            if err != nil {
                result.Success = false
                result.Message = "Error opening files"
                continue
            }
            defer file.Close()
            
            // Membuat file di server
            dst, err := os.Create(filepath.Join("uploads", header.Filename))
            if err != nil {
                result.Success = false
                result.Message = "Error creating files"
                continue
            }
            defer dst.Close()
            
            // Menyalin file
            if _, err := io.Copy(dst, file); err != nil {
                result.Success = false
                result.Message = "Error copying files"
                continue
            }
            
            // Menambahkan file ke hasil
            result.Files = append(result.Files, header.Filename)
        }
        
        // Menampilkan hasil
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>Upload Result</title>
    <style>
        .success {
            color: green;
        }
        .error {
            color: red;
        }
    </style>
</head>
<body>
    <h1>Upload Result</h1>
    <p class="{{if .Success}}success{{else}}error{{end}}">{{.Message}}</p>
    {{if .Success}}
    <h2>Uploaded Files:</h2>
    <ul>
        {{range .Files}}
        <li>{{.}}</li>
        {{end}}
    </ul>
    {{end}}
    <p><a href="/">Back to Upload</a></p>
</body>
</html>
`
        t := template.Must(template.New("result").Parse(tmpl))
        t.Execute(w, result)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// isAllowedFileType mengecek apakah tipe file diizinkan
func isAllowedFileType(filename string) bool {
    ext := strings.ToLower(filepath.Ext(filename))
    allowedTypes := map[string]bool{
        ".jpg":  true,
        ".jpeg": true,
        ".png":  true,
        ".gif":  true,
    }
    return allowedTypes[ext]
}
```

## JSON Processing

JSON processing adalah proses memproses data dalam format JSON. Go menyediakan package `encoding/json` untuk encoding dan decoding JSON.

### Karakteristik JSON Processing di Go
- **Encoding**: Mengubah struct atau map menjadi JSON
- **Decoding**: Mengubah JSON menjadi struct atau map
- **Validation**: Validasi data JSON
- **Custom Marshaling**: Kustomisasi proses encoding dan decoding
- **Streaming**: Memproses JSON dalam bentuk stream

### Implementasi JSON Processing
```go
// JSON processing sederhana
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
    Age  int    `json:"age"`
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/users"
    mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Decode JSON
        var user User
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            http.Error(w, "Error decoding JSON", http.StatusBadRequest)
            return
        }
        defer r.Body.Close()
        
        // Menampilkan user
        fmt.Printf("User: %+v\n", user)
        
        // Encode JSON
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// JSON processing dengan validasi
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
    Age  int    `json:"age"`
}

// UserResponse adalah struct untuk response
type UserResponse struct {
    Success bool   `json:"success"`
    Message string `json:"message"`
    User    *User  `json:"user,omitempty"`
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/users"
    mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            response := UserResponse{
                Success: false,
                Message: "Method not allowed",
            }
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusMethodNotAllowed)
            json.NewEncoder(w).Encode(response)
            return
        }
        
        // Decode JSON
        var user User
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            response := UserResponse{
                Success: false,
                Message: "Error decoding JSON",
            }
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(response)
            return
        }
        defer r.Body.Close()
        
        // Validasi user
        if user.Name == "" {
            response := UserResponse{
                Success: false,
                Message: "Name is required",
            }
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(response)
            return
        }
        
        if user.Age < 0 || user.Age > 150 {
            response := UserResponse{
                Success: false,
                Message: "Age must be between 0 and 150",
            }
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(response)
            return
        }
        
        // Menampilkan user
        fmt.Printf("User: %+v\n", user)
        
        // Encode JSON
        response := UserResponse{
            Success: true,
            Message: "User created successfully",
            User:    &user,
        }
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(response)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// JSON processing dengan custom marshaling
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
)

// User adalah struct untuk data user
type User struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Age       int       `json:"age"`
    CreatedAt time.Time `json:"created_at"`
}

// UserResponse adalah struct untuk response
type UserResponse struct {
    Success bool   `json:"success"`
    Message string `json:"message"`
    User    *User  `json:"user,omitempty"`
}

// MarshalJSON mengimplementasikan custom marshaling
func (u *User) MarshalJSON() ([]byte, error) {
    type Alias User
    return json.Marshal(&struct {
        *Alias
        CreatedAt string `json:"created_at"`
    }{
        Alias:     (*Alias)(u),
        CreatedAt: u.CreatedAt.Format("2006-01-02 15:04:05"),
    })
}

// UnmarshalJSON mengimplementasikan custom unmarshaling
func (u *User) UnmarshalJSON(data []byte) error {
    type Alias User
    aux := &struct {
        *Alias
        CreatedAt string `json:"created_at"`
    }{
        Alias: (*Alias)(u),
    }
    
    if err := json.Unmarshal(data, &aux); err != nil {
        return err
    }
    
    if aux.CreatedAt != "" {
        t, err := time.Parse("2006-01-02 15:04:05", aux.CreatedAt)
        if err != nil {
            return err
        }
        u.CreatedAt = t
    } else {
        u.CreatedAt = time.Now()
    }
    
    return nil
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/users"
    mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            response := UserResponse{
                Success: false,
                Message: "Method not allowed",
            }
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusMethodNotAllowed)
            json.NewEncoder(w).Encode(response)
            return
        }
        
        // Decode JSON
        var user User
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            response := UserResponse{
                Success: false,
                Message: "Error decoding JSON",
            }
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(response)
            return
        }
        defer r.Body.Close()
        
        // Set CreatedAt jika belum di-set
        if user.CreatedAt.IsZero() {
            user.CreatedAt = time.Now()
        }
        
        // Menampilkan user
        fmt.Printf("User: %+v\n", user)
        
        // Encode JSON
        response := UserResponse{
            Success: true,
            Message: "User created successfully",
            User:    &user,
        }
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(response)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## XML Processing

XML processing adalah proses memproses data dalam format XML. Go menyediakan package `encoding/xml` untuk encoding dan decoding XML.

### Karakteristik XML Processing di Go
- **Encoding**: Mengubah struct atau map menjadi XML
- **Decoding**: Mengubah XML menjadi struct atau map
- **Validation**: Validasi data XML
- **Custom Marshaling**: Kustomisasi proses encoding dan decoding
- **Streaming**: Memproses XML dalam bentuk stream

### Implementasi XML Processing
```go
// XML processing sederhana
package main

import (
    "encoding/xml"
    "fmt"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    XMLName xml.Name `xml:"user"`
    ID      string   `xml:"id"`
    Name    string   `xml:"name"`
    Age     int      `xml:"age"`
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/users"
    mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        
        // Decode XML
        var user User
        if err := xml.NewDecoder(r.Body).Decode(&user); err != nil {
            http.Error(w, "Error decoding XML", http.StatusBadRequest)
            return
        }
        defer r.Body.Close()
        
        // Menampilkan user
        fmt.Printf("User: %+v\n", user)
        
        // Encode XML
        w.Header().Set("Content-Type", "application/xml")
        xml.NewEncoder(w).Encode(user)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// XML processing dengan validasi
package main

import (
    "encoding/xml"
    "fmt"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    XMLName xml.Name `xml:"user"`
    ID      string   `xml:"id"`
    Name    string   `xml:"name"`
    Age     int      `xml:"age"`
}

// UserResponse adalah struct untuk response
type UserResponse struct {
    XMLName xml.Name `xml:"response"`
    Success bool     `xml:"success"`
    Message string   `xml:"message"`
    User    *User    `xml:"user,omitempty"`
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/users"
    mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Cek method
        if r.Method != http.MethodPost {
            response := UserResponse{
                Success: false,
                Message: "Method not allowed",
            }
            w.Header().Set("Content-Type", "application/xml")
            w.WriteHeader(http.StatusMethodNotAllowed)
            xml.NewEncoder(w).Encode(response)
            return
        }
        
        // Decode XML
        var user User
        if err := xml.NewDecoder(r.Body).Decode(&user); err != nil {
            response := UserResponse{
                Success: false,
                Message: "Error decoding XML",
            }
            w.Header().Set("Content-Type", "application/xml")
            w.WriteHeader(http.StatusBadRequest)
            xml.NewEncoder(w).Encode(response)
            return
        }
        defer r.Body.Close()
        
        // Validasi user
        if user.Name == "" {
            response := UserResponse{
                Success: false,
                Message: "Name is required",
            }
            w.Header().Set("Content-Type", "application/xml")
            w.WriteHeader(http.StatusBadRequest)
            xml.NewEncoder(w).Encode(response)
            return
        }
        
        if user.Age < 0 || user.Age > 150 {
            response := UserResponse{
                Success: false,
                Message: "Age must be between 0 and 150",
            }
            w.Header().Set("Content-Type", "application/xml")
            w.WriteHeader(http.StatusBadRequest)
            xml.NewEncoder(w).Encode(response)
            return
        }
        
        // Menampilkan user
        fmt.Printf("User: %+v\n", user)
        
        // Encode XML
        response := UserResponse{
            Success: true,
            Message: "User created successfully",
            User:    &user,
        }
        w.Header().Set("Content-Type", "application/xml")
        w.WriteHeader(http.StatusCreated)
        xml.NewEncoder(w).Encode(response)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Kesimpulan

Request processing adalah komponen penting dalam pengembangan web yang memungkinkan kita untuk menangani dan memproses data yang dikirim oleh client. Go menyediakan berbagai cara untuk memproses request, termasuk parsing request body, menangani form data, file uploads, dan memproses data dalam format JSON atau XML.

Dengan memahami dan mengimplementasikan konsep-konsep seperti request parsing, form handling, file uploads, JSON processing, dan XML processing, kita dapat mengembangkan aplikasi web yang dapat menerima dan memproses data dari client dengan baik. Pilihan metode processing yang tepat tergantung pada tipe data yang dikirim dan kebutuhan aplikasi. 