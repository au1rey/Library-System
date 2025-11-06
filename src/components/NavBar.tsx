/*********************************
* File Name: NavBar.tsx 
* About:
*   Navigation bar component for the library management system.
*   Displays different navigation options based on user type (admin or user).
*   Includes a logout button.
**********************************/

import { LogOut, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import './styles/Navbar.css';

// Props for Navbar component: admin/user type, navigation handler, logout handler
interface NavbarProps {
  userType: 'admin' | 'user' | null;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function Navbar({ userType, onNavigate, onLogout }: NavbarProps) {
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-left">
          <BookOpen className="nav-icon" />
          <h1 className="nav-title">Library System</h1> {/* Library Header and Icon */} 
        </div>
        {/* Admin Nav Buttons*/} 
        <div className="nav-links">
          {userType === 'admin' && (
            <>
              <Button variant="ghost" onClick={() => onNavigate('admin-welcome')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => onNavigate('admin-add-book')}>
                Add Book
              </Button>
              <Button variant="ghost" onClick={() => onNavigate('admin-search')}>
                Search
              </Button>
            </>
          )}
          {/* User Nav Buttons*/} 
          {userType === 'user' && (
            <>
              <Button variant="ghost" onClick={() => onNavigate('user-welcome')}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => onNavigate('user-search')}>
                Search
              </Button>
              <Button variant="ghost" onClick={() => onNavigate('user-books')}>
                Your Books
              </Button>
            </>
          )}
          {/* Log Out Button*/} 
          {userType && (
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="logout-icon" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

