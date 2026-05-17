'use client';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/dashboard/login';
  };

  return (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-400 hover:text-gold-500 border border-navy-700 hover:border-gold-500/40 px-4 py-2 transition-colors"
    >
      <LogOut className="w-3 h-3" />
      Sign out
    </button>
  );
}
