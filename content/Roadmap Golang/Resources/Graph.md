# Graph

Graph adalah struktur data yang terdiri dari himpunan node (vertex) dan edge yang menghubungkan node-node tersebut. Graph sangat penting dalam pemodelan berbagai masalah dunia nyata seperti jaringan sosial, rute navigasi, dan dependensi antar komponen.

## Directed dan Undirected Graph

### Karakteristik Graph
- **Vertex (Node)**: Titik dalam graph yang menyimpan data
- **Edge**: Hubungan antar vertex
- **Directed Graph**: Edge memiliki arah (one-way)
- **Undirected Graph**: Edge tidak memiliki arah (two-way)
- **Weighted Graph**: Edge memiliki nilai (weight)
- **Unweighted Graph**: Edge tidak memiliki nilai

### Implementasi Graph
```go
// Implementasi graph menggunakan adjacency list
type Graph struct {
    Vertices map[int]*Vertex
    Directed bool
}

// Vertex dalam graph
type Vertex struct {
    Key       int
    Adjacent  map[int]*Vertex
    Visited   bool
    Distance  int
    Parent    *Vertex
}

// Membuat graph baru
func NewGraph(directed bool) *Graph {
    return &Graph{
        Vertices: make(map[int]*Vertex),
        Directed: directed,
    }
}

// Membuat vertex baru
func NewVertex(key int) *Vertex {
    return &Vertex{
        Key:      key,
        Adjacent: make(map[int]*Vertex),
        Visited:  false,
        Distance: 0,
        Parent:   nil,
    }
}

// Menambah vertex ke graph
func (g *Graph) AddVertex(key int) {
    if _, exists := g.Vertices[key]; !exists {
        g.Vertices[key] = NewVertex(key)
    }
}

// Menambah edge ke graph
func (g *Graph) AddEdge(from, to int) {
    // Pastikan vertex ada
    if _, exists := g.Vertices[from]; !exists {
        g.AddVertex(from)
    }
    if _, exists := g.Vertices[to]; !exists {
        g.AddVertex(to)
    }
    
    // Tambah edge
    g.Vertices[from].Adjacent[to] = g.Vertices[to]
    
    // Jika undirected, tambah edge balik
    if !g.Directed {
        g.Vertices[to].Adjacent[from] = g.Vertices[from]
    }
}

// Menambah weighted edge ke graph
func (g *Graph) AddWeightedEdge(from, to, weight int) {
    // Pastikan vertex ada
    if _, exists := g.Vertices[from]; !exists {
        g.AddVertex(from)
    }
    if _, exists := g.Vertices[to]; !exists {
        g.AddVertex(to)
    }
    
    // Tambah edge dengan weight
    g.Vertices[from].Adjacent[to] = g.Vertices[to]
    g.Vertices[from].Distance = weight
    
    // Jika undirected, tambah edge balik
    if !g.Directed {
        g.Vertices[to].Adjacent[from] = g.Vertices[from]
        g.Vertices[to].Distance = weight
    }
}

// Menghapus vertex dari graph
func (g *Graph) RemoveVertex(key int) {
    // Hapus semua edge yang mengarah ke vertex
    for _, v := range g.Vertices {
        delete(v.Adjacent, key)
    }
    
    // Hapus vertex
    delete(g.Vertices, key)
}

// Menghapus edge dari graph
func (g *Graph) RemoveEdge(from, to int) {
    if v, exists := g.Vertices[from]; exists {
        delete(v.Adjacent, to)
    }
    
    // Jika undirected, hapus edge balik
    if !g.Directed {
        if v, exists := g.Vertices[to]; exists {
            delete(v.Adjacent, from)
        }
    }
}

// Mendapatkan semua vertex dalam graph
func (g *Graph) GetVertices() []int {
    vertices := make([]int, 0, len(g.Vertices))
    for k := range g.Vertices {
        vertices = append(vertices, k)
    }
    return vertices
}

// Mendapatkan semua edge dalam graph
func (g *Graph) GetEdges() [][2]int {
    edges := make([][2]int, 0)
    for _, v := range g.Vertices {
        for k := range v.Adjacent {
            edges = append(edges, [2]int{v.Key, k})
        }
    }
    return edges
}

// Mendapatkan derajat vertex (jumlah edge yang terhubung)
func (g *Graph) GetDegree(key int) int {
    if v, exists := g.Vertices[key]; exists {
        return len(v.Adjacent)
    }
    return 0
}

// Mendapatkan derajat masuk (in-degree) untuk directed graph
func (g *Graph) GetInDegree(key int) int {
    if !g.Directed {
        return g.GetDegree(key)
    }
    
    inDegree := 0
    for _, v := range g.Vertices {
        if _, exists := v.Adjacent[key]; exists {
            inDegree++
        }
    }
    return inDegree
}

// Mendapatkan derajat keluar (out-degree) untuk directed graph
func (g *Graph) GetOutDegree(key int) int {
    if v, exists := g.Vertices[key]; exists {
        return len(v.Adjacent)
    }
    return 0
}

// Menampilkan graph secara visual
func (g *Graph) Display() {
    for _, v := range g.Vertices {
        fmt.Printf("Vertex %d: ", v.Key)
        for k := range v.Adjacent {
            fmt.Printf("%d ", k)
        }
        fmt.Println()
    }
}
```

