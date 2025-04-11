# Hash Table

Hash table adalah struktur data yang menyimpan data dalam bentuk key-value pairs, di mana setiap key di-hash menjadi indeks dalam array. Hash table menyediakan akses data yang sangat cepat dengan kompleksitas waktu rata-rata O(1).

## Hash Function

### Karakteristik Hash Function
- **Deterministik**: Input yang sama selalu menghasilkan output yang sama
- **Uniform distribution**: Output terdistribusi merata di seluruh range
- **Fixed size output**: Output selalu memiliki ukuran yang sama
- **Avalanche effect**: Perubahan kecil pada input menghasilkan perubahan besar pada output
- **Efficient computation**: Perhitungan hash harus cepat

### Implementasi Hash Function
```go
// Implementasi hash function sederhana
func SimpleHash(key string) int {
    hash := 0
    for i := 0; i < len(key); i++ {
        hash = (hash*31 + int(key[i])) % 1000000
    }
    return hash
}

// Implementasi hash function menggunakan FNV-1a
func FNV1aHash(key string) uint64 {
    const (
        offset64 uint64 = 14695981039346656037
        prime64  uint64 = 1099511628211
    )
    
    hash := offset64
    for i := 0; i < len(key); i++ {
        hash ^= uint64(key[i])
        hash *= prime64
    }
    
    return hash
}

// Implementasi hash function untuk integer
func IntHash(key int) int {
    // Menggunakan teknik bit manipulation
    key = ^key + (key << 15)
    key = key ^ (key >> 12)
    key = key + (key << 2)
    key = key ^ (key >> 4)
    key = key * 2057
    key = key ^ (key >> 16)
    return key
}

// Implementasi hash function untuk float
func FloatHash(key float64) int {
    // Menggunakan teknik bit manipulation
    bits := math.Float64bits(key)
    return int(bits ^ (bits >> 32))
}

// Implementasi hash function untuk struct
func StructHash(data interface{}) int {
    // Menggunakan reflection untuk mendapatkan field values
    val := reflect.ValueOf(data)
    typ := val.Type()
    
    hash := 0
    for i := 0; i < val.NumField(); i++ {
        field := val.Field(i)
        fieldHash := 0
        
        switch field.Kind() {
        case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
            fieldHash = IntHash(int(field.Int()))
        case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
            fieldHash = IntHash(int(field.Uint()))
        case reflect.Float32, reflect.Float64:
            fieldHash = FloatHash(field.Float())
        case reflect.String:
            fieldHash = SimpleHash(field.String())
        case reflect.Bool:
            if field.Bool() {
                fieldHash = 1
            } else {
                fieldHash = 0
            }
        default:
            // Untuk tipe data lain, gunakan default hash
            fieldHash = SimpleHash(fmt.Sprintf("%v", field.Interface()))
        }
        
        // Combine hash dengan field hash
        hash = hash*31 + fieldHash
    }
    
    return hash
}

// Implementasi hash function untuk slice
func SliceHash(data []interface{}) int {
    hash := 0
    for i, v := range data {
        // Hash setiap elemen
        elemHash := 0
        
        switch val := v.(type) {
        case int:
            elemHash = IntHash(val)
        case float64:
            elemHash = FloatHash(val)
        case string:
            elemHash = SimpleHash(val)
        case bool:
            if val {
                elemHash = 1
            } else {
                elemHash = 0
            }
        default:
            // Untuk tipe data lain, gunakan default hash
            elemHash = SimpleHash(fmt.Sprintf("%v", v))
        }
        
        // Combine hash dengan elemen hash dan posisi
        hash = hash*31 + elemHash + i
    }
    
    return hash
}

// Implementasi hash function untuk map
func MapHash(data map[string]interface{}) int {
    hash := 0
    
    // Sort keys untuk memastikan hash konsisten
    keys := make([]string, 0, len(data))
    for k := range data {
        keys = append(keys, k)
    }
    sort.Strings(keys)
    
    // Hash setiap key-value pair
    for _, k := range keys {
        v := data[k]
        
        // Hash key
        keyHash := SimpleHash(k)
        
        // Hash value
        valHash := 0
        switch val := v.(type) {
        case int:
            valHash = IntHash(val)
        case float64:
            valHash = FloatHash(val)
        case string:
            valHash = SimpleHash(val)
        case bool:
            if val {
                valHash = 1
            } else {
                valHash = 0
            }
        default:
            // Untuk tipe data lain, gunakan default hash
            valHash = SimpleHash(fmt.Sprintf("%v", v))
        }
        
        // Combine hash dengan key-value hash
        hash = hash*31 + keyHash + valHash
    }
    
    return hash
}
```

## Collision Handling

