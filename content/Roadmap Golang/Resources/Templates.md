# Templates

Template engine adalah komponen penting dalam pengembangan web yang memungkinkan kita untuk memisahkan logika aplikasi dari presentasi. Go menyediakan package `html/template` yang kuat untuk menangani template HTML dengan fitur keamanan bawaan untuk mencegah XSS (Cross-Site Scripting).

## Template Engine

Template engine di Go memungkinkan kita untuk membuat template HTML yang dapat diisi dengan data dinamis. Package `html/template` menyediakan berbagai fitur untuk menangani template, seperti parsing, eksekusi, dan fungsi template.

### Karakteristik Template Engine di Go
- **HTML Escaping**: Escaping otomatis untuk mencegah XSS
- **Template Parsing**: Parsing template dari string atau file
- **Template Execution**: Eksekusi template dengan data
- **Template Functions**: Fungsi bawaan dan kustom untuk template
- **Template Inheritance**: Pewarisan template untuk layout

### Implementasi Template Engine
```go
// Template engine dasar
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Membuat template
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .user {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .user h2 {
            margin-top: 0;
        }
    </style>
</head>
<body>
    <h1>User Template</h1>
    <div class="user">
        <h2>{{.Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Age: {{.Age}}</p>
    </div>
</body>
</html>
`
        // Parsing template
        t, err := template.New("user").Parse(tmpl)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Template engine dengan file
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Membuat file template
        tmplFile := "templates/user.html"
        
        // Membuat direktori templates jika belum ada
        if err := os.MkdirAll(filepath.Dir(tmplFile), 0755); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Membuat file template jika belum ada
        if _, err := os.Stat(tmplFile); os.IsNotExist(err) {
            tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .user {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .user h2 {
            margin-top: 0;
        }
    </style>
</head>
<body>
    <h1>User Template</h1>
    <div class="user">
        <h2>{{.Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Age: {{.Age}}</p>
    </div>
</body>
</html>
`
            if err := os.WriteFile(tmplFile, []byte(tmpl), 0644); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
        }
        
        // Parsing template dari file
        t, err := template.ParseFiles(tmplFile)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Template Parsing

Template parsing adalah proses mengubah template dari bentuk teks menjadi struktur data yang dapat dieksekusi. Go menyediakan berbagai cara untuk parsing template, seperti `template.Parse()`, `template.ParseFiles()`, `template.ParseGlob()`, dll.

### Karakteristik Template Parsing di Go
- **String Parsing**: Parsing template dari string
- **File Parsing**: Parsing template dari file
- **Glob Parsing**: Parsing template dari glob pattern
- **Error Handling**: Penanganan error saat parsing
- **Template Reuse**: Penggunaan ulang template

### Implementasi Template Parsing
```go
// Template parsing dasar
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/string"
    mux.HandleFunc("/string", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Membuat template
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Template</title>
</head>
<body>
    <h1>User Template</h1>
    <div class="user">
        <h2>{{.Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Age: {{.Age}}</p>
    </div>
</body>
</html>
`
        // Parsing template dari string
        t, err := template.New("user").Parse(tmpl)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Mendefinisikan handler untuk route "/file"
    mux.HandleFunc("/file", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Parsing template dari file
        t, err := template.ParseFiles("templates/user.html")
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Mendefinisikan handler untuk route "/glob"
    mux.HandleFunc("/glob", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Parsing template dari glob pattern
        t, err := template.ParseGlob("templates/*.html")
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.ExecuteTemplate(w, "user.html", user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Template parsing dengan error handling
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

// TemplateStore adalah struct untuk menyimpan template
type TemplateStore struct {
    templates map[string]*template.Template
}

// NewTemplateStore membuat TemplateStore baru
func NewTemplateStore() *TemplateStore {
    return &TemplateStore{
        templates: make(map[string]*template.Template),
    }
}

// LoadTemplate memuat template dari file
func (s *TemplateStore) LoadTemplate(name, file string) error {
    // Parsing template dari file
    t, err := template.ParseFiles(file)
    if err != nil {
        return err
    }
    
    // Menyimpan template
    s.templates[name] = t
    
    return nil
}

// LoadTemplates memuat semua template dari direktori
func (s *TemplateStore) LoadTemplates(dir string) error {
    // Membuat direktori jika belum ada
    if err := os.MkdirAll(dir, 0755); err != nil {
        return err
    }
    
    // Membuat file template jika belum ada
    tmplFile := filepath.Join(dir, "user.html")
    if _, err := os.Stat(tmplFile); os.IsNotExist(err) {
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .user {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .user h2 {
            margin-top: 0;
        }
    </style>
</head>
<body>
    <h1>User Template</h1>
    <div class="user">
        <h2>{{.Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Age: {{.Age}}</p>
    </div>
</body>
</html>
`
        if err := os.WriteFile(tmplFile, []byte(tmpl), 0644); err != nil {
            return err
        }
    }
    
    // Parsing template dari file
    t, err := template.ParseFiles(tmplFile)
    if err != nil {
        return err
    }
    
    // Menyimpan template
    s.templates["user"] = t
    
    return nil
}

// ExecuteTemplate mengeksekusi template
func (s *TemplateStore) ExecuteTemplate(w http.ResponseWriter, name string, data interface{}) error {
    // Mengambil template
    t, ok := s.templates[name]
    if !ok {
        return fmt.Errorf("template %s not found", name)
    }
    
    // Eksekusi template
    return t.Execute(w, data)
}

func main() {
    // Membuat template store
    templateStore := NewTemplateStore()
    
    // Memuat template
    if err := templateStore.LoadTemplates("templates"); err != nil {
        log.Fatal(err)
    }
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Eksekusi template
        if err := templateStore.ExecuteTemplate(w, "user", user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Template Execution

Template execution adalah proses mengisi template dengan data dan menghasilkan output HTML. Go menyediakan berbagai cara untuk eksekusi template, seperti `template.Execute()`, `template.ExecuteTemplate()`, dll.

### Karakteristik Template Execution di Go
- **Data Passing**: Mengirim data ke template
- **Template Selection**: Memilih template yang akan dieksekusi
- **Error Handling**: Penanganan error saat eksekusi
- **Output Writing**: Menulis output ke writer
- **Template Nesting**: Template bersarang

### Implementasi Template Execution
```go
// Template execution dasar
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Membuat template
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Template</title>
</head>
<body>
    <h1>User Template</h1>
    <div class="user">
        <h2>{{.Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Age: {{.Age}}</p>
    </div>
</body>
</html>
`
        // Parsing template
        t, err := template.New("user").Parse(tmpl)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Template execution dengan multiple templates
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/user"
    mux.HandleFunc("/user", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Membuat template
        tmpl := `
{{define "user"}}
<!DOCTYPE html>
<html>
<head>
    <title>User Template</title>
</head>
<body>
    <h1>User Template</h1>
    <div class="user">
        <h2>{{.Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Age: {{.Age}}</p>
    </div>
</body>
</html>
{{end}}
`
        // Parsing template
        t, err := template.New("user").Parse(tmpl)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.ExecuteTemplate(w, "user", user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Mendefinisikan handler untuk route "/users"
    mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Membuat users
        users := []User{
            {
                ID:   "1",
                Name: "John Doe",
                Age:  30,
            },
            {
                ID:   "2",
                Name: "Jane Doe",
                Age:  25,
            },
            {
                ID:   "3",
                Name: "Bob Smith",
                Age:  40,
            },
        }
        
        // Membuat template
        tmpl := `
{{define "users"}}
<!DOCTYPE html>
<html>
<head>
    <title>Users Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .user {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .user h2 {
            margin-top: 0;
        }
    </style>
</head>
<body>
    <h1>Users Template</h1>
    {{range .}}
    <div class="user">
        <h2>{{.Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Age: {{.Age}}</p>
    </div>
    {{end}}
</body>
</html>
{{end}}
`
        // Parsing template
        t, err := template.New("users").Parse(tmpl)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.ExecuteTemplate(w, "users", users); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Template execution dengan error handling
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

// TemplateExecutor adalah struct untuk mengeksekusi template
type TemplateExecutor struct {
    templates map[string]*template.Template
}

// NewTemplateExecutor membuat TemplateExecutor baru
func NewTemplateExecutor() *TemplateExecutor {
    return &TemplateExecutor{
        templates: make(map[string]*template.Template),
    }
}

// AddTemplate menambahkan template
func (e *TemplateExecutor) AddTemplate(name, tmpl string) error {
    // Parsing template
    t, err := template.New(name).Parse(tmpl)
    if err != nil {
        return err
    }
    
    // Menyimpan template
    e.templates[name] = t
    
    return nil
}

// ExecuteTemplate mengeksekusi template
func (e *TemplateExecutor) ExecuteTemplate(w http.ResponseWriter, name string, data interface{}) error {
    // Mengambil template
    t, ok := e.templates[name]
    if !ok {
        return fmt.Errorf("template %s not found", name)
    }
    
    // Eksekusi template
    return t.Execute(w, data)
}

func main() {
    // Membuat template executor
    executor := NewTemplateExecutor()
    
    // Menambahkan template
    userTmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .user {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .user h2 {
            margin-top: 0;
        }
    </style>
</head>
<body>
    <h1>User Template</h1>
    <div class="user">
        <h2>{{.Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Age: {{.Age}}</p>
    </div>
</body>
</html>
`
    if err := executor.AddTemplate("user", userTmpl); err != nil {
        log.Fatal(err)
    }
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Eksekusi template
        if err := executor.ExecuteTemplate(w, "user", user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Template Functions

Template functions adalah fungsi yang dapat digunakan dalam template untuk memanipulasi data. Go menyediakan berbagai fungsi bawaan, seperti `eq`, `ne`, `lt`, `le`, `gt`, `ge`, dll. Selain itu, kita juga dapat membuat fungsi kustom.

### Karakteristik Template Functions di Go
- **Built-in Functions**: Fungsi bawaan untuk template
- **Custom Functions**: Fungsi kustom untuk template
- **Function Maps**: Map fungsi untuk template
- **Function Arguments**: Argumen untuk fungsi template
- **Function Results**: Hasil dari fungsi template

### Implementasi Template Functions
```go
// Template functions dasar
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
    "strings"
    "time"
)

// User adalah struct untuk data user
type User struct {
    ID        string
    Name      string
    Age       int
    CreatedAt time.Time
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:        "1",
            Name:      "John Doe",
            Age:       30,
            CreatedAt: time.Now(),
        }
        
        // Membuat template dengan fungsi bawaan
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .user {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .user h2 {
            margin-top: 0;
        }
        .adult {
            color: green;
        }
        .minor {
            color: red;
        }
    </style>
</head>
<body>
    <h1>User Template</h1>
    <div class="user">
        <h2>{{.Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Age: {{.Age}} ({{if ge .Age 18}}<span class="adult">Adult</span>{{else}}<span class="minor">Minor</span>{{end}})</p>
        <p>Created At: {{.CreatedAt.Format "2006-01-02 15:04:05"}}</p>
    </div>
</body>
</html>
`
        // Parsing template
        t, err := template.New("user").Parse(tmpl)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Template functions dengan fungsi kustom
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
    "strings"
    "time"
)

// User adalah struct untuk data user
type User struct {
    ID        string
    Name      string
    Age       int
    CreatedAt time.Time
}

// FuncMap adalah map fungsi untuk template
var FuncMap = template.FuncMap{
    "upper": strings.ToUpper,
    "lower": strings.ToLower,
    "title": strings.Title,
    "formatTime": func(t time.Time, layout string) string {
        return t.Format(layout)
    },
    "isAdult": func(age int) bool {
        return age >= 18
    },
    "ageGroup": func(age int) string {
        switch {
        case age < 13:
            return "Child"
        case age < 18:
            return "Teenager"
        case age < 30:
            return "Young Adult"
        case age < 50:
            return "Adult"
        default:
            return "Senior"
        }
    },
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:        "1",
            Name:      "John Doe",
            Age:       30,
            CreatedAt: time.Now(),
        }
        
        // Membuat template dengan fungsi kustom
        tmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>User Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .user {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .user h2 {
            margin-top: 0;
        }
        .adult {
            color: green;
        }
        .minor {
            color: red;
        }
    </style>
</head>
<body>
    <h1>User Template</h1>
    <div class="user">
        <h2>{{title .Name}}</h2>
        <p>ID: {{.ID}}</p>
        <p>Name (upper): {{upper .Name}}</p>
        <p>Name (lower): {{lower .Name}}</p>
        <p>Age: {{.Age}} ({{if isAdult .Age}}<span class="adult">Adult</span>{{else}}<span class="minor">Minor</span>{{end}})</p>
        <p>Age Group: {{ageGroup .Age}}</p>
        <p>Created At: {{formatTime .CreatedAt "2006-01-02 15:04:05"}}</p>
    </div>
</body>
</html>
`
        // Parsing template dengan fungsi kustom
        t, err := template.New("user").Funcs(FuncMap).Parse(tmpl)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Layout Templates

Layout templates adalah template yang digunakan sebagai kerangka untuk halaman web. Layout templates memungkinkan kita untuk memisahkan bagian yang sama dari halaman web, seperti header, footer, dan navigasi, sehingga dapat digunakan kembali di berbagai halaman.

### Karakteristik Layout Templates di Go
- **Template Inheritance**: Pewarisan template untuk layout
- **Block Definition**: Mendefinisikan blok yang dapat diisi oleh template anak
- **Template Composition**: Komposisi template untuk layout
- **Partial Templates**: Template parsial untuk bagian yang sama
- **Dynamic Layouts**: Layout yang dapat berubah berdasarkan kondisi

### Implementasi Layout Templates
```go
// Layout templates dasar
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Membuat layout template
        layoutTmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>{{block "title" .}}Default Title{{end}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 10px;
            margin-bottom: 20px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 10px;
            margin-top: 20px;
        }
        .content {
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{block "header" .}}Default Header{{end}}</h1>
    </div>
    <div class="content">
        {{block "content" .}}Default Content{{end}}
    </div>
    <div class="footer">
        <p>{{block "footer" .}}Default Footer{{end}}</p>
    </div>
</body>
</html>
`
        // Membuat user template
        userTmpl := `
{{define "title"}}User Template{{end}}
{{define "header"}}User Template{{end}}
{{define "content"}}
<div class="user">
    <h2>{{.Name}}</h2>
    <p>ID: {{.ID}}</p>
    <p>Age: {{.Age}}</p>
</div>
{{end}}
{{define "footer"}}© 2023 User Template{{end}}
`
        // Parsing template
        t, err := template.New("layout").Parse(layoutTmpl)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        t, err = t.Parse(userTmpl)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Layout templates dengan file
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Membuat direktori templates jika belum ada
        if err := os.MkdirAll("templates", 0755); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Membuat layout template jika belum ada
        layoutFile := "templates/layout.html"
        if _, err := os.Stat(layoutFile); os.IsNotExist(err) {
            layoutTmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>{{block "title" .}}Default Title{{end}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 10px;
            margin-bottom: 20px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 10px;
            margin-top: 20px;
        }
        .content {
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{block "header" .}}Default Header{{end}}</h1>
    </div>
    <div class="content">
        {{block "content" .}}Default Content{{end}}
    </div>
    <div class="footer">
        <p>{{block "footer" .}}Default Footer{{end}}</p>
    </div>
</body>
</html>
`
            if err := os.WriteFile(layoutFile, []byte(layoutTmpl), 0644); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
        }
        
        // Membuat user template jika belum ada
        userFile := "templates/user.html"
        if _, err := os.Stat(userFile); os.IsNotExist(err) {
            userTmpl := `
{{define "title"}}User Template{{end}}
{{define "header"}}User Template{{end}}
{{define "content"}}
<div class="user">
    <h2>{{.Name}}</h2>
    <p>ID: {{.ID}}</p>
    <p>Age: {{.Age}}</p>
</div>
{{end}}
{{define "footer"}}© 2023 User Template{{end}}
`
            if err := os.WriteFile(userFile, []byte(userTmpl), 0644); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
        }
        
        // Parsing template dari file
        t, err := template.ParseFiles(layoutFile, userFile)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, user); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Layout templates dengan dynamic layouts
package main

import (
    "fmt"
    "html/template"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

// User adalah struct untuk data user
type User struct {
    ID   string
    Name string
    Age  int
}

// PageData adalah struct untuk data halaman
type PageData struct {
    User     User
    Layout   string
    Title    string
    Header   string
    Content  string
    Footer   string
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Membuat page data
        pageData := PageData{
            User:   user,
            Layout: "default",
            Title:  "User Template",
            Header: "User Template",
            Content: `
<div class="user">
    <h2>{{.User.Name}}</h2>
    <p>ID: {{.User.ID}}</p>
    <p>Age: {{.User.Age}}</p>
</div>
`,
            Footer: "© 2023 User Template",
        }
        
        // Membuat direktori templates jika belum ada
        if err := os.MkdirAll("templates", 0755); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Membuat layout template jika belum ada
        layoutFile := "templates/layout.html"
        if _, err := os.Stat(layoutFile); os.IsNotExist(err) {
            layoutTmpl := `
<!DOCTYPE html>
<html>
<head>
    <title>{{.Title}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 10px;
            margin-bottom: 20px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 10px;
            margin-top: 20px;
        }
        .content {
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{.Header}}</h1>
    </div>
    <div class="content">
        {{template "content" .}}
    </div>
    <div class="footer">
        <p>{{.Footer}}</p>
    </div>
</body>
</html>
`
            if err := os.WriteFile(layoutFile, []byte(layoutTmpl), 0644); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
        }
        
        // Membuat content template jika belum ada
        contentFile := "templates/content.html"
        if _, err := os.Stat(contentFile); os.IsNotExist(err) {
            contentTmpl := `
{{define "content"}}
<div class="user">
    <h2>{{.User.Name}}</h2>
    <p>ID: {{.User.ID}}</p>
    <p>Age: {{.User.Age}}</p>
</div>
{{end}}
`
            if err := os.WriteFile(contentFile, []byte(contentTmpl), 0644); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
        }
        
        // Parsing template dari file
        t, err := template.ParseFiles(layoutFile, contentFile)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Eksekusi template
        if err := t.Execute(w, pageData); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Kesimpulan

Template engine adalah komponen penting dalam pengembangan web yang memungkinkan kita untuk memisahkan logika aplikasi dari presentasi. Go menyediakan package `html/template` yang kuat untuk menangani template HTML dengan fitur keamanan bawaan untuk mencegah XSS.

Dengan memahami dan mengimplementasikan konsep-konsep seperti template engine, template parsing, template execution, template functions, dan layout templates, kita dapat mengembangkan aplikasi web yang dapat menampilkan data dengan baik dan aman. Pilihan metode template yang tepat tergantung pada kebutuhan aplikasi dan kompleksitas tampilan yang diinginkan. 