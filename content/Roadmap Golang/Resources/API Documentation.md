# API Documentation

Dokumentasi API yang baik sangat penting untuk memastikan bahwa API dapat digunakan dengan mudah oleh developer lain. Dokumentasi yang lengkap dan jelas membantu pengguna memahami cara menggunakan API dengan benar.

## Swagger/OpenAPI

Swagger (sekarang dikenal sebagai OpenAPI) adalah standar untuk mendokumentasikan API RESTful. Ini memungkinkan kita untuk mendefinisikan API dalam format yang dapat dibaca oleh manusia dan mesin.

### 1. OpenAPI Specification

- Definisikan API menggunakan format YAML atau JSON
- Dokumentasikan endpoints, parameters, dan responses
- Gunakan tools untuk generate dokumentasi

```go
// Contoh OpenAPI specification dalam YAML
openapi: 3.0.0
info:
  title: User Management API
  description: API untuk mengelola pengguna
  version: 1.0.0
  contact:
    name: API Support
    email: support@example.com
servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://staging-api.example.com/v1
    description: Staging server
paths:
  /users:
    get:
      summary: Mendapatkan daftar pengguna
      description: Mengembalikan daftar pengguna dengan paginasi
      operationId: getUsers
      tags:
        - Users
      parameters:
        - name: page
          in: query
          description: Nomor halaman
          required: false
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          description: Jumlah item per halaman
          required: false
          schema:
            type: integer
            default: 10
            maximum: 100
      responses:
        '200':
          description: Daftar pengguna berhasil diambil
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
        '400':
          description: Parameter tidak valid
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  /users/{id}:
    get:
      summary: Mendapatkan detail pengguna
      description: Mengembalikan detail pengguna berdasarkan ID
      operationId: getUser
      tags:
        - Users
      parameters:
        - name: id
          in: path
          description: ID pengguna
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Detail pengguna berhasil diambil
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: Pengguna tidak ditemukan
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          format: int64
          example: 1
        username:
          type: string
          example: johndoe
        email:
          type: string
          format: email
          example: john.doe@example.com
        createdAt:
          type: string
          format: date-time
          example: "2023-01-01T12:00:00Z"
        updatedAt:
          type: string
          format: date-time
          example: "2023-01-01T12:00:00Z"
      required:
        - id
        - username
        - email
    UserList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/User'
        pagination:
          type: object
          properties:
            page:
              type: integer
              example: 1
            limit:
              type: integer
              example: 10
            total:
              type: integer
              example: 100
            totalPages:
              type: integer
              example: 10
    Error:
      type: object
      properties:
        code:
          type: string
          example: "ERR_400"
        message:
          type: string
          example: "Invalid parameter"
        details:
          type: string
          example: "Page must be greater than 0"
```

### 2. Swagger UI Integration

- Integrasikan Swagger UI ke aplikasi
- Sediakan dokumentasi interaktif
- Gunakan middleware untuk serve dokumentasi

```go
// Swagger UI middleware
func swaggerUIMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Serve Swagger UI
        if r.URL.Path == "/swagger" {
            w.Header().Set("Content-Type", "text/html")
            w.Write([]byte(swaggerUIHTML))
            return
        }
        
        // Serve OpenAPI specification
        if r.URL.Path == "/swagger.json" {
            w.Header().Set("Content-Type", "application/json")
            w.Write([]byte(openAPISpec))
            return
        }
        
        next.ServeHTTP(w, r)
    })
}

// Swagger UI HTML template
const swaggerUIHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="SwaggerUI" />
    <title>SwaggerUI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" crossorigin></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
            });
        };
    </script>
</body>
</html>
`

