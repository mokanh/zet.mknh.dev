
## Authentication and Authorization

Autentikasi dan otorisasi adalah komponen penting dalam desain API untuk memastikan keamanan dan kontrol akses yang tepat.

### 1. Authentication Methods

- Implementasi berbagai metode autentikasi
- Gunakan token-based authentication
- Dukung OAuth 2.0 dan OpenID Connect

```go
// Authentication service
type AuthService struct {
    userRepo    *UserRepository
    tokenSecret []byte
    tokenExpiry time.Duration
}

// JWT claims
type Claims struct {
    UserID   int      `json:"userId"`
    Username string   `json:"username"`
    Roles    []string `json:"roles"`
    jwt.StandardClaims
}

// Authentication methods
func (s *AuthService) AuthenticateWithPassword(username, password string) (string, error) {
    // Get user
    user, err := s.userRepo.GetUserByUsername(username)
    if err != nil {
        return "", fmt.Errorf("invalid credentials")
    }
    
    // Verify password
    if !verifyPassword(password, user.Password) {
        return "", fmt.Errorf("invalid credentials")
    }
    
    // Generate token
    return s.generateToken(user)
}

func (s *AuthService) AuthenticateWithOAuth(provider, code string) (string, error) {
    // Exchange code for token
    token, err := s.exchangeOAuthCode(provider, code)
    if err != nil {
        return "", err
    }
    
    // Get user info from OAuth provider
    userInfo, err := s.getOAuthUserInfo(provider, token)
    if err != nil {
        return "", err
    }
    
    // Get or create user
    user, err := s.userRepo.GetOrCreateOAuthUser(provider, userInfo)
    if err != nil {
        return "", err
    }
    
    // Generate JWT token
    return s.generateToken(user)
}

// Token generation
func (s *AuthService) generateToken(user *User) (string, error) {
    // Create claims
    claims := Claims{
        UserID:   user.ID,
        Username: user.Username,
        Roles:    user.Roles,
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: time.Now().Add(s.tokenExpiry).Unix(),
            IssuedAt:  time.Now().Unix(),
            Issuer:    "api",
            Subject:   fmt.Sprintf("%d", user.ID),
        },
    }
    
    // Create token
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    
    // Sign token
    return token.SignedString(s.tokenSecret)
}

// Token validation
func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
    // Parse token
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return s.tokenSecret, nil
    })
    
    if err != nil {
        return nil, err
    }
    
    // Get claims
    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    
    return nil, fmt.Errorf("invalid token")
}

// Authentication middleware
func (s *AuthService) AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Get token from header
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            respondWithError(w, http.StatusUnauthorized, "No authorization header")
            return
        }
        
        // Extract token
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            respondWithError(w, http.StatusUnauthorized, "Invalid authorization header")
            return
        }
        
        // Validate token
        claims, err := s.ValidateToken(parts[1])
        if err != nil {
            respondWithError(w, http.StatusUnauthorized, "Invalid token")
            return
        }
        
        // Add claims to context
        ctx := context.WithValue(r.Context(), "claims", claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Example login handler
func (s *AuthService) handleLogin(w http.ResponseWriter, r *http.Request) {
    // Parse request
    var req struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }
    
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid request body")
        return
    }
    
    // Authenticate user
    token, err := s.AuthenticateWithPassword(req.Username, req.Password)
    if err != nil {
        respondWithError(w, http.StatusUnauthorized, err.Error())
        return
    }
    
    // Return token
    respondWithJSON(w, http.StatusOK, map[string]string{
        "token": token,
    })
}
```

### 2. Authorization

- Implementasi Role-Based Access Control (RBAC)
- Gunakan middleware untuk authorization
- Dukung fine-grained permissions

