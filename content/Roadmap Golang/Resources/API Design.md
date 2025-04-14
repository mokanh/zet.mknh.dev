# API Design

API Design adalah proses merancang antarmuka pemrograman aplikasi (API) yang efektif, konsisten, dan mudah digunakan. Desain API yang baik sangat penting untuk memastikan bahwa API dapat digunakan dengan mudah oleh developer lain dan dapat berkembang seiring waktu.

## REST Principles

REST (Representational State Transfer) didasarkan pada enam prinsip arsitektur yang membuat API lebih mudah dipahami dan digunakan.

### 1. Client-Server

- Pemisahan antara client dan server
- Client tidak perlu tahu implementasi server
- Server tidak perlu tahu implementasi client
- Keduanya dapat berkembang secara independen

```go
// Contoh pemisahan client-server
// Server
type Server struct {
    router *mux.Router
    db     *sql.DB
}

func (s *Server) handleGetUser(w http.ResponseWriter, r *http.Request) {
    // Implementasi server
    userID := mux.Vars(r)["id"]
    user, err := s.db.GetUser(userID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(user)
}

// Client
type Client struct {
    baseURL    string
    httpClient *http.Client
}

func (c *Client) GetUser(id string) (*User, error) {
    // Implementasi client
    resp, err := c.httpClient.Get(c.baseURL + "/users/" + id)
    if err != nil {
        return nil, err
    }
    var user User
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        return nil, err
    }
    return &user, nil
}
```

### 2. Stateless

- Setiap request harus mengandung semua informasi yang diperlukan
- Server tidak menyimpan state client
- Setiap request berdiri sendiri

```go
// Contoh API stateless
func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
    // Setiap request harus menyertakan kredensial
    var creds struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }
    if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Generate token berdasarkan request saat ini
    token, err := s.auth.GenerateToken(creds.Username, creds.Password)
    if err != nil {
        http.Error(w, err.Error(), http.StatusUnauthorized)
        return
    }

    // Kirim token ke client
    json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func (s *Server) handleProtectedResource(w http.ResponseWriter, r *http.Request) {
    // Setiap request ke protected resource harus menyertakan token
    token := r.Header.Get("Authorization")
    if token == "" {
        http.Error(w, "No token provided", http.StatusUnauthorized)
        return
    }

    // Validasi token untuk setiap request
    claims, err := s.auth.ValidateToken(token)
    if err != nil {
        http.Error(w, err.Error(), http.StatusUnauthorized)
        return
    }

    // Proses request dengan claims dari token
    // ...
}
```

### 3. Cacheable

- Response harus mendefinisikan dirinya sebagai cacheable atau non-cacheable
- Jika cacheable, client dapat menggunakan kembali data response untuk request yang sama

```go
func (s *Server) handleGetProduct(w http.ResponseWriter, r *http.Request) {
    productID := mux.Vars(r)["id"]
    
    // Generate ETag berdasarkan data
    product, err := s.db.GetProduct(productID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    etag := generateETag(product)
    
    // Periksa If-None-Match header
    if match := r.Header.Get("If-None-Match"); match != "" {
        if match == etag {
            w.WriteHeader(http.StatusNotModified)
            return
        }
    }
    
    // Set cache headers
    w.Header().Set("ETag", etag)
    w.Header().Set("Cache-Control", "public, max-age=3600") // Cache selama 1 jam
    
    json.NewEncoder(w).Encode(product)
}

func generateETag(data interface{}) string {
    bytes, _ := json.Marshal(data)
    hash := sha256.Sum256(bytes)
    return fmt.Sprintf(`"%x"`, hash[:])
}
```

### 4. Uniform Interface

- Interface yang seragam dan terstandarisasi
- Menggunakan HTTP methods sesuai semantiknya
- Menggunakan URI untuk mengidentifikasi resources
- Menggunakan hypermedia (HATEOAS)

```go
type ResourceResponse struct {
    Data  interface{} `json:"data"`
    Links struct {
        Self    string `json:"self,omitempty"`
        Next    string `json:"next,omitempty"`
        Prev    string `json:"prev,omitempty"`
        Related []Link `json:"related,omitempty"`
    } `json:"links"`
}

type Link struct {
    Href string `json:"href"`
    Rel  string `json:"rel"`
    Type string `json:"type"`
}

func (s *Server) handleGetOrder(w http.ResponseWriter, r *http.Request) {
    orderID := mux.Vars(r)["id"]
    
    order, err := s.db.GetOrder(orderID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Buat response dengan HATEOAS links
    response := ResourceResponse{
        Data: order,
    }
    
    // Tambahkan links
    response.Links.Self = fmt.Sprintf("/api/orders/%s", orderID)
    response.Links.Related = []Link{
        {
            Href: fmt.Sprintf("/api/orders/%s/items", orderID),
            Rel:  "items",
            Type: "GET",
        },
        {
            Href: fmt.Sprintf("/api/users/%s", order.UserID),
            Rel:  "user",
            Type: "GET",
        },
    }
    
    json.NewEncoder(w).Encode(response)
}
```

