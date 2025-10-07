interface NavbarProps {
  userType: 'admin' | 'user' | null;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