// Router setup dengan Swagger UI
func setupRouter() *mux.Router {
    router := mux.NewRouter()
    
    // Swagger UI
    router.HandleFunc("/swagger", handleSwaggerUI).Methods("GET")
    router.HandleFunc("/swagger.json", handleSwaggerJSON).Methods("GET")
    
    // API routes
    router.HandleFunc("/api/v1/users", handleGetUsers).Methods("GET")
    router.HandleFunc("/api/v1/users/{id}", handleGetUser).Methods("GET")
    
    return router
}

// Handler untuk Swagger UI
func handleSwaggerUI(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/html")
    w.Write([]byte(swaggerUIHTML))
}

// Handler untuk OpenAPI specification
func handleSwaggerJSON(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.Write([]byte(openAPISpec))
}
```

### 3. Code Generation

- Generate kode dari OpenAPI specification
- Generate client libraries
- Generate server stubs

```go
// Contoh penggunaan go-swagger untuk generate kode
// go-swagger generate server -f swagger.yaml -A user-management-api

// Contoh penggunaan swagger-codegen untuk generate client
// swagger-codegen generate -i swagger.yaml -l go -o ./client

// Contoh penggunaan oapi-codegen untuk generate kode
// oapi-codegen -package api swagger.yaml > api.go

// Contoh implementasi server yang di-generate
type Server struct {
    userRepo *UserRepository
}

func NewServer(userRepo *UserRepository) *Server {
    return &Server{
        userRepo: userRepo,
    }
}

// Implementasi handler yang di-generate
func (s *Server) GetUsers(ctx context.Context, request GetUsersRequest) (GetUsersResponse, error) {
    // Parse query parameters
    page := 1
    if request.Page != nil {
        page = *request.Page
    }
    
    limit := 10
    if request.Limit != nil {
        limit = *request.Limit
    }
    
    // Get users
    users, total, err := s.userRepo.GetUsers(page, limit)
    if err != nil {
        return GetUsersResponse{}, err
    }
    
    // Calculate pagination
    totalPages := int(math.Ceil(float64(total) / float64(limit)))
    
    // Build response
    return GetUsersResponse{
        Data: users,
        Pagination: &Pagination{
            Page:       page,
            Limit:      limit,
            Total:      total,
            TotalPages: totalPages,
        },
    }, nil
}

func (s *Server) GetUser(ctx context.Context, request GetUserRequest) (GetUserResponse, error) {
    // Get user
    user, err := s.userRepo.GetUser(request.Id)
    if err != nil {
        if err == sql.ErrNoRows {
            return GetUserResponse{}, &NotFoundError{
                Message: "User not found",
            }
        }
        return GetUserResponse{}, err
    }
    
    return GetUserResponse{
        Data: user,
    }, nil
}
```

## API Documentation Tools

Berbagai tools dapat digunakan untuk membuat dokumentasi API yang baik.

### 1. godoc

- Dokumentasi bawaan Go
- Generate dokumentasi dari komentar kode
- Sediakan dokumentasi online

```go
// Package api menyediakan fungsi-fungsi untuk mengelola API.
package api

// User merepresentasikan pengguna dalam sistem.
type User struct {
    // ID adalah identifier unik untuk pengguna.
    ID int `json:"id"`
    
    // Username adalah nama pengguna yang digunakan untuk login.
    Username string `json:"username"`
    
    // Email adalah alamat email pengguna.
    Email string `json:"email"`
    
    // CreatedAt adalah waktu pembuatan pengguna.
    CreatedAt time.Time `json:"createdAt"`
    
    // UpdatedAt adalah waktu terakhir pengguna diperbarui.
    UpdatedAt time.Time `json:"updatedAt"`
}

