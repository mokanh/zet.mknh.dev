# Tree

Tree adalah struktur data hierarkis yang terdiri dari node-node yang terhubung oleh edge. Setiap node memiliki nilai dan dapat memiliki beberapa child node. Tree memiliki banyak variasi dan aplikasi dalam pengembangan perangkat lunak.

## Binary Tree

### Karakteristik Binary Tree
- **Node structure**: Setiap node memiliki maksimal dua child (left dan right)
- **Root node**: Node teratas dalam tree
- **Leaf node**: Node yang tidak memiliki child
- **Internal node**: Node yang memiliki minimal satu child
- **Height**: Panjang path dari root ke leaf terdalam
- **Depth**: Panjang path dari root ke node tertentu

### Implementasi Binary Tree
```go
// Implementasi node untuk binary tree
type Node struct {
    Data  int
    Left  *Node
    Right *Node
}

// Membuat node baru
func NewNode(data int) *Node {
    return &Node{
        Data:  data,
        Left:  nil,
        Right: nil,
    }
}

// Menambah node ke binary tree
func (n *Node) Insert(data int) {
    if data < n.Data {
        if n.Left == nil {
            n.Left = NewNode(data)
        } else {
            n.Left.Insert(data)
        }
    } else {
        if n.Right == nil {
            n.Right = NewNode(data)
        } else {
            n.Right.Insert(data)
        }
    }
}

// Mencari node dengan nilai tertentu
func (n *Node) Search(data int) *Node {
    if n == nil || n.Data == data {
        return n
    }
    
    if data < n.Data {
        return n.Left.Search(data)
    }
    
    return n.Right.Search(data)
}

// Mendapatkan tinggi tree
func (n *Node) Height() int {
    if n == nil {
        return 0
    }
    
    leftHeight := n.Left.Height()
    rightHeight := n.Right.Height()
    
    if leftHeight > rightHeight {
        return leftHeight + 1
    }
    
    return rightHeight + 1
}

// Mendapatkan jumlah node
func (n *Node) Count() int {
    if n == nil {
        return 0
    }
    
    return n.Left.Count() + n.Right.Count() + 1
}

// Menampilkan tree secara visual (inorder)
func (n *Node) Display() {
    if n == nil {
        return
    }
    
    n.Left.Display()
    fmt.Printf("%d ", n.Data)
    n.Right.Display()
}
```

## Binary Search Tree (BST)

### Karakteristik Binary Search Tree
- **Ordered elements**: Semua node di subtree kiri lebih kecil dari root, semua node di subtree kanan lebih besar dari root
- **Unique values**: Biasanya tidak mengizinkan nilai duplikat
- **Efficient search**: Kompleksitas waktu pencarian rata-rata O(log n)
- **Unbalanced**: Dapat menjadi tidak seimbang, mengakibatkan kompleksitas waktu O(n)

### Implementasi Binary Search Tree
```go
// Implementasi binary search tree
type BST struct {
    Root *Node
}

// Membuat BST baru
func NewBST() *BST {
    return &BST{Root: nil}
}

// Menambah elemen ke BST
func (bst *BST) Insert(data int) {
    if bst.Root == nil {
        bst.Root = NewNode(data)
    } else {
        bst.Root.Insert(data)
    }
}

// Mencari elemen dalam BST
func (bst *BST) Search(data int) *Node {
    if bst.Root == nil {
        return nil
    }
    
    return bst.Root.Search(data)
}

// Menghapus elemen dari BST
func (bst *BST) Delete(data int) bool {
    if bst.Root == nil {
        return false
    }
    
    // Jika root yang akan dihapus
    if bst.Root.Data == data {
        bst.Root = bst.deleteNode(bst.Root)
        return true
    }
    
    // Mencari node yang akan dihapus
    return bst.deleteFromSubtree(bst.Root, data)
}

// Menghapus node dari subtree
func (bst *BST) deleteFromSubtree(node *Node, data int) bool {
    if node == nil {
        return false
    }
    
    if data < node.Data {
        if node.Left != nil && node.Left.Data == data {
            node.Left = bst.deleteNode(node.Left)
            return true
        }
        return bst.deleteFromSubtree(node.Left, data)
    }
    
    if node.Right != nil && node.Right.Data == data {
        node.Right = bst.deleteNode(node.Right)
        return true
    }
    
    return bst.deleteFromSubtree(node.Right, data)
}

// Menghapus node dan mengembalikan node pengganti
func (bst *BST) deleteNode(node *Node) *Node {
    // Node tidak memiliki child
    if node.Left == nil && node.Right == nil {
        return nil
    }
    
    // Node hanya memiliki child kanan
    if node.Left == nil {
        return node.Right
    }
    
    // Node hanya memiliki child kiri
    if node.Right == nil {
        return node.Left
    }
    
    // Node memiliki dua child
    // Cari inorder successor (node terkecil di subtree kanan)
    successor := bst.findMin(node.Right)
    
    // Salin data successor ke node yang akan dihapus
    node.Data = successor.Data
    
    // Hapus successor dari subtree kanan
    node.Right = bst.deleteFromSubtree(node.Right, successor.Data)
    
    return node
}

// Mencari node dengan nilai terkecil
func (bst *BST) findMin(node *Node) *Node {
    current := node
    for current.Left != nil {
        current = current.Left
    }
    return current
}

// Mendapatkan tinggi BST
func (bst *BST) Height() int {
    if bst.Root == nil {
        return 0
    }
    
    return bst.Root.Height()
}

// Mendapatkan jumlah node
func (bst *BST) Count() int {
    if bst.Root == nil {
        return 0
    }
    
    return bst.Root.Count()
}

// Menampilkan BST secara visual (inorder)
func (bst *BST) Display() {
    if bst.Root == nil {
        fmt.Println("Tree is empty")
        return
    }
    
    bst.Root.Display()
    fmt.Println()
}
```

