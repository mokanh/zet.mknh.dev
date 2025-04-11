# Web Frameworks

Web Frameworks adalah library yang menyediakan struktur dan komponen untuk mempermudah pengembangan aplikasi web. Go memiliki beberapa web framework populer yang dapat digunakan untuk mengembangkan aplikasi web dengan lebih cepat dan terstruktur.

## Gin

Gin adalah web framework yang ringan dan cepat untuk Go. Framework ini menyediakan API yang sederhana dan mudah digunakan, serta performa yang tinggi.

### Karakteristik Gin
- **High Performance**: Performa tinggi dengan routing yang cepat
- **Middleware Support**: Mendukung berbagai middleware
- **Route Grouping**: Pengelompokan route untuk organisasi yang lebih baik
- **Parameter Binding**: Binding parameter dari berbagai sumber (URL, form, JSON, dll.)
- **Validation**: Validasi input yang mudah digunakan
- **Error Management**: Penanganan error yang terstruktur

### Implementasi dengan Gin
```go
// Gin sederhana
package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

func main() {
    // Membuat router Gin
    r := gin.Default()
    
    // Mendefinisikan route
    r.GET("/", func(c *gin.Context) {
        c.String(http.StatusOK, "Hello, World!")
    })
    
    r.GET("/users", func(c *gin.Context) {
        users := []struct {
            ID   string `json:"id"`
            Name string `json:"name"`
        }{
            {ID: "1", Name: "John Doe"},
            {ID: "2", Name: "Jane Smith"},
        }
        
        c.JSON(http.StatusOK, users)
    })
    
    r.GET("/users/:id", func(c *gin.Context) {
        id := c.Param("id")
        user := struct {
            ID   string `json:"id"`
            Name string `json:"name"`
        }{
            ID:   id,
            Name: "User " + id,
        }
        
        c.JSON(http.StatusOK, user)
    })
    
    // Menjalankan server
    r.Run(":8080")
}

// Gin dengan middleware
package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
    "time"
)

// Logger middleware
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        
        // Memanggil handler berikutnya
        c.Next()
        
        // Logging setelah request selesai
        latency := time.Since(start)
        statusCode := c.Writer.Status()
        
        gin.DefaultWriter.Write([]byte(fmt.Sprintf(
            "[GIN] %v | %3d | %13v | %15s | %s\n",
            time.Now().Format("2006/01/02 - 15:04:05"),
            statusCode,
            latency,
            c.ClientIP(),
            c.Request.Method+" "+c.Request.URL.Path,
        )))
    }
}

// Auth middleware
func Auth() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token != "Bearer secret-token" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "Unauthorized",
            })
            return
        }
        
        c.Next()
    }
}

func main() {
    // Membuat router Gin
    r := gin.New()
    
    // Menerapkan middleware
    r.Use(Logger())
    r.Use(gin.Recovery())
    
    // Group untuk API
    api := r.Group("/api")
    api.Use(Auth())
    {
        api.GET("/users", func(c *gin.Context) {
            users := []struct {
                ID   string `json:"id"`
                Name string `json:"name"`
            }{
                {ID: "1", Name: "John Doe"},
                {ID: "2", Name: "Jane Smith"},
            }
            
            c.JSON(http.StatusOK, users)
        })
        
        api.GET("/users/:id", func(c *gin.Context) {
            id := c.Param("id")
            user := struct {
                ID   string `json:"id"`
                Name string `json:"name"`
            }{
                ID:   id,
                Name: "User " + id,
            }
            
            c.JSON(http.StatusOK, user)
        })
    }
    
    // Menjalankan server
    r.Run(":8080")
}

// Gin dengan parameter binding
package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID       string `json:"id" binding:"required"`
    Name     string `json:"name" binding:"required"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
}

func main() {
    // Membuat router Gin
    r := gin.Default()
    
    // Mendefinisikan route untuk GET /users
    r.GET("/users", func(c *gin.Context) {
        users := []User{
            {ID: "1", Name: "John Doe", Email: "john@example.com", Password: "123456"},
            {ID: "2", Name: "Jane Smith", Email: "jane@example.com", Password: "123456"},
        }
        
        c.JSON(http.StatusOK, users)
    })
    
    // Mendefinisikan route untuk POST /users
    r.POST("/users", func(c *gin.Context) {
        var user User
        
        // Binding JSON ke struct User
        if err := c.ShouldBindJSON(&user); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "error": err.Error(),
            })
            return
        }
        
        // Simulasi menyimpan user
        c.JSON(http.StatusCreated, user)
    })
    
    // Mendefinisikan route untuk GET /users/:id
    r.GET("/users/:id", func(c *gin.Context) {
        id := c.Param("id")
        
        // Simulasi mengambil user
        user := User{
            ID:       id,
            Name:     "User " + id,
            Email:    "user" + id + "@example.com",
            Password: "123456",
        }
        
        c.JSON(http.StatusOK, user)
    })
    
    // Menjalankan server
    r.Run(":8080")
}
```

## Echo

Echo adalah web framework yang ringan, cepat, dan minimalis untuk Go. Framework ini menyediakan API yang intuitif dan mudah digunakan.

### Karakteristik Echo
- **High Performance**: Performa tinggi dengan routing yang cepat
- **Middleware Support**: Mendukung berbagai middleware
- **Data Binding**: Binding data dari berbagai sumber
- **Data Rendering**: Rendering data ke berbagai format
- **Extensible**: Mudah diperluas dengan plugin
- **Auto TLS**: Dukungan untuk HTTPS otomatis

### Implementasi dengan Echo
```go
// Echo sederhana
package main

