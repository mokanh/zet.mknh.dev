# Stack dan Queue

Stack dan queue adalah struktur data linear yang mengikuti prinsip LIFO (Last In First Out) dan FIFO (First In First Out) secara berturut-turut. Kedua struktur data ini sangat penting dalam pengembangan perangkat lunak dan memiliki berbagai aplikasi praktis.

## Stack

### Karakteristik Stack
- **LIFO (Last In First Out)**: Elemen terakhir yang dimasukkan adalah elemen pertama yang dikeluarkan
- **Operations**: Push (menambah elemen) dan Pop (menghapus elemen)
- **Top pointer**: Menunjuk ke elemen teratas
- **Empty check**: Memeriksa apakah stack kosong

### Implementasi Stack

#### Implementasi menggunakan Array/Slice
```go
// Implementasi stack menggunakan slice
type Stack struct {
    items []int
}

// Membuat stack baru
func NewStack() *Stack {
    return &Stack{items: make([]int, 0)}
}

// Menambah elemen ke stack (push)
func (s *Stack) Push(item int) {
    s.items = append(s.items, item)
}

// Menghapus elemen dari stack (pop)
func (s *Stack) Pop() (int, bool) {
    if s.IsEmpty() {
        return 0, false
    }
    
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}

// Melihat elemen teratas tanpa menghapus (peek)
func (s *Stack) Peek() (int, bool) {
    if s.IsEmpty() {
        return 0, false
    }
    
    return s.items[len(s.items)-1], true
}

// Memeriksa apakah stack kosong
func (s *Stack) IsEmpty() bool {
    return len(s.items) == 0
}

// Mendapatkan ukuran stack
func (s *Stack) Size() int {
    return len(s.items)
}

// Menampilkan semua elemen
func (s *Stack) Display() {
    for i := len(s.items) - 1; i >= 0; i-- {
        fmt.Printf("%d ", s.items[i])
    }
    fmt.Println()
}
```

#### Implementasi menggunakan Linked List
```go
// Implementasi stack menggunakan linked list
type Node struct {
    Data int
    Next *Node
}

type LinkedListStack struct {
    Top *Node
}

// Membuat stack baru
func NewLinkedListStack() *LinkedListStack {
    return &LinkedListStack{Top: nil}
}

// Menambah elemen ke stack (push)
func (s *LinkedListStack) Push(item int) {
    newNode := &Node{Data: item, Next: s.Top}
    s.Top = newNode
}

// Menghapus elemen dari stack (pop)
func (s *LinkedListStack) Pop() (int, bool) {
    if s.IsEmpty() {
        return 0, false
    }
    
    item := s.Top.Data
    s.Top = s.Top.Next
    return item, true
}

// Melihat elemen teratas tanpa menghapus (peek)
func (s *LinkedListStack) Peek() (int, bool) {
    if s.IsEmpty() {
        return 0, false
    }
    
    return s.Top.Data, true
}

// Memeriksa apakah stack kosong
func (s *LinkedListStack) IsEmpty() bool {
    return s.Top == nil
}

// Menampilkan semua elemen
func (s *LinkedListStack) Display() {
    current := s.Top
    for current != nil {
        fmt.Printf("%d ", current.Data)
        current = current.Next
    }
    fmt.Println()
}
```

### Aplikasi Stack
- **Function calls**: Mengelola pemanggilan fungsi dan return address
- **Expression evaluation**: Mengevaluasi ekspresi matematika
- **Backtracking**: Menyimpan state untuk algoritma backtracking
- **Undo/Redo**: Mengimplementasikan fitur undo/redo
- **Parentheses matching**: Memeriksa keseimbangan tanda kurung

```go
// Contoh aplikasi: Parentheses matching
func IsBalanced(expression string) bool {
    stack := NewStack()
    
    for _, char := range expression {
        if char == '(' || char == '{' || char == '[' {
            stack.Push(int(char))
        } else if char == ')' || char == '}' || char == ']' {
            if stack.IsEmpty() {
                return false
            }
            
            top, _ := stack.Pop()
            if (char == ')' && top != '(') ||
               (char == '}' && top != '{') ||
               (char == ']' && top != '[') {
                return false
            }
        }
    }
    
    return stack.IsEmpty()
}
```

## Queue

### Karakteristik Queue
- **FIFO (First In First Out)**: Elemen pertama yang dimasukkan adalah elemen pertama yang dikeluarkan
- **Operations**: Enqueue (menambah elemen) dan Dequeue (menghapus elemen)
- **Front pointer**: Menunjuk ke elemen depan
- **Rear pointer**: Menunjuk ke elemen belakang

### Implementasi Queue