### 5. Layered System

- Client tidak perlu tahu apakah terhubung langsung ke server atau melalui perantara
- Server dapat menggunakan load balancer, cache, atau gateway
- Setiap layer menangani fungsionalitas spesifik

```go
// Middleware untuk logging
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // Wrap ResponseWriter untuk mendapatkan status code
        wrapped := wrapResponseWriter(w)
        
        // Panggil handler berikutnya
        next.ServeHTTP(wrapped, r)
        
        // Log request setelah selesai
        log.Printf(
            "%s %s %d %s",
            r.Method,
            r.RequestURI,
            wrapped.status,
            time.Since(start),
        )
    })
}

// Middleware untuk rate limiting
func rateLimitMiddleware(next http.Handler) http.Handler {
    limiter := rate.NewLimiter(rate.Every(time.Second), 100) // 100 requests per second
    
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if !limiter.Allow() {
            http.Error(w, "Too many requests", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}

// Middleware untuk caching
func cacheMiddleware(next http.Handler) http.Handler {
    cache := make(map[string]cacheEntry)
    
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Hanya cache GET requests
        if r.Method != http.MethodGet {
            next.ServeHTTP(w, r)
            return
        }
        
        // Cek cache
        key := r.URL.String()
        if entry, exists := cache[key]; exists && !entry.isExpired() {
            w.Header().Set("Content-Type", "application/json")
            w.Header().Set("X-Cache", "HIT")
            w.Write(entry.data)
            return
        }
        
        // Jika tidak ada di cache, lanjutkan ke handler berikutnya
        wrapped := wrapResponseWriter(w)
        next.ServeHTTP(wrapped, r)
        
        // Simpan response di cache
        if wrapped.status == http.StatusOK {
            cache[key] = cacheEntry{
                data:    wrapped.body.Bytes(),
                expires: time.Now().Add(5 * time.Minute),
            }
        }
    })
}

func main() {
    router := mux.NewRouter()
    
    // Terapkan middleware dalam urutan yang tepat
    router.Use(loggingMiddleware)
    router.Use(rateLimitMiddleware)
    router.Use(cacheMiddleware)
    
    // Definisikan routes
    router.HandleFunc("/api/users", handleGetUsers).Methods("GET")
    
    log.Fatal(http.ListenAndServe(":8080", router))
}
```

### 6. Code on Demand (Optional)

- Server dapat memperluas fungsionalitas client dengan mengirimkan kode yang dapat dieksekusi
- Bersifat opsional dalam REST
- Jarang digunakan dalam API modern

```go
func (s *Server) handleGetClientScript(w http.ResponseWriter, r *http.Request) {
    // Contoh mengirim script JavaScript ke client
    script := `
        function validateForm() {
            var name = document.getElementById("name").value;
            if (name == "") {
                alert("Name must be filled out");
                return false;
            }
            return true;
        }
    `
    
    w.Header().Set("Content-Type", "application/javascript")
    w.Write([]byte(script))
}
```

## Resource Modeling

Resource modeling adalah proses mengidentifikasi dan merancang resources yang akan diekspos melalui API. Resource adalah entitas atau objek yang dapat diakses dan dimanipulasi melalui API.

### 1. Identifikasi Resources

- Resources harus berupa kata benda
- Resources dapat berupa singleton atau collection
- Resources harus mencerminkan domain bisnis

```go
// Contoh model resources
type User struct {
    ID        int       `json:"id"`
    Username  string    `json:"username"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