## AVL Tree

### Karakteristik AVL Tree
- **Self-balancing**: Secara otomatis menyeimbangkan diri setelah operasi insert/delete
- **Balance factor**: Selisih tinggi subtree kiri dan kanan (harus antara -1 dan 1)
- **Rotations**: Menggunakan rotasi untuk menyeimbangkan tree
- **Efficient operations**: Semua operasi memiliki kompleksitas waktu O(log n)

### Implementasi AVL Tree
```go
// Implementasi node untuk AVL tree
type AVLNode struct {
    Data    int
    Left    *AVLNode
    Right   *AVLNode
    Height  int
    Balance int
}

// Membuat node AVL baru
func NewAVLNode(data int) *AVLNode {
    return &AVLNode{
        Data:    data,
        Left:    nil,
        Right:   nil,
        Height:  1,
        Balance: 0,
    }
}

// Mendapatkan tinggi node
func getHeight(node *AVLNode) int {
    if node == nil {
        return 0
    }
    return node.Height
}

// Mendapatkan balance factor
func getBalance(node *AVLNode) int {
    if node == nil {
        return 0
    }
    return getHeight(node.Left) - getHeight(node.Right)
}

// Update tinggi dan balance factor
func updateHeightAndBalance(node *AVLNode) {
    if node == nil {
        return
    }
    
    leftHeight := getHeight(node.Left)
    rightHeight := getHeight(node.Right)
    
    if leftHeight > rightHeight {
        node.Height = leftHeight + 1
    } else {
        node.Height = rightHeight + 1
    }
    
    node.Balance = leftHeight - rightHeight
}

// Rotasi kanan
func rightRotate(y *AVLNode) *AVLNode {
    x := y.Left
    T2 := x.Right
    
    x.Right = y
    y.Left = T2
    
    updateHeightAndBalance(y)
    updateHeightAndBalance(x)
    
    return x
}

// Rotasi kiri
func leftRotate(x *AVLNode) *AVLNode {
    y := x.Right
    T2 := y.Left
    
    y.Left = x
    x.Right = T2
    
    updateHeightAndBalance(x)
    updateHeightAndBalance(y)
    
    return y
}

// Implementasi AVL tree
type AVLTree struct {
    Root *AVLNode
}

// Membuat AVL tree baru
func NewAVLTree() *AVLTree {
    return &AVLTree{Root: nil}
}

// Menambah elemen ke AVL tree
func (avl *AVLTree) Insert(data int) {
    avl.Root = avl.insert(avl.Root, data)
}

// Menambah node ke subtree
func (avl *AVLTree) insert(node *AVLNode, data int) *AVLNode {
    // Insert node seperti BST biasa
    if node == nil {
        return NewAVLNode(data)
    }
    
    if data < node.Data {
        node.Left = avl.insert(node.Left, data)
    } else if data > node.Data {
        node.Right = avl.insert(node.Right, data)
    } else {
        // Duplikat tidak diizinkan
        return node
    }
    
    // Update tinggi dan balance factor
    updateHeightAndBalance(node)
    
    // Cek balance factor dan lakukan rotasi jika perlu
    balance := node.Balance
    
    // Left Left Case
    if balance > 1 && data < node.Left.Data {
        return rightRotate(node)
    }
    
    // Right Right Case
    if balance < -1 && data > node.Right.Data {
        return leftRotate(node)
    }
    
    // Left Right Case
    if balance > 1 && data > node.Left.Data {
        node.Left = leftRotate(node.Left)
        return rightRotate(node)
    }
    
    // Right Left Case
    if balance < -1 && data < node.Right.Data {
        node.Right = rightRotate(node.Right)
        return leftRotate(node)
    }
    
    return node
}

// Mencari elemen dalam AVL tree
func (avl *AVLTree) Search(data int) *AVLNode {
    return avl.search(avl.Root, data)
}

// Mencari node dalam subtree
func (avl *AVLTree) search(node *AVLNode, data int) *AVLNode {
    if node == nil || node.Data == data {
        return node
    }
    
    if data < node.Data {
        return avl.search(node.Left, data)
    }
    
    return avl.search(node.Right, data)
}

// Menghapus elemen dari AVL tree
func (avl *AVLTree) Delete(data int) bool {
    if avl.Root == nil {
        return false
    }
    
    var deleted bool
    avl.Root, deleted = avl.delete(avl.Root, data)
    return deleted
}

// Menghapus node dari subtree
func (avl *AVLTree) delete(node *AVLNode, data int) (*AVLNode, bool) {
    if node == nil {
        return nil, false
    }
    
    var deleted bool
    
    if data < node.Data {
        node.Left, deleted = avl.delete(node.Left, data)
    } else if data > node.Data {
        node.Right, deleted = avl.delete(node.Right, data)
    } else {
        // Node yang akan dihapus ditemukan
        deleted = true
        
        // Node tidak memiliki child atau hanya memiliki satu child
        if node.Left == nil || node.Right == nil {
            var temp *AVLNode
            if node.Left == nil {
                temp = node.Right
            } else {
                temp = node.Left
            }
            
            // Tidak ada child
            if temp == nil {
                node = nil
            } else {
                // Satu child
                *node = *temp
            }
        } else {
            // Node memiliki dua child
            // Cari inorder successor
            temp := avl.findMin(node.Right)
            
            // Salin data successor ke node yang akan dihapus
            node.Data = temp.Data
            
            // Hapus successor
            node.Right, _ = avl.delete(node.Right, temp.Data)
        }
    }
    
    // Jika tree kosong setelah penghapusan
    if node == nil {
        return nil, deleted
    }
    
    // Update tinggi dan balance factor
    updateHeightAndBalance(node)
    
    // Cek balance factor dan lakukan rotasi jika perlu
    balance := node.Balance
    
    // Left Left Case
    if balance > 1 && getBalance(node.Left) >= 0 {
        return rightRotate(node), deleted
    }
    
    // Left Right Case
    if balance > 1 && getBalance(node.Left) < 0 {
        node.Left = leftRotate(node.Left)
        return rightRotate(node), deleted
    }
    
    // Right Right Case
    if balance < -1 && getBalance(node.Right) <= 0 {
        return leftRotate(node), deleted
    }
    
    // Right Left Case
    if balance < -1 && getBalance(node.Right) > 0 {
        node.Right = rightRotate(node.Right)
        return leftRotate(node), deleted
    }
    
    return node, deleted
}

// Mencari node dengan nilai terkecil
func (avl *AVLTree) findMin(node *AVLNode) *AVLNode {
    if node == nil || node.Left == nil {
        return node
    }
    
    return avl.findMin(node.Left)
}

// Menampilkan AVL tree secara visual (inorder)
func (avl *AVLTree) Display() {
    if avl.Root == nil {
        fmt.Println("Tree is empty")
        return
    }
    
    avl.inorder(avl.Root)
    fmt.Println()
}

// Traversal inorder
func (avl *AVLTree) inorder(node *AVLNode) {
    if node == nil {
        return
    }
    
    avl.inorder(node.Left)
    fmt.Printf("%d ", node.Data)
    avl.inorder(node.Right)
}
```

