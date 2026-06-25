// app/dashboard/SignOutButton.tsx
'use client';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/dashboard/login';
  };
  return (
    <button onClick={handleSignOut} className="btn-ghost text-sm">
      <LogOut className="w-4 h-4" /> Sign out
    </button>
  );
}
