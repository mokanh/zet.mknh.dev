# Session Management

Session management adalah komponen penting dalam pengembangan web yang memungkinkan kita untuk menyimpan dan mengambil data pengguna di antara permintaan HTTP. Go menyediakan berbagai cara untuk menangani sesi, seperti cookie-based sessions, server-side sessions, dan session storage.

## Session Handling

Session handling adalah proses mengelola data sesi pengguna, seperti login status, preferensi pengguna, dan data sementara lainnya. Go menyediakan berbagai cara untuk menangani sesi, seperti cookie-based sessions, server-side sessions, dan session storage.

### Karakteristik Session Handling di Go
- **Cookie-based Sessions**: Menyimpan data sesi di cookie
- **Server-side Sessions**: Menyimpan data sesi di server
- **Session Storage**: Menyimpan data sesi di storage
- **Session Security**: Keamanan data sesi
- **Session Expiration**: Kadaluarsa sesi

### Implementasi Session Handling
```go
// Session handling dasar
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

// Session adalah struct untuk data sesi
type Session struct {
    ID        string
    Data      map[string]interface{}
    CreatedAt time.Time
    ExpiresAt time.Time
}

// SessionStore adalah struct untuk menyimpan sesi
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

// GenerateID menghasilkan ID sesi baru
func GenerateID() (string, error) {
    b := make([]byte, 32)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b), nil
}

// CreateSession membuat sesi baru
func (s *SessionStore) CreateSession() (*Session, error) {
    id, err := GenerateID()
    if err != nil {
        return nil, err
    }
    
    session := &Session{
        ID:        id,
        Data:      make(map[string]interface{}),
        CreatedAt: time.Now(),
        ExpiresAt: time.Now().Add(24 * time.Hour),
    }
    
    s.mu.Lock()
    s.sessions[id] = session
    s.mu.Unlock()
    
    return session, nil
}

// GetSession mengambil sesi berdasarkan ID
func (s *SessionStore) GetSession(id string) (*Session, bool) {
    s.mu.RLock()
    session, ok := s.sessions[id]
    s.mu.RUnlock()
    
    if !ok {
        return nil, false
    }
    
    if time.Now().After(session.ExpiresAt) {
        s.DeleteSession(id)
        return nil, false
    }
    
    return session, true
}

// DeleteSession menghapus sesi berdasarkan ID
func (s *SessionStore) DeleteSession(id string) {
    s.mu.Lock()
    delete(s.sessions, id)
    s.mu.Unlock()
}

// CleanupSessions membersihkan sesi yang kadaluarsa
func (s *SessionStore) CleanupSessions() {
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
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil sesi dari cookie
        cookie, err := r.Cookie("session_id")
        if err != nil {
            // Membuat sesi baru
            session, err := sessionStore.CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session_id",
                Value:    session.ID,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mengambil sesi dari store
        session, ok := sessionStore.GetSession(cookie.Value)
        if !ok {
            // Membuat sesi baru
            session, err := sessionStore.CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session_id",
                Value:    session.ID,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mengambil data dari sesi
        count, ok := session.Data["count"].(int)
        if !ok {
            count = 0
        }
        
        // Menyimpan data di sesi
        session.Data["count"] = count + 1
        
        // Menampilkan data sesi
        fmt.Fprintf(w, "Session: %s\n", session.ID)
        fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
    })
    
    // Mendefinisikan handler untuk route "/logout"
    mux.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil sesi dari cookie
        cookie, err := r.Cookie("session_id")
        if err != nil {
            http.Redirect(w, r, "/", http.StatusSeeOther)
            return
        }
        
        // Menghapus sesi dari store
        sessionStore.DeleteSession(cookie.Value)
        
        // Menghapus cookie
        http.SetCookie(w, &http.Cookie{
            Name:     "session_id",
            Value:    "",
            Path:     "/",
            Expires:  time.Now().Add(-1 * time.Hour),
            HttpOnly: true,
        })
        
        // Redirect ke halaman utama
        http.Redirect(w, r, "/", http.StatusSeeOther)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Cookie-based Sessions

Cookie-based sessions adalah metode untuk menyimpan data sesi di cookie. Cookie adalah data kecil yang disimpan di browser pengguna dan dikirim ke server setiap kali pengguna mengakses halaman web.

### Karakteristik Cookie-based Sessions di Go
- **Cookie Creation**: Membuat cookie untuk sesi
- **Cookie Reading**: Membaca cookie untuk sesi
- **Cookie Deletion**: Menghapus cookie untuk sesi
- **Cookie Security**: Keamanan cookie
- **Cookie Expiration**: Kadaluarsa cookie

### Implementasi Cookie-based Sessions
```go
// Cookie-based sessions dasar
package main