## Red-Black Tree

### Karakteristik Red-Black Tree
- **Self-balancing**: Secara otomatis menyeimbangkan diri setelah operasi insert/delete
- **Color property**: Setiap node memiliki warna (merah atau hitam)
- **Five properties**: Memiliki lima properti yang harus dipenuhi
- **Efficient operations**: Semua operasi memiliki kompleksitas waktu O(log n)

### Lima Properti Red-Black Tree
1. Setiap node adalah merah atau hitam
2. Root node selalu hitam
3. Semua leaf node (NIL) adalah hitam
4. Jika node merah, maka kedua child-nya hitam
5. Setiap path dari root ke leaf memiliki jumlah node hitam yang sama

### Implementasi Red-Black Tree
```go
// Warna node
const (
    RED   = true
    BLACK = false
)

// Implementasi node untuk red-black tree
type RBNode struct {
    Data   int
    Left   *RBNode
    Right  *RBNode
    Parent *RBNode
    Color  bool
}

// Membuat node red-black baru
func NewRBNode(data int) *RBNode {
    return &RBNode{
        Data:   data,
        Left:   nil,
        Right:  nil,
        Parent: nil,
        Color:  RED,
    }
}

// Implementasi red-black tree
type RedBlackTree struct {
    Root *RBNode
    NIL  *RBNode
}

// Membuat red-black tree baru
func NewRedBlackTree() *RedBlackTree {
    nilNode := &RBNode{Color: BLACK}
    return &RedBlackTree{
        Root: nilNode,
        NIL:  nilNode,
    }
}

// Rotasi kiri
func (rbt *RedBlackTree) leftRotate(x *RBNode) {
    y := x.Right
    x.Right = y.Left
    
    if y.Left != rbt.NIL {
        y.Left.Parent = x
    }
    
    y.Parent = x.Parent
    
    if x.Parent == rbt.NIL {
        rbt.Root = y
    } else if x == x.Parent.Left {
        x.Parent.Left = y
    } else {
        x.Parent.Right = y
    }
    
    y.Left = x
    x.Parent = y
}

// Rotasi kanan
func (rbt *RedBlackTree) rightRotate(y *RBNode) {
    x := y.Left
    y.Left = x.Right
    
    if x.Right != rbt.NIL {
        x.Right.Parent = y
    }
    
    x.Parent = y.Parent
    
    if y.Parent == rbt.NIL {
        rbt.Root = x
    } else if y == y.Parent.Right {
        y.Parent.Right = x
    } else {
        y.Parent.Left = x
    }
    
    x.Right = y
    y.Parent = x
}

// Menambah elemen ke red-black tree
func (rbt *RedBlackTree) Insert(data int) {
    z := NewRBNode(data)
    y := rbt.NIL
    x := rbt.Root
    
    // Cari posisi untuk insert
    for x != rbt.NIL {
        y = x
        if z.Data < x.Data {
            x = x.Left
        } else {
            x = x.Right
        }
    }
    
    z.Parent = y
    
    if y == rbt.NIL {
        rbt.Root = z
    } else if z.Data < y.Data {
        y.Left = z
    } else {
        y.Right = z
    }
    
    z.Left = rbt.NIL
    z.Right = rbt.NIL
    z.Color = RED
    
    rbt.insertFixup(z)
}

// Memperbaiki properti red-black tree setelah insert
func (rbt *RedBlackTree) insertFixup(z *RBNode) {
    for z.Parent.Color == RED {
        if z.Parent == z.Parent.Parent.Left {
            y := z.Parent.Parent.Right
            
            if y.Color == RED {
                z.Parent.Color = BLACK
                y.Color = BLACK
                z.Parent.Parent.Color = RED
                z = z.Parent.Parent
            } else {
                if z == z.Parent.Right {
                    z = z.Parent
                    rbt.leftRotate(z)
                }
                
                z.Parent.Color = BLACK
                z.Parent.Parent.Color = RED
                rbt.rightRotate(z.Parent.Parent)
            }
        } else {
            y := z.Parent.Parent.Left
            
            if y.Color == RED {
                z.Parent.Color = BLACK
                y.Color = BLACK
                z.Parent.Parent.Color = RED
                z = z.Parent.Parent
            } else {
                if z == z.Parent.Left {
                    z = z.Parent
                    rbt.rightRotate(z)
                }
                
                z.Parent.Color = BLACK
                z.Parent.Parent.Color = RED
                rbt.leftRotate(z.Parent.Parent)
            }
        }
        
        if z == rbt.Root {
            break
        }
    }
    
    rbt.Root.Color = BLACK
}

// Mencari elemen dalam red-black tree
func (rbt *RedBlackTree) Search(data int) *RBNode {
    return rbt.search(rbt.Root, data)
}

// Mencari node dalam subtree
func (rbt *RedBlackTree) search(node *RBNode, data int) *RBNode {
    if node == rbt.NIL || data == node.Data {
        return node
    }
    
    if data < node.Data {
        return rbt.search(node.Left, data)
    }
    
    return rbt.search(node.Right, data)
}

// Menampilkan red-black tree secara visual (inorder)
func (rbt *RedBlackTree) Display() {
    if rbt.Root == rbt.NIL {
        fmt.Println("Tree is empty")
        return
    }
    
    rbt.inorder(rbt.Root)
    fmt.Println()
}

// Traversal inorder
func (rbt *RedBlackTree) inorder(node *RBNode) {
    if node == rbt.NIL {
        return
    }
    
    rbt.inorder(node.Left)
    color := "BLACK"
    if node.Color == RED {
        color = "RED"
    }
    fmt.Printf("%d(%s) ", node.Data, color)
    rbt.inorder(node.Right)
}
```

