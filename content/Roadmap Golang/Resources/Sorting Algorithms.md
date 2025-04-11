# Sorting Algorithms

Sorting algorithms adalah algoritma yang mengatur ulang elemen dalam urutan tertentu. Pemilihan algoritma sorting yang tepat sangat penting untuk performa aplikasi.

## Bubble Sort

### Karakteristik Bubble Sort
- **Stable**: Mempertahankan urutan relatif elemen yang sama
- **In-place**: Tidak memerlukan memori tambahan
- **Adaptive**: Performa lebih baik untuk data yang hampir terurut
- **Time Complexity**: O(n²) worst dan average case, O(n) best case
- **Space Complexity**: O(1)

### Implementasi Bubble Sort
```go
// Implementasi bubble sort
func BubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                // Swap elemen
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        // Jika tidak ada swap, array sudah terurut
        if !swapped {
            break
        }
    }
}

// Implementasi bubble sort dengan generic type
func BubbleSortGeneric[T constraints.Ordered](arr []T) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                // Swap elemen
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        // Jika tidak ada swap, array sudah terurut
        if !swapped {
            break
        }
    }
}

// Implementasi bubble sort dengan custom comparator
func BubbleSortWithComparator[T any](arr []T, less func(a, b T) bool) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-i-1; j++ {
            if less(arr[j+1], arr[j]) {
                // Swap elemen
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        // Jika tidak ada swap, array sudah terurut
        if !swapped {
            break
        }
    }
}
```

## Insertion Sort

### Karakteristik Insertion Sort
- **Stable**: Mempertahankan urutan relatif elemen yang sama
- **In-place**: Tidak memerlukan memori tambahan
- **Adaptive**: Performa lebih baik untuk data yang hampir terurut
- **Time Complexity**: O(n²) worst dan average case, O(n) best case
- **Space Complexity**: O(1)

### Implementasi Insertion Sort
```go
// Implementasi insertion sort
func InsertionSort(arr []int) {
    for i := 1; i < len(arr); i++ {
        key := arr[i]
        j := i - 1
        
        // Geser elemen yang lebih besar dari key
        for j >= 0 && arr[j] > key {
            arr[j+1] = arr[j]
            j--
        }
        arr[j+1] = key
    }
}

// Implementasi insertion sort dengan generic type
func InsertionSortGeneric[T constraints.Ordered](arr []T) {
    for i := 1; i < len(arr); i++ {
        key := arr[i]
        j := i - 1
        
        // Geser elemen yang lebih besar dari key
        for j >= 0 && arr[j] > key {
            arr[j+1] = arr[j]
            j--
        }
        arr[j+1] = key
    }
}

// Implementasi insertion sort dengan custom comparator
func InsertionSortWithComparator[T any](arr []T, less func(a, b T) bool) {
    for i := 1; i < len(arr); i++ {
        key := arr[i]
        j := i - 1
        
        // Geser elemen yang lebih besar dari key
        for j >= 0 && less(key, arr[j]) {
            arr[j+1] = arr[j]
            j--
        }
        arr[j+1] = key
    }
}

// Implementasi binary insertion sort
func BinaryInsertionSort(arr []int) {
    for i := 1; i < len(arr); i++ {
        key := arr[i]
        
        // Cari posisi yang tepat menggunakan binary search
        j := sort.Search(i, func(j int) bool {
            return arr[j] > key
        })
        
        // Geser elemen
        copy(arr[j+1:i+1], arr[j:i])
        arr[j] = key
    }
}

// Implementasi binary insertion sort dengan generic type
func BinaryInsertionSortGeneric[T constraints.Ordered](arr []T) {
    for i := 1; i < len(arr); i++ {
        key := arr[i]
        
        // Cari posisi yang tepat menggunakan binary search
        j := sort.Search(i, func(j int) bool {
            return arr[j] > key
        })
        
        // Geser elemen
        copy(arr[j+1:i+1], arr[j:i])
        arr[j] = key
    }
}

// Implementasi binary insertion sort dengan custom comparator
func BinaryInsertionSortWithComparator[T any](arr []T, less func(a, b T) bool) {
    for i := 1; i < len(arr); i++ {
        key := arr[i]
        
        // Cari posisi yang tepat menggunakan binary search
        j := sort.Search(i, func(j int) bool {
            return less(key, arr[j])
        })
        
        // Geser elemen
        copy(arr[j+1:i+1], arr[j:i])
        arr[j] = key
    }
}
```