import (
    "github.com/labstack/echo/v4"
    "net/http"
)

func main() {
    // Membuat instance Echo
    e := echo.New()
    
    // Mendefinisikan route
    e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, World!")
    })
    
    e.GET("/users", func(c echo.Context) error {
        users := []struct {
            ID   string `json:"id"`
            Name string `json:"name"`
        }{
            {ID: "1", Name: "John Doe"},
            {ID: "2", Name: "Jane Smith"},
        }
        
        return c.JSON(http.StatusOK, users)
    })
    
    e.GET("/users/:id", func(c echo.Context) error {
        id := c.Param("id")
        user := struct {
            ID   string `json:"id"`
            Name string `json:"name"`
        }{
            ID:   id,
            Name: "User " + id,
        }
        
        return c.JSON(http.StatusOK, user)
    })
    
    // Menjalankan server
    e.Start(":8080")
}

// Echo dengan middleware
package main

import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "net/http"
)

func main() {
    // Membuat instance Echo
    e := echo.New()
    
    // Menerapkan middleware
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Use(middleware.CORS())
    
    // Group untuk API
    api := e.Group("/api")
    api.Use(middleware.JWT([]byte("secret")))
    {
        api.GET("/users", func(c echo.Context) error {
            users := []struct {
                ID   string `json:"id"`
                Name string `json:"name"`
            }{
                {ID: "1", Name: "John Doe"},
                {ID: "2", Name: "Jane Smith"},
            }
            
            return c.JSON(http.StatusOK, users)
        })
        
        api.GET("/users/:id", func(c echo.Context) error {
            id := c.Param("id")
            user := struct {
                ID   string `json:"id"`
                Name string `json:"name"`
            }{
                ID:   id,
                Name: "User " + id,
            }
            
            return c.JSON(http.StatusOK, user)
        })
    }
    
    // Menjalankan server
    e.Start(":8080")
}

// Echo dengan data binding
package main

import (
    "github.com/labstack/echo/v4"
    "net/http"
)

// User adalah struct untuk data user
type User struct {
    ID       string `json:"id" validate:"required"`
    Name     string `json:"name" validate:"required"`
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=6"`
}

// CustomValidator adalah validator kustom
type CustomValidator struct {
    validator *validator.Validate
}

// Validate adalah method untuk validasi
func (cv *CustomValidator) Validate(i interface{}) error {
    return cv.validator.Struct(i)
}

func main() {
    // Membuat instance Echo
    e := echo.New()
    
    // Menerapkan validator
    e.Validator = &CustomValidator{validator: validator.New()}
    
    // Mendefinisikan route untuk GET /users
    e.GET("/users", func(c echo.Context) error {
        users := []User{
            {ID: "1", Name: "John Doe", Email: "john@example.com", Password: "123456"},
            {ID: "2", Name: "Jane Smith", Email: "jane@example.com", Password: "123456"},
        }
        
        return c.JSON(http.StatusOK, users)
    })
    
    // Mendefinisikan route untuk POST /users
    e.POST("/users", func(c echo.Context) error {
        user := new(User)
        
        // Binding JSON ke struct User
        if err := c.Bind(user); err != nil {
            return err
        }
        
        // Validasi struct User
        if err := c.Validate(user); err != nil {
            return err
        }
        
        // Simulasi menyimpan user
        return c.JSON(http.StatusCreated, user)
    })
    
    // Mendefinisikan route untuk GET /users/:id
    e.GET("/users/:id", func(c echo.Context) error {
        id := c.Param("id")
        
        // Simulasi mengambil user
        user := User{
            ID:       id,
            Name:     "User " + id,
            Email:    "user" + id + "@example.com",
            Password: "123456",
        }
        
        return c.JSON(http.StatusOK, user)
    })
    
    // Menjalankan server
    e.Start(":8080")
}
```

## Fiber

Fiber adalah web framework yang terinspirasi oleh Express.js, dibangun di atas `fasthttp`, engine HTTP tercepat untuk Go.

### Karakteristik Fiber
- **Express-like**: API yang mirip dengan Express.js
- **Zero Memory Allocation**: Alokasi memori minimal
- **Middleware Support**: Mendukung berbagai middleware
- **Route Grouping**: Pengelompokan route untuk organisasi yang lebih baik
- **Static Files**: Dukungan untuk file statis
- **WebSocket**: Dukungan untuk WebSocket

### Implementasi dengan Fiber
```go
// Fiber sederhana
package main