import (
    "crypto/rand"
    "encoding/base64"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
)

// Session adalah struct untuk data sesi
type Session struct {
    ID        string
    Data      map[string]interface{}
    CreatedAt time.Time
    ExpiresAt time.Time
}

// GenerateID menghasilkan ID sesi baru
func GenerateID() (string, error) {
    b := make([]byte, 32)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b), nil
}

// CreateSession membuat sesi baru
func CreateSession() (*Session, error) {
    id, err := GenerateID()
    if err != nil {
        return nil, err
    }
    
    session := &Session{
        ID:        id,
        Data:      make(map[string]interface{}),
        CreatedAt: time.Now(),
        ExpiresAt: time.Now().Add(24 * time.Hour),
    }
    
    return session, nil
}

// EncodeSession mengkodekan sesi ke string
func EncodeSession(session *Session) (string, error) {
    data, err := json.Marshal(session)
    if err != nil {
        return "", err
    }
    
    return base64.URLEncoding.EncodeToString(data), nil
}

// DecodeSession mendekodekan string ke sesi
func DecodeSession(data string) (*Session, error) {
    decoded, err := base64.URLEncoding.DecodeString(data)
    if err != nil {
        return nil, err
    }
    
    var session Session
    if err := json.Unmarshal(decoded, &session); err != nil {
        return nil, err
    }
    
    if time.Now().After(session.ExpiresAt) {
        return nil, fmt.Errorf("session expired")
    }
    
    return &session, nil
}

