# Routing

Routing adalah proses mengarahkan request HTTP ke handler yang sesuai berdasarkan URL dan method HTTP. Routing merupakan komponen penting dalam pengembangan web yang memungkinkan kita untuk mendefinisikan endpoint API dan halaman web.

## URL Routing

URL routing adalah proses mengarahkan request berdasarkan URL path. Go menyediakan beberapa cara untuk melakukan URL routing, mulai dari yang sederhana hingga yang kompleks.

### Karakteristik URL Routing di Go
- **Path Matching**: Mencocokkan URL path dengan pattern yang didefinisikan
- **Method Matching**: Mencocokkan method HTTP (GET, POST, PUT, DELETE, dll.)
- **Pattern Types**: Mendukung berbagai tipe pattern (exact, prefix, wildcard, regex)
- **Priority**: Urutan definisi route menentukan prioritas matching
- **Handler Types**: Mendukung berbagai tipe handler (function, struct, interface)

### Implementasi URL Routing
```go
// URL routing sederhana dengan http.ServeMux
package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    
    // Mendefinisikan handler untuk route "/about"
    mux.HandleFunc("/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    })
    
    // Mendefinisikan handler untuk route "/contact"
    mux.HandleFunc("/contact", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Contact Page")
    })
    
    // Mendefinisikan handler untuk route "/api"
    mux.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "API Page")
    })
    
    // Mendefinisikan handler untuk route "/api/users"
    mux.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Users API")
    })
    
    // Mendefinisikan handler untuk route "/api/products"
    mux.HandleFunc("/api/products", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Products API")
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// URL routing dengan custom router
package main

import (
    "fmt"
    "log"
    "net/http"
    "regexp"
    "strings"
)

// Route adalah struct untuk menyimpan informasi route
type Route struct {
    Method  string
    Pattern *regexp.Regexp
    Handler http.HandlerFunc
}

// Router adalah struct untuk menyimpan routes
type Router struct {
    Routes []Route
}

// NewRouter membuat instance baru dari Router
func NewRouter() *Router {
    return &Router{}
}

// AddRoute menambahkan route baru ke Router
func (r *Router) AddRoute(method, pattern string, handler http.HandlerFunc) {
    // Mengubah pattern menjadi regex
    regex := regexp.MustCompile("^" + strings.ReplaceAll(pattern, ":id", `([^/]+)`) + "$")
    
    // Menambahkan route ke Router
    r.Routes = append(r.Routes, Route{
        Method:  method,
        Pattern: regex,
        Handler: handler,
    })
}

// ServeHTTP mengimplementasikan method dari interface http.Handler
func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
    // Mencari route yang cocok
    for _, route := range r.Routes {
        // Cek method
        if route.Method != req.Method {
            continue
        }
        
        // Cek pattern
        matches := route.Pattern.FindStringSubmatch(req.URL.Path)
        if matches == nil {
            continue
        }
        
        // Ekstrak parameter dari URL
        params := make(map[string]string)
        paramNames := route.Pattern.SubexpNames()
        for i, name := range paramNames {
            if i > 0 && name != "" {
                params[name] = matches[i]
            }
        }
        
        // Menyimpan parameter di context
        ctx := req.Context()
        for k, v := range params {
            ctx = context.WithValue(ctx, k, v)
        }
        
        // Memanggil handler
        route.Handler(w, req.WithContext(ctx))
        return
    }
    
    // Route tidak ditemukan
    http.NotFound(w, req)
}

func main() {
    // Membuat router
    router := NewRouter()
    
    // Mendefinisikan handler untuk route "/"
    router.AddRoute("GET", "/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    
    // Mendefinisikan handler untuk route "/about"
    router.AddRoute("GET", "/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    })
    
    // Mendefinisikan handler untuk route "/users/:id"
    router.AddRoute("GET", "/users/:id", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari context
        id := r.Context().Value(":id").(string)
        fmt.Fprintf(w, "User ID: %s", id)
    })
    
    // Mendefinisikan handler untuk route "/products/:id"
    router.AddRoute("GET", "/products/:id", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari context
        id := r.Context().Value(":id").(string)
        fmt.Fprintf(w, "Product ID: %s", id)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}

// URL routing dengan third-party router (Gorilla Mux)
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    
    "github.com/gorilla/mux"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}

func main() {
    // Membuat router
    r := mux.NewRouter()
    
    // Mendefinisikan handler untuk route "/"
    r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    }).Methods("GET")
    
    // Mendefinisikan handler untuk route "/about"
    r.HandleFunc("/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    }).Methods("GET")
    
    // Mendefinisikan handler untuk route "/users"
    r.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Simulasi data users
        users := []User{
            {ID: "1", Name: "John Doe"},
            {ID: "2", Name: "Jane Smith"},
        }
        
        // Menulis response JSON
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(users)
    }).Methods("GET")
    
    // Mendefinisikan handler untuk route "/users/{id}"
    r.HandleFunc("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari URL
        vars := mux.Vars(r)
        id := vars["id"]
        
        // Simulasi data user
        user := User{ID: id, Name: "User " + id}
        
        // Menulis response JSON
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    }).Methods("GET")
    
    // Mendefinisikan handler untuk route "/users"
    r.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Membaca request body
        var user User
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        
        // Simulasi menyimpan user
        fmt.Printf("User saved: %+v\n", user)
        
        // Menulis response
        w.WriteHeader(http.StatusCreated)
        fmt.Fprintf(w, "User created")
    }).Methods("POST")
    
    // Mendefinisikan handler untuk route "/users/{id}"
    r.HandleFunc("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari URL
        vars := mux.Vars(r)
        id := vars["id"]
        
        // Membaca request body
        var user User
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        
        // Simulasi mengupdate user
        user.ID = id
        fmt.Printf("User updated: %+v\n", user)
        
        // Menulis response
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, "User updated")
    }).Methods("PUT")
    
    // Mendefinisikan handler untuk route "/users/{id}"
    r.HandleFunc("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari URL
        vars := mux.Vars(r)
        id := vars["id"]
        
        // Simulasi menghapus user
        fmt.Printf("User deleted: %s\n", id)
        
        // Menulis response
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, "User deleted")
    }).Methods("DELETE")
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}
```