import (
    "github.com/gofiber/fiber/v2"
)

func main() {
    // Membuat instance Fiber
    app := fiber.New()
    
    // Mendefinisikan route
    app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Hello, World!")
    })
    
    app.Get("/users", func(c *fiber.Ctx) error {
        users := []struct {
            ID   string `json:"id"`
            Name string `json:"name"`
        }{
            {ID: "1", Name: "John Doe"},
            {ID: "2", Name: "Jane Smith"},
        }
        
        return c.JSON(users)
    })
    
    app.Get("/users/:id", func(c *fiber.Ctx) error {
        id := c.Params("id")
        user := struct {
            ID   string `json:"id"`
            Name string `json:"name"`
        }{
            ID:   id,
            Name: "User " + id,
        }
        
        return c.JSON(user)
    })
    
    // Menjalankan server
    app.Listen(":8080")
}

// Fiber dengan middleware
package main

import (
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/recover"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/jwt/v2"
)

func main() {
    // Membuat instance Fiber
    app := fiber.New()
    
    // Menerapkan middleware
    app.Use(logger.New())
    app.Use(recover.New())
    app.Use(cors.New())
    
    // Group untuk API
    api := app.Group("/api")
    api.Use(jwtware.New(jwtware.Config{
        SigningKey: []byte("secret"),
    }))
    {
        api.Get("/users", func(c *fiber.Ctx) error {
            users := []struct {
                ID   string `json:"id"`
                Name string `json:"name"`
            }{
                {ID: "1", Name: "John Doe"},
                {ID: "2", Name: "Jane Smith"},
            }
            
            return c.JSON(users)
        })
        
        api.Get("/users/:id", func(c *fiber.Ctx) error {
            id := c.Params("id")
            user := struct {
                ID   string `json:"id"`
                Name string `json:"name"`
            }{
                ID:   id,
                Name: "User " + id,
            }
            
            return c.JSON(user)
        })
    }
    
    // Menjalankan server
    app.Listen(":8080")
}

// Fiber dengan data binding
package main

import (
    "github.com/gofiber/fiber/v2"
)

// User adalah struct untuk data user
type User struct {
    ID       string `json:"id" validate:"required"`
    Name     string `json:"name" validate:"required"`
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=6"`
}

func main() {
    // Membuat instance Fiber
    app := fiber.New()
    
    // Mendefinisikan route untuk GET /users
    app.Get("/users", func(c *fiber.Ctx) error {
        users := []User{
            {ID: "1", Name: "John Doe", Email: "john@example.com", Password: "123456"},
            {ID: "2", Name: "Jane Smith", Email: "jane@example.com", Password: "123456"},
        }
        
        return c.JSON(users)
    })
    
    // Mendefinisikan route untuk POST /users
    app.Post("/users", func(c *fiber.Ctx) error {
        user := new(User)
        
        // Binding JSON ke struct User
        if err := c.BodyParser(user); err != nil {
            return err
        }
        
        // Validasi struct User
        if err := validate.Struct(user); err != nil {
            return err
        }
        
        // Simulasi menyimpan user
        return c.Status(fiber.StatusCreated).JSON(user)
    })
    
    // Mendefinisikan route untuk GET /users/:id
    app.Get("/users/:id", func(c *fiber.Ctx) error {
        id := c.Params("id")
        
        // Simulasi mengambil user
        user := User{
            ID:       id,
            Name:     "User " + id,
            Email:    "user" + id + "@example.com",
            Password: "123456",
        }
        
        return c.JSON(user)
    })
    
    // Menjalankan server
    app.Listen(":8080")
}
```

## Kesimpulan

Web Frameworks di Go menyediakan berbagai pilihan untuk mengembangkan aplikasi web. Setiap framework memiliki karakteristik dan keunggulan masing-masing. Pemilihan framework yang tepat tergantung pada kebutuhan aplikasi, seperti performa, kemudahan penggunaan, fitur yang dibutuhkan, dll. Beberapa framework populer seperti Gin, Echo, dan Fiber menyediakan API yang intuitif dan mudah digunakan, serta performa yang tinggi. 