### Teknik Collision Handling
- **Chaining**: Menyimpan multiple items dengan hash yang sama dalam linked list
- **Open Addressing**: Mencari slot kosong ketika terjadi collision
  - **Linear Probing**: Mencoba slot berikutnya secara berurutan
  - **Quadratic Probing**: Mencoba slot dengan fungsi kuadratik
  - **Double Hashing**: Menggunakan hash function kedua untuk probing

### Implementasi Collision Handling
```go
// Implementasi hash table dengan chaining
type HashTable struct {
    Size    int
    Buckets []*LinkedList
}

// Node untuk linked list
type Node struct {
    Key   interface{}
    Value interface{}
    Next  *Node
}

// Linked list untuk chaining
type LinkedList struct {
    Head *Node
}

// Membuat linked list baru
func NewLinkedList() *LinkedList {
    return &LinkedList{Head: nil}
}

// Menambah node ke linked list
func (ll *LinkedList) Add(key, value interface{}) {
    // Cek apakah key sudah ada
    current := ll.Head
    for current != nil {
        if current.Key == key {
            // Update value jika key sudah ada
            current.Value = value
            return
        }
        current = current.Next
    }
    
    // Tambah node baru di awal
    newNode := &Node{
        Key:   key,
        Value: value,
        Next:  ll.Head,
    }
    ll.Head = newNode
}

// Mencari node dalam linked list
func (ll *LinkedList) Find(key interface{}) (interface{}, bool) {
    current := ll.Head
    for current != nil {
        if current.Key == key {
            return current.Value, true
        }
        current = current.Next
    }
    return nil, false
}

// Menghapus node dari linked list
func (ll *LinkedList) Remove(key interface{}) bool {
    if ll.Head == nil {
        return false
    }
    
    // Jika head yang akan dihapus
    if ll.Head.Key == key {
        ll.Head = ll.Head.Next
        return true
    }
    
    // Cari node yang akan dihapus
    current := ll.Head
    for current.Next != nil {
        if current.Next.Key == key {
            current.Next = current.Next.Next
            return true
        }
        current = current.Next
    }
    
    return false
}

// Membuat hash table baru
func NewHashTable(size int) *HashTable {
    buckets := make([]*LinkedList, size)
    for i := 0; i < size; i++ {
        buckets[i] = NewLinkedList()
    }
    
    return &HashTable{
        Size:    size,
        Buckets: buckets,
    }
}

// Mendapatkan indeks bucket untuk key
func (ht *HashTable) getBucketIndex(key interface{}) int {
    var hash int
    
    // Pilih hash function berdasarkan tipe data
    switch k := key.(type) {
    case string:
        hash = SimpleHash(k)
    case int:
        hash = IntHash(k)
    case float64:
        hash = FloatHash(k)
    case bool:
        if k {
            hash = 1
        } else {
            hash = 0
        }
    default:
        // Untuk tipe data lain, gunakan default hash
        hash = SimpleHash(fmt.Sprintf("%v", key))
    }
    
    // Pastikan hash positif dan dalam range
    if hash < 0 {
        hash = -hash
    }
    return hash % ht.Size
}

// Menambah key-value pair ke hash table
func (ht *HashTable) Put(key, value interface{}) {
    index := ht.getBucketIndex(key)
    ht.Buckets[index].Add(key, value)
}

// Mencari value berdasarkan key
func (ht *HashTable) Get(key interface{}) (interface{}, bool) {
    index := ht.getBucketIndex(key)
    return ht.Buckets[index].Find(key)
}

// Menghapus key-value pair dari hash table
func (ht *HashTable) Remove(key interface{}) bool {
    index := ht.getBucketIndex(key)
    return ht.Buckets[index].Remove(key)
}

// Implementasi hash table dengan linear probing
type LinearProbingHashTable struct {
    Size     int
    Keys     []interface{}
    Values   []interface{}
    Occupied []bool
}

// Membuat linear probing hash table baru
func NewLinearProbingHashTable(size int) *LinearProbingHashTable {
    return &LinearProbingHashTable{
        Size:     size,
        Keys:     make([]interface{}, size),
        Values:   make([]interface{}, size),
        Occupied: make([]bool, size),
    }
}

// Mendapatkan indeks untuk key
func (ht *LinearProbingHashTable) getIndex(key interface{}) int {
    var hash int
    
    // Pilih hash function berdasarkan tipe data
    switch k := key.(type) {
    case string:
        hash = SimpleHash(k)
    case int:
        hash = IntHash(k)
    case float64:
        hash = FloatHash(k)
    case bool:
        if k {
            hash = 1
        } else {
            hash = 0
        }
    default:
        // Untuk tipe data lain, gunakan default hash
        hash = SimpleHash(fmt.Sprintf("%v", key))
    }
    
    // Pastikan hash positif dan dalam range
    if hash < 0 {
        hash = -hash
    }
    return hash % ht.Size
}

// Menambah key-value pair ke hash table
func (ht *LinearProbingHashTable) Put(key, value interface{}) bool {
    // Cek apakah hash table penuh
    for _, occupied := range ht.Occupied {
        if !occupied {
            break
        }
    }
    
    index := ht.getIndex(key)
    startIndex := index
    
    // Linear probing
    for ht.Occupied[index] {
        // Jika key sudah ada, update value
        if ht.Keys[index] == key {
            ht.Values[index] = value
            return true
        }
        
        // Coba indeks berikutnya
        index = (index + 1) % ht.Size
        
        // Jika sudah kembali ke indeks awal, hash table penuh
        if index == startIndex {
            return false
        }
    }
    
    // Tambah key-value pair
    ht.Keys[index] = key
    ht.Values[index] = value
    ht.Occupied[index] = true
    
    return true
}

// Mencari value berdasarkan key
func (ht *LinearProbingHashTable) Get(key interface{}) (interface{}, bool) {
    index := ht.getIndex(key)
    startIndex := index
    
    // Linear probing
    for ht.Occupied[index] {
        if ht.Keys[index] == key {
            return ht.Values[index], true
        }
        
        // Coba indeks berikutnya
        index = (index + 1) % ht.Size
        
        // Jika sudah kembali ke indeks awal, key tidak ditemukan
        if index == startIndex {
            return nil, false
        }
    }
    
    return nil, false
}

// Menghapus key-value pair dari hash table
func (ht *LinearProbingHashTable) Remove(key interface{}) bool {
    index := ht.getIndex(key)
    startIndex := index
    
    // Linear probing
    for ht.Occupied[index] {
        if ht.Keys[index] == key {
            // Hapus key-value pair
            ht.Keys[index] = nil
            ht.Values[index] = nil
            ht.Occupied[index] = false
            
            // Rehash semua elemen berikutnya dalam cluster yang sama
            nextIndex := (index + 1) % ht.Size
            for ht.Occupied[nextIndex] {
                // Simpan key-value pair
                k := ht.Keys[nextIndex]
                v := ht.Values[nextIndex]
                
                // Hapus key-value pair
                ht.Keys[nextIndex] = nil
                ht.Values[nextIndex] = nil
                ht.Occupied[nextIndex] = false
                
                // Tambah kembali key-value pair
                ht.Put(k, v)
                
                // Coba indeks berikutnya
                nextIndex = (nextIndex + 1) % ht.Size
            }
            
            return true
        }
        
        // Coba indeks berikutnya
        index = (index + 1) % ht.Size
        
        // Jika sudah kembali ke indeks awal, key tidak ditemukan
        if index == startIndex {
            return false
        }
    }
    
    return false
}

// Implementasi hash table dengan quadratic probing
type QuadraticProbingHashTable struct {
    Size     int
    Keys     []interface{}
    Values   []interface{}
    Occupied []bool
}

// Membuat quadratic probing hash table baru
func NewQuadraticProbingHashTable(size int) *QuadraticProbingHashTable {
    return &QuadraticProbingHashTable{
        Size:     size,
        Keys:     make([]interface{}, size),
        Values:   make([]interface{}, size),
        Occupied: make([]bool, size),
    }
}

// Mendapatkan indeks untuk key
func (ht *QuadraticProbingHashTable) getIndex(key interface{}) int {
    var hash int
    
    // Pilih hash function berdasarkan tipe data
    switch k := key.(type) {
    case string:
        hash = SimpleHash(k)
    case int:
        hash = IntHash(k)
    case float64:
        hash = FloatHash(k)
    case bool:
        if k {
            hash = 1
        } else {
            hash = 0
        }
    default:
        // Untuk tipe data lain, gunakan default hash
        hash = SimpleHash(fmt.Sprintf("%v", key))
    }
    
    // Pastikan hash positif dan dalam range
    if hash < 0 {
        hash = -hash
    }
    return hash % ht.Size
}

// Menambah key-value pair ke hash table
func (ht *QuadraticProbingHashTable) Put(key, value interface{}) bool {
    // Cek apakah hash table penuh
    for _, occupied := range ht.Occupied {
        if !occupied {
            break
        }
    }
    
    index := ht.getIndex(key)
    startIndex := index
    i := 0
    
    // Quadratic probing
    for ht.Occupied[index] {
        // Jika key sudah ada, update value
        if ht.Keys[index] == key {
            ht.Values[index] = value
            return true
        }
        
        // Coba indeks berikutnya dengan fungsi kuadratik
        i++
        index = (startIndex + i*i) % ht.Size
        
        // Jika sudah kembali ke indeks awal, hash table penuh
        if index == startIndex {
            return false
        }
    }
    
    // Tambah key-value pair
    ht.Keys[index] = key
    ht.Values[index] = value
    ht.Occupied[index] = true
    
    return true
}

// Mencari value berdasarkan key
func (ht *QuadraticProbingHashTable) Get(key interface{}) (interface{}, bool) {
    index := ht.getIndex(key)
    startIndex := index
    i := 0
    
    // Quadratic probing
    for ht.Occupied[index] {
        if ht.Keys[index] == key {
            return ht.Values[index], true
        }
        
        // Coba indeks berikutnya dengan fungsi kuadratik
        i++
        index = (startIndex + i*i) % ht.Size
        
        // Jika sudah kembali ke indeks awal, key tidak ditemukan
        if index == startIndex {
            return nil, false
        }
    }
    
    return nil, false
}

// Menghapus key-value pair dari hash table
func (ht *QuadraticProbingHashTable) Remove(key interface{}) bool {
    index := ht.getIndex(key)
    startIndex := index
    i := 0
    
    // Quadratic probing
    for ht.Occupied[index] {
        if ht.Keys[index] == key {
            // Hapus key-value pair
            ht.Keys[index] = nil
            ht.Values[index] = nil
            ht.Occupied[index] = false
            
            // Rehash semua elemen berikutnya dalam cluster yang sama
            nextIndex := (index + 1) % ht.Size
            for ht.Occupied[nextIndex] {
                // Simpan key-value pair
                k := ht.Keys[nextIndex]
                v := ht.Values[nextIndex]
                
                // Hapus key-value pair
                ht.Keys[nextIndex] = nil
                ht.Values[nextIndex] = nil
                ht.Occupied[nextIndex] = false
                
                // Tambah kembali key-value pair
                ht.Put(k, v)
                
                // Coba indeks berikutnya
                nextIndex = (nextIndex + 1) % ht.Size
            }
            
            return true
        }
        
        // Coba indeks berikutnya dengan fungsi kuadratik
        i++
        index = (startIndex + i*i) % ht.Size
        
        // Jika sudah kembali ke indeks awal, key tidak ditemukan
        if index == startIndex {
            return false
        }
    }
    
    return false
}

// Implementasi hash table dengan double hashing
type DoubleHashingHashTable struct {
    Size     int
    Keys     []interface{}
    Values   []interface{}
    Occupied []bool
}

// Membuat double hashing hash table baru
func NewDoubleHashingHashTable(size int) *DoubleHashingHashTable {
    return &DoubleHashingHashTable{
        Size:     size,
        Keys:     make([]interface{}, size),
        Values:   make([]interface{}, size),
        Occupied: make([]bool, size),
    }
}

// Mendapatkan indeks untuk key
func (ht *DoubleHashingHashTable) getIndex(key interface{}) int {
    var hash int
    
    // Pilih hash function berdasarkan tipe data
    switch k := key.(type) {
    case string:
        hash = SimpleHash(k)
    case int:
        hash = IntHash(k)
    case float64:
        hash = FloatHash(k)
    case bool:
        if k {
            hash = 1
        } else {
            hash = 0
        }
    default:
        // Untuk tipe data lain, gunakan default hash
        hash = SimpleHash(fmt.Sprintf("%v", key))
    }
    
    // Pastikan hash positif dan dalam range
    if hash < 0 {
        hash = -hash
    }
    return hash % ht.Size
}

// Mendapatkan hash function kedua untuk key
func (ht *DoubleHashingHashTable) getSecondHash(key interface{}) int {
    var hash int
    
    // Pilih hash function kedua berdasarkan tipe data
    switch k := key.(type) {
    case string:
        hash = FNV1aHash(k)
    case int:
        hash = IntHash(k) * 31
    case float64:
        hash = FloatHash(k) * 31
    case bool:
        if k {
            hash = 31
        } else {
            hash = 17
        }
    default:
        // Untuk tipe data lain, gunakan default hash
        hash = FNV1aHash(fmt.Sprintf("%v", key))
    }
    
    // Pastikan hash positif dan dalam range
    if hash < 0 {
        hash = -hash
    }
    
    // Hash harus relatif prima dengan size
    return (hash % (ht.Size - 2)) + 1
}

// Menambah key-value pair ke hash table
func (ht *DoubleHashingHashTable) Put(key, value interface{}) bool {
    // Cek apakah hash table penuh
    for _, occupied := range ht.Occupied {
        if !occupied {
            break
        }
    }
    
    index := ht.getIndex(key)
    startIndex := index
    secondHash := ht.getSecondHash(key)
    
    // Double hashing
    for ht.Occupied[index] {
        // Jika key sudah ada, update value
        if ht.Keys[index] == key {
            ht.Values[index] = value
            return true
        }
        
        // Coba indeks berikutnya dengan double hashing
        index = (index + secondHash) % ht.Size
        
        // Jika sudah kembali ke indeks awal, hash table penuh
        if index == startIndex {
            return false
        }
    }
    
    // Tambah key-value pair
    ht.Keys[index] = key
    ht.Values[index] = value
    ht.Occupied[index] = true
    
    return true
}

// Mencari value berdasarkan key
func (ht *DoubleHashingHashTable) Get(key interface{}) (interface{}, bool) {
    index := ht.getIndex(key)
    startIndex := index
    secondHash := ht.getSecondHash(key)
    
    // Double hashing
    for ht.Occupied[index] {
        if ht.Keys[index] == key {
            return ht.Values[index], true
        }
        
        // Coba indeks berikutnya dengan double hashing
        index = (index + secondHash) % ht.Size
        
        // Jika sudah kembali ke indeks awal, key tidak ditemukan
        if index == startIndex {
            return nil, false
        }
    }
    
    return nil, false
}

// Menghapus key-value pair dari hash table
func (ht *DoubleHashingHashTable) Remove(key interface{}) bool {
    index := ht.getIndex(key)
    startIndex := index
    secondHash := ht.getSecondHash(key)
    
    // Double hashing
    for ht.Occupied[index] {
        if ht.Keys[index] == key {
            // Hapus key-value pair
            ht.Keys[index] = nil
            ht.Values[index] = nil
            ht.Occupied[index] = false
            
            // Rehash semua elemen berikutnya dalam cluster yang sama
            nextIndex := (index + secondHash) % ht.Size
            for ht.Occupied[nextIndex] {
                // Simpan key-value pair
                k := ht.Keys[nextIndex]
                v := ht.Values[nextIndex]
                
                // Hapus key-value pair
                ht.Keys[nextIndex] = nil
                ht.Values[nextIndex] = nil
                ht.Occupied[nextIndex] = false
                
                // Tambah kembali key-value pair
                ht.Put(k, v)
                
                // Coba indeks berikutnya
                nextIndex = (nextIndex + secondHash) % ht.Size
            }
            
            return true
        }
        
        // Coba indeks berikutnya dengan double hashing
        index = (index + secondHash) % ht.Size
        
        // Jika sudah kembali ke indeks awal, key tidak ditemukan
        if index == startIndex {
            return false
        }
    }
    
    return false
}
```