type Order struct {
    ID          int       `json:"id"`
    UserID      int       `json:"userId"`
    Status      string    `json:"status"`
    TotalAmount float64   `json:"totalAmount"`
    Items       []Item    `json:"items"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}

type Item struct {
    ID        int       `json:"id"`
    OrderID   int       `json:"orderId"`
    ProductID int       `json:"productId"`
    Quantity  int       `json:"quantity"`
    Price     float64   `json:"price"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

type Product struct {
    ID          int       `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Price       float64   `json:"price"`
    Stock       int       `json:"stock"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}
```

### 2. Resource Relationships

- Identifikasi hubungan antar resources
- Gunakan nested resources untuk menunjukkan hubungan
- Pertahankan kedalaman nesting yang masuk akal

```go
// Repository interface untuk menangani relationships
type UserRepository interface {
    GetUser(id int) (*User, error)
    GetUserOrders(userID int) ([]Order, error)
    GetUserOrderItems(userID, orderID int) ([]Item, error)
}

type OrderRepository interface {
    GetOrder(id int) (*Order, error)
    GetOrderItems(orderID int) ([]Item, error)
    GetOrderUser(orderID int) (*User, error)
}

// Implementasi handlers untuk nested resources
func (s *Server) handleGetUserOrders(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    userID, _ := strconv.Atoi(vars["userId"])
    
    orders, err := s.userRepo.GetUserOrders(userID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Buat response dengan HATEOAS links
    response := ResourceResponse{
        Data: orders,
        Links: struct {
            Self    string `json:"self"`
            Parent  string `json:"parent"`
            Related []Link `json:"related"`
        }{
            Self:   fmt.Sprintf("/api/users/%d/orders", userID),
            Parent: fmt.Sprintf("/api/users/%d", userID),
            Related: []Link{
                {
                    Href: fmt.Sprintf("/api/users/%d", userID),
                    Rel:  "user",
                    Type: "GET",
                },
            },
        },
    }
    
    json.NewEncoder(w).Encode(response)
}

func (s *Server) handleGetOrderItems(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    orderID, _ := strconv.Atoi(vars["orderId"])
    
    items, err := s.orderRepo.GetOrderItems(orderID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Buat response dengan HATEOAS links
    response := ResourceResponse{
        Data: items,
        Links: struct {
            Self    string `json:"self"`
            Parent  string `json:"parent"`
            Related []Link `json:"related"`
        }{
            Self:   fmt.Sprintf("/api/orders/%d/items", orderID),
            Parent: fmt.Sprintf("/api/orders/%d", orderID),
            Related: []Link{
                {
                    Href: fmt.Sprintf("/api/orders/%d", orderID),
                    Rel:  "order",
                    Type: "GET",
                },
            },
        },
    }
    
    json.NewEncoder(w).Encode(response)
}
```

### 3. Resource Attributes

- Pilih atribut yang relevan untuk setiap resource
- Gunakan nama yang deskriptif dan konsisten
- Pertimbangkan format dan tipe data yang sesuai

```go
// Contoh penggunaan custom types dan validasi
type Email string

func (e Email) Validate() error {
    if !strings.Contains(string(e), "@") {
        return errors.New("invalid email format")
    }
    return nil
}

type Money struct {
    Amount   float64 `json:"amount"`
    Currency string  `json:"currency"`
}

func (m Money) Validate() error {
    if m.Amount < 0 {
        return errors.New("amount cannot be negative")
    }
    if m.Currency == "" {
        return errors.New("currency is required")
    }
    return nil
}

// Resource dengan custom types dan validasi
type User struct {
    ID        int       `json:"id"`
    Username  string    `json:"username" validate:"required,min=3"`
    Email     Email     `json:"email" validate:"required"`
    Balance   Money     `json:"balance"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

// Validator untuk resource
type Validator interface {
    Validate() error
}

func validateResource(v Validator) error {
    if err := v.Validate(); err != nil {
        return err
    }
    return nil
}

// Handler dengan validasi
func (s *Server) handleCreateUser(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Validasi resource
    if err := validateResource(&user); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Simpan user
    if err := s.userRepo.CreateUser(&user); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}
```

### 4. Resource Collections

- Implementasi paginasi untuk collections
- Sediakan filtering dan sorting
- Gunakan query parameters yang konsisten

```go
// Struktur untuk query parameters
type QueryParams struct {
    Page     int      `schema:"page"`
    Limit    int      `schema:"limit"`
    Sort     string   `schema:"sort"`
    Order    string   `schema:"order"`
    Filters  []Filter `schema:"filters"`
}

type Filter struct {
    Field    string `schema:"field"`
    Operator string `schema:"operator"`
    Value    string `schema:"value"`
}

// Handler untuk collection dengan paginasi dan filtering
func (s *Server) handleGetUsers(w http.ResponseWriter, r *http.Request) {
    // Parse query parameters
    var params QueryParams
    if err := schema.NewDecoder().Decode(&params, r.URL.Query()); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Set default values
    if params.Page <= 0 {
        params.Page = 1
    }
    if params.Limit <= 0 {
        params.Limit = 10
    }
    
    // Get total count
    total, err := s.userRepo.CountUsers(params.Filters)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Calculate pagination
    offset := (params.Page - 1) * params.Limit
    totalPages := int(math.Ceil(float64(total) / float64(params.Limit)))
    
    // Get users
    users, err := s.userRepo.GetUsers(params.Filters, params.Sort, params.Order, params.Limit, offset)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Build response
    response := struct {
        Data       []User `json:"data"`
        Pagination struct {
            Page       int `json:"page"`
            Limit      int `json:"limit"`
            Total      int `json:"total"`
            TotalPages int `json:"totalPages"`
        } `json:"pagination"`
        Links struct {
            Self  string `json:"self"`
            First string `json:"first"`
            Prev  string `json:"prev,omitempty"`
            Next  string `json:"next,omitempty"`
            Last  string `json:"last"`
        } `json:"links"`
    }{
        Data: users,
        Pagination: struct {
            Page       int `json:"page"`
            Limit      int `json:"limit"`
            Total      int `json:"total"`
            TotalPages int `json:"totalPages"`
        }{
            Page:       params.Page,
            Limit:      params.Limit,
            Total:      total,
            TotalPages: totalPages,
        },
    }
    
    // Build links
    baseURL := fmt.Sprintf("%s://%s/api/users", s.config.Scheme, r.Host)
    response.Links.Self = fmt.Sprintf("%s?page=%d&limit=%d", baseURL, params.Page, params.Limit)
    response.Links.First = fmt.Sprintf("%s?page=1&limit=%d", baseURL, params.Limit)
    response.Links.Last = fmt.Sprintf("%s?page=%d&limit=%d", baseURL, totalPages, params.Limit)
    
    if params.Page > 1 {
        response.Links.Prev = fmt.Sprintf("%s?page=%d&limit=%d", baseURL, params.Page-1, params.Limit)
    }
    if params.Page < totalPages {
        response.Links.Next = fmt.Sprintf("%s?page=%d&limit=%d", baseURL, params.Page+1, params.Limit)
    }
    
    json.NewEncoder(w).Encode(response)
}
```

## URL Structure

URL structure adalah cara mengorganisir endpoints API agar mudah dipahami dan digunakan. URL yang baik harus intuitif, konsisten, dan mengikuti konvensi REST.

### 1. URL Patterns

- Gunakan kata benda, bukan kata kerja
- Gunakan bentuk jamak untuk collections
- Gunakan kebab-case atau snake_case
- Hindari trailing slash

```go
// Router configuration dengan URL patterns yang baik
func setupRouter() *mux.Router {
    router := mux.NewRouter()
    
    // Basic CRUD endpoints
    router.HandleFunc("/api/users", handleGetUsers).Methods("GET")
    router.HandleFunc("/api/users/{id}", handleGetUser).Methods("GET")
    router.HandleFunc("/api/users", handleCreateUser).Methods("POST")
    router.HandleFunc("/api/users/{id}", handleUpdateUser).Methods("PUT")
    router.HandleFunc("/api/users/{id}", handleDeleteUser).Methods("DELETE")
    
    // Nested resources
    router.HandleFunc("/api/users/{userId}/orders", handleGetUserOrders).Methods("GET")
    router.HandleFunc("/api/users/{userId}/orders/{orderId}", handleGetUserOrder).Methods("GET")
    
    // Query parameters untuk filtering dan sorting
    // GET /api/users?role=admin&sort=username&order=asc
    
    // Pagination
    // GET /api/users?page=1&limit=10
    
    // Search
    // GET /api/users/search?q=john
    
    // Bulk operations
    router.HandleFunc("/api/users/bulk", handleBulkCreateUsers).Methods("POST")
    router.HandleFunc("/api/users/bulk", handleBulkUpdateUsers).Methods("PUT")
    router.HandleFunc("/api/users/bulk", handleBulkDeleteUsers).Methods("DELETE")
    
    return router
}

// Contoh implementasi handler untuk bulk operations
func handleBulkCreateUsers(w http.ResponseWriter, r *http.Request) {
    var users []User
    if err := json.NewDecoder(r.Body).Decode(&users); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Validasi setiap user
    for _, user := range users {
        if err := validateResource(&user); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
    }
    
    // Simpan users
    createdUsers, err := userRepo.BulkCreateUsers(users)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(createdUsers)
}
```

### 2. Query Parameters

- Gunakan untuk filtering, sorting, dan pagination
- Gunakan nama yang deskriptif dan konsisten
- Dukung multiple filters dan sort fields

```go
// Query parameter parser
type QueryOptions struct {
    Filters     map[string]interface{} `schema:"filter"`
    Sort        []string              `schema:"sort"`
    Page        int                   `schema:"page"`
    Limit       int                   `schema:"limit"`
    Fields      []string              `schema:"fields"`
    Search      string                `schema:"q"`
    IncludeRefs []string              `schema:"include"`
}

func parseQueryOptions(r *http.Request) (*QueryOptions, error) {
    var opts QueryOptions
    
    // Parse query parameters
    if err := schema.NewDecoder().Decode(&opts, r.URL.Query()); err != nil {
        return nil, err
    }
    
    // Set default values
    if opts.Page <= 0 {
        opts.Page = 1
    }
    if opts.Limit <= 0 {
        opts.Limit = 10
    }
    if opts.Limit > 100 {
        opts.Limit = 100 // Maximum limit
    }
    
    return &opts, nil
}

// Handler yang menggunakan query parameters
func handleGetUsers(w http.ResponseWriter, r *http.Request) {
    opts, err := parseQueryOptions(r)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Build query
    query := NewQuery()
    
    // Apply filters
    for field, value := range opts.Filters {
        query.Filter(field, value)
    }
    
    // Apply sorting
    for _, sort := range opts.Sort {
        if strings.HasPrefix(sort, "-") {
            query.OrderBy(strings.TrimPrefix(sort, "-"), "DESC")
        } else {
            query.OrderBy(sort, "ASC")
        }
    }
    
    // Apply pagination
    query.Limit(opts.Limit).Offset((opts.Page - 1) * opts.Limit)
    
    // Apply field selection
    if len(opts.Fields) > 0 {
        query.Select(opts.Fields...)
    }
    
    // Apply search
    if opts.Search != "" {
        query.Search(opts.Search)
    }
    
    // Execute query
    users, total, err := userRepo.FindUsers(query)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Include referenced resources
    if len(opts.IncludeRefs) > 0 {
        if err := includeReferences(users, opts.IncludeRefs); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    }
    
    // Build response
    response := struct {
        Data       interface{} `json:"data"`
        Pagination struct {
            Page       int `json:"page"`
            Limit      int `json:"limit"`
            Total      int `json:"total"`
            TotalPages int `json:"totalPages"`
        } `json:"pagination"`
    }{
        Data: users,
        Pagination: struct {
            Page       int `json:"page"`
            Limit      int `json:"limit"`
            Total      int `json:"total"`
            TotalPages int `json:"totalPages"`
        }{
            Page:       opts.Page,
            Limit:      opts.Limit,
            Total:      total,
            TotalPages: int(math.Ceil(float64(total) / float64(opts.Limit))),
        },
    }
    
    json.NewEncoder(w).Encode(response)
}
```

### 3. Path Parameters

- Gunakan untuk mengidentifikasi specific resources
- Validasi parameter sebelum digunakan
- Gunakan nama yang deskriptif

```go
// Path parameter validator
type PathParams struct {
    UserID  int `validate:"required,min=1"`
    OrderID int `validate:"required,min=1"`
}

func validatePathParams(r *http.Request) (*PathParams, error) {
    vars := mux.Vars(r)
    
    params := &PathParams{}
    
    // Parse UserID
    if userID, ok := vars["userId"]; ok {
        id, err := strconv.Atoi(userID)
        if err != nil {
            return nil, fmt.Errorf("invalid user ID: %s", userID)
        }
        params.UserID = id
    }
    
    // Parse OrderID
    if orderID, ok := vars["orderId"]; ok {
        id, err := strconv.Atoi(orderID)
        if err != nil {
            return nil, fmt.Errorf("invalid order ID: %s", orderID)
        }
        params.OrderID = id
    }
    
    // Validate params
    validate := validator.New()
    if err := validate.Struct(params); err != nil {
        return nil, err
    }
    
    return params, nil
}

// Handler yang menggunakan path parameters
func handleGetUserOrder(w http.ResponseWriter, r *http.Request) {
    // Validate path parameters
    params, err := validatePathParams(r)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Get user
    user, err := userRepo.GetUser(params.UserID)
    if err != nil {
        if err == sql.ErrNoRows {
            http.Error(w, "User not found", http.StatusNotFound)
            return
        }
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Get order
    order, err := orderRepo.GetUserOrder(params.UserID, params.OrderID)
    if err != nil {
        if err == sql.ErrNoRows {
            http.Error(w, "Order not found", http.StatusNotFound)
            return
        }
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Build response with HATEOAS links
    response := struct {
        Data  interface{} `json:"data"`
        Links struct {
            Self   string `json:"self"`
            User   string `json:"user"`
            Items  string `json:"items"`
            Cancel string `json:"cancel"`
        } `json:"links"`
    }{
        Data: order,
        Links: struct {
            Self   string `json:"self"`
            User   string `json:"user"`
            Items  string `json:"items"`
            Cancel string `json:"cancel"`
        }{
            Self:   fmt.Sprintf("/api/users/%d/orders/%d", params.UserID, params.OrderID),
            User:   fmt.Sprintf("/api/users/%d", params.UserID),
            Items:  fmt.Sprintf("/api/users/%d/orders/%d/items", params.UserID, params.OrderID),
            Cancel: fmt.Sprintf("/api/users/%d/orders/%d/cancel", params.UserID, params.OrderID),
        },
    }
    
    json.NewEncoder(w).Encode(response)
}
```

### 4. Versioning in URLs

- Gunakan prefix versi di URL
- Pertahankan backward compatibility
- Dokumentasikan perubahan antar versi

```go
// Version prefix middleware
func versionPrefixMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Extract version from URL
        path := r.URL.Path
        if !strings.HasPrefix(path, "/api/v") {
            http.Error(w, "API version required", http.StatusBadRequest)
            return
        }
        
        // Parse version number
        version := strings.Split(path, "/")[2] // e.g., "v1" from "/api/v1/..."
        versionNum := strings.TrimPrefix(version, "v")
        
        // Validate version
        if !isValidVersion(versionNum) {
            http.Error(w, "Invalid API version", http.StatusBadRequest)
            return
        }
        
        // Add version to context
        ctx := context.WithValue(r.Context(), "version", versionNum)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Version router setup
func setupVersionedRouter() *mux.Router {
    router := mux.NewRouter()
    
    // Apply version middleware
    router.Use(versionPrefixMiddleware)
    
    // v1 routes
    v1 := router.PathPrefix("/api/v1").Subrouter()
    v1.HandleFunc("/users", handleGetUsersV1).Methods("GET")
    v1.HandleFunc("/users/{id}", handleGetUserV1).Methods("GET")
    
    // v2 routes with new features
    v2 := router.PathPrefix("/api/v2").Subrouter()
    v2.HandleFunc("/users", handleGetUsersV2).Methods("GET")
    v2.HandleFunc("/users/{id}", handleGetUserV2).Methods("GET")
    v2.HandleFunc("/users/search", handleSearchUsersV2).Methods("GET") // New in v2
    
    return router
}

// Version-specific handlers
func handleGetUsersV1(w http.ResponseWriter, r *http.Request) {
    // Basic implementation
    users, err := userRepo.GetUsers()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(users)
}

func handleGetUsersV2(w http.ResponseWriter, r *http.Request) {
    // Enhanced implementation with more features
    opts, err := parseQueryOptions(r)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    users, total, err := userRepo.FindUsers(opts)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    response := struct {
        Data       interface{} `json:"data"`
        Pagination interface{} `json:"pagination,omitempty"`
    }{
        Data: users,
        Pagination: struct {
            Total int `json:"total"`
            Page  int `json:"page"`
            Limit int `json:"limit"`
        }{
            Total: total,
            Page:  opts.Page,
            Limit: opts.Limit,
        },
    }
    
    json.NewEncoder(w).Encode(response)
}
```

## Request/Response Handling

Penanganan request dan response yang baik sangat penting untuk membuat API yang konsisten dan mudah digunakan.

### 1. Request Validation

- Validasi semua input dari client
- Berikan error message yang jelas
- Gunakan custom validator sesuai kebutuhan

```go
// Request validator
type CreateUserRequest struct {
    Username string `json:"username" validate:"required,min=3,max=50"`
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=8"`
    Age      int    `json:"age" validate:"required,gte=18"`
    Role     string `json:"role" validate:"required,oneof=admin user guest"`
}

// Custom validator
func validateCreateUserRequest(r *http.Request) (*CreateUserRequest, error) {
    var req CreateUserRequest
    
    // Parse request body
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        return nil, fmt.Errorf("invalid request body: %v", err)
    }
    
    // Initialize validator
    validate := validator.New()
    
    // Register custom validation
    validate.RegisterValidation("username_unique", validateUniqueUsername)
    
    // Validate struct
    if err := validate.Struct(req); err != nil {
        return nil, fmt.Errorf("validation failed: %v", err)
    }
    
    return &req, nil
}

// Custom validation function
func validateUniqueUsername(fl validator.FieldLevel) bool {
    username := fl.Field().String()
    
    // Check if username exists in database
    exists, err := userRepo.UsernameExists(username)
    if err != nil {
        return false
    }
    
    return !exists
}

// Handler with request validation
func handleCreateUser(w http.ResponseWriter, r *http.Request) {
    // Validate request
    req, err := validateCreateUserRequest(r)
    if err != nil {
        respondWithError(w, http.StatusBadRequest, err.Error())
        return
    }
    
    // Create user
    user := &User{
        Username: req.Username,
        Email:    req.Email,
        Password: hashPassword(req.Password),
        Age:      req.Age,
        Role:     req.Role,
    }
    
    if err := userRepo.CreateUser(user); err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to create user")
        return
    }
    
    respondWithJSON(w, http.StatusCreated, user)
}
```

### 2. Response Format

- Gunakan format response yang konsisten
- Sertakan metadata yang relevan
- Handle errors dengan baik

```go
// Response structures
type Response struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   *Error     `json:"error,omitempty"`
    Meta    *Meta      `json:"meta,omitempty"`
}