// UserRepository menyediakan metode untuk mengakses data pengguna.
type UserRepository interface {
    // GetUser mengembalikan pengguna berdasarkan ID.
    // Jika pengguna tidak ditemukan, mengembalikan sql.ErrNoRows.
    GetUser(id int) (*User, error)
    
    // GetUsers mengembalikan daftar pengguna dengan paginasi.
    // Mengembalikan daftar pengguna, total jumlah pengguna, dan error jika ada.
    GetUsers(page, limit int) ([]User, int, error)
    
    // CreateUser membuat pengguna baru.
    // Mengembalikan error jika pengguna sudah ada atau terjadi kesalahan lain.
    CreateUser(user *User) error
    
    // UpdateUser memperbarui pengguna yang ada.
    // Mengembalikan error jika pengguna tidak ditemukan atau terjadi kesalahan lain.
    UpdateUser(user *User) error
    
    // DeleteUser menghapus pengguna berdasarkan ID.
    // Mengembalikan error jika pengguna tidak ditemukan atau terjadi kesalahan lain.
    DeleteUser(id int) error
}

// GetUserHandler menangani request untuk mendapatkan detail pengguna.
// Mengembalikan pengguna dalam format JSON jika ditemukan,
// atau error dengan status code yang sesuai jika tidak ditemukan.
func GetUserHandler(w http.ResponseWriter, r *http.Request) {
    // Implementation
}
```

### 2. godoc server

- Jalankan godoc server lokal
- Akses dokumentasi melalui browser
- Sinkronisasi dengan GitHub

```bash
# Install godoc
go install golang.org/x/tools/cmd/godoc@latest

# Jalankan godoc server
godoc -http=:6060

# Akses dokumentasi di browser
# http://localhost:6060/pkg/
```

### 3. pkg.go.dev

- Dokumentasi online untuk package Go
- Versiing dan navigasi
- Integrasi dengan GitHub

```go
// Package api menyediakan fungsi-fungsi untuk mengelola API.
//
// Contoh penggunaan:
//
//	server := api.NewServer(userRepo)
//	router := mux.NewRouter()
//	server.RegisterRoutes(router)
//	http.ListenAndServe(":8080", router)
package api

// Contoh penggunaan dalam komentar
func ExampleGetUser() {
    server := NewServer(userRepo)
    user, err := server.GetUser(1)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(user.Username)
    // Output: johndoe
}
```

## Documentation Best Practices

Praktik terbaik untuk membuat dokumentasi API yang baik.

### 1. Konsistensi

- Gunakan format yang konsisten
- Ikuti gaya penulisan yang sama
- Gunakan terminologi yang konsisten

```go
// Konsistensi dalam penamaan
type UserService struct {
    // ...
}

func (s *UserService) GetUser(id int) (*User, error) {
    // ...
}

func (s *UserService) CreateUser(user *User) error {
    // ...
}

func (s *UserService) UpdateUser(user *User) error {
    // ...
}

func (s *UserService) DeleteUser(id int) error {
    // ...
}