## Graph Representation

### Adjacency List
- **Struktur**: Map dari vertex ke list vertex yang terhubung
- **Kompleksitas ruang**: O(V + E)
- **Kompleksitas waktu untuk mencari edge**: O(degree)
- **Cocok untuk**: Graph sparse (sedikit edge)

### Adjacency Matrix
- **Struktur**: Matrix V x V dengan nilai 1 jika ada edge, 0 jika tidak
- **Kompleksitas ruang**: O(V²)
- **Kompleksitas waktu untuk mencari edge**: O(1)
- **Cocok untuk**: Graph dense (banyak edge)

### Implementasi Adjacency Matrix
```go
// Implementasi graph menggunakan adjacency matrix
type MatrixGraph struct {
    Matrix   [][]int
    Vertices int
    Directed bool
}

// Membuat matrix graph baru
func NewMatrixGraph(vertices int, directed bool) *MatrixGraph {
    // Inisialisasi matrix dengan nilai 0
    matrix := make([][]int, vertices)
    for i := range matrix {
        matrix[i] = make([]int, vertices)
    }
    
    return &MatrixGraph{
        Matrix:   matrix,
        Vertices: vertices,
        Directed: directed,
    }
}

// Menambah edge ke graph
func (g *MatrixGraph) AddEdge(from, to int) {
    if from >= 0 && from < g.Vertices && to >= 0 && to < g.Vertices {
        g.Matrix[from][to] = 1
        
        // Jika undirected, tambah edge balik
        if !g.Directed {
            g.Matrix[to][from] = 1
        }
    }
}

// Menambah weighted edge ke graph
func (g *MatrixGraph) AddWeightedEdge(from, to, weight int) {
    if from >= 0 && from < g.Vertices && to >= 0 && to < g.Vertices {
        g.Matrix[from][to] = weight
        
        // Jika undirected, tambah edge balik
        if !g.Directed {
            g.Matrix[to][from] = weight
        }
    }
}

// Menghapus edge dari graph
func (g *MatrixGraph) RemoveEdge(from, to int) {
    if from >= 0 && from < g.Vertices && to >= 0 && to < g.Vertices {
        g.Matrix[from][to] = 0
        
        // Jika undirected, hapus edge balik
        if !g.Directed {
            g.Matrix[to][from] = 0
        }
    }
}

// Mendapatkan derajat vertex
func (g *MatrixGraph) GetDegree(vertex int) int {
    if vertex < 0 || vertex >= g.Vertices {
        return 0
    }
    
    degree := 0
    for i := 0; i < g.Vertices; i++ {
        if g.Matrix[vertex][i] != 0 {
            degree++
        }
    }
    
    return degree
}

// Mendapatkan derajat masuk (in-degree) untuk directed graph
func (g *MatrixGraph) GetInDegree(vertex int) int {
    if !g.Directed {
        return g.GetDegree(vertex)
    }
    
    if vertex < 0 || vertex >= g.Vertices {
        return 0
    }
    
    inDegree := 0
    for i := 0; i < g.Vertices; i++ {
        if g.Matrix[i][vertex] != 0 {
            inDegree++
        }
    }
    
    return inDegree
}

// Mendapatkan derajat keluar (out-degree) untuk directed graph
func (g *MatrixGraph) GetOutDegree(vertex int) int {
    if vertex < 0 || vertex >= g.Vertices {
        return 0
    }
    
    outDegree := 0
    for i := 0; i < g.Vertices; i++ {
        if g.Matrix[vertex][i] != 0 {
            outDegree++
        }
    }
    
    return outDegree
}

// Menampilkan graph secara visual
func (g *MatrixGraph) Display() {
    for i := 0; i < g.Vertices; i++ {
        for j := 0; j < g.Vertices; j++ {
            fmt.Printf("%d ", g.Matrix[i][j])
        }
        fmt.Println()
    }
}
```

