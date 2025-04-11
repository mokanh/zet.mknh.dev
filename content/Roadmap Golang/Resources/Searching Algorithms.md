# Searching Algorithms

Searching algorithms adalah algoritma yang digunakan untuk menemukan elemen tertentu dalam kumpulan data. Pemilihan algoritma pencarian yang tepat sangat penting untuk performa aplikasi.

## Linear Search

### Karakteristik Linear Search
- **Kompleksitas waktu**: O(n) untuk semua kasus
- **Kompleksitas ruang**: O(1)
- **Cocok untuk**: Data tidak terurut atau data terurut
- **Keuntungan**: Sederhana, dapat menemukan elemen pertama yang cocok
- **Kerugian**: Tidak efisien untuk data besar

### Implementasi Linear Search
```go
// Implementasi linear search
func LinearSearch(arr []int, target int) int {
    for i := 0; i < len(arr); i++ {
        if arr[i] == target {
            return i
        }
    }
    return -1 // Elemen tidak ditemukan
}

// Implementasi linear search dengan generic type
func LinearSearchGeneric[T comparable](arr []T, target T) int {
    for i := 0; i < len(arr); i++ {
        if arr[i] == target {
            return i
        }
    }
    return -1 // Elemen tidak ditemukan
}

// Implementasi linear search dengan custom comparator
func LinearSearchWithComparator[T any](arr []T, target T, equal func(a, b T) bool) int {
    for i := 0; i < len(arr); i++ {
        if equal(arr[i], target) {
            return i
        }
    }
    return -1 // Elemen tidak ditemukan
}

// Implementasi linear search untuk menemukan semua kemunculan
func LinearSearchAll(arr []int, target int) []int {
    indices := make([]int, 0)
    for i := 0; i < len(arr); i++ {
        if arr[i] == target {
            indices = append(indices, i)
        }
    }
    return indices
}

// Implementasi linear search untuk menemukan semua kemunculan dengan generic type
func LinearSearchAllGeneric[T comparable](arr []T, target T) []int {
    indices := make([]int, 0)
    for i := 0; i < len(arr); i++ {
        if arr[i] == target {
            indices = append(indices, i)
        }
    }
    return indices
}

// Implementasi linear search untuk menemukan semua kemunculan dengan custom comparator
func LinearSearchAllWithComparator[T any](arr []T, target T, equal func(a, b T) bool) []int {
    indices := make([]int, 0)
    for i := 0; i < len(arr); i++ {
        if equal(arr[i], target) {
            indices = append(indices, i)
        }
    }
    return indices
}
```

## Binary Search

### Karakteristik Binary Search
- **Kompleksitas waktu**: O(log n) untuk semua kasus
- **Kompleksitas ruang**: O(1) untuk iteratif, O(log n) untuk rekursif
- **Cocok untuk**: Data terurut
- **Keuntungan**: Sangat efisien untuk data besar
- **Kerugian**: Hanya bekerja pada data terurut