func main() {
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil sesi dari cookie
        cookie, err := r.Cookie("session")
        if err != nil {
            // Membuat sesi baru
            session, err := CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Mengkodekan sesi
            encoded, err := EncodeSession(session)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session",
                Value:    encoded,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
                Secure:   true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mendekodekan sesi
        session, err := DecodeSession(cookie.Value)
        if err != nil {
            // Membuat sesi baru
            session, err := CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Mengkodekan sesi
            encoded, err := EncodeSession(session)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session",
                Value:    encoded,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
                Secure:   true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mengambil data dari sesi
        count, ok := session.Data["count"].(float64)
        if !ok {
            count = 0
        }
        
        // Menyimpan data di sesi
        session.Data["count"] = count + 1
        
        // Mengkodekan sesi
        encoded, err := EncodeSession(session)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Membuat cookie
        http.SetCookie(w, &http.Cookie{
            Name:     "session",
            Value:    encoded,
            Path:     "/",
            Expires:  session.ExpiresAt,
            HttpOnly: true,
            Secure:   true,
        })
        
        // Menampilkan data sesi
        fmt.Fprintf(w, "Session: %s\n", session.ID)
        fmt.Fprintf(w, "Count: %d\n", int(session.Data["count"].(float64)))
    })
    
    // Mendefinisikan handler untuk route "/logout"
    mux.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
        // Menghapus cookie
        http.SetCookie(w, &http.Cookie{
            Name:     "session",
            Value:    "",
            Path:     "/",
            Expires:  time.Now().Add(-1 * time.Hour),
            HttpOnly: true,
            Secure:   true,
        })
        
        // Redirect ke halaman utama
        http.Redirect(w, r, "/", http.StatusSeeOther)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Server-side Sessions

Server-side sessions adalah metode untuk menyimpan data sesi di server. Data sesi disimpan di server dan hanya ID sesi yang disimpan di cookie.

### Karakteristik Server-side Sessions di Go
- **Session Storage**: Menyimpan data sesi di server
- **Session ID**: ID sesi yang disimpan di cookie
- **Session Retrieval**: Mengambil data sesi dari server
- **Session Update**: Memperbarui data sesi di server
- **Session Deletion**: Menghapus data sesi dari server

### Implementasi Server-side Sessions
```go
// Server-side sessions dasar
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

// Session adalah struct untuk data sesi
type Session struct {
    ID        string
    Data      map[string]interface{}
    CreatedAt time.Time
    ExpiresAt time.Time
}

// SessionStore adalah struct untuk menyimpan sesi
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

// GenerateID menghasilkan ID sesi baru
func GenerateID() (string, error) {
    b := make([]byte, 32)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b), nil
}

// CreateSession membuat sesi baru
func (s *SessionStore) CreateSession() (*Session, error) {
    id, err := GenerateID()
    if err != nil {
        return nil, err
    }
    
    session := &Session{
        ID:        id,
        Data:      make(map[string]interface{}),
        CreatedAt: time.Now(),
        ExpiresAt: time.Now().Add(24 * time.Hour),
    }
    
    s.mu.Lock()
    s.sessions[id] = session
    s.mu.Unlock()
    
    return session, nil
}

// GetSession mengambil sesi berdasarkan ID
func (s *SessionStore) GetSession(id string) (*Session, bool) {
    s.mu.RLock()
    session, ok := s.sessions[id]
    s.mu.RUnlock()
    
    if !ok {
        return nil, false
    }
    
    if time.Now().After(session.ExpiresAt) {
        s.DeleteSession(id)
        return nil, false
    }
    
    return session, true
}

// UpdateSession memperbarui sesi
func (s *SessionStore) UpdateSession(session *Session) error {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    if _, ok := s.sessions[session.ID]; !ok {
        return fmt.Errorf("session not found")
    }
    
    s.sessions[session.ID] = session
    return nil
}

// DeleteSession menghapus sesi berdasarkan ID
func (s *SessionStore) DeleteSession(id string) {
    s.mu.Lock()
    delete(s.sessions, id)
    s.mu.Unlock()
}

// CleanupSessions membersihkan sesi yang kadaluarsa
func (s *SessionStore) CleanupSessions() {
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
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil sesi dari cookie
        cookie, err := r.Cookie("session_id")
        if err != nil {
            // Membuat sesi baru
            session, err := sessionStore.CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session_id",
                Value:    session.ID,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mengambil sesi dari store
        session, ok := sessionStore.GetSession(cookie.Value)
        if !ok {
            // Membuat sesi baru
            session, err := sessionStore.CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session_id",
                Value:    session.ID,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mengambil data dari sesi
        count, ok := session.Data["count"].(int)
        if !ok {
            count = 0
        }
        
        // Menyimpan data di sesi
        session.Data["count"] = count + 1
        
        // Memperbarui sesi
        if err := sessionStore.UpdateSession(session); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Menampilkan data sesi
        fmt.Fprintf(w, "Session: %s\n", session.ID)
        fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
    })
    
    // Mendefinisikan handler untuk route "/logout"
    mux.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil sesi dari cookie
        cookie, err := r.Cookie("session_id")
        if err != nil {
            http.Redirect(w, r, "/", http.StatusSeeOther)
            return
        }
        
        // Menghapus sesi dari store
        sessionStore.DeleteSession(cookie.Value)
        
        // Menghapus cookie
        http.SetCookie(w, &http.Cookie{
            Name:     "session_id",
            Value:    "",
            Path:     "/",
            Expires:  time.Now().Add(-1 * time.Hour),
            HttpOnly: true,
        })
        
        // Redirect ke halaman utama
        http.Redirect(w, r, "/", http.StatusSeeOther)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Session Security

Session security adalah aspek penting dalam pengembangan web yang memastikan data sesi pengguna aman dari serangan seperti session hijacking, session fixation, dan cross-site scripting (XSS).

### Karakteristik Session Security di Go
- **Session ID Generation**: Pembuatan ID sesi yang aman
- **Session ID Validation**: Validasi ID sesi
- **Session ID Rotation**: Rotasi ID sesi
- **Session Data Encryption**: Enkripsi data sesi
- **Session Data Validation**: Validasi data sesi

### Implementasi Session Security
```go
// Session security dasar
package main

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "crypto/sha256"
    "encoding/base64"
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "time"
)

// Session adalah struct untuk data sesi
type Session struct {
    ID        string
    Data      map[string]interface{}
    CreatedAt time.Time
    ExpiresAt time.Time
}