## Graph Traversal

### Depth-First Search (DFS)
- **Algoritma**: Menjelajahi graph sedalam mungkin sebelum backtrack
- **Implementasi**: Menggunakan stack (rekursif atau iteratif)
- **Kompleksitas waktu**: O(V + E)
- **Aplikasi**: Mencari path, komponen terhubung, cycle detection

### Breadth-First Search (BFS)
- **Algoritma**: Menjelajahi graph level by level
- **Implementasi**: Menggunakan queue
- **Kompleksitas waktu**: O(V + E)
- **Aplikasi**: Shortest path (unweighted), level-order traversal

### Implementasi DFS dan BFS
```go
// Implementasi DFS (Depth-First Search)
func (g *Graph) DFS(start int) []int {
    // Reset visited status
    for _, v := range g.Vertices {
        v.Visited = false
    }
    
    result := make([]int, 0)
    g.dfsHelper(g.Vertices[start], &result)
    
    return result
}

// Helper function untuk DFS
func (g *Graph) dfsHelper(vertex *Vertex, result *[]int) {
    if vertex == nil || vertex.Visited {
        return
    }
    
    // Mark vertex as visited
    vertex.Visited = true
    *result = append(*result, vertex.Key)
    
    // Visit all adjacent vertices
    for _, adj := range vertex.Adjacent {
        g.dfsHelper(adj, result)
    }
}

// Implementasi DFS iteratif menggunakan stack
func (g *Graph) DFSIterative(start int) []int {
    // Reset visited status
    for _, v := range g.Vertices {
        v.Visited = false
    }
    
    result := make([]int, 0)
    stack := make([]*Vertex, 0)
    
    // Push start vertex to stack
    startVertex := g.Vertices[start]
    stack = append(stack, startVertex)
    
    for len(stack) > 0 {
        // Pop vertex from stack
        vertex := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        
        if !vertex.Visited {
            // Mark vertex as visited
            vertex.Visited = true
            result = append(result, vertex.Key)
            
            // Push all unvisited adjacent vertices to stack
            // Push in reverse order to maintain DFS order
            adjList := make([]*Vertex, 0)
            for _, adj := range vertex.Adjacent {
                if !adj.Visited {
                    adjList = append(adjList, adj)
                }
            }
            
            // Reverse the list to maintain DFS order
            for i := len(adjList) - 1; i >= 0; i-- {
                stack = append(stack, adjList[i])
            }
        }
    }
    
    return result
}

// Implementasi BFS (Breadth-First Search)
func (g *Graph) BFS(start int) []int {
    // Reset visited status
    for _, v := range g.Vertices {
        v.Visited = false
    }
    
    result := make([]int, 0)
    queue := make([]*Vertex, 0)
    
    // Enqueue start vertex
    startVertex := g.Vertices[start]
    startVertex.Visited = true
    queue = append(queue, startVertex)
    
    for len(queue) > 0 {
        // Dequeue vertex
        vertex := queue[0]
        queue = queue[1:]
        
        // Add vertex to result
        result = append(result, vertex.Key)
        
        // Enqueue all unvisited adjacent vertices
        for _, adj := range vertex.Adjacent {
            if !adj.Visited {
                adj.Visited = true
                queue = append(queue, adj)
            }
        }
    }
    
    return result
}

// Implementasi BFS dengan level tracking
func (g *Graph) BFSWithLevel(start int) map[int]int {
    // Reset visited status
    for _, v := range g.Vertices {
        v.Visited = false
        v.Distance = 0
    }
    
    levels := make(map[int]int)
    queue := make([]*Vertex, 0)
    
    // Enqueue start vertex
    startVertex := g.Vertices[start]
    startVertex.Visited = true
    startVertex.Distance = 0
    queue = append(queue, startVertex)
    
    for len(queue) > 0 {
        // Dequeue vertex
        vertex := queue[0]
        queue = queue[1:]
        
        // Add vertex to levels
        levels[vertex.Key] = vertex.Distance
        
        // Enqueue all unvisited adjacent vertices
        for _, adj := range vertex.Adjacent {
            if !adj.Visited {
                adj.Visited = true
                adj.Distance = vertex.Distance + 1
                queue = append(queue, adj)
            }
        }
    }
    
    return levels
}

// Implementasi BFS untuk mencari path dari start ke end
func (g *Graph) BFSPath(start, end int) []int {
    // Reset visited status
    for _, v := range g.Vertices {
        v.Visited = false
        v.Parent = nil
    }
    
    queue := make([]*Vertex, 0)
    
    // Enqueue start vertex
    startVertex := g.Vertices[start]
    startVertex.Visited = true
    queue = append(queue, startVertex)
    
    var endVertex *Vertex = nil
    
    for len(queue) > 0 && endVertex == nil {
        // Dequeue vertex
        vertex := queue[0]
        queue = queue[1:]
        
        // Check if we reached the end vertex
        if vertex.Key == end {
            endVertex = vertex
            break
        }
        
        // Enqueue all unvisited adjacent vertices
        for _, adj := range vertex.Adjacent {
            if !adj.Visited {
                adj.Visited = true
                adj.Parent = vertex
                queue = append(queue, adj)
            }
        }
    }
    
    // If end vertex was found, reconstruct path
    if endVertex != nil {
        path := make([]int, 0)
        current := endVertex
        
        for current != nil {
            path = append([]int{current.Key}, path...)
            current = current.Parent
        }
        
        return path
    }
    
    // No path found
    return []int{}
}
```

