# REST API Basics

REST (Representational State Transfer) adalah arsitektur perangkat lunak yang mendefinisikan serangkaian prinsip dan kendala untuk merancang sistem terdistribusi. REST API adalah implementasi dari prinsip-prinsip ini untuk membangun layanan web. Dalam pengembangan aplikasi Go, memahami dasar-dasar REST API sangat penting untuk membangun layanan web yang efisien dan mudah digunakan.

## HTTP Methods

HTTP methods mendefinisikan jenis operasi yang akan dilakukan pada resource. REST API menggunakan metode HTTP standar untuk operasi CRUD (Create, Read, Update, Delete).

### Metode HTTP Utama

1. **GET**: Mengambil data dari server
   - Tidak mengubah data di server
   - Dapat di-cache
   - Tidak boleh memiliki body request

2. **POST**: Membuat resource baru
   - Mengirim data ke server untuk diproses
   - Biasanya memiliki body request
   - Tidak idempoten (multiple requests dapat menghasilkan hasil yang berbeda)

3. **PUT**: Mengganti resource yang ada
   - Mengirim data lengkap untuk mengganti resource
   - Idempoten (multiple requests menghasilkan hasil yang sama)
   - Biasanya memiliki body request

4. **PATCH**: Memperbarui sebagian dari resource
   - Mengirim hanya data yang perlu diperbarui
   - Idempoten
   - Biasanya memiliki body request

5. **DELETE**: Menghapus resource
   - Menghapus resource yang ditentukan
   - Idempoten
   - Biasanya tidak memiliki body request

### Implementasi HTTP Methods di Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "github.com/gorilla/mux"
)

// User merepresentasikan model data user
type User struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
}

// In-memory storage untuk contoh
var users = []User{
    {ID: 1, Username: "john", Email: "john@example.com"},
    {ID: 2, Username: "jane", Email: "jane@example.com"},
}

// getUsers menangani GET request untuk mengambil semua user
func getUsers(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}

// getUser menangani GET request untuk mengambil user berdasarkan ID
func getUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    for _, user := range users {
        if strconv.Itoa(user.ID) == params["id"] {
            json.NewEncoder(w).Encode(user)
            return
        }
    }
    
    // Jika user tidak ditemukan
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
}

// createUser menangani POST request untuk membuat user baru
func createUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    var user User
    err := json.NewDecoder(r.Body).Decode(&user)
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"message": "Invalid request payload"})
        return
    }
    
    // Generate ID baru (dalam aplikasi nyata, ini akan dilakukan oleh database)
    user.ID = len(users) + 1
    
    // Tambahkan user baru ke slice
    users = append(users, user)
    
    // Return user yang baru dibuat dengan status 201 Created
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}

// updateUser menangani PUT request untuk memperbarui user
func updateUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    var updatedUser User
    err := json.NewDecoder(r.Body).Decode(&updatedUser)
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{"message": "Invalid request payload"})
        return
    }
    
    // Cari user berdasarkan ID
    for i, user := range users {
        if strconv.Itoa(user.ID) == params["id"] {
            // Pastikan ID tetap sama
            updatedUser.ID = user.ID
            
            // Update user
            users[i] = updatedUser
            
            // Return user yang diperbarui
            json.NewEncoder(w).Encode(updatedUser)
            return
        }
    }
    
    // Jika user tidak ditemukan
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
}

// deleteUser menangani DELETE request untuk menghapus user
func deleteUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    // Cari user berdasarkan ID
    for i, user := range users {
        if strconv.Itoa(user.ID) == params["id"] {
            // Hapus user dari slice
            users = append(users[:i], users[i+1:]...)
            
            // Return pesan sukses
            json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
            return
        }
    }
    
    // Jika user tidak ditemukan
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
}