type Error struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Details string `json:"details,omitempty"`
}

type Meta struct {
    Timestamp   time.Time `json:"timestamp"`
    RequestID   string    `json:"requestId"`
    Version     string    `json:"version"`
    Pagination  *Pagination `json:"pagination,omitempty"`
}

type Pagination struct {
    CurrentPage int `json:"currentPage"`
    PageSize    int `json:"pageSize"`
    TotalItems  int `json:"totalItems"`
    TotalPages  int `json:"totalPages"`
}

// Response helpers
func respondWithJSON(w http.ResponseWriter, status int, payload interface{}) {
    response := Response{
        Success: status >= 200 && status < 300,
        Data:    payload,
        Meta: &Meta{
            Timestamp: time.Now(),
            RequestID: getRequestID(),
            Version:   "v1",
        },
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(response)
}

func respondWithError(w http.ResponseWriter, status int, message string) {
    response := Response{
        Success: false,
        Error: &Error{
            Code:    fmt.Sprintf("ERR_%d", status),
            Message: message,
        },
        Meta: &Meta{
            Timestamp: time.Now(),
            RequestID: getRequestID(),
            Version:   "v1",
        },
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(response)
}

// Example handler with consistent response format
func handleGetUser(w http.ResponseWriter, r *http.Request) {
    // Get user ID from path parameters
    vars := mux.Vars(r)
    userID, err := strconv.Atoi(vars["id"])
    if err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid user ID")
        return
    }
    
    // Get user from database
    user, err := userRepo.GetUser(userID)
    if err != nil {
        if err == sql.ErrNoRows {
            respondWithError(w, http.StatusNotFound, "User not found")
            return
        }
        respondWithError(w, http.StatusInternalServerError, "Failed to get user")
        return
    }
    
    respondWithJSON(w, http.StatusOK, user)
}
```

### 3. Content Negotiation

- Support multiple content types
- Handle Accept header
- Provide consistent serialization

```go
// Content type constants
const (
    ContentTypeJSON = "application/json"
    ContentTypeXML  = "application/xml"
    ContentTypeYAML = "application/yaml"
)

// Content negotiation middleware
func contentNegotiationMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Get Accept header
        accept := r.Header.Get("Accept")
        if accept == "" {
            accept = ContentTypeJSON // Default to JSON
        }
        
        // Validate content type
        switch accept {
        case ContentTypeJSON, ContentTypeXML, ContentTypeYAML:
            // Set response content type
            w.Header().Set("Content-Type", accept)
            // Continue with request
            next.ServeHTTP(w, r)
        default:
            // Unsupported content type
            w.WriteHeader(http.StatusNotAcceptable)
            fmt.Fprintf(w, "Unsupported content type: %s", accept)
        }
    })
}