## Selection Sort

### Karakteristik Selection Sort
- **Unstable**: Tidak mempertahankan urutan relatif elemen yang sama
- **In-place**: Tidak memerlukan memori tambahan
- **Non-adaptive**: Performa sama untuk semua jenis data
- **Time Complexity**: O(n²) untuk semua kasus
- **Space Complexity**: O(1)

### Implementasi Selection Sort
```go
// Implementasi selection sort
func SelectionSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        minIdx := i
        for j := i + 1; j < n; j++ {
            if arr[j] < arr[minIdx] {
                minIdx = j
            }
        }
        // Swap elemen
        arr[i], arr[minIdx] = arr[minIdx], arr[i]
    }
}

// Implementasi selection sort dengan generic type
func SelectionSortGeneric[T constraints.Ordered](arr []T) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        minIdx := i
        for j := i + 1; j < n; j++ {
            if arr[j] < arr[minIdx] {
                minIdx = j
            }
        }
        // Swap elemen
        arr[i], arr[minIdx] = arr[minIdx], arr[i]
    }
}

// Implementasi selection sort dengan custom comparator
func SelectionSortWithComparator[T any](arr []T, less func(a, b T) bool) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        minIdx := i
        for j := i + 1; j < n; j++ {
            if less(arr[j], arr[minIdx]) {
                minIdx = j
            }
        }
        // Swap elemen
        arr[i], arr[minIdx] = arr[minIdx], arr[i]
    }
}
```

## Merge Sort

### Karakteristik Merge Sort
- **Stable**: Mempertahankan urutan relatif elemen yang sama
- **Not in-place**: Memerlukan memori tambahan O(n)
- **Non-adaptive**: Performa sama untuk semua jenis data
- **Time Complexity**: O(n log n) untuk semua kasus
- **Space Complexity**: O(n)

