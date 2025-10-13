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
import "../styles/signup.css";

interface SignUpProps {
  onSignUp: (userType: "admin" | "user") => void;
  onNavigate: (screen: string) => void;
}

export function SignUp({ onSignUp, onNavigate }: SignUpProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Simple demo logic
    if (formData.email.includes("admin")) {
      onSignUp("admin");
    } else {
      onSignUp("user");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        {/* Header */}
        <div className="signup-header">
          <div className="signup-logo-container">
            <BookOpen className="signup-logo" />
          </div>
          <h2>Create Account</h2>
          <p>Join our library community</p>
        </div>

        {/* Sign Up Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create your library account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="signup-form-group">
              <div className="signup-name-grid">
                <div className="signup-field">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="signup-field">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="signup-field">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="signup-field">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                />
              </div>

              <div className="signup-field">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                />
              </div>

              <Button type="submit" className="signup-form-group">
                Create Account
              </Button>
            </form>

            <div className="signup-link-section">
              <p>
                Already have an account?{" "}
                <button onClick={() => onNavigate("sign-in")}>Sign in</button>
              </p>
            </div>

            {/* Demo Instructions */}
            <div className="signup-demo-box">
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