// Response encoder based on content type
func encodeResponse(w http.ResponseWriter, data interface{}) error {
    contentType := w.Header().Get("Content-Type")
    
    switch contentType {
    case ContentTypeJSON:
        return json.NewEncoder(w).Encode(data)
    case ContentTypeXML:
        return xml.NewEncoder(w).Encode(data)
    case ContentTypeYAML:
        return yaml.NewEncoder(w).Encode(data)
    default:
        return fmt.Errorf("unsupported content type: %s", contentType)
    }
}

// Handler with content negotiation
func handleGetUserWithContentNegotiation(w http.ResponseWriter, r *http.Request) {
    // Get user ID from path parameters
    vars := mux.Vars(r)
    userID, err := strconv.Atoi(vars["id"])
    if err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid user ID")
        return
    }
    
    // Get user from database
    user, err := userRepo.GetUser(userID)
    if err != nil {
        if err == sql.ErrNoRows {
            respondWithError(w, http.StatusNotFound, "User not found")
            return
        }
        respondWithError(w, http.StatusInternalServerError, "Failed to get user")
        return
    }
    
    // Encode response based on content type
    if err := encodeResponse(w, Response{
        Success: true,
        Data:    user,
        Meta: &Meta{
            Timestamp: time.Now(),
            RequestID: getRequestID(),
            Version:   "v1",
        },
    }); err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to encode response")
        return
    }
}
```

### 4. Error Handling

- Gunakan error codes yang konsisten
- Berikan error message yang informatif
- Log errors untuk debugging

```go
// Error codes
const (
    ErrCodeValidation    = "VALIDATION_ERROR"
    ErrCodeNotFound      = "NOT_FOUND"
    ErrCodeUnauthorized  = "UNAUTHORIZED"
    ErrCodeForbidden     = "FORBIDDEN"
    ErrCodeInternal      = "INTERNAL_ERROR"
)

