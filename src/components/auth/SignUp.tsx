interface SignUpProps {
  onSignUp: (userType: 'admin' | 'user') => void;
  onNavigate: (screen: string) => void;
}

export function SignUp({ onSignUp, onNavigate }: SignUpProps) {
     return (
    <div>
      <h1>Sign Up</h1>
      <button onClick={() => onSignUp("user")}>Sign up as User</button>
      <button onClick={() => onSignUp("admin")}>Sign up as Admin</button>
      <p>
        Already have an account?{" "}
        <button onClick={() => onNavigate("sign-in")}>Sign In</button>
      </p>
    </div>
  );
};