### Implementasi Merge Sort
```go
// Implementasi merge sort
func MergeSort(arr []int) {
    if len(arr) <= 1 {
        return
    }
    
    // Bagi array menjadi dua
    mid := len(arr) / 2
    left := make([]int, mid)
    right := make([]int, len(arr)-mid)
    copy(left, arr[:mid])
    copy(right, arr[mid:])
    
    // Rekursif sort
    MergeSort(left)
    MergeSort(right)
    
    // Merge hasil
    merge(arr, left, right)
}

// Fungsi merge untuk merge sort
func merge(arr, left, right []int) {
    i, j, k := 0, 0, 0
    
    // Merge dua array
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            arr[k] = left[i]
            i++
        } else {
            arr[k] = right[j]
            j++
        }
        k++
    }
    
    // Salin sisa elemen
    for i < len(left) {
        arr[k] = left[i]
        i++
        k++
    }
    for j < len(right) {
        arr[k] = right[j]
        j++
        k++
    }
}

// Implementasi merge sort dengan generic type
func MergeSortGeneric[T constraints.Ordered](arr []T) {
    if len(arr) <= 1 {
        return
    }
    
    // Bagi array menjadi dua
    mid := len(arr) / 2
    left := make([]T, mid)
    right := make([]T, len(arr)-mid)
    copy(left, arr[:mid])
    copy(right, arr[mid:])
    
    // Rekursif sort
    MergeSortGeneric(left)
    MergeSortGeneric(right)
    
    // Merge hasil
    mergeGeneric(arr, left, right)
}

// Fungsi merge untuk merge sort dengan generic type
func mergeGeneric[T constraints.Ordered](arr, left, right []T) {
    i, j, k := 0, 0, 0
    
    // Merge dua array
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            arr[k] = left[i]
            i++
        } else {
            arr[k] = right[j]
            j++
        }
        k++
    }
    
    // Salin sisa elemen
    for i < len(left) {
        arr[k] = left[i]
        i++
        k++
    }
    for j < len(right) {
        arr[k] = right[j]
        j++
        k++
    }
}

// Implementasi merge sort dengan custom comparator
func MergeSortWithComparator[T any](arr []T, less func(a, b T) bool) {
    if len(arr) <= 1 {
        return
    }
    
    // Bagi array menjadi dua
    mid := len(arr) / 2
    left := make([]T, mid)
    right := make([]T, len(arr)-mid)
    copy(left, arr[:mid])
    copy(right, arr[mid:])
    
    // Rekursif sort
    MergeSortWithComparator(left, less)
    MergeSortWithComparator(right, less)
    
    // Merge hasil
    mergeWithComparator(arr, left, right, less)
}

// Fungsi merge untuk merge sort dengan custom comparator
func mergeWithComparator[T any](arr, left, right []T, less func(a, b T) bool) {
    i, j, k := 0, 0, 0
    
    // Merge dua array
    for i < len(left) && j < len(right) {
        if !less(right[j], left[i]) {
            arr[k] = left[i]
            i++
        } else {
            arr[k] = right[j]
            j++
        }
        k++
    }
    
    // Salin sisa elemen
    for i < len(left) {
        arr[k] = left[i]
        i++
        k++
    }
    for j < len(right) {
        arr[k] = right[j]
        j++
        k++
    }
}

// Implementasi in-place merge sort
func InPlaceMergeSort(arr []int) {
    if len(arr) <= 1 {
        return
    }
    
    // Bagi array menjadi dua
    mid := len(arr) / 2
    
    // Rekursif sort
    InPlaceMergeSort(arr[:mid])
    InPlaceMergeSort(arr[mid:])
    
    // Merge hasil
    inPlaceMerge(arr, 0, mid, len(arr))
}

// Fungsi in-place merge untuk merge sort
func inPlaceMerge(arr []int, start, mid, end int) {
    i, j := start, mid
    
    // Merge dua array
    for i < mid && j < end {
        if arr[i] <= arr[j] {
            i++
        } else {
            // Rotasi array
            value := arr[j]
            copy(arr[i+1:j+1], arr[i:j])
            arr[i] = value
            i++
            mid++
            j++
        }
    }
}

// Implementasi in-place merge sort dengan generic type
func InPlaceMergeSortGeneric[T constraints.Ordered](arr []T) {
    if len(arr) <= 1 {
        return
    }
    
    // Bagi array menjadi dua
    mid := len(arr) / 2
    
    // Rekursif sort
    InPlaceMergeSortGeneric(arr[:mid])
    InPlaceMergeSortGeneric(arr[mid:])
    
    // Merge hasil
    inPlaceMergeGeneric(arr, 0, mid, len(arr))
}

// Fungsi in-place merge untuk merge sort dengan generic type
func inPlaceMergeGeneric[T constraints.Ordered](arr []T, start, mid, end int) {
    i, j := start, mid
    
    // Merge dua array
    for i < mid && j < end {
        if arr[i] <= arr[j] {
            i++
        } else {
            // Rotasi array
            value := arr[j]
            copy(arr[i+1:j+1], arr[i:j])
            arr[i] = value
            i++
            mid++
            j++
        }
    }
}

// Implementasi in-place merge sort dengan custom comparator
func InPlaceMergeSortWithComparator[T any](arr []T, less func(a, b T) bool) {
    if len(arr) <= 1 {
        return
    }
    
    // Bagi array menjadi dua
    mid := len(arr) / 2
    
    // Rekursif sort
    InPlaceMergeSortWithComparator(arr[:mid], less)
    InPlaceMergeSortWithComparator(arr[mid:], less)
    
    // Merge hasil
    inPlaceMergeWithComparator(arr, 0, mid, len(arr), less)
}

// Fungsi in-place merge untuk merge sort dengan custom comparator
func inPlaceMergeWithComparator[T any](arr []T, start, mid, end int, less func(a, b T) bool) {
    i, j := start, mid
    
    // Merge dua array
    for i < mid && j < end {
        if !less(arr[j], arr[i]) {
            i++
        } else {
            // Rotasi array
            value := arr[j]
            copy(arr[i+1:j+1], arr[i:j])
            arr[i] = value
            i++
            mid++
            j++
        }
    }
}
```

## Quick Sort

### Karakteristik Quick Sort
- **Unstable**: Tidak mempertahankan urutan relatif elemen yang sama
- **In-place**: Tidak memerlukan memori tambahan
- **Non-adaptive**: Performa sama untuk semua jenis data
- **Time Complexity**: O(n log n) average case, O(n²) worst case
- **Space Complexity**: O(log n) untuk rekursi

