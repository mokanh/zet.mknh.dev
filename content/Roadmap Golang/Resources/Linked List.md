# Linked List

Linked list adalah struktur data linear yang terdiri dari node-node yang terhubung satu sama lain. Setiap node menyimpan data dan referensi ke node berikutnya (dan sebelumnya untuk double linked list). Linked list berbeda dengan array karena elemen-elemennya tidak disimpan secara berurutan dalam memori.

## Single Linked List

### Karakteristik Single Linked List
- **Node structure**: Setiap node memiliki data dan pointer ke node berikutnya
- **Memory efficiency**: Hanya menggunakan memori yang diperlukan
- **Dynamic size**: Ukuran dapat berubah saat runtime
- **Sequential access**: Harus melakukan traversal untuk mengakses elemen

```go
// Implementasi node untuk single linked list
type Node struct {
    Data int
    Next *Node
}

// Implementasi single linked list
type LinkedList struct {
    Head *Node
}

// Membuat linked list baru
func NewLinkedList() *LinkedList {
    return &LinkedList{Head: nil}
}

// Menambah node di awal
func (ll *LinkedList) Prepend(data int) {
    newNode := &Node{Data: data, Next: ll.Head}
    ll.Head = newNode
}

// Menambah node di akhir
func (ll *LinkedList) Append(data int) {
    newNode := &Node{Data: data, Next: nil}
    
    if ll.Head == nil {
        ll.Head = newNode
        return
    }
    
    current := ll.Head
    for current.Next != nil {
        current = current.Next
    }
    current.Next = newNode
}

// Mencari node dengan nilai tertentu
func (ll *LinkedList) Find(data int) *Node {
    current := ll.Head
    for current != nil {
        if current.Data == data {
            return current
        }
        current = current.Next
    }
    return nil
}

// Menghapus node dengan nilai tertentu
func (ll *LinkedList) Delete(data int) bool {
    if ll.Head == nil {
        return false
    }
    
    if ll.Head.Data == data {
        ll.Head = ll.Head.Next
        return true
    }
    
    current := ll.Head
    for current.Next != nil {
        if current.Next.Data == data {
            current.Next = current.Next.Next
            return true
        }
        current = current.Next
    }
    
    return false
}

// Menampilkan semua elemen
func (ll *LinkedList) Display() {
    current := ll.Head
    for current != nil {
        fmt.Printf("%d -> ", current.Data)
        current = current.Next
    }
    fmt.Println("nil")
}
```

## Double Linked List

### Karakteristik Double Linked List
- **Node structure**: Setiap node memiliki data, pointer ke node berikutnya, dan pointer ke node sebelumnya
- **Bidirectional traversal**: Dapat melakukan traversal ke dua arah
- **Memory overhead**: Menggunakan lebih banyak memori karena menyimpan dua pointer
- **Efficient deletion**: Lebih efisien untuk menghapus node tertentu

```go
// Implementasi node untuk double linked list
type DNode struct {
    Data int
    Next *DNode
    Prev *DNode
}

// Implementasi double linked list
type DoubleLinkedList struct {
    Head *DNode
    Tail *DNode
}

// Membuat double linked list baru
func NewDoubleLinkedList() *DoubleLinkedList {
    return &DoubleLinkedList{Head: nil, Tail: nil}
}

// Menambah node di awal
func (dll *DoubleLinkedList) Prepend(data int) {
    newNode := &DNode{Data: data, Next: dll.Head, Prev: nil}
    
    if dll.Head != nil {
        dll.Head.Prev = newNode
    } else {
        dll.Tail = newNode
    }
    
    dll.Head = newNode
}

// Menambah node di akhir
func (dll *DoubleLinkedList) Append(data int) {
    newNode := &DNode{Data: data, Next: nil, Prev: dll.Tail}
    
    if dll.Tail != nil {
        dll.Tail.Next = newNode
    } else {
        dll.Head = newNode
    }
    
    dll.Tail = newNode
}

// Menghapus node dengan nilai tertentu
func (dll *DoubleLinkedList) Delete(data int) bool {
    if dll.Head == nil {
        return false
    }
    
    current := dll.Head
    for current != nil {
        if current.Data == data {
            if current == dll.Head {
                dll.Head = current.Next
                if dll.Head != nil {
                    dll.Head.Prev = nil
                } else {
                    dll.Tail = nil
                }
            } else if current == dll.Tail {
                dll.Tail = current.Prev
                dll.Tail.Next = nil
            } else {
                current.Prev.Next = current.Next
                current.Next.Prev = current.Prev
            }
            return true
        }
        current = current.Next
    }
    
    return false
}

// Menampilkan semua elemen dari depan ke belakang
func (dll *DoubleLinkedList) DisplayForward() {
    current := dll.Head
    for current != nil {
        fmt.Printf("%d -> ", current.Data)
        current = current.Next
    }
    fmt.Println("nil")
}

// Menampilkan semua elemen dari belakang ke depan
func (dll *DoubleLinkedList) DisplayBackward() {
    current := dll.Tail
    for current != nil {
        fmt.Printf("%d -> ", current.Data)
        current = current.Prev
    }
    fmt.Println("nil")
}
```