### Implementasi Binary Search
```go
// Implementasi binary search iteratif
func BinarySearch(arr []int, target int) int {
    left := 0
    right := len(arr) - 1
    
    for left <= right {
        mid := (left + right) / 2
        
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    
    return -1 // Elemen tidak ditemukan
}

// Implementasi binary search rekursif
func BinarySearchRecursive(arr []int, target int) int {
    return binarySearchHelper(arr, target, 0, len(arr)-1)
}

// Helper function untuk binary search rekursif
func binarySearchHelper(arr []int, target, left, right int) int {
    if left > right {
        return -1 // Elemen tidak ditemukan
    }
    
    mid := (left + right) / 2
    
    if arr[mid] == target {
        return mid
    } else if arr[mid] < target {
        return binarySearchHelper(arr, target, mid+1, right)
    } else {
        return binarySearchHelper(arr, target, left, mid-1)
    }
}

// Implementasi binary search dengan generic type
func BinarySearchGeneric[T constraints.Ordered](arr []T, target T) int {
    left := 0
    right := len(arr) - 1
    
    for left <= right {
        mid := (left + right) / 2
        
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    
    return -1 // Elemen tidak ditemukan
}

// Implementasi binary search dengan custom comparator
func BinarySearchWithComparator[T any](arr []T, target T, less func(a, b T) bool, equal func(a, b T) bool) int {
    left := 0
    right := len(arr) - 1
    
    for left <= right {
        mid := (left + right) / 2
        
        if equal(arr[mid], target) {
            return mid
        } else if less(arr[mid], target) {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    
    return -1 // Elemen tidak ditemukan
}

// Implementasi binary search untuk menemukan elemen pertama yang cocok
func BinarySearchFirst(arr []int, target int) int {
    left := 0
    right := len(arr) - 1
    result := -1
    
    for left <= right {
        mid := (left + right) / 2
        
        if arr[mid] == target {
            result = mid
            right = mid - 1 // Cari elemen pertama
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    
    return result
}

// Implementasi binary search untuk menemukan elemen terakhir yang cocok
func BinarySearchLast(arr []int, target int) int {
    left := 0
    right := len(arr) - 1
    result := -1
    
    for left <= right {
        mid := (left + right) / 2
        
        if arr[mid] == target {
            result = mid
            left = mid + 1 // Cari elemen terakhir
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    
    return result
}

// Implementasi binary search untuk menemukan elemen terkecil yang lebih besar dari target
func BinarySearchUpperBound(arr []int, target int) int {
    left := 0
    right := len(arr)
    
    for left < right {
        mid := (left + right) / 2
        
        if arr[mid] <= target {
            left = mid + 1
        } else {
            right = mid
        }
    }
    
    if left < len(arr) {
        return left
    }
    return -1 // Tidak ada elemen yang lebih besar
}

// Implementasi binary search untuk menemukan elemen terbesar yang lebih kecil dari target
func BinarySearchLowerBound(arr []int, target int) int {
    left := 0
    right := len(arr)
    
    for left < right {
        mid := (left + right) / 2
        
        if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid
        }
    }
    
    if left > 0 {
        return left - 1
    }
    return -1 // Tidak ada elemen yang lebih kecil
}
```

## Depth-First Search (DFS)

### Karakteristik DFS
- **Kompleksitas waktu**: O(V + E) untuk graph, O(n) untuk tree
- **Kompleksitas ruang**: O(V) untuk graph, O(h) untuk tree (h adalah tinggi tree)
- **Cocok untuk**: Mencari path, komponen terhubung, cycle detection
- **Keuntungan**: Menggunakan memori lebih sedikit dibanding BFS
- **Kerugian**: Tidak menjamin path terpendek