func main() {
    // Inisialisasi router
    router := mux.NewRouter()
    
    // Definisikan routes
    router.HandleFunc("/api/users", getUsers).Methods("GET")
    router.HandleFunc("/api/users/{id}", getUser).Methods("GET")
    router.HandleFunc("/api/users", createUser).Methods("POST")
    router.HandleFunc("/api/users/{id}", updateUser).Methods("PUT")
    router.HandleFunc("/api/users/{id}", deleteUser).Methods("DELETE")
    
    // Jalankan server
    fmt.Println("Server running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

## Resource Naming

Resource naming adalah praktik memberikan nama yang jelas dan konsisten untuk resource dalam API. Nama resource harus mencerminkan entitas yang diwakilinya dan mengikuti konvensi penamaan yang konsisten.

### Prinsip Resource Naming

1. **Gunakan Kata Benda**: Resource harus diwakili oleh kata benda, bukan kata kerja
   - ✅ `/users` (benar)
   - ❌ `/getUsers` (salah)

2. **Gunakan Bentuk Jamak**: Gunakan bentuk jamak untuk nama resource
   - ✅ `/users` (benar)
   - ❌ `/user` (salah)

3. **Gunakan Kebab Case atau Snake Case**: Gunakan kebab case atau snake case untuk nama resource yang terdiri dari beberapa kata
   - ✅ `/user-profiles` atau `/user_profiles` (benar)
   - ❌ `/userProfiles` (salah)

4. **Hindari Kata Kerja**: Hindari menggunakan kata kerja dalam nama resource
   - ✅ `/users/{id}/orders` (benar)
   - ❌ `/users/{id}/getOrders` (salah)

5. **Gunakan Hierarki yang Logis**: Gunakan hierarki yang logis untuk resource yang berelasi
   - ✅ `/users/{id}/orders/{orderId}/items` (benar)
   - ❌ `/orders/{orderId}/users/{id}/items` (salah)

### Implementasi Resource Naming di Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "github.com/gorilla/mux"
)

// User merepresentasikan model data user
type User struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
}

// Order merepresentasikan model data order
type Order struct {
    ID     int     `json:"id"`
    UserID int     `json:"userId"`
    Items  []Item  `json:"items"`
    Total  float64 `json:"total"`
}

// Item merepresentasikan model data item dalam order
type Item struct {
    ID       int     `json:"id"`
    OrderID  int     `json:"orderId"`
    Product  string  `json:"product"`
    Quantity int     `json:"quantity"`
    Price    float64 `json:"price"`
}

// In-memory storage untuk contoh
var users = []User{
    {ID: 1, Username: "john", Email: "john@example.com"},
    {ID: 2, Username: "jane", Email: "jane@example.com"},
}

var orders = []Order{
    {
        ID:     1,
        UserID: 1,
        Items: []Item{
            {ID: 1, OrderID: 1, Product: "Laptop", Quantity: 1, Price: 999.99},
            {ID: 2, OrderID: 1, Product: "Mouse", Quantity: 1, Price: 29.99},
        },
        Total: 1029.98,
    },
    {
        ID:     2,
        UserID: 2,
        Items: []Item{
            {ID: 3, OrderID: 2, Product: "Keyboard", Quantity: 1, Price: 59.99},
        },
        Total: 59.99,
    },
}

// getUsers menangani GET request untuk mengambil semua user
func getUsers(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}

// getUser menangani GET request untuk mengambil user berdasarkan ID
func getUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    for _, user := range users {
        if strconv.Itoa(user.ID) == params["id"] {
            json.NewEncoder(w).Encode(user)
            return
        }
    }
    
    // Jika user tidak ditemukan
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
}

// getUserOrders menangani GET request untuk mengambil semua order dari user tertentu
func getUserOrders(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    userID, _ := strconv.Atoi(params["id"])
    
    var userOrders []Order
    for _, order := range orders {
        if order.UserID == userID {
            userOrders = append(userOrders, order)
        }
    }
    
    json.NewEncoder(w).Encode(userOrders)
}

// getOrder menangani GET request untuk mengambil order berdasarkan ID
func getOrder(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    for _, order := range orders {
        if strconv.Itoa(order.ID) == params["orderId"] {
            json.NewEncoder(w).Encode(order)
            return
        }
    }
    
    // Jika order tidak ditemukan
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(map[string]string{"message": "Order not found"})
}

// getOrderItems menangani GET request untuk mengambil semua item dari order tertentu
func getOrderItems(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    orderID, _ := strconv.Atoi(params["orderId"])
    
    for _, order := range orders {
        if order.ID == orderID {
            json.NewEncoder(w).Encode(order.Items)
            return
        }
    }
    
    // Jika order tidak ditemukan
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(map[string]string{"message": "Order not found"})
}