### Implementasi Quick Sort
```go
// Implementasi quick sort
func QuickSort(arr []int) {
    if len(arr) <= 1 {
        return
    }
    
    // Pilih pivot
    pivot := partition(arr)
    
    // Rekursif sort
    QuickSort(arr[:pivot])
    QuickSort(arr[pivot+1:])
}

// Fungsi partition untuk quick sort
func partition(arr []int) int {
    pivot := arr[len(arr)-1]
    i := -1
    
    for j := 0; j < len(arr)-1; j++ {
        if arr[j] <= pivot {
            i++
            arr[i], arr[j] = arr[j], arr[i]
        }
    }
    arr[i+1], arr[len(arr)-1] = arr[len(arr)-1], arr[i+1]
    return i + 1
}

// Implementasi quick sort dengan generic type
func QuickSortGeneric[T constraints.Ordered](arr []T) {
    if len(arr) <= 1 {
        return
    }
    
    // Pilih pivot
    pivot := partitionGeneric(arr)
    
    // Rekursif sort
    QuickSortGeneric(arr[:pivot])
    QuickSortGeneric(arr[pivot+1:])
}

// Fungsi partition untuk quick sort dengan generic type
func partitionGeneric[T constraints.Ordered](arr []T) int {
    pivot := arr[len(arr)-1]
    i := -1
    
    for j := 0; j < len(arr)-1; j++ {
        if arr[j] <= pivot {
            i++
            arr[i], arr[j] = arr[j], arr[i]
        }
    }
    arr[i+1], arr[len(arr)-1] = arr[len(arr)-1], arr[i+1]
    return i + 1
}

// Implementasi quick sort dengan custom comparator
func QuickSortWithComparator[T any](arr []T, less func(a, b T) bool) {
    if len(arr) <= 1 {
        return
    }
    
    // Pilih pivot
    pivot := partitionWithComparator(arr, less)
    
    // Rekursif sort
    QuickSortWithComparator(arr[:pivot], less)
    QuickSortWithComparator(arr[pivot+1:], less)
}

// Fungsi partition untuk quick sort dengan custom comparator
func partitionWithComparator[T any](arr []T, less func(a, b T) bool) int {
    pivot := arr[len(arr)-1]
    i := -1
    
    for j := 0; j < len(arr)-1; j++ {
        if !less(pivot, arr[j]) {
            i++
            arr[i], arr[j] = arr[j], arr[i]
        }
    }
    arr[i+1], arr[len(arr)-1] = arr[len(arr)-1], arr[i+1]
    return i + 1
}

// Implementasi quick sort dengan median-of-three pivot
func QuickSortMedianOfThree(arr []int) {
    if len(arr) <= 1 {
        return
    }
    
    // Pilih pivot menggunakan median-of-three
    pivot := medianOfThree(arr)
    
    // Rekursif sort
    QuickSortMedianOfThree(arr[:pivot])
    QuickSortMedianOfThree(arr[pivot+1:])
}

// Fungsi median-of-three untuk quick sort
func medianOfThree(arr []int) int {
    left := 0
    right := len(arr) - 1
    mid := (left + right) / 2
    
    // Urutkan tiga elemen
    if arr[left] > arr[mid] {
        arr[left], arr[mid] = arr[mid], arr[left]
    }
    if arr[left] > arr[right] {
        arr[left], arr[right] = arr[right], arr[left]
    }
    if arr[mid] > arr[right] {
        arr[mid], arr[right] = arr[right], arr[mid]
    }
    
    // Gunakan median sebagai pivot
    arr[mid], arr[right-1] = arr[right-1], arr[mid]
    return partition(arr[:right])
}

// Implementasi quick sort dengan insertion sort untuk array kecil
func QuickSortWithInsertion(arr []int, threshold int) {
    if len(arr) <= threshold {
        InsertionSort(arr)
        return
    }
    
    // Pilih pivot
    pivot := partition(arr)
    
    // Rekursif sort
    QuickSortWithInsertion(arr[:pivot], threshold)
    QuickSortWithInsertion(arr[pivot+1:], threshold)
}

// Implementasi quick sort dengan insertion sort untuk array kecil dengan generic type
func QuickSortWithInsertionGeneric[T constraints.Ordered](arr []T, threshold int) {
    if len(arr) <= threshold {
        InsertionSortGeneric(arr)
        return
    }
    
    // Pilih pivot
    pivot := partitionGeneric(arr)
    
    // Rekursif sort
    QuickSortWithInsertionGeneric(arr[:pivot], threshold)
    QuickSortWithInsertionGeneric(arr[pivot+1:], threshold)
}

// Implementasi quick sort dengan insertion sort untuk array kecil dengan custom comparator
func QuickSortWithInsertionComparator[T any](arr []T, less func(a, b T) bool, threshold int) {
    if len(arr) <= threshold {
        InsertionSortWithComparator(arr, less)
        return
    }
    
    // Pilih pivot
    pivot := partitionWithComparator(arr, less)
    
    // Rekursif sort
    QuickSortWithInsertionComparator(arr[:pivot], less, threshold)
    QuickSortWithInsertionComparator(arr[pivot+1:], less, threshold)
}
```

