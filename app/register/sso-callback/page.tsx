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
        await handleRedirectCallback({
          redirectUrl: '/',
          afterSignInUrl: '/',
          afterSignUpUrl: '/',
        });
      } catch (error) {
        console.error('Error processing SSO callback:', error);
        router.push('/register?error=sso_failed');
      }
    };

    processSSOCallback();
  }, [handleRedirectCallback, router]);

  // B2: Gán role "user" nếu chưa có và đồng bộ backend
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !userLoaded) return;

    const syncUserWithBackend = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No authentication token available');

        let role = user.publicMetadata?.role;

        // Gán role nếu chưa có
        if (!role) {
          role = 'user';
          const res = await fetch('http://localhost:3000/api/set-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: user.id, role }),
          });

          if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed to set role: ${err}`);
          }

          const data = await res.json();
          console.log('✅ Set role response:', data);
        }

        // Gửi dữ liệu đồng bộ backend (Spring Boot + MongoDB)
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

        const response = await fetch('http://localhost:8080/api/users/sync-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`❌ Failed to sync user data: ${errorData}`);
        }

        const syncedUser = await response.json();
        console.log('✅ User synced to backend:', syncedUser);

        router.push('/');

      } catch (error) {
        console.error('❌ Error syncing user data:', error);
        router.push('/register?error=sync_failed');
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