func main() {
    // Inisialisasi router
    router := mux.NewRouter()
    
    // Definisikan routes dengan resource naming yang baik
    router.HandleFunc("/api/users", getUsers).Methods("GET")
    router.HandleFunc("/api/users/{id}", getUser).Methods("GET")
    router.HandleFunc("/api/users/{id}/orders", getUserOrders).Methods("GET")
    router.HandleFunc("/api/orders/{orderId}", getOrder).Methods("GET")
    router.HandleFunc("/api/orders/{orderId}/items", getOrderItems).Methods("GET")
    
    // Jalankan server
    fmt.Println("Server running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

## Status Codes

Status codes adalah kode numerik yang dikembalikan oleh server untuk menunjukkan hasil dari request. Status codes membantu client memahami hasil dari request dan mengambil tindakan yang sesuai.

### Status Codes Umum

1. **2xx Success**:
   - **200 OK**: Request berhasil
   - **201 Created**: Resource berhasil dibuat
   - **204 No Content**: Request berhasil tetapi tidak ada konten untuk dikembalikan

2. **3xx Redirection**:
   - **301 Moved Permanently**: Resource telah dipindahkan secara permanen
   - **302 Found**: Resource telah dipindahkan sementara

3. **4xx Client Error**:
   - **400 Bad Request**: Request tidak valid
   - **401 Unauthorized**: Autentikasi diperlukan
   - **403 Forbidden**: Autorisasi ditolak
   - **404 Not Found**: Resource tidak ditemukan
   - **405 Method Not Allowed**: Metode HTTP tidak diizinkan
   - **409 Conflict**: Konflik dengan resource yang ada

4. **5xx Server Error**:
   - **500 Internal Server Error**: Kesalahan server umum
   - **501 Not Implemented**: Fitur tidak diimplementasikan
   - **503 Service Unavailable**: Layanan tidak tersedia

### Implementasi Status Codes di Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "github.com/gorilla/mux"
)

// User merepresentasikan model data user
type User struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
}

// ErrorResponse merepresentasikan format response error
type ErrorResponse struct {
    Status  int    `json:"status"`
    Message string `json:"message"`
}

// In-memory storage untuk contoh
var users = []User{
    {ID: 1, Username: "john", Email: "john@example.com"},
    {ID: 2, Username: "jane", Email: "jane@example.com"},
}

// getUsers menangani GET request untuk mengambil semua user
func getUsers(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    // Jika tidak ada user, kembalikan array kosong
    if len(users) == 0 {
        json.NewEncoder(w).Encode([]User{})
        return
    }
    
    // Kembalikan semua user dengan status 200 OK
    json.NewEncoder(w).Encode(users)
}

// getUser menangani GET request untuk mengambil user berdasarkan ID
func getUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    for _, user := range users {
        if strconv.Itoa(user.ID) == params["id"] {
            // Kembalikan user dengan status 200 OK
            json.NewEncoder(w).Encode(user)
            return
        }
    }
    
    // Jika user tidak ditemukan, kembalikan status 404 Not Found
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(ErrorResponse{
        Status:  http.StatusNotFound,
        Message: "User not found",
    })
}

// createUser menangani POST request untuk membuat user baru
func createUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    var user User
    err := json.NewDecoder(r.Body).Decode(&user)
    if err != nil {
        // Jika request tidak valid, kembalikan status 400 Bad Request
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Invalid request payload",
        })
        return
    }
    
    // Validasi input
    if user.Username == "" || user.Email == "" {
        // Jika input tidak lengkap, kembalikan status 400 Bad Request
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Username and email are required",
        })
        return
    }
    
    // Cek apakah username sudah ada
    for _, u := range users {
        if u.Username == user.Username {
            // Jika username sudah ada, kembalikan status 409 Conflict
            w.WriteHeader(http.StatusConflict)
            json.NewEncoder(w).Encode(ErrorResponse{
                Status:  http.StatusConflict,
                Message: "Username already exists",
            })
            return
        }
    }
    
    // Generate ID baru (dalam aplikasi nyata, ini akan dilakukan oleh database)
    user.ID = len(users) + 1
    
    // Tambahkan user baru ke slice
    users = append(users, user)
    
    // Kembalikan user yang baru dibuat dengan status 201 Created
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}