// Konsistensi dalam format komentar
// GetUser mengembalikan pengguna berdasarkan ID.
// Parameter:
//   - id: ID pengguna yang akan diambil
// Return:
//   - *User: Pengguna yang ditemukan
//   - error: Error jika pengguna tidak ditemukan atau terjadi kesalahan lain
func (s *UserService) GetUser(id int) (*User, error) {
    // ...
}
```

### 2. Kelengkapan

- Dokumentasikan semua parameter
- Dokumentasikan semua return values
- Dokumentasikan semua error conditions

```go
// GetUsers mengembalikan daftar pengguna dengan paginasi.
//
// Parameter:
//   - page: Nomor halaman (dimulai dari 1)
//   - limit: Jumlah item per halaman (maksimum 100)
//
// Return:
//   - []User: Daftar pengguna
//   - int: Total jumlah pengguna
//   - error: Error jika terjadi kesalahan
//
// Error:
//   - ErrInvalidPage: Jika page < 1
//   - ErrInvalidLimit: Jika limit < 1 atau limit > 100
//   - ErrDatabase: Jika terjadi kesalahan database
func (s *UserService) GetUsers(page, limit int) ([]User, int, error) {
    // Validasi parameter
    if page < 1 {
        return nil, 0, ErrInvalidPage
    }
    if limit < 1 || limit > 100 {
        return nil, 0, ErrInvalidLimit
    }
    
    // Get users
    users, total, err := s.userRepo.GetUsers(page, limit)
    if err != nil {
        return nil, 0, fmt.Errorf("database error: %w", err)
    }
    
    return users, total, nil
}
```

### 3. Kejelasan

- Gunakan bahasa yang jelas dan mudah dipahami
- Hindari jargon yang tidak perlu
- Berikan contoh penggunaan

```go
// CreateUser membuat pengguna baru dalam sistem.
//
// Fungsi ini memvalidasi data pengguna, mengenkripsi password,
// dan menyimpan pengguna ke database.
//
// Parameter:
//   - user: Data pengguna yang akan dibuat
//
// Return:
//   - error: Error jika validasi gagal atau terjadi kesalahan database
//
// Contoh penggunaan:
//
//	user := &User{
//	    Username: "johndoe",
//	    Email:    "john.doe@example.com",
//	    Password: "secret123",
//	}
//	err := userService.CreateUser(user)
//	if err != nil {
//	    log.Fatal(err)
//	}
func (s *UserService) CreateUser(user *User) error {
    // Validasi
    if err := s.validateUser(user); err != nil {
        return err
    }
    
    // Enkripsi password
    hashedPassword, err := s.hashPassword(user.Password)
    if err != nil {
        return err
    }
    user.Password = hashedPassword
    
    // Simpan ke database
    return s.userRepo.CreateUser(user)
}
```

### 4. Pemeliharaan

- Perbarui dokumentasi saat kode berubah
- Gunakan tools untuk memvalidasi dokumentasi
- Tinjau dokumentasi secara berkala

```go
// UpdateUser memperbarui data pengguna yang ada.
//
// Fungsi ini memvalidasi data pengguna, mengenkripsi password jika diubah,
// dan memperbarui data pengguna di database.
//
// Parameter:
//   - user: Data pengguna yang akan diperbarui
//
// Return:
//   - error: Error jika validasi gagal atau terjadi kesalahan database
//
// Catatan: Fungsi ini diperbarui pada versi 1.2.0 untuk mendukung
// validasi email yang lebih ketat.
func (s *UserService) UpdateUser(user *User) error {
    // Validasi
    if err := s.validateUser(user); err != nil {
        return err
    }
    
    // Enkripsi password jika diubah
    if user.Password != "" {
        hashedPassword, err := s.hashPassword(user.Password)
        if err != nil {
            return err
        }
        user.Password = hashedPassword
    }
    
    // Simpan ke database
    return s.userRepo.UpdateUser(user)
}
```

## API Examples

Contoh penggunaan API untuk membantu pengguna memahami cara menggunakan API.

### 1. cURL Examples

- Sediakan contoh cURL untuk setiap endpoint
- Tunjukkan parameter yang diperlukan
- Tunjukkan response yang diharapkan

```bash
# Mendapatkan daftar pengguna
curl -X GET "https://api.example.com/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Response
{
  "data": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john.doe@example.com",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z"
    },
    {
      "id": 2,
      "username": "janedoe",
      "email": "jane.doe@example.com",
      "createdAt": "2023-01-02T12:00:00Z",
      "updatedAt": "2023-01-02T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

# Mendapatkan detail pengguna
curl -X GET "https://api.example.com/v1/users/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Response
{
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
}

# Membuat pengguna baru
curl -X POST "https://api.example.com/v1/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "new.user@example.com",
    "password": "secret123"
  }'

# Response
{
  "data": {
    "id": 101,
    "username": "newuser",
    "email": "new.user@example.com",
    "createdAt": "2023-01-10T12:00:00Z",
    "updatedAt": "2023-01-10T12:00:00Z"
  }
}
```

### 2. Code Examples

- Sediakan contoh kode dalam berbagai bahasa
- Tunjukkan cara autentikasi
- Tunjukkan cara menangani error

```go
// Contoh penggunaan API dalam Go
package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

