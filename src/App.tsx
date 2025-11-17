/*********************************
 * File Name: App.tsx
 * About:
 *   Main application component that manages routing and authentication state.
 * Changes:
 *   - Added useEffect to check for existing user session on load
 *   - Integrated auth service for logout
 *   - Added loading state while checking authentication
 **********************************/
import { useState, useEffect } from "react";
import { Navbar } from "./components/NavBar.tsx";
import { SignIn } from "./components/auth/SignIn.tsx";
import { SignUp } from "./components/auth/SignUp.tsx";
import { AdminWelcome } from "./components/admins/AdminWelcome.tsx";
import { UserWelcome } from "./components/users/UserWelcome.tsx";
import { AddBook } from "./components/admins/AdminAddBook.tsx";
import { AdminSearch } from "./components/admins/AdminSearch.tsx";
import { UserSearch } from "./components/users/UserSearch.tsx";
import { UserBooks } from "./components/users/UserBooks.tsx";
import { getCurrentUser, signOut as authSignOut } from "./services/auth";
import "./globals.css";

// Define the possible screens
type Screen =
  | "sign-in"
  | "sign-up"
  | "admin-welcome"
  | "admin-add-book"
  | "admin-search"
  | "user-welcome"
  | "user-search"
  | "user-books";

// Define possible user types
type UserType = "admin" | "user" | null;

export default function App() {
  // State to track current screen and user type
  const [currentScreen, setCurrentScreen] = useState<Screen>("sign-in");
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  /***********************
   * Check for existing user session on app load
   * If user is logged in, restore their session
   ***********************/
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserType(user.userRole);
      setCurrentScreen(
        user.userRole === "admin" ? "admin-welcome" : "user-welcome"
      );
    }
    setIsLoading(false);
  }, []);

  /***********************
   * SIGN IN FUNCTION
   * Handle role-based sign in and navigate to respective welcome screen
   ***********************/
  const handleSignIn = (type: "admin" | "user") => {
    setUserType(type);
    if (type === "admin") {
      setCurrentScreen("admin-welcome");
    } else {
      setCurrentScreen("user-welcome");
    }
  };

  /***********************
   * SIGN UP FUNCTION
   * Handle role-based sign up and navigate to respective welcome screen
   ***********************/
  const handleSignUp = (type: "admin" | "user") => {
    setUserType(type);
    if (type === "admin") {
      setCurrentScreen("admin-welcome");
    } else {
      setCurrentScreen("user-welcome");
    }
  };

  /***********************
   * LOGOUT FUNCTION
   * Clear user session and navigate to sign-in screen
   ***********************/
  const handleLogout = () => {
    authSignOut(); // Clear localStorage
    setUserType(null);
    setCurrentScreen("sign-in");
  };

  /***********************
   * NAVIGATION FUNCTION
   * Handle navigation between screens
   ***********************/
  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  /***********************
   * RENDER FUNCTION
   * Render content based on current screen
   ***********************/
  const renderContent = () => {
    switch (currentScreen) {
      case "sign-in":
        return <SignIn onSignIn={handleSignIn} onNavigate={handleNavigate} />;
      case "sign-up":
        return <SignUp onSignUp={handleSignUp} onNavigate={handleNavigate} />;
      case "admin-welcome":
        return <AdminWelcome onNavigate={handleNavigate} />;
      case "admin-add-book":
        return <AddBook />;
      case "admin-search":
        return <AdminSearch />;
      case "user-welcome":
        return <UserWelcome onNavigate={handleNavigate} />;
      case "user-search":
        return <UserSearch />;
      case "user-books":
        return <UserBooks />;
      default:
        return <SignIn onSignIn={handleSignIn} onNavigate={handleNavigate} />;
    }
  };

  /***********************
   * Show loading screen while checking authentication
   ***********************/
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.25rem",
        }}
      >
        Loading...
      </div>
    );
  }

  // Conditionally render Navbar on everything but auth screens
  const showNavBar = currentScreen !== "sign-in" && currentScreen !== "sign-up";

  return (
    <div className="app-container">
      {showNavBar && (
        <Navbar
          userType={userType}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {renderContent()}
    </div>
  );
}
