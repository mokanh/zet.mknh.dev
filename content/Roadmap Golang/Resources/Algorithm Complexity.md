# Algorithm Complexity

Algorithm complexity is a mathematical analysis used to predict the performance of an algorithm in terms of execution time and memory usage. Understanding algorithm complexity is crucial for optimizing code and choosing the right algorithm for each situation.

## Time Complexity

### Big O Notation
- **O(1)**: Constant - operations take the same time regardless of input size
- **O(log n)**: Logarithmic - execution time increases logarithmically with input size
- **O(n)**: Linear - execution time increases proportionally with input size
- **O(n log n)**: Linearithmic - combination of linear and logarithmic
- **O(n²)**: Quadratic - execution time increases quadratically with input size
- **O(2ⁿ)**: Exponential - execution time increases exponentially with input size
- **O(n!)**: Factorial - execution time increases factorially with input size

### Implementation and Analysis Examples
```go
// O(1) - Constant
func GetFirstElement(arr []int) int {
    return arr[0]
}

// O(log n) - Logarithmic
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
    return -1
}

// O(n) - Linear
func LinearSearch(arr []int, target int) int {
    for i := 0; i < len(arr); i++ {
        if arr[i] == target {
            return i
        }
    }
    return -1
}

// O(n log n) - Linearithmic
func MergeSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    
    mid := len(arr) / 2
    left := MergeSort(arr[:mid])
    right := MergeSort(arr[mid:])
    
    return merge(left, right)
}

func merge(left, right []int) []int {
    result := make([]int, 0, len(left)+len(right))
    i, j := 0, 0
    
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            result = append(result, left[i])
            i++
        } else {
            result = append(result, right[j])
            j++
        }
    }
    
    result = append(result, left[i:]...)
    result = append(result, right[j:]...)
    return result
}

// O(n²) - Quadratic
func BubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
    return arr
}

// O(2ⁿ) - Exponential
func FibonacciRecursive(n int) int {
    if n <= 1 {
        return n
    }
    return FibonacciRecursive(n-1) + FibonacciRecursive(n-2)
}

// O(n!) - Factorial
func Permutations(arr []int) [][]int {
    if len(arr) <= 1 {
        return [][]int{arr}
    }
    
    result := make([][]int, 0)
    for i := 0; i < len(arr); i++ {
        // Swap current element with first element
        arr[0], arr[i] = arr[i], arr[0]
        
        // Get permutations of remaining elements
        subPerms := Permutations(arr[1:])
        
        // Add current element to each sub-permutation
        for _, subPerm := range subPerms {
            perm := append([]int{arr[0]}, subPerm...)
            result = append(result, perm)
        }
        
        // Swap back
        arr[0], arr[i] = arr[i], arr[0]
    }
    return result
}
```

## Space Complexity

### Big O Notation for Space
- **O(1)**: Constant - memory usage remains constant regardless of input size
- **O(log n)**: Logarithmic - memory usage increases logarithmically
- **O(n)**: Linear - memory usage increases proportionally
- **O(n²)**: Quadratic - memory usage increases quadratically

### Implementation and Analysis Examples
```go
// O(1) - Constant
func SumArray(arr []int) int {
    sum := 0
    for _, num := range arr {
        sum += num
    }
    return sum
}

// O(log n) - Logarithmic (recursive)
func BinarySearchRecursive(arr []int, target, left, right int) int {
    if left > right {
        return -1
    }
    
    mid := (left + right) / 2
    if arr[mid] == target {
        return mid
    } else if arr[mid] < target {
        return BinarySearchRecursive(arr, target, mid+1, right)
    } else {
        return BinarySearchRecursive(arr, target, left, mid-1)
    }
}

// O(n) - Linear
func CopyArray(arr []int) []int {
    result := make([]int, len(arr))
    copy(result, arr)
    return result
}

// O(n²) - Quadratic
func GenerateMatrix(n int) [][]int {
    matrix := make([][]int, n)
    for i := 0; i < n; i++ {
        matrix[i] = make([]int, n)
    }
    return matrix
}
```

## Best, Average, and Worst Case

### Case Analysis
- **Best Case**: Situation where the algorithm runs most efficiently
- **Average Case**: Expected situation in normal usage
- **Worst Case**: Situation where the algorithm runs least efficiently

### Implementation and Analysis Examples
```go
// QuickSort with case analysis
func QuickSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    
    // Best Case: O(n log n) - pivot is always the median
    // Average Case: O(n log n) - pivot is good enough
    // Worst Case: O(n²) - pivot is always minimum/maximum
    pivot := arr[len(arr)/2]
    
    left := make([]int, 0)
    middle := make([]int, 0)
    right := make([]int, 0)
    
    for _, num := range arr {
        if num < pivot {
            left = append(left, num)
        } else if num == pivot {
            middle = append(middle, num)
        } else {
            right = append(right, num)
        }
    }
    
    left = QuickSort(left)
    right = QuickSort(right)
    
    return append(append(left, middle...), right...)
}

// Linear Search with case analysis
func LinearSearchWithCases(arr []int, target int) int {
    // Best Case: O(1) - element found at the beginning
    // Average Case: O(n) - element found in the middle
    // Worst Case: O(n) - element not found
    for i := 0; i < len(arr); i++ {
        if arr[i] == target {
            return i
        }
    }
    return -1
}
```

## Amortized Analysis

### Amortized Analysis Concepts
- **Aggregate Method**: Calculate the total cost of operations
- **Accounting Method**: Using "credit" for expensive operations
- **Potential Method**: Using a potential function

### Implementation and Analysis Examples
```go
// Dynamic Array with amortized analysis
type DynamicArray struct {
    arr []int
    size int
    capacity int
}

func NewDynamicArray() *DynamicArray {
    return &DynamicArray{
        arr: make([]int, 1),
        size: 0,
        capacity: 1,
    }
}

func (da *DynamicArray) Append(x int) {
    // Amortized O(1) - cost of resize divided among all operations
    if da.size == da.capacity {
        // Resize - O(n)
        newArr := make([]int, da.capacity*2)
        copy(newArr, da.arr)
        da.arr = newArr
        da.capacity *= 2
    }
    da.arr[da.size] = x
    da.size++
}

func (da *DynamicArray) Get(i int) int {
    // O(1)
    return da.arr[i]
}
```

## Practical Considerations

### Algorithm Optimization
- **Caching**: Storing calculation results for reuse
- **Memoization**: Caching technique for recursive functions
- **Early Termination**: Stopping execution when a condition is met
- **Space-Time Trade-off**: Balancing memory usage and execution time

### Implementation Examples
```go
// Fibonacci with memoization
var memo = make(map[int]int)

func FibonacciMemoized(n int) int {
    if n <= 1 {
        return n
    }
    
    if val, ok := memo[n]; ok {
        return val
    }
    
    memo[n] = FibonacciMemoized(n-1) + FibonacciMemoized(n-2)
    return memo[n]
}

// Linear Search with early termination
func LinearSearchEarly(arr []int, target int) int {
    for i := 0; i < len(arr); i++ {
        if arr[i] > target { // Early termination if element is larger
            return -1
        }
        if arr[i] == target {
            return i
        }
    }
    return -1
}
```

## Conclusion

Algorithm complexity analysis is a crucial skill in software development. By understanding time complexity and space complexity, we can:
1. Choose the right algorithm for each situation
2. Optimize code for better performance
3. Predict algorithm behavior at scale
4. Make better design decisions

A deep understanding of algorithm complexity helps in developing efficient and scalable applications.