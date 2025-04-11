# Concurrency dan Goroutines

Golang terkenal dengan dukungannya yang kuat untuk konkurensi melalui goroutines dan channels. Bagian ini akan membahas konsep-konsep penting dalam pemrograman konkuren di Golang.

## Poin-poin Pembelajaran

1. [[Goroutines]]
   - Pengenalan goroutines
   - Lifecycle goroutine
   - Goroutine scheduling
   - Best practices

2. [[Channels]]
   - Channel basics
   - Buffered vs unbuffered channels
   - Channel operations
   - Channel direction

3. [[Select Statement]]
   - Multiple channel operations
   - Default case
   - Timeout handling
   - Non-blocking operations

4. [[Sync Package]]
   - WaitGroup
   - Mutex
   - RWMutex
   - Once
   - Pool

5. [[Context Package]]
   - Context basics
   - Context with timeout
   - Context with cancellation
   - Context with values

6. [[Race Conditions]]
   - Detecting race conditions
   - Race detector
   - Preventing race conditions
   - Atomic operations

7. [[Worker Pools]]
   - Worker pool pattern
   - Job queues
   - Rate limiting
   - Load balancing

8. [[Concurrency Patterns]]
   - Pipeline pattern
   - Fan-out, Fan-in
   - Worker pool pattern
   - Pub/sub pattern

9. [[Error Handling in Concurrency]]
   - Error propagation
   - Error groups
   - Context cancellation
   - Graceful shutdown