// GenerateID menghasilkan ID sesi baru
func GenerateID() (string, error) {
    b := make([]byte, 32)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b), nil
}

// CreateSession membuat sesi baru
func CreateSession() (*Session, error) {
    id, err := GenerateID()
    if err != nil {
        return nil, err
    }
    
    session := &Session{
        ID:        id,
        Data:      make(map[string]interface{}),
        CreatedAt: time.Now(),
        ExpiresAt: time.Now().Add(24 * time.Hour),
    }
    
    return session, nil
}

// EncryptSession mengenkripsi sesi
func EncryptSession(session *Session, key []byte) (string, error) {
    // Mengkodekan sesi ke JSON
    data, err := json.Marshal(session)
    if err != nil {
        return "", err
    }
    
    // Membuat cipher block
    block, err := aes.NewCipher(key)
    if err != nil {
        return "", err
    }
    
    // Membuat GCM
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }
    
    // Membuat nonce
    nonce := make([]byte, gcm.NonceSize())
    if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
        return "", err
    }
    
    // Mengenkripsi data
    ciphertext := gcm.Seal(nonce, nonce, data, nil)
    
    // Mengkodekan ciphertext ke base64
    return base64.URLEncoding.EncodeToString(ciphertext), nil
}

// DecryptSession mendekripsi sesi
func DecryptSession(data string, key []byte) (*Session, error) {
    // Mendekodekan data dari base64
    ciphertext, err := base64.URLEncoding.DecodeString(data)
    if err != nil {
        return nil, err
    }
    
    // Membuat cipher block
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }
    
    // Membuat GCM
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }
    
    // Mengekstrak nonce
    nonceSize := gcm.NonceSize()
    if len(ciphertext) < nonceSize {
        return nil, fmt.Errorf("ciphertext too short")
    }
    
    nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
    
    // Mendekripsi data
    plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
    if err != nil {
        return nil, err
    }
    
    // Mendekodekan data dari JSON
    var session Session
    if err := json.Unmarshal(plaintext, &session); err != nil {
        return nil, err
    }
    
    // Memeriksa kadaluarsa
    if time.Now().After(session.ExpiresAt) {
        return nil, fmt.Errorf("session expired")
    }
    
    return &session, nil
}

// GenerateKey menghasilkan kunci enkripsi
func GenerateKey() ([]byte, error) {
    key := make([]byte, 32)
    if _, err := io.ReadFull(rand.Reader, key); err != nil {
        return nil, err
    }
    return key, nil
}

// HashPassword mengenkripsi password
func HashPassword(password string) string {
    hash := sha256.Sum256([]byte(password))
    return base64.URLEncoding.EncodeToString(hash[:])
}