#### Implementasi menggunakan Array/Slice
```go
// Implementasi queue menggunakan slice
type Queue struct {
    items []int
}

// Membuat queue baru
func NewQueue() *Queue {
    return &Queue{items: make([]int, 0)}
}

// Menambah elemen ke queue (enqueue)
func (q *Queue) Enqueue(item int) {
    q.items = append(q.items, item)
}

// Menghapus elemen dari queue (dequeue)
func (q *Queue) Dequeue() (int, bool) {
    if q.IsEmpty() {
        return 0, false
    }
    
    item := q.items[0]
    q.items = q.items[1:]
    return item, true
}

// Melihat elemen depan tanpa menghapus (peek)
func (q *Queue) Peek() (int, bool) {
    if q.IsEmpty() {
        return 0, false
    }
    
    return q.items[0], true
}

// Memeriksa apakah queue kosong
func (q *Queue) IsEmpty() bool {
    return len(q.items) == 0
}

// Mendapatkan ukuran queue
func (q *Queue) Size() int {
    return len(q.items)
}

// Menampilkan semua elemen
func (q *Queue) Display() {
    for _, item := range q.items {
        fmt.Printf("%d ", item)
    }
    fmt.Println()
}
```

#### Implementasi menggunakan Linked List
```go
// Implementasi queue menggunakan linked list
type QueueNode struct {
    Data int
    Next *QueueNode
}

type LinkedListQueue struct {
    Front *QueueNode
    Rear  *QueueNode
}

// Membuat queue baru
func NewLinkedListQueue() *LinkedListQueue {
    return &LinkedListQueue{Front: nil, Rear: nil}
}

// Menambah elemen ke queue (enqueue)
func (q *LinkedListQueue) Enqueue(item int) {
    newNode := &QueueNode{Data: item, Next: nil}
    
    if q.IsEmpty() {
        q.Front = newNode
        q.Rear = newNode
    } else {
        q.Rear.Next = newNode
        q.Rear = newNode
    }
}

// Menghapus elemen dari queue (dequeue)
func (q *LinkedListQueue) Dequeue() (int, bool) {
    if q.IsEmpty() {
        return 0, false
    }
    
    item := q.Front.Data
    q.Front = q.Front.Next
    
    if q.Front == nil {
        q.Rear = nil
    }
    
    return item, true
}

// Melihat elemen depan tanpa menghapus (peek)
func (q *LinkedListQueue) Peek() (int, bool) {
    if q.IsEmpty() {
        return 0, false
    }
    
    return q.Front.Data, true
}

// Memeriksa apakah queue kosong
func (q *LinkedListQueue) IsEmpty() bool {
    return q.Front == nil
}

// Menampilkan semua elemen
func (q *LinkedListQueue) Display() {
    current := q.Front
    for current != nil {
        fmt.Printf("%d ", current.Data)
        current = current.Next
    }
    fmt.Println()
}
```

### Aplikasi Queue
- **Process scheduling**: Mengelola proses dalam sistem operasi
- **Print queue**: Mengelola antrian cetak
- **Web server**: Mengelola permintaan HTTP
- **Breadth-first search**: Mengimplementasikan algoritma BFS
- **Buffer**: Mengimplementasikan buffer untuk komunikasi

```go
// Contoh aplikasi: Breadth-first search
type Graph struct {
    vertices int
    adjList  map[int][]int
}

func NewGraph(vertices int) *Graph {
    return &Graph{
        vertices: vertices,
        adjList:  make(map[int][]int),
    }
}

func (g *Graph) AddEdge(u, v int) {
    g.adjList[u] = append(g.adjList[u], v)
}

func (g *Graph) BFS(start int) []int {
    visited := make([]bool, g.vertices)
    result := make([]int, 0)
    queue := NewQueue()
    
    visited[start] = true
    queue.Enqueue(start)
    
    for !queue.IsEmpty() {
        vertex, _ := queue.Dequeue()
        result = append(result, vertex)
        
        for _, neighbor := range g.adjList[vertex] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue.Enqueue(neighbor)
            }
        }
    }
    
    return result
}
```

## Priority Queue

### Karakteristik Priority Queue
- **Ordered elements**: Elemen diurutkan berdasarkan prioritas
- **Operations**: Enqueue dan Dequeue dengan prioritas
- **Implementation**: Biasanya menggunakan heap

### Implementasi Priority Queue
```go
// Implementasi priority queue menggunakan heap
type Item struct {
    Value    int
    Priority int
    Index    int
}

type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
    // Untuk max heap, gunakan > untuk min heap
    return pq[i].Priority > pq[j].Priority
}

func (pq PriorityQueue) Swap(i, j int) {
    pq[i], pq[j] = pq[j], pq[i]
    pq[i].Index = i
    pq[j].Index = j
}

func (pq *PriorityQueue) Push(x interface{}) {
    n := len(*pq)
    item := x.(*Item)
    item.Index = n
    *pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() interface{} {
    old := *pq
    n := len(old)
    item := old[n-1]
    old[n-1] = nil
    item.Index = -1
    *pq = old[0 : n-1]
    return item
}

// Membuat priority queue baru
func NewPriorityQueue() *PriorityQueue {
    pq := make(PriorityQueue, 0)
    heap.Init(&pq)
    return &pq
}

// Menambah elemen ke priority queue
func (pq *PriorityQueue) Enqueue(value, priority int) {
    item := &Item{
        Value:    value,
        Priority: priority,
    }
    heap.Push(pq, item)
}

// Menghapus elemen dari priority queue
func (pq *PriorityQueue) Dequeue() (int, bool) {
    if pq.Len() == 0 {
        return 0, false
    }
    
    item := heap.Pop(pq).(*Item)
    return item.Value, true
}

// Melihat elemen dengan prioritas tertinggi tanpa menghapus
func (pq *PriorityQueue) Peek() (int, bool) {
    if pq.Len() == 0 {
        return 0, false
    }
    
    return (*pq)[0].Value, true
}

// Memeriksa apakah priority queue kosong
func (pq *PriorityQueue) IsEmpty() bool {
    return pq.Len() == 0
}
```

