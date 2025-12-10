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

  //token if available
  const token = localStorage.getItem("authToken");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

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

  /***********************
   * Get joined book + copy data
   * Provides status counts for user search UI
   ***********************/
  getBooksWithCopies: () =>
    request("/api/books/books-with-copies", { method: "GET" }),

  /***********************
   * Checkout a book for the current user
   * Automatically grabs the first available copy
   ***********************/
  checkoutBook: (bookId: number, userId: number) =>
    request(`/api/loans/checkout`, {
      method: "POST",
      body: JSON.stringify({ bookId, userId }),
    }),

  /***********************
   * Reserve a book for later pickup
   ***********************/
  reserveBook: (bookId: number, userId: number) =>
    request("/api/reservations", {
      method: "POST",
      body: JSON.stringify({ bookId, userId }),
    }),

  /***********************
   * LOAN ENDPOINTS
   ***********************/
  getActiveLoans: () => request("/api/loans/active", { method: "GET" }),

  getLoanStats: () => request("/api/loans/stats", { method: "GET" }),

  getUserLoans: (userId: number) =>
    request(`/api/loans/user/${userId}`, { method: "GET" }),

  returnBook: (loanId: number) =>
    request(`/api/loans/return/${loanId}`, { method: "PUT" }),

  /***********************
   * RESERVATION ENDPOINTS
   ***********************/
  getUserReservations: (userId: number) =>
    request(`/api/reservations/user/${userId}`, { method: "GET" }),

  getAllReservations: () => request("/api/reservations/all", { method: "GET" }),

  fulfillReservation: (reservationId: number) =>
    request(`/api/reservations/${reservationId}/fulfill`, {
      method: "POST",
    }),

  cancelReservation: (reservationId: number) =>
    request(`/api/reservations/${reservationId}/cancel`, {
      method: "POST",
    }),

  getReservationStats: async () => {
    const reservations: any[] = await request("/api/reservations/all", {
      method: "GET",
    });
    const pending = reservations.filter((r) => r.status === "pending").length;
    const ready = reservations.filter((r) => r.status === "ready").length;
    return {
      pending_reservations: pending,
      ready_reservations: ready,
    };
  },

  /***********************
   * Add new book with optional cover image
   * Sends FormData instead of JSON to support file upload
   ***********************/
  addBookWithImage: async (
    bookData: {
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
    },
    coverImage?: File | null
  ) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("title", bookData.title);
    formData.append("author", bookData.author);
    if (bookData.isbn) formData.append("isbn", bookData.isbn);
    if (bookData.publisher) formData.append("publisher", bookData.publisher);
    if (bookData.publishYear)
      formData.append("publishYear", bookData.publishYear);
    if (bookData.category) formData.append("category", bookData.category);
    if (bookData.description)
      formData.append("description", bookData.description);
    formData.append("copies", bookData.copies);
    if (bookData.location) formData.append("location", bookData.location);
    if (bookData.pages) formData.append("pages", bookData.pages);

    // Append cover image if provided
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    // Get token
    const token = localStorage.getItem("authToken");
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Send FormData (don't set Content-Type - browser sets it with boundary)
    const res = await fetch(`${API_BASE}/api/books`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }

    return res.json();
  },
  /***********************
   * Update existing book with optional cover image
   * Sends FormData to support file upload
   * @param bookId - ID of book to update
   * @param bookData - Updated book information
   * @param coverImage - Optional new cover image file
   * @returns Updated book data
   ***********************/
  updateBookWithImage: async (
    bookId: number,
    bookData: {
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
    },
    coverImage?: File | null
  ) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append("title", bookData.title);
    formData.append("author", bookData.author);
    if (bookData.isbn) formData.append("isbn", bookData.isbn);
    if (bookData.publisher) formData.append("publisher", bookData.publisher);
    if (bookData.publishYear)
      formData.append("publishYear", bookData.publishYear);
    if (bookData.category) formData.append("category", bookData.category);
    if (bookData.description)
      formData.append("description", bookData.description);
    formData.append("copies", bookData.copies);
    if (bookData.location) formData.append("location", bookData.location);
    if (bookData.pages) formData.append("pages", bookData.pages);

    // Append cover image if provided
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    // Get token
    const token = localStorage.getItem("authToken");
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Send FormData with PUT method
    const res = await fetch(`${API_BASE}/api/books/${bookId}`, {
      method: "PUT",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }

    const data = await res.json();
    return data.book; // Return the updated book object
  },
};