// Custom error type
type APIError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Details string `json:"details,omitempty"`
    Err     error  `json:"-"` // Internal error
}

func (e *APIError) Error() string {
    return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// Error factory functions
func NewValidationError(message string, err error) *APIError {
    return &APIError{
        Code:    ErrCodeValidation,
        Message: message,
        Details: err.Error(),
        Err:     err,
    }
}

func NewNotFoundError(resource string) *APIError {
    return &APIError{
        Code:    ErrCodeNotFound,
        Message: fmt.Sprintf("%s not found", resource),
    }
}

// Error handling middleware
func errorHandlerMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Create response writer wrapper to catch panics
        rw := &responseWriter{ResponseWriter: w}
        
        // Recover from panics
        defer func() {
            if err := recover(); err != nil {
                // Log panic
                log.Printf("Panic: %v\n%s", err, debug.Stack())
                
                // Respond with 500
                respondWithError(w, http.StatusInternalServerError, "Internal server error")
            }
        }()
        
        // Call next handler
        next.ServeHTTP(rw, r)
        
        // Check if error occurred
        if rw.err != nil {
            var apiErr *APIError
            if errors.As(rw.err, &apiErr) {
                // Handle API error
                status := getStatusCodeForError(apiErr)
                respondWithError(w, status, apiErr.Message)
            } else {
                // Handle unknown error
                log.Printf("Unknown error: %v", rw.err)
                respondWithError(w, http.StatusInternalServerError, "Internal server error")
            }
        }
    })
}