## Tree Traversal

### Jenis-jenis Traversal
- **Inorder**: Left -> Root -> Right
- **Preorder**: Root -> Left -> Right
- **Postorder**: Left -> Right -> Root
- **Level-order**: Level by level, dari kiri ke kanan

### Implementasi Tree Traversal
```go
// Implementasi tree traversal
type Tree struct {
    Root *Node
}

// Membuat tree baru
func NewTree() *Tree {
    return &Tree{Root: nil}
}

// Inorder traversal
func (t *Tree) Inorder() {
    t.inorder(t.Root)
    fmt.Println()
}

func (t *Tree) inorder(node *Node) {
    if node == nil {
        return
    }
    
    t.inorder(node.Left)
    fmt.Printf("%d ", node.Data)
    t.inorder(node.Right)
}

// Preorder traversal
func (t *Tree) Preorder() {
    t.preorder(t.Root)
    fmt.Println()
}

func (t *Tree) preorder(node *Node) {
    if node == nil {
        return
    }
    
    fmt.Printf("%d ", node.Data)
    t.preorder(node.Left)
    t.preorder(node.Right)
}

// Postorder traversal
func (t *Tree) Postorder() {
    t.postorder(t.Root)
    fmt.Println()
}

func (t *Tree) postorder(node *Node) {
    if node == nil {
        return
    }
    
    t.postorder(node.Left)
    t.postorder(node.Right)
    fmt.Printf("%d ", node.Data)
}

// Level-order traversal (BFS)
func (t *Tree) LevelOrder() {
    if t.Root == nil {
        fmt.Println("Tree is empty")
        return
    }
    
    queue := make([]*Node, 0)
    queue = append(queue, t.Root)
    
    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        
        fmt.Printf("%d ", node.Data)
        
        if node.Left != nil {
            queue = append(queue, node.Left)
        }
        
        if node.Right != nil {
            queue = append(queue, node.Right)
        }
    }
    
    fmt.Println()
}

// Contoh penggunaan
func main() {
    // Membuat tree
    tree := NewTree()
    tree.Root = NewNode(1)
    tree.Root.Left = NewNode(2)
    tree.Root.Right = NewNode(3)
    tree.Root.Left.Left = NewNode(4)
    tree.Root.Left.Right = NewNode(5)
    tree.Root.Right.Left = NewNode(6)
    tree.Root.Right.Right = NewNode(7)
    
    // Traversal
    fmt.Print("Inorder traversal: ")
    tree.Inorder() // 4 2 5 1 6 3 7
    
    fmt.Print("Preorder traversal: ")
    tree.Preorder() // 1 2 4 5 3 6 7
    
    fmt.Print("Postorder traversal: ")
    tree.Postorder() // 4 5 2 6 7 3 1
    
    fmt.Print("Level-order traversal: ")
    tree.LevelOrder() // 1 2 3 4 5 6 7
}
```

## Aplikasi Tree
- **File system**: Mengorganisir file dan direktori
- **Database indexing**: Mengimplementasikan indeks untuk pencarian cepat
- **Expression evaluation**: Mengevaluasi ekspresi matematika
- **Decision making**: Mengimplementasikan pohon keputusan
- **Compression**: Mengimplementasikan algoritma Huffman
- **Game AI**: Mengimplementasikan algoritma minimax

## Kesimpulan

Tree adalah struktur data yang sangat penting dan serbaguna dalam pengembangan perangkat lunak. Binary tree adalah bentuk dasar, sementara binary search tree menambahkan properti pengurutan untuk pencarian yang efisien. AVL tree dan red-black tree adalah variasi self-balancing yang menjaga keseimbangan tree untuk operasi yang optimal. Tree traversal adalah teknik penting untuk mengakses dan memproses data dalam tree. Memahami implementasi dan penggunaan berbagai jenis tree sangat penting untuk pengembangan algoritma dan aplikasi yang efisien.
```