```go
// Permission constants
const (
    PermissionRead   = "read"
    PermissionWrite  = "write"
    PermissionDelete = "delete"
    PermissionAdmin  = "admin"
)

// Role definitions
type Role struct {
    Name        string   `json:"name"`
    Permissions []string `json:"permissions"`
}

var (
    RoleAdmin = Role{
        Name: "admin",
        Permissions: []string{
            PermissionRead,
            PermissionWrite,
            PermissionDelete,
            PermissionAdmin,
        },
    }
    
    RoleUser = Role{
        Name: "user",
        Permissions: []string{
            PermissionRead,
            PermissionWrite,
        },
    }
    
    RoleGuest = Role{
        Name: "guest",
        Permissions: []string{
            PermissionRead,
        },
    }
)

// Authorization service
type AuthzService struct {
    roles map[string]Role
}

// Check permission
func (s *AuthzService) HasPermission(claims *Claims, permission string) bool {
    // Get user roles
    for _, roleName := range claims.Roles {
        // Get role
        role, exists := s.roles[roleName]
        if !exists {
            continue
        }
        
        // Check permissions
        for _, p := range role.Permissions {
            if p == permission {
                return true
            }
        }
    }
    
    return false
}

// Authorization middleware
func (s *AuthzService) RequirePermission(permission string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Get claims from context
            claims, ok := r.Context().Value("claims").(*Claims)
            if !ok {
                respondWithError(w, http.StatusUnauthorized, "No authentication")
                return
            }
            
            // Check permission
            if !s.HasPermission(claims, permission) {
                respondWithError(w, http.StatusForbidden, "Permission denied")
                return
            }
            
            // Continue
            next.ServeHTTP(w, r)
        })
    }
}

// Example protected handler
func (s *Server) handleDeleteUser(w http.ResponseWriter, r *http.Request) {
    // Get user ID
    vars := mux.Vars(r)
    userID, err := strconv.Atoi(vars["id"])
    if err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid user ID")
        return
    }
    
    // Get claims
    claims := r.Context().Value("claims").(*Claims)
    
    // Check if user is deleting their own account or has admin permission
    if claims.UserID != userID && !s.authz.HasPermission(claims, PermissionAdmin) {
        respondWithError(w, http.StatusForbidden, "Permission denied")
        return
    }
    
    // Delete user
    if err := s.userRepo.DeleteUser(userID); err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to delete user")
        return
    }
    
    respondWithJSON(w, http.StatusOK, map[string]string{
        "message": "User deleted successfully",
    })
}

// Router setup with authorization
func (s *Server) setupProtectedRoutes() *mux.Router {
    router := mux.NewRouter()
    
    // Apply authentication middleware
    router.Use(s.auth.AuthMiddleware)
    
    // Public routes
    router.HandleFunc("/api/login", s.auth.handleLogin).Methods("POST")
    router.HandleFunc("/api/register", s.handleRegister).Methods("POST")
    
    // Protected routes
    protected := router.PathPrefix("/api").Subrouter()
    
    // User routes
    protected.HandleFunc("/users", s.handleGetUsers).Methods("GET").
        Middleware(s.authz.RequirePermission(PermissionRead))
    
    protected.HandleFunc("/users/{id}", s.handleGetUser).Methods("GET").
        Middleware(s.authz.RequirePermission(PermissionRead))
    
    protected.HandleFunc("/users/{id}", s.handleUpdateUser).Methods("PUT").
        Middleware(s.authz.RequirePermission(PermissionWrite))
    
    protected.HandleFunc("/users/{id}", s.handleDeleteUser).Methods("DELETE").
        Middleware(s.authz.RequirePermission(PermissionDelete))
    
    // Admin routes
    admin := protected.PathPrefix("/admin").Subrouter()
    admin.Use(s.authz.RequirePermission(PermissionAdmin))
    
    admin.HandleFunc("/users", s.handleGetAllUsers).Methods("GET")
    admin.HandleFunc("/users/{id}/roles", s.handleUpdateUserRoles).Methods("PUT")
    admin.HandleFunc("/system/stats", s.handleGetSystemStats).Methods("GET")
    
    return router
}
```

### 3. API Keys

- Implementasi API key authentication
- Rotasi API keys secara berkala
- Batasi penggunaan API keys

```go
// API key service
type APIKeyService struct {
    keyRepo *APIKeyRepository
}

// API key model
type APIKey struct {
    ID          int       `json:"id"`
    Key         string    `json:"key"`
    Name        string    `json:"name"`
    UserID      int       `json:"userId"`
    Permissions []string  `json:"permissions"`
    LastUsed    time.Time `json:"lastUsed"`
    ExpiresAt   time.Time `json:"expiresAt"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}