// updateUser menangani PUT request untuk memperbarui user
func updateUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    var updatedUser User
    err := json.NewDecoder(r.Body).Decode(&updatedUser)
    if err != nil {
        // Jika request tidak valid, kembalikan status 400 Bad Request
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Invalid request payload",
        })
        return
    }
    
    // Validasi input
    if updatedUser.Username == "" || updatedUser.Email == "" {
        // Jika input tidak lengkap, kembalikan status 400 Bad Request
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Username and email are required",
        })
        return
    }
    
    // Cari user berdasarkan ID
    for i, user := range users {
        if strconv.Itoa(user.ID) == params["id"] {
            // Pastikan ID tetap sama
            updatedUser.ID = user.ID
            
            // Cek apakah username sudah digunakan oleh user lain
            for j, u := range users {
                if i != j && u.Username == updatedUser.Username {
                    // Jika username sudah digunakan oleh user lain, kembalikan status 409 Conflict
                    w.WriteHeader(http.StatusConflict)
                    json.NewEncoder(w).Encode(ErrorResponse{
                        Status:  http.StatusConflict,
                        Message: "Username already exists",
                    })
                    return
                }
            }
            
            // Update user
            users[i] = updatedUser
            
            // Kembalikan user yang diperbarui dengan status 200 OK
            json.NewEncoder(w).Encode(updatedUser)
            return
        }
    }
    
    // Jika user tidak ditemukan, kembalikan status 404 Not Found
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(ErrorResponse{
        Status:  http.StatusNotFound,
        Message: "User not found",
    })
}

// deleteUser menangani DELETE request untuk menghapus user
func deleteUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    // Cari user berdasarkan ID
    for i, user := range users {
        if strconv.Itoa(user.ID) == params["id"] {
            // Hapus user dari slice
            users = append(users[:i], users[i+1:]...)
            
            // Kembalikan pesan sukses dengan status 200 OK
            json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
            return
        }
    }
    
    // Jika user tidak ditemukan, kembalikan status 404 Not Found
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(ErrorResponse{
        Status:  http.StatusNotFound,
        Message: "User not found",
    })
}

// methodNotAllowed menangani request dengan metode HTTP yang tidak diizinkan
func methodNotAllowed(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    // Kembalikan status 405 Method Not Allowed
    w.WriteHeader(http.StatusMethodNotAllowed)
    json.NewEncoder(w).Encode(ErrorResponse{
        Status:  http.StatusMethodNotAllowed,
        Message: "Method not allowed",
    })
}

func main() {
    // Inisialisasi router
    router := mux.NewRouter()
    
    // Definisikan routes
    router.HandleFunc("/api/users", getUsers).Methods("GET")
    router.HandleFunc("/api/users/{id}", getUser).Methods("GET")
    router.HandleFunc("/api/users", createUser).Methods("POST")
    router.HandleFunc("/api/users/{id}", updateUser).Methods("PUT")
    router.HandleFunc("/api/users/{id}", deleteUser).Methods("DELETE")
    
    // Tangani metode HTTP yang tidak diizinkan
    router.MethodNotAllowedHandler = http.HandlerFunc(methodNotAllowed)
    
    // Jalankan server
    fmt.Println("Server running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

## Request/Response Format

Format request dan response adalah cara data dikirim dan diterima antara client dan server. Format yang umum digunakan dalam REST API adalah JSON (JavaScript Object Notation).

### Format Request

1. **Headers**: Informasi tambahan tentang request
   - `Content-Type`: Tipe konten yang dikirim (biasanya `application/json`)
   - `Authorization`: Token autentikasi
   - `Accept`: Tipe konten yang diharapkan dari response

2. **Body**: Data yang dikirim dalam request (untuk metode POST, PUT, PATCH)
   ```json
   {
     "username": "john",
     "email": "john@example.com"
   }
   ```

3. **Query Parameters**: Parameter yang dikirim dalam URL (untuk metode GET)
   ```
   /api/users?limit=10&offset=0
   ```

4. **Path Parameters**: Parameter yang dikirim dalam path URL
   ```
   /api/users/123
   ```

### Format Response

1. **Headers**: Informasi tambahan tentang response
   - `Content-Type`: Tipe konten yang dikirim (biasanya `application/json`)
   - `Status`: Kode status HTTP

2. **Body**: Data yang dikirim dalam response
   ```json
   {
     "id": 1,
     "username": "john",
     "email": "john@example.com"
   }
   ```

3. **Error Response**: Format untuk response error
   ```json
   {
     "status": 400,
     "message": "Invalid request payload"
   }
   ```

### Implementasi Request/Response Format di Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "github.com/gorilla/mux"
)

// User merepresentasikan model data user
type User struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
}