## Heap Sort

### Karakteristik Heap Sort
- **Unstable**: Tidak mempertahankan urutan relatif elemen yang sama
- **In-place**: Tidak memerlukan memori tambahan
- **Non-adaptive**: Performa sama untuk semua jenis data
- **Time Complexity**: O(n log n) untuk semua kasus
- **Space Complexity**: O(1)

### Implementasi Heap Sort
```go
// Implementasi heap sort
func HeapSort(arr []int) {
    n := len(arr)
    
    // Build heap
    for i := n/2 - 1; i >= 0; i-- {
        heapify(arr, n, i)
    }
    
    // Extract elemen dari heap
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    }
}

// Fungsi heapify untuk heap sort
func heapify(arr []int, n, i int) {
    largest := i
    left := 2*i + 1
    right := 2*i + 2
    
    if left < n && arr[left] > arr[largest] {
        largest = left
    }
    
    if right < n && arr[right] > arr[largest] {
        largest = right
    }
    
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)
    }
}

// Implementasi heap sort dengan generic type
func HeapSortGeneric[T constraints.Ordered](arr []T) {
    n := len(arr)
    
    // Build heap
    for i := n/2 - 1; i >= 0; i-- {
        heapifyGeneric(arr, n, i)
    }
    
    // Extract elemen dari heap
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        heapifyGeneric(arr, i, 0)
    }
}

// Fungsi heapify untuk heap sort dengan generic type
func heapifyGeneric[T constraints.Ordered](arr []T, n, i int) {
    largest := i
    left := 2*i + 1
    right := 2*i + 2
    
    if left < n && arr[left] > arr[largest] {
        largest = left
    }
    
    if right < n && arr[right] > arr[largest] {
        largest = right
    }
    
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        heapifyGeneric(arr, n, largest)
    }
}

// Implementasi heap sort dengan custom comparator
func HeapSortWithComparator[T any](arr []T, less func(a, b T) bool) {
    n := len(arr)
    
    // Build heap
    for i := n/2 - 1; i >= 0; i-- {
        heapifyWithComparator(arr, n, i, less)
    }
    
    // Extract elemen dari heap
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        heapifyWithComparator(arr, i, 0, less)
    }
}

// Fungsi heapify untuk heap sort dengan custom comparator
func heapifyWithComparator[T any](arr []T, n, i int, less func(a, b T) bool) {
    largest := i
    left := 2*i + 1
    right := 2*i + 2
    
    if left < n && less(arr[largest], arr[left]) {
        largest = left
    }
    
    if right < n && less(arr[largest], arr[right]) {
        largest = right
    }
    
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        heapifyWithComparator(arr, n, largest, less)
    }
}
```

## Aplikasi Sorting Algorithms
- **Database indexing**: Mengurutkan indeks untuk pencarian cepat
- **Data analysis**: Mengurutkan data untuk analisis
- **Search algorithms**: Mengurutkan data untuk pencarian biner
- **Graph algorithms**: Mengurutkan edge berdasarkan weight
- **Scheduling**: Mengurutkan task berdasarkan prioritas
- **File systems**: Mengurutkan file berdasarkan nama/tanggal
- **Network routing**: Mengurutkan packet berdasarkan prioritas
- **Compression**: Mengurutkan data untuk kompresi yang lebih baik

## Kesimpulan

Sorting algorithms adalah algoritma fundamental dalam pengembangan perangkat lunak. Pemilihan algoritma sorting yang tepat tergantung pada karakteristik data dan kebutuhan aplikasi. Setiap algoritma memiliki kelebihan dan kekurangan masing-masing, dan pemahaman mendalam tentang algoritma-algoritma ini sangat penting untuk pengembangan aplikasi yang efisien.