### Aplikasi Priority Queue
- **Task scheduling**: Mengelola tugas berdasarkan prioritas
- **Event-driven simulation**: Mengelola event berdasarkan waktu
- **Dijkstra's algorithm**: Mengimplementasikan algoritma Dijkstra
- **Huffman coding**: Mengimplementasikan algoritma Huffman

```go
// Contoh aplikasi: Task scheduling
type Task struct {
    ID       int
    Priority int
    Name     string
}

func ScheduleTasks(tasks []Task) []Task {
    pq := NewPriorityQueue()
    
    // Menambahkan semua tugas ke priority queue
    for _, task := range tasks {
        pq.Enqueue(task.ID, task.Priority)
    }
    
    // Mengambil tugas berdasarkan prioritas
    result := make([]Task, 0)
    for !pq.IsEmpty() {
        id, _ := pq.Dequeue()
        for _, task := range tasks {
            if task.ID == id {
                result = append(result, task)
                break
            }
        }
    }
    
    return result
}
```

## Deque (Double-Ended Queue)

### Karakteristik Deque
- **Double-ended**: Dapat menambah dan menghapus elemen dari kedua ujung
- **Operations**: PushFront, PushBack, PopFront, PopBack
- **Flexibility**: Kombinasi dari stack dan queue

### Implementasi Deque
```go
// Implementasi deque menggunakan slice
type Deque struct {
    items []int
}

// Membuat deque baru
func NewDeque() *Deque {
    return &Deque{items: make([]int, 0)}
}

// Menambah elemen ke depan (push front)
func (d *Deque) PushFront(item int) {
    d.items = append([]int{item}, d.items...)
}

// Menambah elemen ke belakang (push back)
func (d *Deque) PushBack(item int) {
    d.items = append(d.items, item)
}

// Menghapus elemen dari depan (pop front)
func (d *Deque) PopFront() (int, bool) {
    if d.IsEmpty() {
        return 0, false
    }
    
    item := d.items[0]
    d.items = d.items[1:]
    return item, true
}

// Menghapus elemen dari belakang (pop back)
func (d *Deque) PopBack() (int, bool) {
    if d.IsEmpty() {
        return 0, false
    }
    
    item := d.items[len(d.items)-1]
    d.items = d.items[:len(d.items)-1]
    return item, true
}

// Melihat elemen depan tanpa menghapus (peek front)
func (d *Deque) PeekFront() (int, bool) {
    if d.IsEmpty() {
        return 0, false
    }
    
    return d.items[0], true
}

// Melihat elemen belakang tanpa menghapus (peek back)
func (d *Deque) PeekBack() (int, bool) {
    if d.IsEmpty() {
        return 0, false
    }
    
    return d.items[len(d.items)-1], true
}

// Memeriksa apakah deque kosong
func (d *Deque) IsEmpty() bool {
    return len(d.items) == 0
}

// Mendapatkan ukuran deque
func (d *Deque) Size() int {
    return len(d.items)
}

// Menampilkan semua elemen
func (d *Deque) Display() {
    for _, item := range d.items {
        fmt.Printf("%d ", item)
    }
    fmt.Println()
}
```

### Aplikasi Deque
- **Sliding window**: Mengimplementasikan algoritma sliding window
- **Palindrome checker**: Memeriksa palindrom
- **Undo/Redo**: Mengimplementasikan fitur undo/redo yang lebih fleksibel
- **Job scheduling**: Mengelola pekerjaan dengan prioritas di kedua ujung

```go
// Contoh aplikasi: Palindrome checker
func IsPalindrome(s string) bool {
    deque := NewDeque()
    
    // Menambahkan semua karakter ke deque
    for _, char := range s {
        deque.PushBack(int(char))
    }
    
    // Memeriksa palindrom
    for deque.Size() > 1 {
        front, _ := deque.PopFront()
        back, _ := deque.PopBack()
        
        if front != back {
            return false
        }
    }
    
    return true
}
```

## Kesimpulan

Stack dan queue adalah struktur data fundamental yang sangat penting dalam pengembangan perangkat lunak. Stack mengikuti prinsip LIFO dan cocok untuk aplikasi seperti pemanggilan fungsi dan evaluasi ekspresi, sementara queue mengikuti prinsip FIFO dan cocok untuk aplikasi seperti penjadwalan proses dan antrian cetak. Priority queue dan deque adalah variasi yang lebih fleksibel dari struktur data dasar ini, masing-masing dengan aplikasi khusus. Memahami implementasi dan penggunaan struktur data ini sangat penting untuk pengembangan algoritma dan aplikasi yang efisien.