## Map Implementation

### Karakteristik Map di Go
- **Built-in**: Map adalah tipe data bawaan di Go
- **Generic**: Dapat menyimpan berbagai tipe data
- **Dynamic**: Ukuran dapat berubah secara dinamis
- **Unordered**: Urutan elemen tidak dijamin
- **Thread-safe**: Tidak thread-safe secara default

### Implementasi Map
```go
// Implementasi map sederhana
type SimpleMap struct {
    Data map[interface{}]interface{}
}

// Membuat map baru
func NewSimpleMap() *SimpleMap {
    return &SimpleMap{
        Data: make(map[interface{}]interface{}),
    }
}

// Menambah key-value pair ke map
func (m *SimpleMap) Put(key, value interface{}) {
    m.Data[key] = value
}

// Mencari value berdasarkan key
func (m *SimpleMap) Get(key interface{}) (interface{}, bool) {
    value, exists := m.Data[key]
    return value, exists
}

// Menghapus key-value pair dari map
func (m *SimpleMap) Remove(key interface{}) bool {
    if _, exists := m.Data[key]; exists {
        delete(m.Data, key)
        return true
    }
    return false
}

// Mendapatkan semua key dalam map
func (m *SimpleMap) Keys() []interface{} {
    keys := make([]interface{}, 0, len(m.Data))
    for k := range m.Data {
        keys = append(keys, k)
    }
    return keys
}

// Mendapatkan semua value dalam map
func (m *SimpleMap) Values() []interface{} {
    values := make([]interface{}, 0, len(m.Data))
    for _, v := range m.Data {
        values = append(values, v)
    }
    return values
}

// Mendapatkan jumlah elemen dalam map
func (m *SimpleMap) Size() int {
    return len(m.Data)
}

// Mengecek apakah map kosong
func (m *SimpleMap) IsEmpty() bool {
    return len(m.Data) == 0
}

// Mengosongkan map
func (m *SimpleMap) Clear() {
    m.Data = make(map[interface{}]interface{})
}

// Mengecek apakah key ada dalam map
func (m *SimpleMap) ContainsKey(key interface{}) bool {
    _, exists := m.Data[key]
    return exists
}

// Mengecek apakah value ada dalam map
func (m *SimpleMap) ContainsValue(value interface{}) bool {
    for _, v := range m.Data {
        if v == value {
            return true
        }
    }
    return false
}

// Mendapatkan semua key-value pair dalam map
func (m *SimpleMap) Entries() []struct{ Key, Value interface{} } {
    entries := make([]struct{ Key, Value interface{} }, 0, len(m.Data))
    for k, v := range m.Data {
        entries = append(entries, struct{ Key, Value interface{} }{k, v})
    }
    return entries
}

// Implementasi thread-safe map
type ThreadSafeMap struct {
    Data map[interface{}]interface{}
    mu   sync.RWMutex
}

// Membuat thread-safe map baru
func NewThreadSafeMap() *ThreadSafeMap {
    return &ThreadSafeMap{
        Data: make(map[interface{}]interface{}),
    }
}

// Menambah key-value pair ke map
func (m *ThreadSafeMap) Put(key, value interface{}) {
    m.mu.Lock()
    defer m.mu.Unlock()
    m.Data[key] = value
}

// Mencari value berdasarkan key
func (m *ThreadSafeMap) Get(key interface{}) (interface{}, bool) {
    m.mu.RLock()
    defer m.mu.RUnlock()
    value, exists := m.Data[key]
    return value, exists
}

// Menghapus key-value pair dari map
func (m *ThreadSafeMap) Remove(key interface{}) bool {
    m.mu.Lock()
    defer m.mu.Unlock()
    if _, exists := m.Data[key]; exists {
        delete(m.Data, key)
        return true
    }
    return false
}

// Mendapatkan semua key dalam map
func (m *ThreadSafeMap) Keys() []interface{} {
    m.mu.RLock()
    defer m.mu.RUnlock()
    keys := make([]interface{}, 0, len(m.Data))
    for k := range m.Data {
        keys = append(keys, k)
    }
    return keys
}

// Mendapatkan semua value dalam map
func (m *ThreadSafeMap) Values() []interface{} {
    m.mu.RLock()
    defer m.mu.RUnlock()
    values := make([]interface{}, 0, len(m.Data))
    for _, v := range m.Data {
        values = append(values, v)
    }
    return values
}

// Mendapatkan jumlah elemen dalam map
func (m *ThreadSafeMap) Size() int {
    m.mu.RLock()
    defer m.mu.RUnlock()
    return len(m.Data)
}

// Mengecek apakah map kosong
func (m *ThreadSafeMap) IsEmpty() bool {
    m.mu.RLock()
    defer m.mu.RUnlock()
    return len(m.Data) == 0
}

// Mengosongkan map
func (m *ThreadSafeMap) Clear() {
    m.mu.Lock()
    defer m.mu.Unlock()
    m.Data = make(map[interface{}]interface{})
}

// Mengecek apakah key ada dalam map
func (m *ThreadSafeMap) ContainsKey(key interface{}) bool {
    m.mu.RLock()
    defer m.mu.RUnlock()
    _, exists := m.Data[key]
    return exists
}

// Mengecek apakah value ada dalam map
func (m *ThreadSafeMap) ContainsValue(value interface{}) bool {
    m.mu.RLock()
    defer m.mu.RUnlock()
    for _, v := range m.Data {
        if v == value {
            return true
        }
    }
    return false
}

// Mendapatkan semua key-value pair dalam map
func (m *ThreadSafeMap) Entries() []struct{ Key, Value interface{} } {
    m.mu.RLock()
    defer m.mu.RUnlock()
    entries := make([]struct{ Key, Value interface{} }, 0, len(m.Data))
    for k, v := range m.Data {
        entries = append(entries, struct{ Key, Value interface{} }{k, v})
    }
    return entries
}
```

