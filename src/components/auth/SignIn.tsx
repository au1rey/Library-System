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
import "../styles/signin.css";

interface SignInProps {
  onSignIn: (userType: "admin" | "user") => void;
  onNavigate: (screen: string) => void;
}

export function SignIn({ onSignIn, onNavigate }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo logic - in real app, this would validate against a database
    if (email.includes("admin")) {
      onSignIn("admin");
    } else {
      onSignIn("user");
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
          <p>Sign in to your library account</p>
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
              <div className="signin-field">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                />
              </div>

              <Button type="submit" className="signin-form-group">
                Sign In
              </Button>
            </form>

            <div className="signin-link-section">
              <p>
                Don't have an account?{" "}
                <button onClick={() => onNavigate("sign-up")}>Sign up</button>
              </p>
            </div>

            {/* Demo Instructions */}
            <div className="signin-demo-box">
              <p>
                <strong>Demo Instructions:</strong>
              </p>
              <p>• Use any email with "admin" for admin access</p>
              <p>• Use any other email for user access</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
