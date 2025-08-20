---
title: Zustand Best Practice - Slice Pattern
draft: 
tags:
  - evergreen
  - blog
---


The most robust and widely-adopted best practice for managing multiple, distinct states in Zustand is the **slice pattern**.

This pattern allows you to define separate, domain-specific pieces of state and logic ("slices") and then compose them into a single, unified store. This keeps your code organized, scalable, and much easier to maintain.

### **The Core Concept: The Slice Pattern**

Instead of creating multiple independent stores (useUserStore, useCartStore, etc.), you create multiple *slice creators*. Each creator is a function that defines the state and actions for a specific feature (like authentication, cart, or UI state). You then combine these slices into one central, "bound" store hook.2

**Why this is the best practice:**

* **Organization:** Keeps related state and actions grouped together in their own files.3

* **Separation of Concerns:** authSlice doesn't need to know about the internals of cartSlice.  
* **Cross-Slice Communication:** Slices within the same store can easily interact with each other using the get() function, which is crucial for complex applications.  
* **Single Source of Truth:** Your application still consumes a single store hook, making it easy to use in components.4

---

### **Step-by-Step Implementation**

Let's model a simple e-commerce scenario with an authSlice and a cartSlice.

#### **Step 1: Create Your Individual Slices**

First, create a dedicated folder for your store, for example src/stores. Inside, you'll create a file for each slice.

**src/stores/authSlice.js**

```javascript
export const createAuthSlice = (set, get) => ({
  token: null,
  user: null,
  login: (token, user) => set({ token, user }),
  logout: () => {
    // When logging out, we can also clear the cart
    // This is an example of cross-slice action
    get().clearCart(); 
    set({ token: null, user: null });
  },
});
```


**src/stores/cartSlice.js**
```javascript
export const createCartSlice = (set, get) => ({
  items: [],
  addItem: (newItem) =>
    set((state) => ({
      items: [...state.items, newItem],
    })),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
  clearCart: () => set({ items: [] }),
});
```

**Key Points:**

* Each slice creator is a function that receives set and get.5

* set is used to update the state.  
* get() is a powerful function that lets you access the *entire state* from any slice. In authSlice, we use get().clearCart() to call an action from cartSlice.

#### **Step 2: Combine Slices into a Single "Bound" Store**

Create a central file, like src/stores/index.js, to combine your slices. This is also the best place to add middleware.

**src/stores/index.js**
```javascript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createAuthSlice } from './authSlice';
import { createCartSlice } from './cartSlice';

// Combine all slices into a single store
export const useBoundStore = create(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createCartSlice(...a),
      }),
      {
        name: 'app-storage', // name of the item in storage (must be unique)
      }
    )
  )
);
```

**Explanation:**

* (...a) \=\> ({ ... }): This concise syntax passes the (set, get) arguments from create into each of your slice creators.  
* ...: The spread operator merges the state and actions from all your slices into a single object.  
* **Middleware:** We've wrapped our store in two essential middlewares:  
  * devtools: Connects your store to the Redux DevTools extension for easy debugging.  
  * persist: Automatically saves your store's state to localStorage and rehydrates it on page load. This is perfect for persisting a user's session or cart.

#### **Step 3: Use the Store in Your Components with Selectors**

Now you can use your single useBoundStore hook anywhere in your app. The best practice here is to use **selectors** to only subscribe components to the state they actually need. This prevents unnecessary re-renders.

**src/components/LoginButton.jsx**
```javascript
import { useBoundStore } from '../stores';

function LoginButton() {
  // Select both state and actions
  const { user, login, logout } = useBoundStore((state) => ({
    user: state.user,
    login: state.login,
    logout: state.logout,
  }));

  if (user) {
    return (
      <div>
        Welcome, {user.name}! <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <button onClick={() => login('some-jwt-token', { name: 'Budi' })}>Login</button>;
}
```

**src/components/Cart.jsx**
```javascript
import { useBoundStore } from '../stores';

function Cart() {
  // Using a selector to get only the cart items
  const items = useBoundStore((state) => state.items);
  const addItem = useBoundStore((state) => state.addItem);

  return (
    <div>
      <h2>Cart Items: {items.length}</h2>
      <button onClick={() => addItem({ id: Date.now(), name: 'Product' })}>
        Add Item
      </button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```


### **Summary of Best Practices**

1. **Use the Slice Pattern:** Define state and actions by feature/domain in separate create...Slice functions.  
2. **Combine into a Single Bound Store:** Create one useBoundStore hook that merges all slices.  
3. **Leverage Middleware:** Always use devtools for debugging. Use persist when you need to save state to storage.  
4. **Use get() for Cross-Slice Logic:** This is the standard way for actions in one slice to read state or call actions from another.  
5. **Always Use Selectors:** In components, select only the specific pieces of state needed to prevent performance issues and unnecessary re-renders (e.g., useBoundStore(state \=\> state.user)).