## Custom Hash Tables

### Implementasi Custom Hash Table
```go
// Implementasi custom hash table dengan chaining
type CustomHashTable struct {
    Size    int
    Buckets []*LinkedList
    Count   int
}

// Membuat custom hash table baru
func NewCustomHashTable(size int) *CustomHashTable {
    buckets := make([]*LinkedList, size)
    for i := 0; i < size; i++ {
        buckets[i] = NewLinkedList()
    }
    
    return &CustomHashTable{
        Size:    size,
        Buckets: buckets,
        Count:   0,
    }
}

// Mendapatkan indeks bucket untuk key
func (ht *CustomHashTable) getBucketIndex(key interface{}) int {
    var hash int
    
    // Pilih hash function berdasarkan tipe data
    switch k := key.(type) {
    case string:
        hash = SimpleHash(k)
    case int:
        hash = IntHash(k)
    case float64:
        hash = FloatHash(k)
    case bool:
        if k {
            hash = 1
        } else {
            hash = 0
        }
    default:
        // Untuk tipe data lain, gunakan default hash
        hash = SimpleHash(fmt.Sprintf("%v", key))
    }
    
    // Pastikan hash positif dan dalam range
    if hash < 0 {
        hash = -hash
    }
    return hash % ht.Size
}

// Menambah key-value pair ke hash table
func (ht *CustomHashTable) Put(key, value interface{}) {
    index := ht.getBucketIndex(key)
    
    // Cek apakah key sudah ada
    if _, exists := ht.Buckets[index].Find(key); exists {
        // Update value jika key sudah ada
        ht.Buckets[index].Add(key, value)
    } else {
        // Tambah key-value pair baru
        ht.Buckets[index].Add(key, value)
        ht.Count++
    }
}

// Mencari value berdasarkan key
func (ht *CustomHashTable) Get(key interface{}) (interface{}, bool) {
    index := ht.getBucketIndex(key)
    return ht.Buckets[index].Find(key)
}

// Menghapus key-value pair dari hash table
func (ht *CustomHashTable) Remove(key interface{}) bool {
    index := ht.getBucketIndex(key)
    if ht.Buckets[index].Remove(key) {
        ht.Count--
        return true
    }
    return false
}

// Mendapatkan jumlah elemen dalam hash table
func (ht *CustomHashTable) Size() int {
    return ht.Count
}

// Mengecek apakah hash table kosong
func (ht *CustomHashTable) IsEmpty() bool {
    return ht.Count == 0
}

// Mengosongkan hash table
func (ht *CustomHashTable) Clear() {
    for i := 0; i < ht.Size; i++ {
        ht.Buckets[i] = NewLinkedList()
    }
    ht.Count = 0
}

// Mendapatkan load factor
func (ht *CustomHashTable) LoadFactor() float64 {
    return float64(ht.Count) / float64(ht.Size)
}

// Resize hash table
func (ht *CustomHashTable) Resize(newSize int) {
    // Simpan semua elemen
    entries := make([]struct{ Key, Value interface{} }, 0, ht.Count)
    for i := 0; i < ht.Size; i++ {
        current := ht.Buckets[i].Head
        for current != nil {
            entries = append(entries, struct{ Key, Value interface{} }{current.Key, current.Value})
            current = current.Next
        }
    }
    
    // Buat hash table baru
    ht.Size = newSize
    ht.Buckets = make([]*LinkedList, newSize)
    for i := 0; i < newSize; i++ {
        ht.Buckets[i] = NewLinkedList()
    }
    ht.Count = 0
    
    // Tambah kembali semua elemen
    for _, entry := range entries {
        ht.Put(entry.Key, entry.Value)
    }
}

// Implementasi custom hash table dengan linear probing
type CustomLinearProbingHashTable struct {
    Size     int
    Keys     []interface{}
    Values   []interface{}
    Occupied []bool
    Count    int
}

// Membuat custom linear probing hash table baru
func NewCustomLinearProbingHashTable(size int) *CustomLinearProbingHashTable {
    return &CustomLinearProbingHashTable{
        Size:     size,
        Keys:     make([]interface{}, size),
        Values:   make([]interface{}, size),
        Occupied: make([]bool, size),
        Count:    0,
    }
}

// Mendapatkan indeks untuk key
func (ht *CustomLinearProbingHashTable) getIndex(key interface{}) int {
    var hash int
    
    // Pilih hash function berdasarkan tipe data
    switch k := key.(type) {
    case string:
        hash = SimpleHash(k)
    case int:
        hash = IntHash(k)
    case float64:
        hash = FloatHash(k)
    case bool:
        if k {
            hash = 1
        } else {
            hash = 0
        }
    default:
        // Untuk tipe data lain, gunakan default hash
        hash = SimpleHash(fmt.Sprintf("%v", key))
    }
    
    // Pastikan hash positif dan dalam range
    if hash < 0 {
        hash = -hash
    }
    return hash % ht.Size
}

// Menambah key-value pair ke hash table
func (ht *CustomLinearProbingHashTable) Put(key, value interface{}) bool {
    // Cek apakah hash table penuh
    if ht.Count >= ht.Size {
        return false
    }
    
    index := ht.getIndex(key)
    startIndex := index
    
    // Linear probing
    for ht.Occupied[index] {
        // Jika key sudah ada, update value
        if ht.Keys[index] == key {
            ht.Values[index] = value
            return true
        }
        
        // Coba indeks berikutnya
        index = (index + 1) % ht.Size
        
        // Jika sudah kembali ke indeks awal, hash table penuh
        if index == startIndex {
            return false
        }
    }
    
    // Tambah key-value pair
    ht.Keys[index] = key
    ht.Values[index] = value
    ht.Occupied[index] = true
    ht.Count++
    
    return true
}

// Mencari value berdasarkan key
func (ht *CustomLinearProbingHashTable) Get(key interface{}) (interface{}, bool) {
    index := ht.getIndex(key)
    startIndex := index
    
    // Linear probing
    for ht.Occupied[index] {
        if ht.Keys[index] == key {
            return ht.Values[index], true
        }
        
        // Coba indeks berikutnya
        index = (index + 1) % ht.Size
        
        // Jika sudah kembali ke indeks awal, key tidak ditemukan
        if index == startIndex {
            return nil, false
        }
    }
    
    return nil, false
}

// Menghapus key-value pair dari hash table
func (ht *CustomLinearProbingHashTable) Remove(key interface{}) bool {
    index := ht.getIndex(key)
    startIndex := index
    
    // Linear probing
    for ht.Occupied[index] {
        if ht.Keys[index] == key {
            // Hapus key-value pair
            ht.Keys[index] = nil
            ht.Values[index] = nil
            ht.Occupied[index] = false
            ht.Count--
            
            // Rehash semua elemen berikutnya dalam cluster yang sama
            nextIndex := (index + 1) % ht.Size
            for ht.Occupied[nextIndex] {
                // Simpan key-value pair
                k := ht.Keys[nextIndex]
                v := ht.Values[nextIndex]
                
                // Hapus key-value pair
                ht.Keys[nextIndex] = nil
                ht.Values[nextIndex] = nil
                ht.Occupied[nextIndex] = false
                ht.Count--
                
                // Tambah kembali key-value pair
                ht.Put(k, v)
                
                // Coba indeks berikutnya
                nextIndex = (nextIndex + 1) % ht.Size
            }
            
            return true
        }
        
        // Coba indeks berikutnya
        index = (index + 1) % ht.Size
        
        // Jika sudah kembali ke indeks awal, key tidak ditemukan
        if index == startIndex {
            return false
        }
    }
    
    return false
}

// Mendapatkan jumlah elemen dalam hash table
func (ht *CustomLinearProbingHashTable) Size() int {
    return ht.Count
}

// Mengecek apakah hash table kosong
func (ht *CustomLinearProbingHashTable) IsEmpty() bool {
    return ht.Count == 0
}

// Mengosongkan hash table
func (ht *CustomLinearProbingHashTable) Clear() {
    ht.Keys = make([]interface{}, ht.Size)
    ht.Values = make([]interface{}, ht.Size)
    ht.Occupied = make([]bool, ht.Size)
    ht.Count = 0
}

// Mendapatkan load factor
func (ht *CustomLinearProbingHashTable) LoadFactor() float64 {
    return float64(ht.Count) / float64(ht.Size)
}

// Resize hash table
func (ht *CustomLinearProbingHashTable) Resize(newSize int) {
    // Simpan semua elemen
    entries := make([]struct{ Key, Value interface{} }, 0, ht.Count)
    for i := 0; i < ht.Size; i++ {
        if ht.Occupied[i] {
            entries = append(entries, struct{ Key, Value interface{} }{ht.Keys[i], ht.Values[i]})
        }
    }
    
    // Buat hash table baru
    ht.Size = newSize
    ht.Keys = make([]interface{}, newSize)
    ht.Values = make([]interface{}, newSize)
    ht.Occupied = make([]bool, newSize)
    ht.Count = 0
    
    // Tambah kembali semua elemen
    for _, entry := range entries {
        ht.Put(entry.Key, entry.Value)
    }
}
```

## Aplikasi Hash Table
- **Database indexing**: Mengimplementasikan indeks untuk pencarian cepat
- **Caching**: Menyimpan hasil komputasi untuk penggunaan kembali
- **Symbol tables**: Menyimpan simbol dalam compiler/interpreter
- **Dictionaries**: Mengimplementasikan kamus atau thesaurus
- **Frequency counting**: Menghitung frekuensi elemen
- **Deduplication**: Menghapus duplikat dari data
- **Graph representation**: Mengimplementasikan adjacency list
- **Set implementation**: Mengimplementasikan set data structure

## Kesimpulan

Hash table adalah struktur data yang sangat penting dan serbaguna dalam pengembangan perangkat lunak. Hash function yang baik sangat penting untuk performa hash table, dan pemilihan teknik collision handling tergantung pada karakteristik data dan operasi yang akan dilakukan. Map adalah implementasi hash table bawaan di Go, sementara custom hash table dapat diimplementasikan untuk kebutuhan khusus. Memahami implementasi dan penggunaan hash table sangat penting untuk pengembangan aplikasi yang efisien.