import { getCurrentAccount } from '@/lib/auth';
import { ProfileForm } from './ProfileForm';

export default async function AdminProfilePage() {
  const account = await getCurrentAccount();
  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-display font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>My Profile</h1>
      <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>Update your name and password</p>
      <ProfileForm email={account!.email} displayName={account!.display_name} />
    </div>
  );
}