type User struct {
    ID        int       `json:"id"`
    Username  string    `json:"username"`
    Email     string    `json:"email"`
    CreatedAt string    `json:"createdAt"`
    UpdatedAt string    `json:"updatedAt"`
}

type UserList struct {
    Data       []User `json:"data"`
    Pagination struct {
        Page       int `json:"page"`
        Limit      int `json:"limit"`
        Total      int `json:"total"`
        TotalPages int `json:"totalPages"`
    } `json:"pagination"`
}

func main() {
    // Konfigurasi client
    client := &http.Client{}
    baseURL := "https://api.example.com/v1"
    token := "YOUR_TOKEN"
    
    // Mendapatkan daftar pengguna
    req, err := http.NewRequest("GET", baseURL+"/users?page=1&limit=10", nil)
    if err != nil {
        fmt.Printf("Error creating request: %v\n", err)
        return
    }
    
    req.Header.Add("Authorization", "Bearer "+token)
    req.Header.Add("Content-Type", "application/json")
    
    resp, err := client.Do(req)
    if err != nil {
        fmt.Printf("Error sending request: %v\n", err)
        return
    }
    defer resp.Body.Close()
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        fmt.Printf("Error reading response: %v\n", err)
        return
    }
    
    if resp.StatusCode != http.StatusOK {
        fmt.Printf("Error: %s\n", string(body))
        return
    }
    
    var userList UserList
    if err := json.Unmarshal(body, &userList); err != nil {
        fmt.Printf("Error parsing response: %v\n", err)
        return
    }
    
    fmt.Printf("Users: %+v\n", userList.Data)
    fmt.Printf("Pagination: %+v\n", userList.Pagination)
}
```

```python
# Contoh penggunaan API dalam Python
import requests
import json

# Konfigurasi client
base_url = "https://api.example.com/v1"
token = "YOUR_TOKEN"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Mendapatkan daftar pengguna
response = requests.get(f"{base_url}/users?page=1&limit=10", headers=headers)

if response.status_code == 200:
    user_list = response.json()
    print(f"Users: {user_list['data']}")
    print(f"Pagination: {user_list['pagination']}")
else:
    print(f"Error: {response.text}")

# Mendapatkan detail pengguna
user_id = 1
response = requests.get(f"{base_url}/users/{user_id}", headers=headers)

if response.status_code == 200:
    user = response.json()["data"]
    print(f"User: {user}")
else:
    print(f"Error: {response.text}")

# Membuat pengguna baru
new_user = {
    "username": "newuser",
    "email": "new.user@example.com",
    "password": "secret123"
}

response = requests.post(f"{base_url}/users", headers=headers, json=new_user)

if response.status_code == 201:
    created_user = response.json()["data"]
    print(f"Created user: {created_user}")
else:
    print(f"Error: {response.text}")
```

### 3. Interactive Examples

- Sediakan contoh interaktif menggunakan Swagger UI
- Tunjukkan parameter yang dapat diubah
- Tunjukkan response yang diharapkan

```go
// Swagger UI dengan contoh interaktif
const swaggerUIHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="SwaggerUI" />
    <title>SwaggerUI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" crossorigin></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                docExpansion: "list",
                defaultModelsExpandDepth: 3,
                defaultModelExpandDepth: 3,
                defaultModelRendering: "model",
                displayRequestDuration: true,
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                tryItOutEnabled: true,
                persistAuthorization: true,
            });
        };
    </script>
</body>
</html>
`
```

## Postman Collections

Postman adalah tool populer untuk menguji API. Menyediakan Postman Collection dapat membantu pengguna memahami dan menguji API dengan mudah.

### 1. Collection Structure

- Organisasi collection berdasarkan resource
- Pengelompokan request berdasarkan operasi
- Penggunaan environment variables

