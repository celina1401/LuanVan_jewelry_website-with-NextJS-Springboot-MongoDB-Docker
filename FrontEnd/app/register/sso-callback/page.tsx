'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useClerk } from '@clerk/nextjs';

export default function SSOCallback() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { handleRedirectCallback } = useClerk();

  // B1: Xử lý redirect sau SSO
  useEffect(() => {
    const processSSOCallback = async () => {
      try {
        await handleRedirectCallback({});
      } catch (error) {
        console.error('SSO_CALLBACK_ERROR:', error);
        router.push('/register?error=sso_failed');
      }
    };

    processSSOCallback();
  }, [handleRedirectCallback, router]);

  // B2: Gán role "user" nếu chưa có và đồng bộ backend
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !userLoaded) return;

    const syncUserWithBackend = async () => {
      console.log('SYNC_REGISTER: Starting user sync...');
      try {
        const token = await getToken();
        if (!token) {
          console.error('SYNC_REGISTER: No token available.');
          return;
        }

        let role = user.publicMetadata?.role || 'user';

        if (!user.publicMetadata?.role) {
          console.log('SYNC_REGISTER: User has no role, setting default "user" role in Clerk...');
          await fetch('/api/set-role', { // Sử dụng relative path
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: user.id, role }),
          });
        }

        const userData = {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          username: user.username || user.primaryEmailAddress?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          imageUrl: user.imageUrl || '',
          provider: user.externalAccounts?.[0]?.provider || 'clerk',
          role,
        };

        console.log('SYNC_REGISTER: Sending data to backend:', userData);

        const response = await fetch('http://localhost:8080/api/users/sync-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
          credentials: 'include',
        });

        if (response.ok) {
          const syncedUser = await response.json();
          console.log('✅ SYNC_REGISTER: User synced successfully:', syncedUser);
        } else {
          const errorText = await response.text();
          console.error(`❌ SYNC_REGISTER: Failed to sync user. Status: ${response.status}`, errorText);
        }
      } catch (error) {
        console.error('❌ SYNC_REGISTER: An exception occurred during fetch:', error);
      } finally {
        console.log('SYNC_REGISTER: Redirecting to dashboard...');
        router.push('/dashboard');
      }
    };

    syncUserWithBackend();
  }, [isLoaded, isSignedIn, user, userLoaded, getToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-4">Completing registration...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}