// Generate API key
func (s *APIKeyService) GenerateAPIKey(userID int, name string, permissions []string) (*APIKey, error) {
    // Generate random key
    key := make([]byte, 32)
    if _, err := rand.Read(key); err != nil {
        return nil, err
    }
    
    // Create API key
    apiKey := &APIKey{
        Key:         base64.URLEncoding.EncodeToString(key),
        Name:        name,
        UserID:      userID,
        Permissions: permissions,
        ExpiresAt:   time.Now().Add(365 * 24 * time.Hour), // 1 year
        CreatedAt:   time.Now(),
        UpdatedAt:   time.Now(),
    }
    
    // Save API key
    if err := s.keyRepo.CreateAPIKey(apiKey); err != nil {
        return nil, err
    }
    
    return apiKey, nil
}

// Validate API key
func (s *APIKeyService) ValidateAPIKey(key string) (*APIKey, error) {
    // Get API key
    apiKey, err := s.keyRepo.GetAPIKeyByKey(key)
    if err != nil {
        return nil, err
    }
    
    // Check expiration
    if time.Now().After(apiKey.ExpiresAt) {
        return nil, fmt.Errorf("API key expired")
    }
    
    // Update last used
    apiKey.LastUsed = time.Now()
    if err := s.keyRepo.UpdateAPIKey(apiKey); err != nil {
        return nil, err
    }
    
    return apiKey, nil
}

// API key middleware
func (s *APIKeyService) APIKeyMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Get API key from header
        key := r.Header.Get("X-API-Key")
        if key == "" {
            respondWithError(w, http.StatusUnauthorized, "No API key provided")
            return
        }
        
        // Validate API key
        apiKey, err := s.ValidateAPIKey(key)
        if err != nil {
            respondWithError(w, http.StatusUnauthorized, "Invalid API key")
            return
        }
        
        // Add API key to context
        ctx := context.WithValue(r.Context(), "apiKey", apiKey)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Example API key handler
func (s *Server) handleCreateAPIKey(w http.ResponseWriter, r *http.Request) {
    // Get claims
    claims := r.Context().Value("claims").(*Claims)
    
    // Parse request
    var req struct {
        Name        string   `json:"name"`
        Permissions []string `json:"permissions"`
    }
    
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid request body")
        return
    }
    
    // Generate API key
    apiKey, err := s.apiKeyService.GenerateAPIKey(claims.UserID, req.Name, req.Permissions)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to generate API key")
        return
    }
    
    respondWithJSON(w, http.StatusCreated, apiKey)
}
```

### 4. OAuth 2.0 Integration

- Implementasi OAuth 2.0 flows
- Dukung berbagai OAuth providers
- Handle token refresh

```go
// OAuth service
type OAuthService struct {
    providers map[string]OAuthProvider
    userRepo  *UserRepository
}

// OAuth provider interface
type OAuthProvider interface {
    GetAuthURL(state string) string
    ExchangeCode(code string) (*OAuthToken, error)
    GetUserInfo(token *OAuthToken) (*OAuthUserInfo, error)
}

// OAuth token
type OAuthToken struct {
    AccessToken  string    `json:"accessToken"`
    TokenType    string    `json:"tokenType"`
    RefreshToken string    `json:"refreshToken"`
    ExpiresAt    time.Time `json:"expiresAt"`
}

// OAuth user info
type OAuthUserInfo struct {
    ID        string `json:"id"`
    Email     string `json:"email"`
    Name      string `json:"name"`
    Picture   string `json:"picture"`
    Provider  string `json:"provider"`
}

// Google OAuth provider
type GoogleOAuthProvider struct {
    clientID     string
    clientSecret string
    redirectURI  string
    authURL      string
    tokenURL     string
    userInfoURL  string
}

func (p *GoogleOAuthProvider) GetAuthURL(state string) string {
    params := url.Values{}
    params.Add("client_id", p.clientID)
    params.Add("redirect_uri", p.redirectURI)
    params.Add("response_type", "code")
    params.Add("scope", "email profile")
    params.Add("state", state)
    
    return fmt.Sprintf("%s?%s", p.authURL, params.Encode())
}

