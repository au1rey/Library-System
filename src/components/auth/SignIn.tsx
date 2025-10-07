
interface SignInProps {
  onSignIn: (userType: 'admin' | 'user') => void;
  onNavigate: (screen: string) => void;
}
// TO::DO NON DEMO: Add real authentication logic
export function SignIn({ onSignIn, onNavigate }: SignInProps) {
  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => onSignIn("user")}>Sign in as User</button>
      <button onClick={() => onSignIn("admin")}>Sign in as Admin</button>
      <p>
        Don't have an account?{" "}
        <button onClick={() => onNavigate("sign-up")}>Sign Up</button>
      </p>
    </div>
  );
};