## Circular Linked List

### Karakteristik Circular Linked List
- **Node structure**: Node terakhir menunjuk kembali ke node pertama
- **No null pointer**: Tidak ada pointer yang menunjuk ke nil
- **Efficient rotation**: Efisien untuk operasi rotasi
- **Traversal**: Perlu perhatian khusus untuk menghindari infinite loop

```go
// Implementasi circular linked list
type CircularLinkedList struct {
    Head *Node
    Tail *Node
}

// Membuat circular linked list baru
func NewCircularLinkedList() *CircularLinkedList {
    return &CircularLinkedList{Head: nil, Tail: nil}
}

// Menambah node di awal
func (cll *CircularLinkedList) Prepend(data int) {
    newNode := &Node{Data: data, Next: nil}
    
    if cll.Head == nil {
        newNode.Next = newNode
        cll.Head = newNode
        cll.Tail = newNode
    } else {
        newNode.Next = cll.Head
        cll.Tail.Next = newNode
        cll.Head = newNode
    }
}

// Menambah node di akhir
func (cll *CircularLinkedList) Append(data int) {
    newNode := &Node{Data: data, Next: nil}
    
    if cll.Head == nil {
        newNode.Next = newNode
        cll.Head = newNode
        cll.Tail = newNode
    } else {
        newNode.Next = cll.Head
        cll.Tail.Next = newNode
        cll.Tail = newNode
    }
}

// Menghapus node dengan nilai tertentu
func (cll *CircularLinkedList) Delete(data int) bool {
    if cll.Head == nil {
        return false
    }
    
    // Jika hanya ada satu node
    if cll.Head == cll.Tail && cll.Head.Data == data {
        cll.Head = nil
        cll.Tail = nil
        return true
    }
    
    // Jika node yang akan dihapus adalah head
    if cll.Head.Data == data {
        cll.Head = cll.Head.Next
        cll.Tail.Next = cll.Head
        return true
    }
    
    // Mencari node yang akan dihapus
    current := cll.Head
    for current.Next != cll.Head {
        if current.Next.Data == data {
            // Jika node yang akan dihapus adalah tail
            if current.Next == cll.Tail {
                cll.Tail = current
            }
            current.Next = current.Next.Next
            return true
        }
        current = current.Next
    }
    
    return false
}

// Menampilkan semua elemen
func (cll *CircularLinkedList) Display() {
    if cll.Head == nil {
        fmt.Println("List is empty")
        return
    }
    
    current := cll.Head
    for {
        fmt.Printf("%d -> ", current.Data)
        current = current.Next
        if current == cll.Head {
            break
        }
    }
    fmt.Println()
}
```

## Implementasi dan Operasi

### Operasi Dasar
- **Insertion**: Menambah node baru (di awal, akhir, atau posisi tertentu)
- **Deletion**: Menghapus node (dari awal, akhir, atau posisi tertentu)
- **Traversal**: Melakukan perjalanan melalui linked list
- **Searching**: Mencari node dengan nilai tertentu

### Kompleksitas Waktu
- **Access**: O(n) - Harus melakukan traversal
- **Search**: O(n) - Harus melakukan traversal
- **Insertion**: O(1) di awal, O(n) di akhir atau posisi tertentu
- **Deletion**: O(1) di awal, O(n) di akhir atau posisi tertentu

### Aplikasi
- **Dynamic memory allocation**: Mengelola memori secara dinamis
- **Implementation of other data structures**: Stack, queue, dll
- **Polynomial representation**: Menyimpan polinomial
- **Sparse matrix representation**: Menyimpan matriks sparse

```go
// Contoh aplikasi: Implementasi Stack menggunakan linked list
type Stack struct {
    Top *Node
}

func NewStack() *Stack {
    return &Stack{Top: nil}
}

func (s *Stack) Push(data int) {
    newNode := &Node{Data: data, Next: s.Top}
    s.Top = newNode
}

func (s *Stack) Pop() (int, bool) {
    if s.Top == nil {
        return 0, false
    }
    
    data := s.Top.Data
    s.Top = s.Top.Next
    return data, true
}

func (s *Stack) Peek() (int, bool) {
    if s.Top == nil {
        return 0, false
    }
    
    return s.Top.Data, true
}

func (s *Stack) IsEmpty() bool {
    return s.Top == nil
}
```

## Kesimpulan

Linked list adalah struktur data yang fleksibel dan efisien untuk berbagai aplikasi. Single linked list cocok untuk traversal satu arah, double linked list untuk traversal dua arah, dan circular linked list untuk operasi yang memerlukan rotasi. Memahami implementasi dan operasi linked list sangat penting untuk pengembangan algoritma dan struktur data yang lebih kompleks.