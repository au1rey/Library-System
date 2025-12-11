/*********************************
 * File Name: SignIn.tsx
 * About:
 *   Sign-in component for the library management system.
 *   Handles user authentication for both admins and regular users.
 *   connects to real backend API
 * Changes:
 *   - Added API integration via auth service
 *   - Added error handling and loading states
 *   - Removed demo instructions
 **********************************/
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { BookOpen } from "lucide-react";
import { signIn } from "../../services/auth";
import "../styles/signin.css";

interface SignInProps {
  onSignIn: (userType: "admin" | "user") => void;
  onNavigate: (screen: string) => void;
}

export function SignIn({ onSignIn, onNavigate }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /***********************
   * Handle sign-in form submission
   * Calls backend API and navigates on success
   ***********************/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call real API via auth service
      const user = await signIn(email, password);

      // Notify App.tsx with user role (admin or user)
      onSignIn(user.userRole);
    } catch (err) {
      // Display error message to user
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-wrapper">
        {/* Header */}
        <div className="signin-header">
          <div className="signin-logo-container">
            <BookOpen className="signin-logo" />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign In to Your Library Account</p>
        </div>

        {/* Sign In Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the library system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="signin-form-group">
              {/* Error Message Display */}
              {error && (
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: "0.375rem",
                    marginBottom: "1rem",
                    border: "1px solid #fca5a5",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="signin-field">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="signin-field">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="signin-form-group"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="signin-link-section">
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => onNavigate("sign-up")}
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