## Shortest Path Algorithms

### Dijkstra's Algorithm
- **Algoritma**: Mencari shortest path dari source ke semua vertex dalam weighted graph
- **Kompleksitas waktu**: O(V²) dengan array, O(E log V) dengan priority queue
- **Batasan**: Tidak bisa menangani negative weight
- **Aplikasi**: Navigasi, routing, network optimization

### Bellman-Ford Algorithm
- **Algoritma**: Mencari shortest path dari source ke semua vertex dalam weighted graph
- **Kompleksitas waktu**: O(VE)
- **Keunggulan**: Bisa menangani negative weight, mendeteksi negative cycle
- **Aplikasi**: Arbitrage detection, network routing

### Floyd-Warshall Algorithm
- **Algoritma**: Mencari shortest path antara semua pasangan vertex
- **Kompleksitas waktu**: O(V³)
- **Keunggulan**: Bisa menangani negative weight, mendeteksi negative cycle
- **Aplikasi**: All-pairs shortest path, transitive closure

### Implementasi Shortest Path Algorithms
```go
// Implementasi Dijkstra's Algorithm
func (g *Graph) Dijkstra(start int) map[int]int {
    // Inisialisasi
    distances := make(map[int]int)
    visited := make(map[int]bool)
    
    // Set semua jarak ke infinity kecuali start
    for k := range g.Vertices {
        distances[k] = math.MaxInt32
    }
    distances[start] = 0
    
    // Loop sampai semua vertex dikunjungi
    for len(visited) < len(g.Vertices) {
        // Cari vertex dengan jarak terkecil yang belum dikunjungi
        minDist := math.MaxInt32
        var minVertex *Vertex
        
        for k, v := range g.Vertices {
            if !visited[k] && distances[k] < minDist {
                minDist = distances[k]
                minVertex = v
            }
        }
        
        // Jika tidak ada vertex yang bisa dikunjungi, keluar
        if minVertex == nil {
            break
        }
        
        // Mark vertex as visited
        visited[minVertex.Key] = true
        
        // Update jarak ke semua vertex yang terhubung
        for k, adj := range minVertex.Adjacent {
            if !visited[k] {
                // Asumsikan weight edge adalah 1, sesuaikan dengan implementasi sebenarnya
                weight := 1
                
                // Update jarak jika ditemukan path yang lebih pendek
                if distances[minVertex.Key]+weight < distances[k] {
                    distances[k] = distances[minVertex.Key] + weight
                }
            }
        }
    }
    
    return distances
}

// Implementasi Dijkstra's Algorithm dengan Priority Queue
func (g *Graph) DijkstraPQ(start int) map[int]int {
    // Inisialisasi
    distances := make(map[int]int)
    
    // Set semua jarak ke infinity kecuali start
    for k := range g.Vertices {
        distances[k] = math.MaxInt32
    }
    distances[start] = 0
    
    // Buat priority queue
    pq := make(PriorityQueue, 0)
    heap.Init(&pq)
    
    // Push start vertex ke queue
    heap.Push(&pq, &Item{
        value:    start,
        priority: 0,
    })
    
    // Loop sampai queue kosong
    for pq.Len() > 0 {
        // Pop vertex dengan prioritas terkecil
        item := heap.Pop(&pq).(*Item)
        vertex := g.Vertices[item.value]
        
        // Skip jika sudah dikunjungi dengan jarak yang lebih pendek
        if item.priority > distances[vertex.Key] {
            continue
        }
        
        // Update jarak ke semua vertex yang terhubung
        for k, adj := range vertex.Adjacent {
            // Asumsikan weight edge adalah 1, sesuaikan dengan implementasi sebenarnya
            weight := 1
            
            // Update jarak jika ditemukan path yang lebih pendek
            if distances[vertex.Key]+weight < distances[k] {
                distances[k] = distances[vertex.Key] + weight
                
                // Push vertex ke queue
                heap.Push(&pq, &Item{
                    value:    k,
                    priority: distances[k],
                })
            }
        }
    }
    
    return distances
}

// Item untuk Priority Queue
type Item struct {
    value    int
    priority int
    index    int
}

// Priority Queue
type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
    return pq[i].priority < pq[j].priority
}

func (pq PriorityQueue) Swap(i, j int) {
    pq[i], pq[j] = pq[j], pq[i]
    pq[i].index = i
    pq[j].index = j
}

func (pq *PriorityQueue) Push(x interface{}) {
    n := len(*pq)
    item := x.(*Item)
    item.index = n
    *pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() interface{} {
    old := *pq
    n := len(old)
    item := old[n-1]
    old[n-1] = nil
    item.index = -1
    *pq = old[0 : n-1]
    return item
}

// Implementasi Bellman-Ford Algorithm
func (g *Graph) BellmanFord(start int) (map[int]int, bool) {
    // Inisialisasi
    distances := make(map[int]int)
    edges := g.GetEdges()
    
    // Set semua jarak ke infinity kecuali start
    for k := range g.Vertices {
        distances[k] = math.MaxInt32
    }
    distances[start] = 0
    
    // Relax edges V-1 times
    for i := 0; i < len(g.Vertices)-1; i++ {
        for _, edge := range edges {
            u, v := edge[0], edge[1]
            
            // Asumsikan weight edge adalah 1, sesuaikan dengan implementasi sebenarnya
            weight := 1
            
            // Relax edge
            if distances[u] != math.MaxInt32 && distances[u]+weight < distances[v] {
                distances[v] = distances[u] + weight
            }
        }
    }
    
    // Check for negative cycles
    for _, edge := range edges {
        u, v := edge[0], edge[1]
        
        // Asumsikan weight edge adalah 1, sesuaikan dengan implementasi sebenarnya
        weight := 1
        
        // If we can still relax an edge, there is a negative cycle
        if distances[u] != math.MaxInt32 && distances[u]+weight < distances[v] {
            return distances, true // Negative cycle detected
        }
    }
    
    return distances, false // No negative cycle
}

// Implementasi Floyd-Warshall Algorithm
func (g *Graph) FloydWarshall() [][]int {
    // Inisialisasi
    n := len(g.Vertices)
    dist := make([][]int, n)
    for i := range dist {
        dist[i] = make([]int, n)
        for j := range dist[i] {
            if i == j {
                dist[i][j] = 0
            } else {
                dist[i][j] = math.MaxInt32
            }
        }
    }
    
    // Set weight untuk setiap edge
    edges := g.GetEdges()
    for _, edge := range edges {
        u, v := edge[0], edge[1]
        
        // Asumsikan weight edge adalah 1, sesuaikan dengan implementasi sebenarnya
        weight := 1
        
        dist[u][v] = weight
        
        // Jika undirected, set weight untuk edge balik
        if !g.Directed {
            dist[v][u] = weight
        }
    }
    
    // Floyd-Warshall algorithm
    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if dist[i][k] != math.MaxInt32 && dist[k][j] != math.MaxInt32 {
                    if dist[i][k]+dist[k][j] < dist[i][j] {
                        dist[i][j] = dist[i][k] + dist[k][j]
                    }
                }
            }
        }
    }
    
    return dist
}

// Deteksi negative cycle dengan Floyd-Warshall
func (g *Graph) HasNegativeCycle() bool {
    dist := g.FloydWarshall()
    
    // Check diagonal elements
    for i := 0; i < len(dist); i++ {
        if dist[i][i] < 0 {
            return true // Negative cycle detected
        }
    }
    
    return false // No negative cycle
}
```

## Aplikasi Graph
- **Social Networks**: Memodelkan hubungan antar pengguna
- **Navigation Systems**: Mencari rute terpendek
- **Network Routing**: Mengoptimalkan aliran data
- **Dependency Management**: Mengelola dependensi antar komponen
- **Game AI**: Pathfinding, decision making
- **Web Crawling**: Menjelajahi halaman web
- **Circuit Design**: Memodelkan sirkuit elektronik
- **Recommendation Systems**: Menganalisis hubungan antar item

## Kesimpulan

Graph adalah struktur data yang sangat penting dan serbaguna dalam pengembangan perangkat lunak. Directed dan undirected graph memiliki aplikasi yang berbeda, dan pemilihan representasi graph (adjacency list atau adjacency matrix) tergantung pada karakteristik graph dan operasi yang akan dilakukan. Graph traversal algorithms seperti DFS dan BFS adalah teknik dasar untuk menjelajahi graph, sementara shortest path algorithms seperti Dijkstra, Bellman-Ford, dan Floyd-Warshall digunakan untuk menemukan path terpendek dalam berbagai skenario. Memahami implementasi dan penggunaan berbagai jenis graph dan algoritma graph sangat penting untuk pengembangan aplikasi yang efisien.