### Implementasi DFS
```go
// Implementasi DFS untuk graph menggunakan adjacency list
func DFS(graph map[int][]int, start int) []int {
    visited := make(map[int]bool)
    result := make([]int, 0)
    
    dfsHelper(graph, start, visited, &result)
    
    return result
}

// Helper function untuk DFS
func dfsHelper(graph map[int][]int, vertex int, visited map[int]bool, result *[]int) {
    visited[vertex] = true
    *result = append(*result, vertex)
    
    for _, neighbor := range graph[vertex] {
        if !visited[neighbor] {
            dfsHelper(graph, neighbor, visited, result)
        }
    }
}

// Implementasi DFS iteratif menggunakan stack
func DFSIterative(graph map[int][]int, start int) []int {
    visited := make(map[int]bool)
    result := make([]int, 0)
    stack := make([]int, 0)
    
    stack = append(stack, start)
    
    for len(stack) > 0 {
        vertex := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        
        if !visited[vertex] {
            visited[vertex] = true
            result = append(result, vertex)
            
            // Push neighbors in reverse order to maintain DFS order
            for i := len(graph[vertex]) - 1; i >= 0; i-- {
                neighbor := graph[vertex][i]
                if !visited[neighbor] {
                    stack = append(stack, neighbor)
                }
            }
        }
    }
    
    return result
}

// Implementasi DFS untuk tree
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

// Implementasi DFS untuk tree (in-order traversal)
func DFSInOrder(root *TreeNode) []int {
    result := make([]int, 0)
    dfsInOrderHelper(root, &result)
    return result
}

// Helper function untuk in-order traversal
func dfsInOrderHelper(node *TreeNode, result *[]int) {
    if node == nil {
        return
    }
    
    dfsInOrderHelper(node.Left, result)
    *result = append(*result, node.Val)
    dfsInOrderHelper(node.Right, result)
}

// Implementasi DFS untuk tree (pre-order traversal)
func DFSPreOrder(root *TreeNode) []int {
    result := make([]int, 0)
    dfsPreOrderHelper(root, &result)
    return result
}

// Helper function untuk pre-order traversal
func dfsPreOrderHelper(node *TreeNode, result *[]int) {
    if node == nil {
        return
    }
    
    *result = append(*result, node.Val)
    dfsPreOrderHelper(node.Left, result)
    dfsPreOrderHelper(node.Right, result)
}

// Implementasi DFS untuk tree (post-order traversal)
func DFSPostOrder(root *TreeNode) []int {
    result := make([]int, 0)
    dfsPostOrderHelper(root, &result)
    return result
}

// Helper function untuk post-order traversal
func dfsPostOrderHelper(node *TreeNode, result *[]int) {
    if node == nil {
        return
    }
    
    dfsPostOrderHelper(node.Left, result)
    dfsPostOrderHelper(node.Right, result)
    *result = append(*result, node.Val)
}

// Implementasi DFS untuk mencari path dari start ke end dalam graph
func DFSPath(graph map[int][]int, start, end int) []int {
    visited := make(map[int]bool)
    path := make([]int, 0)
    
    if dfsPathHelper(graph, start, end, visited, &path) {
        // Reverse path untuk mendapatkan path dari start ke end
        for i, j := 0, len(path)-1; i < j; i, j = i+1, j-1 {
            path[i], path[j] = path[j], path[i]
        }
        return path
    }
    
    return []int{} // Tidak ada path
}

// Helper function untuk mencari path
func dfsPathHelper(graph map[int][]int, current, end int, visited map[int]bool, path *[]int) bool {
    visited[current] = true
    *path = append(*path, current)
    
    if current == end {
        return true
    }
    
    for _, neighbor := range graph[current] {
        if !visited[neighbor] {
            if dfsPathHelper(graph, neighbor, end, visited, path) {
                return true
            }
        }
    }
    
    // Backtrack
    *path = (*path)[:len(*path)-1]
    return false
}
```

## Breadth-First Search (BFS)

### Karakteristik BFS
- **Kompleksitas waktu**: O(V + E) untuk graph, O(n) untuk tree
- **Kompleksitas ruang**: O(V) untuk graph, O(w) untuk tree (w adalah lebar maksimum tree)
- **Cocok untuk**: Shortest path (unweighted), level-order traversal
- **Keuntungan**: Menjamin path terpendek untuk unweighted graph
- **Kerugian**: Menggunakan memori lebih banyak dibanding DFS