## Route Parameters

Route parameters adalah bagian dari URL yang dapat berubah, seperti ID user atau ID produk. Route parameters memungkinkan kita untuk membuat endpoint yang dinamis.

### Karakteristik Route Parameters di Go
- **Dynamic Values**: Nilai yang dapat berubah dalam URL
- **Named Parameters**: Parameter dengan nama yang dapat diakses dalam handler
- **Optional Parameters**: Parameter yang dapat opsional
- **Multiple Parameters**: Mendukung multiple parameters dalam satu URL
- **Type Conversion**: Konversi otomatis dari string ke tipe data lain

### Implementasi Route Parameters
```go
// Route parameters dengan http.ServeMux
package main

import (
    "fmt"
    "log"
    "net/http"
    "strings"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/users/"
    mux.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil ID dari URL
        id := strings.TrimPrefix(r.URL.Path, "/users/")
        
        // Menulis response
        fmt.Fprintf(w, "User ID: %s", id)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Route parameters dengan custom router
package main

import (
    "fmt"
    "log"
    "net/http"
    "regexp"
    "strconv"
    "strings"
)

// Route adalah struct untuk menyimpan informasi route
type Route struct {
    Method  string
    Pattern *regexp.Regexp
    Handler http.HandlerFunc
}

// Router adalah struct untuk menyimpan routes
type Router struct {
    Routes []Route
}

// NewRouter membuat instance baru dari Router
func NewRouter() *Router {
    return &Router{}
}

// AddRoute menambahkan route baru ke Router
func (r *Router) AddRoute(method, pattern string, handler http.HandlerFunc) {
    // Mengubah pattern menjadi regex
    regex := regexp.MustCompile("^" + strings.ReplaceAll(pattern, ":id", `([^/]+)`) + "$")
    
    // Menambahkan route ke Router
    r.Routes = append(r.Routes, Route{
        Method:  method,
        Pattern: regex,
        Handler: handler,
    })
}

// ServeHTTP mengimplementasikan method dari interface http.Handler
func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
    // Mencari route yang cocok
    for _, route := range r.Routes {
        // Cek method
        if route.Method != req.Method {
            continue
        }
        
        // Cek pattern
        matches := route.Pattern.FindStringSubmatch(req.URL.Path)
        if matches == nil {
            continue
        }
        
        // Ekstrak parameter dari URL
        params := make(map[string]string)
        paramNames := route.Pattern.SubexpNames()
        for i, name := range paramNames {
            if i > 0 && name != "" {
                params[name] = matches[i]
            }
        }
        
        // Menyimpan parameter di context
        ctx := req.Context()
        for k, v := range params {
            ctx = context.WithValue(ctx, k, v)
        }
        
        // Memanggil handler
        route.Handler(w, req.WithContext(ctx))
        return
    }
    
    // Route tidak ditemukan
    http.NotFound(w, req)
}

func main() {
    // Membuat router
    router := NewRouter()
    
    // Mendefinisikan handler untuk route "/users/:id"
    router.AddRoute("GET", "/users/:id", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari context
        id := r.Context().Value(":id").(string)
        fmt.Fprintf(w, "User ID: %s", id)
    })
    
    // Mendefinisikan handler untuk route "/users/:id/posts/:postId"
    router.AddRoute("GET", "/users/:id/posts/:postId", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari context
        id := r.Context().Value(":id").(string)
        postId := r.Context().Value(":postId").(string)
        fmt.Fprintf(w, "User ID: %s, Post ID: %s", id, postId)
    })
    
    // Mendefinisikan handler untuk route "/products/:id"
    router.AddRoute("GET", "/products/:id", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari context
        id := r.Context().Value(":id").(string)
        
        // Konversi ID ke integer
        productId, err := strconv.Atoi(id)
        if err != nil {
            http.Error(w, "Invalid product ID", http.StatusBadRequest)
            return
        }
        
        fmt.Fprintf(w, "Product ID: %d", productId)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}

// Route parameters dengan third-party router (Gorilla Mux)
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    
    "github.com/gorilla/mux"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id"`
    Name string `json:"name"`
}