// ErrorResponse merepresentasikan format response error
type ErrorResponse struct {
    Status  int    `json:"status"`
    Message string `json:"message"`
}

// PaginatedResponse merepresentasikan format response dengan paginasi
type PaginatedResponse struct {
    Data       interface{} `json:"data"`
    Total      int         `json:"total"`
    Limit      int         `json:"limit"`
    Offset     int         `json:"offset"`
    NextOffset int         `json:"nextOffset,omitempty"`
}

// In-memory storage untuk contoh
var users = []User{
    {ID: 1, Username: "john", Email: "john@example.com"},
    {ID: 2, Username: "jane", Email: "jane@example.com"},
    {ID: 3, Username: "bob", Email: "bob@example.com"},
    {ID: 4, Username: "alice", Email: "alice@example.com"},
    {ID: 5, Username: "charlie", Email: "charlie@example.com"},
}

// getUsers menangani GET request untuk mengambil semua user dengan paginasi
func getUsers(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    // Ambil query parameters
    limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
    offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
    
    // Set nilai default jika tidak ada
    if limit <= 0 {
        limit = 10
    }
    if offset < 0 {
        offset = 0
    }
    
    // Hitung total data
    total := len(users)
    
    // Hitung next offset
    nextOffset := offset + limit
    if nextOffset >= total {
        nextOffset = 0 // Tidak ada data selanjutnya
    }
    
    // Ambil data sesuai paginasi
    end := offset + limit
    if end > total {
        end = total
    }
    
    // Jika tidak ada data
    if offset >= total {
        json.NewEncoder(w).Encode(PaginatedResponse{
            Data:       []User{},
            Total:      total,
            Limit:      limit,
            Offset:     offset,
            NextOffset: 0,
        })
        return
    }
    
    // Kembalikan data dengan format paginasi
    json.NewEncoder(w).Encode(PaginatedResponse{
        Data:       users[offset:end],
        Total:      total,
        Limit:      limit,
        Offset:     offset,
        NextOffset: nextOffset,
    })
}

// getUser menangani GET request untuk mengambil user berdasarkan ID
func getUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    for _, user := range users {
        if strconv.Itoa(user.ID) == params["id"] {
            json.NewEncoder(w).Encode(user)
            return
        }
    }
    
    // Jika user tidak ditemukan
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(ErrorResponse{
        Status:  http.StatusNotFound,
        Message: "User not found",
    })
}

// createUser menangani POST request untuk membuat user baru
func createUser(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    // Cek Content-Type
    contentType := r.Header.Get("Content-Type")
    if contentType != "application/json" {
        w.WriteHeader(http.StatusUnsupportedMediaType)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusUnsupportedMediaType,
            Message: "Content-Type must be application/json",
        })
        return
    }
    
    var user User
    err := json.NewDecoder(r.Body).Decode(&user)
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Invalid request payload",
        })
        return
    }
    
    // Validasi input
    if user.Username == "" || user.Email == "" {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Username and email are required",
        })
        return
    }
    
    // Cek apakah username sudah ada
    for _, u := range users {
        if u.Username == user.Username {
            w.WriteHeader(http.StatusConflict)
            json.NewEncoder(w).Encode(ErrorResponse{
                Status:  http.StatusConflict,
                Message: "Username already exists",
            })
            return
        }
    }
    
    // Generate ID baru
    user.ID = len(users) + 1
    
    // Tambahkan user baru ke slice
    users = append(users, user)
    
    // Kembalikan user yang baru dibuat dengan status 201 Created
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}