// Helper function to get HTTP status code for error
func getStatusCodeForError(err *APIError) int {
    switch err.Code {
    case ErrCodeValidation:
        return http.StatusBadRequest
    case ErrCodeNotFound:
        return http.StatusNotFound
    case ErrCodeUnauthorized:
        return http.StatusUnauthorized
    case ErrCodeForbidden:
        return http.StatusForbidden
    default:
        return http.StatusInternalServerError
    }
}

// Example handler with error handling
func handleUpdateUser(w http.ResponseWriter, r *http.Request) {
    // Get user ID
    vars := mux.Vars(r)
    userID, err := strconv.Atoi(vars["id"])
    if err != nil {
        panic(NewValidationError("Invalid user ID", err))
    }
    
    // Parse request body
    var req UpdateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        panic(NewValidationError("Invalid request body", err))
    }
    
    // Get existing user
    user, err := userRepo.GetUser(userID)
    if err != nil {
        if err == sql.ErrNoRows {
            panic(NewNotFoundError("User"))
        }
        panic(&APIError{
            Code:    ErrCodeInternal,
            Message: "Failed to get user",
            Err:     err,
        })
    }
    
    // Update user
    user.Username = req.Username
    user.Email = req.Email
    
    if err := userRepo.UpdateUser(user); err != nil {
        panic(&APIError{
            Code:    ErrCodeInternal,
            Message: "Failed to update user",
            Err:     err,
        })
    }
    
    respondWithJSON(w, http.StatusOK, user)
}
```