// Post adalah struct untuk data post
type Post struct {
    ID     string `json:"id"`
    UserID string `json:"userId"`
    Title  string `json:"title"`
}

func main() {
    // Membuat router
    r := mux.NewRouter()
    
    // Mendefinisikan handler untuk route "/users/{id}"
    r.HandleFunc("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari URL
        vars := mux.Vars(r)
        id := vars["id"]
        
        // Simulasi data user
        user := User{ID: id, Name: "User " + id}
        
        // Menulis response JSON
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    }).Methods("GET")
    
    // Mendefinisikan handler untuk route "/users/{id}/posts/{postId}"
    r.HandleFunc("/users/{id}/posts/{postId}", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari URL
        vars := mux.Vars(r)
        id := vars["id"]
        postId := vars["postId"]
        
        // Simulasi data post
        post := Post{
            ID:     postId,
            UserID: id,
            Title:  "Post " + postId + " by User " + id,
        }
        
        // Menulis response JSON
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(post)
    }).Methods("GET")
    
    // Mendefinisikan handler untuk route "/users/{id}/posts"
    r.HandleFunc("/users/{id}/posts", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari URL
        vars := mux.Vars(r)
        id := vars["id"]
        
        // Simulasi data posts
        posts := []Post{
            {ID: "1", UserID: id, Title: "Post 1 by User " + id},
            {ID: "2", UserID: id, Title: "Post 2 by User " + id},
        }
        
        // Menulis response JSON
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(posts)
    }).Methods("GET")
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}
```

## Query Parameters

Query parameters adalah parameter yang ditambahkan ke URL setelah tanda tanya (?), seperti `?name=John&age=30`. Query parameters memungkinkan kita untuk mengirim data tambahan ke server.

### Karakteristik Query Parameters di Go
- **Key-Value Pairs**: Parameter dalam bentuk key-value
- **Multiple Values**: Mendukung multiple values untuk satu key
- **Optional**: Parameter yang dapat opsional
- **Type Conversion**: Konversi otomatis dari string ke tipe data lain
- **Validation**: Validasi nilai parameter

### Implementasi Query Parameters
```go
// Query parameters dengan http.ServeMux
package main