```json
{
  "info": {
    "name": "User Management API",
    "description": "Collection untuk User Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Users",
      "description": "Operasi untuk mengelola pengguna",
      "item": [
        {
          "name": "Get Users",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              },
              {
                "key": "Content-Type",
                "value": "application/json",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{base_url}}/users?page=1&limit=10",
              "host": ["{{base_url}}"],
              "path": ["users"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            },
            "description": "Mendapatkan daftar pengguna dengan paginasi"
          },
          "response": [
            {
              "name": "Success",
              "originalRequest": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{base_url}}/users?page=1&limit=10",
                  "host": ["{{base_url}}"],
                  "path": ["users"],
                  "query": [
                    {
                      "key": "page",
                      "value": "1"
                    },
                    {
                      "key": "limit",
                      "value": "10"
                    }
                  ]
                }
              },
              "status": "OK",
              "code": 200,
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "data": [
                  {
                    "id": 1,
                    "username": "johndoe",
                    "email": "john.doe@example.com",
                    "createdAt": "2023-01-01T12:00:00Z",
                    "updatedAt": "2023-01-01T12:00:00Z"
                  },
                  {
                    "id": 2,
                    "username": "janedoe",
                    "email": "jane.doe@example.com",
                    "createdAt": "2023-01-02T12:00:00Z",
                    "updatedAt": "2023-01-02T12:00:00Z"
                  }
                ],
                "pagination": {
                  "page": 1,
                  "limit": 10,
                  "total": 100,
                  "totalPages": 10
                }
              }
            }
          ]
        },
        {
          "name": "Get User",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              },
              {
                "key": "Content-Type",
                "value": "application/json",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{base_url}}/users/1",
              "host": ["{{base_url}}"],
              "path": ["users", "1"]
            },
            "description": "Mendapatkan detail pengguna berdasarkan ID"
          },
          "response": [
            {
              "name": "Success",
              "originalRequest": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{base_url}}/users/1",
                  "host": ["{{base_url}}"],
                  "path": ["users", "1"]
                }
              },
              "status": "OK",
              "code": 200,
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "data": {
                  "id": 1,
                  "username": "johndoe",
                  "email": "john.doe@example.com",
                  "createdAt": "2023-01-01T12:00:00Z",
                  "updatedAt": "2023-01-01T12:00:00Z"
                }
              }
            }
          ]
        }
      ]
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [
          ""
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          ""
        ]
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.example.com/v1",
      "type": "string"
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN",
      "type": "string"
    }
  ]
}
```

### 2. Environment Variables

- Gunakan environment variables untuk konfigurasi
- Sediakan environment untuk development dan production
- Dokumentasikan cara mengatur environment

```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "name": "Development",
  "values": [
    {
      "key": "base_url",
      "value": "https://staging-api.example.com/v1",
      "type": "default",
      "enabled": true
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN",
      "type": "secret",
      "enabled": true
    }
  ],
  "_postman_variable_scope": "environment",
  "_postman_exported_at": "2023-01-10T12:00:00.000Z",
  "_postman_exported_using": "Postman/10.12.0"
}
```

### 3. Collection Documentation

- Sediakan dokumentasi untuk setiap request
- Tunjukkan parameter yang diperlukan
- Tunjukkan response yang diharapkan

```go
// Handler untuk serve Postman Collection
func handlePostmanCollection(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.Write([]byte(postmanCollection))
}

// Router setup dengan Postman Collection
func setupRouter() *mux.Router {
    router := mux.NewRouter()
    
    // Postman Collection
    router.HandleFunc("/postman.json", handlePostmanCollection).Methods("GET")
    
    // API routes
    router.HandleFunc("/api/v1/users", handleGetUsers).Methods("GET")
    router.HandleFunc("/api/v1/users/{id}", handleGetUser).Methods("GET")
    
    return router
}