### Implementasi BFS
```go
// Implementasi BFS untuk graph menggunakan adjacency list
func BFS(graph map[int][]int, start int) []int {
    visited := make(map[int]bool)
    result := make([]int, 0)
    queue := make([]int, 0)
    
    visited[start] = true
    queue = append(queue, start)
    
    for len(queue) > 0 {
        vertex := queue[0]
        queue = queue[1:]
        
        result = append(result, vertex)
        
        for _, neighbor := range graph[vertex] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
    
    return result
}

// Implementasi BFS dengan level tracking
func BFSWithLevel(graph map[int][]int, start int) map[int]int {
    visited := make(map[int]bool)
    levels := make(map[int]int)
    queue := make([]int, 0)
    
    visited[start] = true
    levels[start] = 0
    queue = append(queue, start)
    
    for len(queue) > 0 {
        vertex := queue[0]
        queue = queue[1:]
        
        for _, neighbor := range graph[vertex] {
            if !visited[neighbor] {
                visited[neighbor] = true
                levels[neighbor] = levels[vertex] + 1
                queue = append(queue, neighbor)
            }
        }
    }
    
    return levels
}

// Implementasi BFS untuk tree (level-order traversal)
func BFSLevelOrder(root *TreeNode) [][]int {
    if root == nil {
        return [][]int{}
    }
    
    result := make([][]int, 0)
    queue := make([]*TreeNode, 0)
    
    queue = append(queue, root)
    
    for len(queue) > 0 {
        levelSize := len(queue)
        level := make([]int, 0, levelSize)
        
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            
            level = append(level, node.Val)
            
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
        
        result = append(result, level)
    }
    
    return result
}

// Implementasi BFS untuk mencari path terpendek dari start ke end dalam unweighted graph
func BFSShortestPath(graph map[int][]int, start, end int) []int {
    visited := make(map[int]bool)
    parent := make(map[int]int)
    queue := make([]int, 0)
    
    visited[start] = true
    queue = append(queue, start)
    
    for len(queue) > 0 {
        vertex := queue[0]
        queue = queue[1:]
        
        if vertex == end {
            // Reconstruct path
            path := make([]int, 0)
            current := end
            
            for current != start {
                path = append([]int{current}, path...)
                current = parent[current]
            }
            path = append([]int{start}, path...)
            
            return path
        }
        
        for _, neighbor := range graph[vertex] {
            if !visited[neighbor] {
                visited[neighbor] = true
                parent[neighbor] = vertex
                queue = append(queue, neighbor)
            }
        }
    }
    
    return []int{} // Tidak ada path
}

// Implementasi BFS untuk mencari semua node dalam level tertentu
func BFSLevelNodes(graph map[int][]int, start int, targetLevel int) []int {
    visited := make(map[int]bool)
    levels := make(map[int]int)
    queue := make([]int, 0)
    
    visited[start] = true
    levels[start] = 0
    queue = append(queue, start)
    
    result := make([]int, 0)
    
    for len(queue) > 0 {
        vertex := queue[0]
        queue = queue[1:]
        
        if levels[vertex] == targetLevel {
            result = append(result, vertex)
        }
        
        for _, neighbor := range graph[vertex] {
            if !visited[neighbor] {
                visited[neighbor] = true
                levels[neighbor] = levels[vertex] + 1
                queue = append(queue, neighbor)
            }
        }
    }
    
    return result
}
```

## Aplikasi Searching Algorithms
- **Database querying**: Mencari record dalam database
- **Text processing**: Mencari substring dalam teks
- **Network routing**: Mencari path dalam jaringan
- **Game AI**: Pathfinding, decision making
- **Web crawling**: Menjelajahi halaman web
- **File systems**: Mencari file dalam direktori
- **Compression**: Mencari pattern untuk kompresi
- **Security**: Mencari pattern untuk deteksi anomali

## Kesimpulan

Searching algorithms adalah algoritma fundamental dalam pengembangan perangkat lunak. Pemilihan algoritma pencarian yang tepat tergantung pada karakteristik data dan kebutuhan aplikasi. Linear search cocok untuk data tidak terurut atau data kecil, sementara binary search sangat efisien untuk data terurut. DFS dan BFS adalah algoritma pencarian untuk struktur data graph dan tree, dengan aplikasi yang berbeda-beda. Memahami implementasi dan penggunaan berbagai algoritma pencarian sangat penting untuk pengembangan aplikasi yang efisien.