import (
    "fmt"
    "log"
    "net/http"
    "strconv"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/search"
    mux.HandleFunc("/search", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil query parameter
        query := r.URL.Query().Get("q")
        page := r.URL.Query().Get("page")
        limit := r.URL.Query().Get("limit")
        
        // Konversi page dan limit ke integer
        pageNum, _ := strconv.Atoi(page)
        limitNum, _ := strconv.Atoi(limit)
        
        // Menulis response
        fmt.Fprintf(w, "Search for: %s, Page: %d, Limit: %d", query, pageNum, limitNum)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Query parameters dengan custom router
package main

import (
    "fmt"
    "log"
    "net/http"
    "strconv"
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
    
    // Mendefinisikan handler untuk route "/users"
    mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil query parameter
        name := r.URL.Query().Get("name")
        age := r.URL.Query().Get("age")
        limit := r.URL.Query().Get("limit")
        
        // Konversi age dan limit ke integer
        ageNum, _ := strconv.Atoi(age)
        limitNum, _ := strconv.Atoi(limit)
        
        // Simulasi data users
        users := []User{
            {ID: "1", Name: "John Doe", Age: 30},
            {ID: "2", Name: "Jane Smith", Age: 25},
        }
        
        // Filter users berdasarkan query parameter
        if name != "" {
            // Filter by name
            filtered := []User{}
            for _, user := range users {
                if user.Name == name {
                    filtered = append(filtered, user)
                }
            }
            users = filtered
        }
        
        if ageNum > 0 {
            // Filter by age
            filtered := []User{}
            for _, user := range users {
                if user.Age == ageNum {
                    filtered = append(filtered, user)
                }
            }
            users = filtered
        }
        
        // Limit hasil
        if limitNum > 0 && limitNum < len(users) {
            users = users[:limitNum]
        }
        
        // Menulis response
        fmt.Fprintf(w, "Users: %+v", users)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Query parameters dengan third-party router (Gorilla Mux)
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    
    "github.com/gorilla/mux"
)

// Product adalah struct untuk data product
type Product struct {
    ID    string  `json:"id"`
    Name  string  `json:"name"`
    Price float64 `json:"price"`
}

func main() {
    // Membuat router
    r := mux.NewRouter()
    
    // Mendefinisikan handler untuk route "/products"
    r.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil query parameter
        name := r.URL.Query().Get("name")
        minPrice := r.URL.Query().Get("min_price")
        maxPrice := r.URL.Query().Get("max_price")
        limit := r.URL.Query().Get("limit")
        
        // Konversi minPrice, maxPrice, dan limit ke float64/int
        minPriceNum, _ := strconv.ParseFloat(minPrice, 64)
        maxPriceNum, _ := strconv.ParseFloat(maxPrice, 64)
        limitNum, _ := strconv.Atoi(limit)
        
        // Simulasi data products
        products := []Product{
            {ID: "1", Name: "Product 1", Price: 10.0},
            {ID: "2", Name: "Product 2", Price: 20.0},
            {ID: "3", Name: "Product 3", Price: 30.0},
        }
        
        // Filter products berdasarkan query parameter
        if name != "" {
            // Filter by name
            filtered := []Product{}
            for _, product := range products {
                if product.Name == name {
                    filtered = append(filtered, product)
                }
            }
            products = filtered
        }
        
        if minPriceNum > 0 {
            // Filter by min price
            filtered := []Product{}
            for _, product := range products {
                if product.Price >= minPriceNum {
                    filtered = append(filtered, product)
                }
            }
            products = filtered
        }
        
        if maxPriceNum > 0 {
            // Filter by max price
            filtered := []Product{}
            for _, product := range products {
                if product.Price <= maxPriceNum {
                    filtered = append(filtered, product)
                }
            }
            products = filtered
        }
        
        // Limit hasil
        if limitNum > 0 && limitNum < len(products) {
            products = products[:limitNum]
        }
        
        // Menulis response JSON
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(products)
    }).Methods("GET")
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}
```

## Route Groups

Route groups adalah cara untuk mengelompokkan route yang memiliki prefix atau middleware yang sama. Route groups memungkinkan kita untuk mengorganisir route dengan lebih baik.

### Karakteristik Route Groups di Go
- **Prefix**: Route dalam satu grup memiliki prefix yang sama
- **Middleware**: Middleware yang sama dapat diterapkan ke semua route dalam grup
- **Nesting**: Grup dapat di-nest (grup dalam grup)
- **Organisasi**: Memudahkan organisasi route berdasarkan fungsionalitas
- **Reusability**: Memudahkan penggunaan kembali prefix dan middleware

### Implementasi Route Groups
```go
// Route groups dengan custom router
package main

