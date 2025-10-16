import { useState } from "react";
import { Navbar } from "./components/NavBar.tsx";
import { SignIn } from "./components/auth/SignIn.tsx";
import { SignUp } from "./components/auth/SignUp.tsx";
import { AdminWelcome } from "./components/admins/AdminWelcome.tsx";
import { UserWelcome } from "./components/users/UserWelcome.tsx";
/*
import { AddBook } from "./components/admins/AdminAddBook.tsx";
import { AdminSearch } from "./components/admins/AdminSearch.tsx";
import { UserSearch } from "./components/users/UserSearch.tsx";
import { UserBooks } from "./components/users/UserBooks.tsx";*/
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

  // SIGN IN FUNCTION
  // Handle role-based sign in and navigate to respective welcome screen
  const handleSignIn = (type: "admin" | "user") => {
    setUserType(type);
    if (type === "admin") {
      setCurrentScreen("admin-welcome");
    } else {
      setCurrentScreen("user-welcome");
    }
  };

  // SIGN UP FUNCTION
  // Handle role-based sign up and navigate to respective welcome screen
  const handleSignUp = (type: "admin" | "user") => {
    setUserType(type);
    if (type === "admin") {
      setCurrentScreen("admin-welcome");
    } else {
      setCurrentScreen("user-welcome");
    }
  };

  // LOGOUT FUNCTION
  // Reset user type and navigate to sign-in screen
  const handleLogout = () => {
    setUserType(null);
    setCurrentScreen("sign-in");
  };

  // NAVIGATION FUNCTION
  // Handle navigation between screens
  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  // RENDER FUNCTION
  // Render content based on current screen
  const renderContent = () => {
    switch (currentScreen) {
      case "sign-in":
        return <SignIn onSignIn={handleSignIn} onNavigate={handleNavigate} />;
      case "sign-up":
        return <SignUp onSignUp={handleSignUp} onNavigate={handleNavigate} />;
      case "admin-welcome":
        return <AdminWelcome onNavigate={handleNavigate} />;
      /* case 'admin-add-book':  TO::DO Uncomment when components are ready
        return <AddBook />;
      case 'admin-search':
        return <AdminSearch />; */
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