func main() {
    // Membuat kunci enkripsi
    key, err := GenerateKey()
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil sesi dari cookie
        cookie, err := r.Cookie("session")
        if err != nil {
            // Membuat sesi baru
            session, err := CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Mengenkripsi sesi
            encrypted, err := EncryptSession(session, key)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session",
                Value:    encrypted,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
                Secure:   true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mendekripsi sesi
        session, err := DecryptSession(cookie.Value, key)
        if err != nil {
            // Membuat sesi baru
            session, err := CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Mengenkripsi sesi
            encrypted, err := EncryptSession(session, key)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session",
                Value:    encrypted,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
                Secure:   true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mengambil data dari sesi
        count, ok := session.Data["count"].(float64)
        if !ok {
            count = 0
        }
        
        // Menyimpan data di sesi
        session.Data["count"] = count + 1
        
        // Mengenkripsi sesi
        encrypted, err := EncryptSession(session, key)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Membuat cookie
        http.SetCookie(w, &http.Cookie{
            Name:     "session",
            Value:    encrypted,
            Path:     "/",
            Expires:  session.ExpiresAt,
            HttpOnly: true,
            Secure:   true,
        })
        
        // Menampilkan data sesi
        fmt.Fprintf(w, "Session: %s\n", session.ID)
        fmt.Fprintf(w, "Count: %d\n", int(session.Data["count"].(float64)))
    })
    
    // Mendefinisikan handler untuk route "/logout"
    mux.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
        // Menghapus cookie
        http.SetCookie(w, &http.Cookie{
            Name:     "session",
            Value:    "",
            Path:     "/",
            Expires:  time.Now().Add(-1 * time.Hour),
            HttpOnly: true,
            Secure:   true,
        })
        
        // Redirect ke halaman utama
        http.Redirect(w, r, "/", http.StatusSeeOther)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Session Storage

Session storage adalah metode untuk menyimpan data sesi di storage, seperti database, file, atau cache. Go menyediakan berbagai cara untuk menyimpan data sesi, seperti database, file, dan cache.

### Karakteristik Session Storage di Go
- **Database Storage**: Menyimpan data sesi di database
- **File Storage**: Menyimpan data sesi di file
- **Cache Storage**: Menyimpan data sesi di cache
- **Storage Interface**: Interface untuk storage
- **Storage Implementation**: Implementasi storage

### Implementasi Session Storage
```go
// Session storage dasar
package main

import (
    "crypto/rand"
    "encoding/base64"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "path/filepath"
    "sync"
    "time"
)

// Session adalah struct untuk data sesi
type Session struct {
    ID        string
    Data      map[string]interface{}
    CreatedAt time.Time
    ExpiresAt time.Time
}

// SessionStorage adalah interface untuk storage
type SessionStorage interface {
    Create(session *Session) error
    Get(id string) (*Session, error)
    Update(session *Session) error
    Delete(id string) error
    Cleanup() error
}

// FileSessionStorage adalah implementasi SessionStorage untuk file
type FileSessionStorage struct {
    dir string
    mu  sync.RWMutex
}

// NewFileSessionStorage membuat FileSessionStorage baru
func NewFileSessionStorage(dir string) (*FileSessionStorage, error) {
    // Membuat direktori jika belum ada
    if err := os.MkdirAll(dir, 0755); err != nil {
        return nil, err
    }
    
    return &FileSessionStorage{
        dir: dir,
    }, nil
}

// filePath mengembalikan path file untuk sesi
func (s *FileSessionStorage) filePath(id string) string {
    return filepath.Join(s.dir, id+".json")
}

// Create membuat sesi baru
func (s *FileSessionStorage) Create(session *Session) error {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    // Mengkodekan sesi ke JSON
    data, err := json.Marshal(session)
    if err != nil {
        return err
    }
    
    // Menulis data ke file
    if err := os.WriteFile(s.filePath(session.ID), data, 0644); err != nil {
        return err
    }
    
    return nil
}

// Get mengambil sesi berdasarkan ID
func (s *FileSessionStorage) Get(id string) (*Session, error) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    
    // Membaca data dari file
    data, err := os.ReadFile(s.filePath(id))
    if err != nil {
        return nil, err
    }
    
    // Mendekodekan data dari JSON
    var session Session
    if err := json.Unmarshal(data, &session); err != nil {
        return nil, err
    }
    
    // Memeriksa kadaluarsa
    if time.Now().After(session.ExpiresAt) {
        s.Delete(id)
        return nil, fmt.Errorf("session expired")
    }
    
    return &session, nil
}

// Update memperbarui sesi
func (s *FileSessionStorage) Update(session *Session) error {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    // Memeriksa apakah file ada
    if _, err := os.Stat(s.filePath(session.ID)); os.IsNotExist(err) {
        return fmt.Errorf("session not found")
    }
    
    // Mengkodekan sesi ke JSON
    data, err := json.Marshal(session)
    if err != nil {
        return err
    }
    
    // Menulis data ke file
    if err := os.WriteFile(s.filePath(session.ID), data, 0644); err != nil {
        return err
    }
    
    return nil
}

// Delete menghapus sesi berdasarkan ID
func (s *FileSessionStorage) Delete(id string) error {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    // Menghapus file
    if err := os.Remove(s.filePath(id)); err != nil {
        return err
    }
    
    return nil
}

// Cleanup membersihkan sesi yang kadaluarsa
func (s *FileSessionStorage) Cleanup() error {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    // Membaca direktori
    files, err := os.ReadDir(s.dir)
    if err != nil {
        return err
    }
    
    // Memeriksa setiap file
    for _, file := range files {
        if file.IsDir() {
            continue
        }
        
        // Membaca data dari file
        data, err := os.ReadFile(filepath.Join(s.dir, file.Name()))
        if err != nil {
            continue
        }
        
        // Mendekodekan data dari JSON
        var session Session
        if err := json.Unmarshal(data, &session); err != nil {
            continue
        }
        
        // Memeriksa kadaluarsa
        if time.Now().After(session.ExpiresAt) {
            os.Remove(filepath.Join(s.dir, file.Name()))
        }
    }
    
    return nil
}

// GenerateID menghasilkan ID sesi baru
func GenerateID() (string, error) {
    b := make([]byte, 32)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b), nil
}

// CreateSession membuat sesi baru
func CreateSession() (*Session, error) {
    id, err := GenerateID()
    if err != nil {
        return nil, err
    }
    
    session := &Session{
        ID:        id,
        Data:      make(map[string]interface{}),
        CreatedAt: time.Now(),
        ExpiresAt: time.Now().Add(24 * time.Hour),
    }
    
    return session, nil
}

func main() {
    // Membuat session storage
    sessionStorage, err := NewFileSessionStorage("sessions")
    if err != nil {
        log.Fatal(err)
    }
    
    // Membuat mux (router)
    mux := http.NewServeMux()
    
    // Mendefinisikan handler untuk route "/"
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil sesi dari cookie
        cookie, err := r.Cookie("session_id")
        if err != nil {
            // Membuat sesi baru
            session, err := CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Menyimpan sesi di storage
            if err := sessionStorage.Create(session); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session_id",
                Value:    session.ID,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mengambil sesi dari storage
        session, err := sessionStorage.Get(cookie.Value)
        if err != nil {
            // Membuat sesi baru
            session, err := CreateSession()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Menyimpan data di sesi
            session.Data["count"] = 1
            
            // Menyimpan sesi di storage
            if err := sessionStorage.Create(session); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            
            // Membuat cookie
            http.SetCookie(w, &http.Cookie{
                Name:     "session_id",
                Value:    session.ID,
                Path:     "/",
                Expires:  session.ExpiresAt,
                HttpOnly: true,
            })
            
            // Menampilkan data sesi
            fmt.Fprintf(w, "Session created: %s\n", session.ID)
            fmt.Fprintf(w, "Count: %d\n", session.Data["count"])
            return
        }
        
        // Mengambil data dari sesi
        count, ok := session.Data["count"].(float64)
        if !ok {
            count = 0
        }
        
        // Menyimpan data di sesi
        session.Data["count"] = count + 1
        
        // Memperbarui sesi di storage
        if err := sessionStorage.Update(session); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Menampilkan data sesi
        fmt.Fprintf(w, "Session: %s\n", session.ID)
        fmt.Fprintf(w, "Count: %d\n", int(session.Data["count"].(float64)))
    })
    
    // Mendefinisikan handler untuk route "/logout"
    mux.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
        // Mengambil sesi dari cookie
        cookie, err := r.Cookie("session_id")
        if err != nil {
            http.Redirect(w, r, "/", http.StatusSeeOther)
            return
        }
        
        // Menghapus sesi dari storage
        if err := sessionStorage.Delete(cookie.Value); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Menghapus cookie
        http.SetCookie(w, &http.Cookie{
            Name:     "session_id",
            Value:    "",
            Path:     "/",
            Expires:  time.Now().Add(-1 * time.Hour),
            HttpOnly: true,
        })
        
        // Redirect ke halaman utama
        http.Redirect(w, r, "/", http.StatusSeeOther)
    })
    
    // Menjalankan server
    fmt.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

## Kesimpulan

Session management adalah komponen penting dalam pengembangan web yang memungkinkan kita untuk menyimpan dan mengambil data pengguna di antara permintaan HTTP. Go menyediakan berbagai cara untuk menangani sesi, seperti cookie-based sessions, server-side sessions, dan session storage.

Dengan memahami dan mengimplementasikan konsep-konsep seperti session handling, cookie-based sessions, server-side sessions, session security, dan session storage, kita dapat mengembangkan aplikasi web yang dapat menyimpan dan mengambil data pengguna dengan aman. Pilihan metode session management yang tepat tergantung pada kebutuhan aplikasi dan kompleksitas data yang disimpan. 