import (
    "fmt"
    "log"
    "net/http"
    "strings"
)

// Group adalah struct untuk menyimpan informasi grup
type Group struct {
    Prefix     string
    Middleware []func(http.Handler) http.Handler
    Router     *Router
}

// Router adalah struct untuk menyimpan routes
type Router struct {
    Groups []Group
    Routes []Route
}

// Route adalah struct untuk menyimpan informasi route
type Route struct {
    Method  string
    Pattern string
    Handler http.HandlerFunc
}

// NewRouter membuat instance baru dari Router
func NewRouter() *Router {
    return &Router{}
}

// Group membuat grup baru
func (r *Router) Group(prefix string, middleware ...func(http.Handler) http.Handler) *Group {
    group := Group{
        Prefix:     prefix,
        Middleware: middleware,
        Router:     r,
    }
    r.Groups = append(r.Groups, group)
    return &group
}

// HandleFunc menambahkan route baru ke Router
func (r *Router) HandleFunc(method, pattern string, handler http.HandlerFunc) {
    r.Routes = append(r.Routes, Route{
        Method:  method,
        Pattern: pattern,
        Handler: handler,
    })
}

// HandleFunc menambahkan route baru ke Group
func (g *Group) HandleFunc(method, pattern string, handler http.HandlerFunc) {
    // Menggabungkan prefix dengan pattern
    fullPattern := g.Prefix + pattern
    
    // Menambahkan route ke Router
    g.Router.HandleFunc(method, fullPattern, handler)
}

// ServeHTTP mengimplementasikan method dari interface http.Handler
func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
    // Mencari route yang cocok
    for _, route := range r.Routes {
        // Cek method
        if route.Method != req.Method {
            continue
        }
        
        // Cek pattern
        if !strings.HasPrefix(req.URL.Path, route.Pattern) {
            continue
        }
        
        // Membuat handler
        handler := route.Handler
        
        // Menerapkan middleware
        for _, group := range r.Groups {
            if strings.HasPrefix(req.URL.Path, group.Prefix) {
                for i := len(group.Middleware) - 1; i >= 0; i-- {
                    handler = group.Middleware[i](http.HandlerFunc(handler)).ServeHTTP
                }
                break
            }
        }
        
        // Memanggil handler
        handler(w, req)
        return
    }
    
    // Route tidak ditemukan
    http.NotFound(w, req)
}

func main() {
    // Membuat router
    router := NewRouter()
    
    // Middleware untuk logging
    loggingMiddleware := func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            fmt.Printf("Request: %s %s\n", r.Method, r.URL.Path)
            next.ServeHTTP(w, r)
        })
    }
    
    // Middleware untuk autentikasi
    authMiddleware := func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if r.Header.Get("Authorization") != "Bearer secret-token" {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
    
    // Grup untuk route publik
    public := router.Group("")
    public.HandleFunc("GET", "/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    public.HandleFunc("GET", "/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    })
    
    // Grup untuk route API
    api := router.Group("/api", loggingMiddleware)
    api.HandleFunc("GET", "/users", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Users API")
    })
    api.HandleFunc("GET", "/products", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Products API")
    })
    
    // Grup untuk route admin
    admin := router.Group("/admin", loggingMiddleware, authMiddleware)
    admin.HandleFunc("GET", "/dashboard", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Admin Dashboard")
    })
    admin.HandleFunc("GET", "/users", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Admin Users")
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}

// Route groups dengan third-party router (Gorilla Mux)
package main

import (
    "fmt"
    "log"
    "net/http"
    
    "github.com/gorilla/mux"
)

