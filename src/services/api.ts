/***********************
 * api.ts - API Service
 * About:
 *   Handles all HTTP requests to the backend.
 *   Provides a centralized interface for making API calls.
 * Functions:
 *   - request(): Generic fetch wrapper with error handling
 *   - signIn(): POST /users/login - Authenticate user
 *   - signUp(): POST /users/register - Register new user
 *   - getUser(): GET /users/:id - Fetch user by ID
 *   - addBook(): POST /books - Add new book (admin only)
 *   - getBooks(): GET /books - Fetch all books
 *   - getBook(): GET /books/:id - Fetch single book
 ***********************/

/***********************
 * API Base URL
 * Uses environment variable or defaults to localhost:3000
 ***********************/
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

/***********************
 * Generic request function
 * @param path - API endpoint path (e.g., "/users/login")
 * @param opts - Fetch options (method, body, headers, etc.)
 * @returns Promise with JSON response
 * @throws Error if request fails
 ***********************/
async function request(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers as HeadersInit);
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }

  return res.json();
}

/***********************
 * API methods - Frontend interface to backend endpoints
 ***********************/
export const api = {
  request,
  /***********************
   * Sign in user
   * @param email - User's email
   * @param password - User's password (plain text - backend will hash)
   * @returns User data with role
   ***********************/
  signIn: (email: string, password: string) =>
    request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /***********************
   * Register new user
   * @param fullName - User's full name
   * @param email - User's email
   * @param password - User's password (plain text - backend will hash)
   * @param userRole - Optional role (defaults to "user")
   * @returns Newly created user data
   ***********************/
  signUp: (
    fullName: string,
    email: string,
    password: string,
    userRole?: string
  ) =>
    request("/api/users/register", {
      method: "POST",
      body: JSON.stringify({
        fullName,
        email,
        password,
        userRole: userRole || "user",
      }),
    }),

  /***********************
   * Get user by ID
   * @param id - User ID
   * @returns User data
   ***********************/
  getUser: (id: number) => request(`/users/${id}`, { method: "GET" }),

  /***********************
   * BOOK ENDPOINTS
   ***********************/

  /***********************
   * Add new book (admin only)
   * @param bookData - Book information from form
   * @returns Created book data
   ***********************/
  addBook: (bookData: {
    title: string;
    author: string;
    isbn?: string;
    publisher?: string;
    publishYear?: string;
    category?: string;
    description?: string;
    copies: string;
    location?: string;
    pages?: string;
  }) =>
    request("/api/books", {
      method: "POST",
      body: JSON.stringify(bookData),
    }),

  /***********************
   * Get all books
   * @returns Array of all books
   ***********************/
  getBooks: () => request("/api/books", { method: "GET" }),

  /***********************
   * Get single book by ID
   * @param id - Book ID
   * @returns Book data
   ***********************/
  getBook: (id: number) => request(`/api/books/${id}`, { method: "GET" }),
};
