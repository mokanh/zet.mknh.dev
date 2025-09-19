---
title: TypeSricpt - Interfacing Response
draft: 
tags:
  - seeds
---

The best practice is to use **strongly-typed models** for your expected response data, centralize your API calls into a dedicated **service layer**, and gracefully handle both **success and error states** using `async/await` with `try...catch` blocks.

---

## ## Define Strong Types with Interfaces 📦

Never use `any` for your API responses. Instead, define an `interface` (or `type`) that describes the exact shape of the expected JSON data. This gives you autocompletion and compile-time safety, preventing common runtime errors.

For example, if you're fetching user data from an API that returns `{ "id": 1, "name": "John Doe", "email": "john.doe@example.com" }`, you should define an interface for it.

TypeScript

```typescript
// src/interfaces/user.interface.ts
export interface User {
  id: number;
  name: string;
  email: string;
  // Use optional properties for fields that might not always be present
  phone?: string;
}
```

---

## ## Centralize API Logic in a Service

Avoid making API calls directly inside your components or business logic. Create a dedicated service class or file to manage all HTTP requests. This makes your code more organized, reusable, and easier to test. It also simplifies swapping out your HTTP client in the future.

Here's an example using the native `fetch` API.

TypeScript

```typescript
// src/services/apiService.ts
import { User } from '../interfaces/user.interface.ts';

const BASE_URL = 'https://api.example.com';

export async function getUser(userId: number): Promise<User> {
  const response = await fetch(`${BASE_URL}/users/${userId}`);

  // Check if the request was successful
  if (!response.ok) {
    // Handle HTTP errors like 404 or 500
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  // Parse the JSON body and cast it to your strong type
  const data: User = await response.json();
  return data;
}
```

---

## ## Handle Success and Errors Gracefully 🛡️

Use `async/await` with a `try...catch` block where you call your API service function. This is the cleanest way to handle the two primary outcomes of an asynchronous operation: success (the `try` block) and failure (the `catch` block).

TypeScript

```typescript
// src/components/UserProfile.ts
import { getUser } from '../services/apiService';
import { User } from '../interfaces/user.interface.ts';

async function displayUserProfile(id: number) {
  try {
    // --- Success Path ---
    console.log('Fetching user...');
    const user: User = await getUser(id);
    
    // Type safety in action! TypeScript knows `user` has `name` and `email` properties.
    console.log(`User Found: ${user.name} (${user.email})`);

  } catch (error) {
    // --- Error Path ---
    // This block catches network failures or HTTP errors thrown from the service.
    console.error('Failed to fetch user:', error);
    // Here you would typically update the UI to show an error message.
  }
}

// Example usage
displayUserProfile(1);
```

### ### Key Takeaways

- **Type Safety:** Always define an `interface` for your response. It's the most significant advantage of using TypeScript.
    
- **Separation of Concerns:** Keep API logic separate from your UI or business logic by using services.
    
- **Robust Error Handling:** A `try...catch` block is essential for building a reliable application that can handle API downtime or bad responses.
    
- **Consider a Library:** While `fetch` is built-in, libraries like **Axios** or **Ky** can simplify things further by providing features like automatic JSON parsing, request cancellation, and interceptors.