func main() {
    // Membuat router
    r := mux.NewRouter()
    
    // Middleware untuk logging
    loggingMiddleware := func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            fmt.Printf("Request: %s %s\n", r.Method, r.URL.Path)
            next.ServeHTTP(w, r)
        })
    }
    
    // Middleware untuk autentikasi
    authMiddleware := func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if r.Header.Get("Authorization") != "Bearer secret-token" {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
    
    // Grup untuk route publik
    public := r.PathPrefix("").Subrouter()
    public.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    }).Methods("GET")
    public.HandleFunc("/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    }).Methods("GET")
    
    // Grup untuk route API
    api := r.PathPrefix("/api").Subrouter()
    api.Use(loggingMiddleware)
    api.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Users API")
    }).Methods("GET")
    api.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Products API")
    }).Methods("GET")
    
    // Grup untuk route admin
    admin := r.PathPrefix("/admin").Subrouter()
    admin.Use(loggingMiddleware, authMiddleware)
    admin.HandleFunc("/dashboard", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Admin Dashboard")
    }).Methods("GET")
    admin.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Admin Users")
    }).Methods("GET")
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}
```

## Custom Routing

Custom routing adalah implementasi routing yang dibuat sendiri, tidak menggunakan router bawaan atau third-party. Custom routing memungkinkan kita untuk membuat router yang sesuai dengan kebutuhan aplikasi.

### Karakteristik Custom Routing di Go
- **Fleksibilitas**: Dapat disesuaikan dengan kebutuhan aplikasi
- **Kompleksitas**: Dapat menangani kasus yang kompleks
- **Performa**: Dapat dioptimalkan untuk performa
- **Fitur Kustom**: Dapat menambahkan fitur yang tidak ada di router lain
- **Kontrol Penuh**: Memiliki kontrol penuh atas implementasi routing

### Implementasi Custom Routing
```go
// Custom routing dengan regex
package main

import (
    "fmt"
    "log"
    "net/http"
    "regexp"
    "strings"
)

// Route adalah struct untuk menyimpan informasi route
type Route struct {
    Method  string
    Pattern *regexp.Regexp
    Handler http.HandlerFunc
}

// Router adalah struct untuk menyimpan routes
type Router struct {
    Routes []Route
}

// NewRouter membuat instance baru dari Router
func NewRouter() *Router {
    return &Router{}
}

// AddRoute menambahkan route baru ke Router
func (r *Router) AddRoute(method, pattern string, handler http.HandlerFunc) {
    // Mengubah pattern menjadi regex
    regex := regexp.MustCompile("^" + strings.ReplaceAll(pattern, ":id", `([^/]+)`) + "$")
    
    // Menambahkan route ke Router
    r.Routes = append(r.Routes, Route{
        Method:  method,
        Pattern: regex,
        Handler: handler,
    })
}

// ServeHTTP mengimplementasikan method dari interface http.Handler
func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
    // Mencari route yang cocok
    for _, route := range r.Routes {
        // Cek method
        if route.Method != req.Method {
            continue
        }
        
        // Cek pattern
        matches := route.Pattern.FindStringSubmatch(req.URL.Path)
        if matches == nil {
            continue
        }
        
        // Ekstrak parameter dari URL
        params := make(map[string]string)
        paramNames := route.Pattern.SubexpNames()
        for i, name := range paramNames {
            if i > 0 && name != "" {
                params[name] = matches[i]
            }
        }
        
        // Menyimpan parameter di context
        ctx := req.Context()
        for k, v := range params {
            ctx = context.WithValue(ctx, k, v)
        }
        
        // Memanggil handler
        route.Handler(w, req.WithContext(ctx))
        return
    }
    
    // Route tidak ditemukan
    http.NotFound(w, req)
}