func (p *GoogleOAuthProvider) ExchangeCode(code string) (*OAuthToken, error) {
    // Prepare request
    data := url.Values{}
    data.Add("client_id", p.clientID)
    data.Add("client_secret", p.clientSecret)
    data.Add("code", code)
    data.Add("redirect_uri", p.redirectURI)
    data.Add("grant_type", "authorization_code")
    
    // Send request
    resp, err := http.PostForm(p.tokenURL, data)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    // Parse response
    var result struct {
        AccessToken  string `json:"access_token"`
        TokenType    string `json:"token_type"`
        RefreshToken string `json:"refresh_token"`
        ExpiresIn    int    `json:"expires_in"`
    }
    
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }
    
    return &OAuthToken{
        AccessToken:  result.AccessToken,
        TokenType:    result.TokenType,
        RefreshToken: result.RefreshToken,
        ExpiresAt:    time.Now().Add(time.Duration(result.ExpiresIn) * time.Second),
    }, nil
}

func (p *GoogleOAuthProvider) GetUserInfo(token *OAuthToken) (*OAuthUserInfo, error) {
    // Create request
    req, err := http.NewRequest("GET", p.userInfoURL, nil)
    if err != nil {
        return nil, err
    }
    
    // Add authorization header
    req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token.AccessToken))
    
    // Send request
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    // Parse response
    var result struct {
        ID            string `json:"id"`
        Email         string `json:"email"`
        Name          string `json:"name"`
        Picture       string `json:"picture"`
    }
    
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }
    
    return &OAuthUserInfo{
        ID:       result.ID,
        Email:    result.Email,
        Name:     result.Name,
        Picture:  result.Picture,
        Provider: "google",
    }, nil
}

// OAuth handlers
func (s *Server) handleOAuthLogin(w http.ResponseWriter, r *http.Request) {
    // Get provider
    provider := mux.Vars(r)["provider"]
    oauthProvider, exists := s.oauth.providers[provider]
    if !exists {
        respondWithError(w, http.StatusBadRequest, "Invalid OAuth provider")
        return
    }
    
    // Generate state
    state := generateRandomState()
    
    // Store state in session
    session, _ := s.sessionStore.Get(r, "oauth")
    session.Values["state"] = state
    session.Save(r, w)
    
    // Redirect to OAuth provider
    http.Redirect(w, r, oauthProvider.GetAuthURL(state), http.StatusTemporaryRedirect)
}

func (s *Server) handleOAuthCallback(w http.ResponseWriter, r *http.Request) {
    // Get provider
    provider := mux.Vars(r)["provider"]
    oauthProvider, exists := s.oauth.providers[provider]
    if !exists {
        respondWithError(w, http.StatusBadRequest, "Invalid OAuth provider")
        return
    }
    
    // Get state from session
    session, _ := s.sessionStore.Get(r, "oauth")
    state, ok := session.Values["state"].(string)
    if !ok {
        respondWithError(w, http.StatusBadRequest, "Invalid state")
        return
    }
    
    // Verify state
    if state != r.URL.Query().Get("state") {
        respondWithError(w, http.StatusBadRequest, "Invalid state")
        return
    }
    
    // Get code
    code := r.URL.Query().Get("code")
    if code == "" {
        respondWithError(w, http.StatusBadRequest, "No code provided")
        return
    }
    
    // Exchange code for token
    token, err := oauthProvider.ExchangeCode(code)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to exchange code")
        return
    }
    
    // Get user info
    userInfo, err := oauthProvider.GetUserInfo(token)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to get user info")
        return
    }
    
    // Get or create user
    user, err := s.userRepo.GetOrCreateOAuthUser(userInfo)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to get or create user")
        return
    }
    
    // Generate JWT token
    jwtToken, err := s.auth.GenerateToken(user)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to generate token")
        return
    }
    
    // Return token
    respondWithJSON(w, http.StatusOK, map[string]string{
        "token": jwtToken,
    })
}
``` 