/***********************
 * auth.ts - Authentication Service
 * About:
 *   Manages authentication state and user session.
 *   Stores user data in localStorage for persistence.
 * Functions:
 *   - signIn(): Authenticate user and store session
 *   - signUp(): Register new user and store session
 *   - signOut(): Clear user session
 *   - getCurrentUser(): Retrieve current user from storage
 ***********************/

import { api } from "./api";

/***********************
 * User type definition
 * Matches backend response format from libraryUsers.ts
 ***********************/
export interface User {
  id: number;
  fullName: string;
  email: string;
  userRole: "admin" | "user";
}

/***********************
 * Sign in user
 * @param email - User's email
 * @param password - User's password
 * @returns User object with role
 * @throws Error if authentication fails
 ***********************/
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const data = await api.signIn(email, password);

    // Store user in localStorage for session persistence
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Sign in failed");
  }
}

/***********************
 * Sign up new user
 * @param fullName - User's full name
 * @param email - User's email
 * @param password - User's password
 * @param userRole - User role (admin or user)
 * @returns User object with role
 * @throws Error if registration fails
 ***********************/
export async function signUp(
  fullName: string,
  email: string,
  password: string,
  userRole?: "admin" | "user"
): Promise<User> {
  try {
    const data = await api.signUp(fullName, email, password, userRole);

    // Store user in localStorage for session persistence
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Sign up failed");
  }
}

/***********************
 * Sign out user
 * Clears user session from localStorage
 ***********************/
export function signOut(): void {
  localStorage.removeItem("currentUser");
}

/***********************
 * Get current user from localStorage
 * @returns User object if logged in, null otherwise
 ***********************/
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