func main() {
    // Membuat router
    router := NewRouter()
    
    // Mendefinisikan handler untuk route "/"
    router.AddRoute("GET", "/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    
    // Mendefinisikan handler untuk route "/about"
    router.AddRoute("GET", "/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    })
    
    // Mendefinisikan handler untuk route "/users/:id"
    router.AddRoute("GET", "/users/:id", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari context
        id := r.Context().Value(":id").(string)
        fmt.Fprintf(w, "User ID: %s", id)
    })
    
    // Mendefinisikan handler untuk route "/products/:id"
    router.AddRoute("GET", "/products/:id", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari context
        id := r.Context().Value(":id").(string)
        fmt.Fprintf(w, "Product ID: %s", id)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}

// Custom routing dengan trie
package main

import (
    "fmt"
    "log"
    "net/http"
    "strings"
)

// Node adalah struct untuk menyimpan node dalam trie
type Node struct {
    Children map[string]*Node
    Handler  http.HandlerFunc
    Param    string
    IsParam  bool
}

// Router adalah struct untuk menyimpan routes
type Router struct {
    Root *Node
}

// NewRouter membuat instance baru dari Router
func NewRouter() *Router {
    return &Router{
        Root: &Node{
            Children: make(map[string]*Node),
        },
    }
}

// AddRoute menambahkan route baru ke Router
func (r *Router) AddRoute(method, path string, handler http.HandlerFunc) {
    // Membuat node root jika belum ada
    if r.Root == nil {
        r.Root = &Node{
            Children: make(map[string]*Node),
        }
    }
    
    // Membuat node untuk method jika belum ada
    methodNode, ok := r.Root.Children[method]
    if !ok {
        methodNode = &Node{
            Children: make(map[string]*Node),
        }
        r.Root.Children[method] = methodNode
    }
    
    // Memisahkan path menjadi segmen
    segments := strings.Split(path, "/")
    
    // Menambahkan segmen ke trie
    currentNode := methodNode
    for _, segment := range segments {
        if segment == "" {
            continue
        }
        
        // Cek apakah segmen adalah parameter
        if strings.HasPrefix(segment, ":") {
            param := strings.TrimPrefix(segment, ":")
            
            // Membuat node parameter
            paramNode := &Node{
                Children: make(map[string]*Node),
                Param:    param,
                IsParam:  true,
            }
            
            // Menambahkan node parameter ke children
            currentNode.Children[":"] = paramNode
            currentNode = paramNode
        } else {
            // Membuat node untuk segmen
            segmentNode, ok := currentNode.Children[segment]
            if !ok {
                segmentNode = &Node{
                    Children: make(map[string]*Node),
                }
                currentNode.Children[segment] = segmentNode
            }
            currentNode = segmentNode
        }
    }
    
    // Menambahkan handler ke node terakhir
    currentNode.Handler = handler
}

// ServeHTTP mengimplementasikan method dari interface http.Handler
func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
    // Mencari node yang cocok
    methodNode, ok := r.Root.Children[req.Method]
    if !ok {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
    
    // Memisahkan path menjadi segmen
    segments := strings.Split(req.URL.Path, "/")
    
    // Mencari node yang cocok
    currentNode := methodNode
    params := make(map[string]string)
    
    for _, segment := range segments {
        if segment == "" {
            continue
        }
        
        // Cek apakah ada node yang cocok
        node, ok := currentNode.Children[segment]
        if !ok {
            // Cek apakah ada node parameter
            paramNode, ok := currentNode.Children[":"]
            if !ok {
                http.NotFound(w, req)
                return
            }
            
            // Menyimpan parameter
            params[paramNode.Param] = segment
            currentNode = paramNode
        } else {
            currentNode = node
        }
    }
    
    // Cek apakah node memiliki handler
    if currentNode.Handler == nil {
        http.NotFound(w, req)
        return
    }
    
    // Menyimpan parameter di context
    ctx := req.Context()
    for k, v := range params {
        ctx = context.WithValue(ctx, k, v)
    }
    
    // Memanggil handler
    currentNode.Handler(w, req.WithContext(ctx))
}

func main() {
    // Membuat router
    router := NewRouter()
    
    // Mendefinisikan handler untuk route "/"
    router.AddRoute("GET", "/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Home Page")
    })
    
    // Mendefinisikan handler untuk route "/about"
    router.AddRoute("GET", "/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "About Page")
    })
    
    // Mendefinisikan handler untuk route "/users/:id"
    router.AddRoute("GET", "/users/:id", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari context
        id := r.Context().Value(":id").(string)
        fmt.Fprintf(w, "User ID: %s", id)
    })
    
    // Mendefinisikan handler untuk route "/products/:id"
    router.AddRoute("GET", "/products/:id", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil parameter dari context
        id := r.Context().Value(":id").(string)
        fmt.Fprintf(w, "Product ID: %s", id)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

## Kesimpulan

Routing adalah komponen penting dalam pengembangan web yang memungkinkan kita untuk mengarahkan request HTTP ke handler yang sesuai. Go menyediakan beberapa cara untuk melakukan routing, mulai dari yang sederhana dengan `http.ServeMux` hingga yang kompleks dengan router kustom atau third-party router seperti Gorilla Mux.

Dengan memahami dan mengimplementasikan konsep-konsep seperti URL routing, route parameters, query parameters, route groups, dan custom routing, kita dapat mengembangkan aplikasi web yang terorganisir dan mudah dimaintain. Pilihan router yang tepat tergantung pada kebutuhan aplikasi, mulai dari yang sederhana hingga yang kompleks. 