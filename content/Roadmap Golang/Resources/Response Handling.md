# Response Handling

Response handling adalah proses mengirim data dari server ke client melalui HTTP response. Dalam pengembangan web dengan Go, kita perlu memahami berbagai cara untuk menangani response, termasuk mengirim berbagai tipe response, mengatur status code, header, cookie, dan streaming response.

## Response Types

Response types adalah berbagai jenis response yang dapat dikirim dari server ke client. Go menyediakan berbagai cara untuk mengirim response, tergantung pada tipe data yang akan dikirim.

### Karakteristik Response Types di Go
- **Text Response**: Mengirim response berupa teks biasa
- **HTML Response**: Mengirim response berupa HTML
- **JSON Response**: Mengirim response berupa JSON
- **XML Response**: Mengirim response berupa XML
- **Binary Response**: Mengirim response berupa data biner
- **File Response**: Mengirim response berupa file

### Implementasi Response Types
```go
// Response types dasar
package main

import (
    "encoding/json"
    "encoding/xml"
    "fmt"
    "html/template"
    "io"
    "log"
    "net/http"
    "os"
    "path/filepath"
)

// User adalah struct untuk data user
type User struct {
    ID   string `json:"id" xml:"id"`
    Name string `json:"name" xml:"name"`
    Age  int    `json:"age" xml:"age"`
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/text"
    mux.HandleFunc("/text", func(w http.ResponseWriter, r *http.Request) {
        // Mengirim text response
        w.Header().Set("Content-Type", "text/plain")
        fmt.Fprintf(w, "Hello, World!")
    })
    
    // Mendefinisikan handler untuk route "/html"
    mux.HandleFunc("/html", func(w http.ResponseWriter, r *http.Request) {
        // Mengirim HTML response
        w.Header().Set("Content-Type", "text/html")
        fmt.Fprintf(w, "<!DOCTYPE html><html><head><title>Hello</title></head><body><h1>Hello, World!</h1></body></html>")
    })
    
    // Mendefinisikan handler untuk route "/json"
    mux.HandleFunc("/json", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Mengirim JSON response
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    })
    
    // Mendefinisikan handler untuk route "/xml"
    mux.HandleFunc("/xml", func(w http.ResponseWriter, r *http.Request) {
        // Membuat user
        user := User{
            ID:   "1",
            Name: "John Doe",
            Age:  30,
        }
        
        // Mengirim XML response
        w.Header().Set("Content-Type", "application/xml")
        xml.NewEncoder(w).Encode(user)
    })
    
    // Mendefinisikan handler untuk route "/binary"
    mux.HandleFunc("/binary", func(w http.ResponseWriter, r *http.Request) {
        // Membuat data biner
        data := []byte{0x48, 0x65, 0x6C, 0x6C, 0x6F} // "Hello" dalam ASCII
        
        // Mengirim binary response
        w.Header().Set("Content-Type", "application/octet-stream")
        w.Write(data)
    })
    
    // Mendefinisikan handler untuk route "/file"
    mux.HandleFunc("/file", func(w http.ResponseWriter, r *http.Request) {
        // Membuka file
        file, err := os.Open("file.txt")
        if err != nil {
            http.Error(w, "File not found", http.StatusNotFound)
            return
        }
        defer file.Close()
        
        // Mengambil informasi file
        stat, err := file.Stat()
        if err != nil {
            http.Error(w, "Error getting file info", http.StatusInternalServerError)
            return
        }
        
        // Mengirim file response
        w.Header().Set("Content-Type", "text/plain")
        w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", stat.Name()))
        w.Header().Set("Content-Length", fmt.Sprintf("%d", stat.Size()))
        io.Copy(w, file)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Response types dengan template
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
    
    // Mendefinisikan handler untuk route "/template"
    mux.HandleFunc("/template", func(w http.ResponseWriter, r *http.Request) {
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
        // Mengirim template response
        t := template.Must(template.New("user").Parse(tmpl))
        t.Execute(w, user)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Status Codes

Status codes adalah kode yang menunjukkan status dari response yang dikirim dari server ke client. Go menyediakan berbagai konstanta untuk status code, seperti `http.StatusOK`, `http.StatusNotFound`, `http.StatusInternalServerError`, dll.

### Karakteristik Status Codes di Go
- **Informational (1xx)**: Menunjukkan bahwa request telah diterima dan sedang diproses
- **Success (2xx)**: Menunjukkan bahwa request telah berhasil diproses
- **Redirection (3xx)**: Menunjukkan bahwa client perlu melakukan tindakan tambahan untuk menyelesaikan request
- **Client Error (4xx)**: Menunjukkan bahwa request tidak dapat diproses karena kesalahan client
- **Server Error (5xx)**: Menunjukkan bahwa server mengalami kesalahan saat memproses request

### Implementasi Status Codes
```go
// Status codes dasar
package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/ok"
    mux.HandleFunc("/ok", func(w http.ResponseWriter, r *http.Request) {
        // Mengirim response dengan status code 200 OK
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, "OK")
    })
    
    // Mendefinisikan handler untuk route "/created"
    mux.HandleFunc("/created", func(w http.ResponseWriter, r *http.Request) {
        // Mengirim response dengan status code 201 Created
        w.WriteHeader(http.StatusCreated)
        fmt.Fprintf(w, "Created")
    })
    
    // Mendefinisikan handler untuk route "/not-found"
    mux.HandleFunc("/not-found", func(w http.ResponseWriter, r *http.Request) {
        // Mengirim response dengan status code 404 Not Found
        http.Error(w, "Not Found", http.StatusNotFound)
    })
    
    // Mendefinisikan handler untuk route "/server-error"
    mux.HandleFunc("/server-error", func(w http.ResponseWriter, r *http.Request) {
        // Mengirim response dengan status code 500 Internal Server Error
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Status codes dengan custom response
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

// ErrorResponse adalah struct untuk response error
type ErrorResponse struct {
    Status  int    `json:"status"`
    Message string `json:"message"`
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/not-found"
    mux.HandleFunc("/not-found", func(w http.ResponseWriter, r *http.Request) {
        // Membuat error response
        response := ErrorResponse{
            Status:  http.StatusNotFound,
            Message: "Resource not found",
        }
        
        // Mengirim JSON response dengan status code 404 Not Found
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusNotFound)
        json.NewEncoder(w).Encode(response)
    })
    
    // Mendefinisikan handler untuk route "/server-error"
    mux.HandleFunc("/server-error", func(w http.ResponseWriter, r *http.Request) {
        // Membuat error response
        response := ErrorResponse{
            Status:  http.StatusInternalServerError,
            Message: "Internal server error",
        }
        
        // Mengirim JSON response dengan status code 500 Internal Server Error
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(response)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Headers

Headers adalah bagian dari HTTP response yang berisi informasi tambahan tentang response. Go menyediakan berbagai cara untuk mengatur header, seperti `w.Header().Set()`, `w.Header().Add()`, dll.

### Karakteristik Headers di Go
- **Content-Type**: Menentukan tipe konten dari response
- **Content-Length**: Menentukan panjang dari response
- **Cache-Control**: Mengatur caching dari response
- **Location**: Mengatur lokasi redirect
- **Set-Cookie**: Mengatur cookie
- **Custom Headers**: Mengatur header kustom

### Implementasi Headers
```go
// Headers dasar
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/headers"
    mux.HandleFunc("/headers", func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header
        w.Header().Set("Content-Type", "text/plain")
        w.Header().Set("X-Custom-Header", "Custom Value")
        w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
        w.Header().Set("Pragma", "no-cache")
        w.Header().Set("Expires", "0")
        
        // Mengirim response
        fmt.Fprintf(w, "Headers set")
    })
    
    // Mendefinisikan handler untuk route "/redirect"
    mux.HandleFunc("/redirect", func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header untuk redirect
        w.Header().Set("Location", "/ok")
        w.WriteHeader(http.StatusFound)
    })
    
    // Mendefinisikan handler untuk route "/cors"
    mux.HandleFunc("/cors", func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header untuk CORS
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        // Mengirim response
        fmt.Fprintf(w, "CORS headers set")
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Headers dengan middleware
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

// Middleware untuk menambahkan header
func addHeaders(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header
        w.Header().Set("X-Request-ID", fmt.Sprintf("%d", time.Now().UnixNano()))
        w.Header().Set("X-Request-Time", time.Now().Format(time.RFC3339))
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
    })
}

// Middleware untuk CORS
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header untuk CORS
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        // Jika method adalah OPTIONS, kirim response dengan status code 200 OK
        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        // Memanggil handler berikutnya
        next.ServeHTTP(w, r)
    })
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, World!")
    })
    
    // Menjalankan server dengan middleware
    handler := addHeaders(corsMiddleware(mux))
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## Cookies

Cookies adalah data kecil yang disimpan di browser client. Go menyediakan berbagai cara untuk mengatur cookie, seperti `http.SetCookie()`, `http.Cookie{}`, dll.

### Karakteristik Cookies di Go
- **Setting Cookies**: Mengatur cookie di response
- **Reading Cookies**: Membaca cookie dari request
- **Cookie Options**: Mengatur opsi cookie, seperti domain, path, expiry, dll.
- **Secure Cookies**: Mengatur cookie yang aman
- **HttpOnly Cookies**: Mengatur cookie yang hanya dapat diakses oleh HTTP

### Implementasi Cookies
```go
// Cookies dasar
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/set-cookie"
    mux.HandleFunc("/set-cookie", func(w http.ResponseWriter, r *http.Request) {
        // Membuat cookie
        cookie := &http.Cookie{
            Name:     "session",
            Value:    "abc123",
            Path:     "/",
            Expires:  time.Now().Add(24 * time.Hour),
            HttpOnly: true,
        }
        
        // Mengatur cookie
        http.SetCookie(w, cookie)
        
        // Mengirim response
        fmt.Fprintf(w, "Cookie set")
    })
    
    // Mendefinisikan handler untuk route "/get-cookie"
    mux.HandleFunc("/get-cookie", func(w http.ResponseWriter, r *http.Request) {
        // Membaca cookie
        cookie, err := r.Cookie("session")
        if err != nil {
            http.Error(w, "Cookie not found", http.StatusNotFound)
            return
        }
        
        // Mengirim response
        fmt.Fprintf(w, "Cookie value: %s", cookie.Value)
    })
    
    // Mendefinisikan handler untuk route "/delete-cookie"
    mux.HandleFunc("/delete-cookie", func(w http.ResponseWriter, r *http.Request) {
        // Membuat cookie dengan expiry di masa lalu
        cookie := &http.Cookie{
            Name:     "session",
            Value:    "",
            Path:     "/",
            Expires:  time.Now().Add(-1 * time.Hour),
            HttpOnly: true,
        }
        
        // Mengatur cookie
        http.SetCookie(w, cookie)
        
        // Mengirim response
        fmt.Fprintf(w, "Cookie deleted")
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Cookies dengan session
package main

import (
    "crypto/rand"
    "encoding/base64"
    "fmt"
    "log"
    "net/http"
    "sync"
    "time"
)

// Session adalah struct untuk menyimpan data session
type Session struct {
    ID        string
    UserID    string
    CreatedAt time.Time
    ExpiresAt time.Time
}

// SessionStore adalah struct untuk menyimpan sessions
type SessionStore struct {
    sessions map[string]*Session
    mu       sync.RWMutex
}

// NewSessionStore membuat SessionStore baru
func NewSessionStore() *SessionStore {
    return &SessionStore{
        sessions: make(map[string]*Session),
    }
}

// CreateSession membuat session baru
func (s *SessionStore) CreateSession(userID string) *Session {
    // Membuat ID session
    id := make([]byte, 32)
    rand.Read(id)
    sessionID := base64.StdEncoding.EncodeToString(id)
    
    // Membuat session
    session := &Session{
        ID:        sessionID,
        UserID:    userID,
        CreatedAt: time.Now(),
        ExpiresAt: time.Now().Add(24 * time.Hour),
    }
    
    // Menyimpan session
    s.mu.Lock()
    s.sessions[sessionID] = session
    s.mu.Unlock()
    
    return session
}

// GetSession mengambil session berdasarkan ID
func (s *SessionStore) GetSession(id string) (*Session, bool) {
    s.mu.RLock()
    session, ok := s.sessions[id]
    s.mu.RUnlock()
    
    if !ok {
        return nil, false
    }
    
    // Cek apakah session sudah expired
    if time.Now().After(session.ExpiresAt) {
        s.DeleteSession(id)
        return nil, false
    }
    
    return session, true
}

// DeleteSession menghapus session berdasarkan ID
func (s *SessionStore) DeleteSession(id string) {
    s.mu.Lock()
    delete(s.sessions, id)
    s.mu.Unlock()
}

// Cleanup menghapus semua session yang sudah expired
func (s *SessionStore) Cleanup() {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    now := time.Now()
    for id, session := range s.sessions {
        if now.After(session.ExpiresAt) {
            delete(s.sessions, id)
        }
    }
}

func main() {
    // Membuat session store
    sessionStore := NewSessionStore()
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/login"
    mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
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
        userID := r.FormValue("user_id")
        
        // Membuat session
        session := sessionStore.CreateSession(userID)
        
        // Membuat cookie
        cookie := &http.Cookie{
            Name:     "session",
            Value:    session.ID,
            Path:     "/",
            Expires:  session.ExpiresAt,
            HttpOnly: true,
        }
        
        // Mengatur cookie
        http.SetCookie(w, cookie)
        
        // Mengirim response
        fmt.Fprintf(w, "Logged in as %s", userID)
    })
    
    // Mendefinisikan handler untuk route "/logout"
    mux.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
        // Membaca cookie
        cookie, err := r.Cookie("session")
        if err == nil {
            // Menghapus session
            sessionStore.DeleteSession(cookie.Value)
        }
        
        // Membuat cookie dengan expiry di masa lalu
        cookie = &http.Cookie{
            Name:     "session",
            Value:    "",
            Path:     "/",
            Expires:  time.Now().Add(-1 * time.Hour),
            HttpOnly: true,
        }
        
        // Mengatur cookie
        http.SetCookie(w, cookie)
        
        // Mengirim response
        fmt.Fprintf(w, "Logged out")
    })
    
    // Mendefinisikan handler untuk route "/profile"
    mux.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
        // Membaca cookie
        cookie, err := r.Cookie("session")
        if err != nil {
            http.Error(w, "Not logged in", http.StatusUnauthorized)
            return
        }
        
        // Mengambil session
        session, ok := sessionStore.GetSession(cookie.Value)
        if !ok {
            http.Error(w, "Invalid session", http.StatusUnauthorized)
            return
        }
        
        // Mengirim response
        fmt.Fprintf(w, "Profile for user %s", session.UserID)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Streaming Responses

Streaming responses adalah proses mengirim response secara bertahap, bukan sekaligus. Go menyediakan berbagai cara untuk streaming response, seperti `http.Flusher`, `io.Writer`, dll.

### Karakteristik Streaming Responses di Go
- **Flushing**: Mengirim response secara bertahap dengan `http.Flusher`
- **Chunked Transfer**: Mengirim response dengan chunked transfer encoding
- **Server-Sent Events**: Mengirim event dari server ke client
- **WebSocket**: Mengirim data secara real-time antara server dan client
- **Long Polling**: Mengirim response setelah data tersedia

### Implementasi Streaming Responses
```go
// Streaming responses dasar
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/stream"
    mux.HandleFunc("/stream", func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header untuk streaming
        w.Header().Set("Content-Type", "text/plain")
        w.Header().Set("Transfer-Encoding", "chunked")
        
        // Mengambil flusher
        flusher, ok := w.(http.Flusher)
        if !ok {
            http.Error(w, "Streaming not supported", http.StatusInternalServerError)
            return
        }
        
        // Mengirim data secara bertahap
        for i := 0; i < 10; i++ {
            fmt.Fprintf(w, "Data %d\n", i)
            flusher.Flush()
            time.Sleep(1 * time.Second)
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Server-Sent Events
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/events"
    mux.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
        // Mengatur header untuk Server-Sent Events
        w.Header().Set("Content-Type", "text/event-stream")
        w.Header().Set("Cache-Control", "no-cache")
        w.Header().Set("Connection", "keep-alive")
        
        // Mengambil flusher
        flusher, ok := w.(http.Flusher)
        if !ok {
            http.Error(w, "Streaming not supported", http.StatusInternalServerError)
            return
        }
        
        // Mengirim event secara bertahap
        for i := 0; i < 10; i++ {
            fmt.Fprintf(w, "data: Event %d\n\n", i)
            flusher.Flush()
            time.Sleep(1 * time.Second)
        }
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}

// Long Polling
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "sync"
    "time"
)

// Message adalah struct untuk menyimpan pesan
type Message struct {
    ID      string    `json:"id"`
    Content string    `json:"content"`
    Time    time.Time `json:"time"`
}

// MessageStore adalah struct untuk menyimpan pesan
type MessageStore struct {
    messages []Message
    mu       sync.RWMutex
}

// NewMessageStore membuat MessageStore baru
func NewMessageStore() *MessageStore {
    return &MessageStore{
        messages: make([]Message, 0),
    }
}

// AddMessage menambahkan pesan baru
func (s *MessageStore) AddMessage(content string) Message {
    // Membuat pesan
    message := Message{
        ID:      fmt.Sprintf("%d", time.Now().UnixNano()),
        Content: content,
        Time:    time.Now(),
    }
    
    // Menyimpan pesan
    s.mu.Lock()
    s.messages = append(s.messages, message)
    s.mu.Unlock()
    
    return message
}

// GetMessages mengambil semua pesan
func (s *MessageStore) GetMessages() []Message {
    s.mu.RLock()
    defer s.mu.RUnlock()
    
    return s.messages
}

func main() {
    // Membuat message store
    messageStore := NewMessageStore()
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Menampilkan form
        fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>Long Polling</title>
    <script>
        function sendMessage() {
            var content = document.getElementById("content").value;
            fetch("/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "content=" + encodeURIComponent(content),
            });
            document.getElementById("content").value = "";
        }
        
        function pollMessages() {
            fetch("/poll")
                .then(response => response.json())
                .then(messages => {
                    var messagesDiv = document.getElementById("messages");
                    messagesDiv.innerHTML = "";
                    messages.forEach(message => {
                        var messageDiv = document.createElement("div");
                        messageDiv.textContent = message.content;
                        messagesDiv.appendChild(messageDiv);
                    });
                    setTimeout(pollMessages, 1000);
                });
        }
        
        window.onload = pollMessages;
    </script>
</head>
<body>
    <h1>Long Polling</h1>
    <div>
        <input type="text" id="content" placeholder="Enter message">
        <button onclick="sendMessage()">Send</button>
    </div>
    <div id="messages"></div>
</body>
</html>
`)
    })
    
    // Mendefinisikan handler untuk route "/send"
    mux.HandleFunc("/send", func(w http.ResponseWriter, r *http.Request) {
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
        content := r.FormValue("content")
        
        // Menambahkan pesan
        messageStore.AddMessage(content)
        
        // Mengirim response
        w.WriteHeader(http.StatusOK)
    })
    
    // Mendefinisikan handler untuk route "/poll"
    mux.HandleFunc("/poll", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil pesan
        messages := messageStore.GetMessages()
        
        // Mengirim response
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(messages)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Kesimpulan

Response handling adalah komponen penting dalam pengembangan web yang memungkinkan kita untuk mengirim data dari server ke client. Go menyediakan berbagai cara untuk menangani response, termasuk mengirim berbagai tipe response, mengatur status code, header, cookie, dan streaming response.

Dengan memahami dan mengimplementasikan konsep-konsep seperti response types, status codes, headers, cookies, dan streaming responses, kita dapat mengembangkan aplikasi web yang dapat mengirim data ke client dengan baik. Pilihan metode handling yang tepat tergantung pada tipe data yang akan dikirim dan kebutuhan aplikasi. 