func main() {
    // Inisialisasi router
    router := mux.NewRouter()
    
    // Definisikan routes
    router.HandleFunc("/api/users", getUsers).Methods("GET")
    router.HandleFunc("/api/users/{id}", getUser).Methods("GET")
    router.HandleFunc("/api/users", createUser).Methods("POST")
    
    // Jalankan server
    fmt.Println("Server running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

## API Versioning

API versioning adalah praktik mengelola perubahan dalam API dengan membuat versi baru dari API yang dapat hidup berdampingan dengan versi lama. Ini memungkinkan client untuk terus menggunakan versi lama sambil memungkinkan pengembang untuk memperkenalkan perubahan dalam versi baru.

### Strategi API Versioning

1. **URL Versioning**: Menambahkan nomor versi dalam URL
   ```
   /api/v1/users
   /api/v2/users
   ```

2. **Header Versioning**: Menentukan versi dalam header request
   ```
   Accept: application/vnd.myapi.v1+json
   ```

3. **Parameter Versioning**: Menentukan versi dalam parameter query
   ```
   /api/users?version=1
   ```

4. **Content Negotiation**: Menentukan versi berdasarkan tipe konten
   ```
   Accept: application/json; version=1
   ```

### Implementasi API Versioning di Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "strings"
    "github.com/gorilla/mux"
)

// UserV1 merepresentasikan model data user versi 1
type UserV1 struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
}

// UserV2 merepresentasikan model data user versi 2
type UserV2 struct {
    ID        int    `json:"id"`
    Username  string `json:"username"`
    Email     string `json:"email"`
    FirstName string `json:"firstName"`
    LastName  string `json:"lastName"`
}

// ErrorResponse merepresentasikan format response error
type ErrorResponse struct {
    Status  int    `json:"status"`
    Message string `json:"message"`
}

// In-memory storage untuk contoh
var usersV1 = []UserV1{
    {ID: 1, Username: "john", Email: "john@example.com"},
    {ID: 2, Username: "jane", Email: "jane@example.com"},
}

var usersV2 = []UserV2{
    {ID: 1, Username: "john", Email: "john@example.com", FirstName: "John", LastName: "Doe"},
    {ID: 2, Username: "jane", Email: "jane@example.com", FirstName: "Jane", LastName: "Smith"},
}

// getAPIVersion mendapatkan versi API dari request
func getAPIVersion(r *http.Request) string {
    // Cek URL path untuk versi
    path := r.URL.Path
    if strings.HasPrefix(path, "/api/v1/") {
        return "v1"
    } else if strings.HasPrefix(path, "/api/v2/") {
        return "v2"
    }
    
    // Cek header Accept untuk versi
    accept := r.Header.Get("Accept")
    if strings.Contains(accept, "vnd.myapi.v1") {
        return "v1"
    } else if strings.Contains(accept, "vnd.myapi.v2") {
        return "v2"
    }
    
    // Cek parameter query untuk versi
    version := r.URL.Query().Get("version")
    if version == "1" {
        return "v1"
    } else if version == "2" {
        return "v2"
    }
    
    // Default ke versi terbaru
    return "v2"
}

// getUsersV1 menangani GET request untuk mengambil semua user versi 1
func getUsersV1(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(usersV1)
}

// getUsersV2 menangani GET request untuk mengambil semua user versi 2
func getUsersV2(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(usersV2)
}

// getUserV1 menangani GET request untuk mengambil user berdasarkan ID versi 1
func getUserV1(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    for _, user := range usersV1 {
        if strconv.Itoa(user.ID) == params["id"] {
            json.NewEncoder(w).Encode(user)
            return
        }
    }
    
    // Jika user tidak ditemukan
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(ErrorResponse{
        Status:  http.StatusNotFound,
        Message: "User not found",
    })
}

