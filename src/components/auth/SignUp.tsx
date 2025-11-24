/*********************************
 * File Name: SignUp.tsx
 * About:
 *   Sign-up component for the library management system.
 *   Handles user registration for both admins and regular users.

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
import { api } from "../../services/api";
import "../styles/signin.css";

interface SignUpProps {
  onSignUp: (userType: "admin" | "user") => void;
  onNavigate: (screen: string) => void;
}

export function SignUp({ onSignUp, onNavigate }: SignUpProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /***********************
   * Handle sign-up form submission
   * Calls backend API and navigates on success
   ***********************/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call real API via api service
      const data = await api.signUp(fullName, email, password);

      // Notify App.tsx with user role (admin or user)
      onSignUp(data.userRole);
    } catch (err) {
      // Display error message to user
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Sign up failed. Please try again.");
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
          <h2>Create an Account</h2>
          <p>Sign up to access the library system</p>
        </div>

        {/* Sign Up Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter your details below</CardDescription>
          </CardHeader>
          <CardContent>
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

            <form onSubmit={handleSubmit} className="signin-form-group">
              <div className="signin-field">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="signin-field">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>

            {/* Navigation link to Sign In */}
            <div className="signin-link-section">
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => onNavigate("sign-in")}
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