// getUserV2 menangani GET request untuk mengambil user berdasarkan ID versi 2
func getUserV2(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    params := mux.Vars(r)
    
    for _, user := range usersV2 {
        if strconv.Itoa(user.ID) == params["id"] {
            json.NewEncoder(w).Encode(user)
            return
        }
    }
    
    // Jika user tidak ditemukan
    w.WriteHeader(http.StatusNotFound)
    json.NewEncoder(w).Encode(ErrorResponse{
        Status:  http.StatusNotFound,
        Message: "User not found",
    })
}

// createUserV1 menangani POST request untuk membuat user baru versi 1
func createUserV1(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    var user UserV1
    err := json.NewDecoder(r.Body).Decode(&user)
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Invalid request payload",
        })
        return
    }
    
    // Validasi input
    if user.Username == "" || user.Email == "" {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Username and email are required",
        })
        return
    }
    
    // Generate ID baru
    user.ID = len(usersV1) + 1
    
    // Tambahkan user baru ke slice
    usersV1 = append(usersV1, user)
    
    // Kembalikan user yang baru dibuat dengan status 201 Created
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}

// createUserV2 menangani POST request untuk membuat user baru versi 2
func createUserV2(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    var user UserV2
    err := json.NewDecoder(r.Body).Decode(&user)
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Invalid request payload",
        })
        return
    }
    
    // Validasi input
    if user.Username == "" || user.Email == "" || user.FirstName == "" || user.LastName == "" {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(ErrorResponse{
            Status:  http.StatusBadRequest,
            Message: "Username, email, firstName, and lastName are required",
        })
        return
    }
    
    // Generate ID baru
    user.ID = len(usersV2) + 1
    
    // Tambahkan user baru ke slice
    usersV2 = append(usersV2, user)
    
    // Kembalikan user yang baru dibuat dengan status 201 Created
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}

// versionMiddleware adalah middleware untuk menangani versi API
func versionMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Dapatkan versi API
        version := getAPIVersion(r)
        
        // Tambahkan versi ke context
        ctx := context.WithValue(r.Context(), "version", version)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

func main() {
    // Inisialisasi router
    router := mux.NewRouter()
    
    // Terapkan middleware versi
    router.Use(versionMiddleware)
    
    // Definisikan routes untuk versi 1
    router.HandleFunc("/api/v1/users", getUsersV1).Methods("GET")
    router.HandleFunc("/api/v1/users/{id}", getUserV1).Methods("GET")
    router.HandleFunc("/api/v1/users", createUserV1).Methods("POST")
    
    // Definisikan routes untuk versi 2
    router.HandleFunc("/api/v2/users", getUsersV2).Methods("GET")
    router.HandleFunc("/api/v2/users/{id}", getUserV2).Methods("GET")
    router.HandleFunc("/api/v2/users", createUserV2).Methods("POST")
    
    // Definisikan routes tanpa versi (akan menggunakan middleware untuk menentukan versi)
    router.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
        version := r.Context().Value("version").(string)
        if version == "v1" {
            getUsersV1(w, r)
        } else {
            getUsersV2(w, r)
        }
    }).Methods("GET")
    
    router.HandleFunc("/api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
        version := r.Context().Value("version").(string)
        if version == "v1" {
            getUserV1(w, r)
        } else {
            getUserV2(w, r)
        }
    }).Methods("GET")
    
    router.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
        version := r.Context().Value("version").(string)
        if version == "v1" {
            createUserV1(w, r)
        } else {
            createUserV2(w, r)
        }
    }).Methods("POST")
    
    // Jalankan server
    fmt.Println("Server running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

## Kesimpulan

REST API Basics adalah fondasi penting dalam pengembangan aplikasi web modern. Dengan memahami konsep-konsep seperti HTTP methods, resource naming, status codes, request/response format, dan API versioning, pengembang dapat membangun API yang konsisten, mudah digunakan, dan dapat diandalkan.

Dalam pengembangan aplikasi Go, ada banyak library yang dapat membantu dalam pembuatan REST API, seperti Gorilla Mux, Gin, Echo, dan Fiber. Library-library ini menyediakan fitur-fitur yang memudahkan pengembang dalam mengimplementasikan prinsip-prinsip REST API.

Dengan mengikuti praktik terbaik dalam pengembangan REST API, pengembang dapat membangun aplikasi yang dapat diandalkan, mudah digunakan, dan dapat dikembangkan lebih lanjut di masa depan. 