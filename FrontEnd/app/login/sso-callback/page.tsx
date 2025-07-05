"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

export default function SSOCallback() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !userLoaded) return;

    const syncUserWithBackend = async () => {
      console.log('SYNC_LOGIN: Starting user sync...');
      try {
        const token = await getToken();
        if (!token) {
          console.error('SYNC_LOGIN: No token available.');
          return;
        }

        const userData = {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          username: user.username || user.primaryEmailAddress?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          imageUrl: user.imageUrl || '',
          provider: user.externalAccounts?.[0]?.provider || 'clerk',
          role: user.publicMetadata?.role || 'user',
        };

        console.log('SYNC_LOGIN: Sending data to backend:', userData);

        const response = await fetch('http://localhost:9001/api/users/sync-role', {
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
          console.log('✅ SYNC_LOGIN: User synced successfully:', syncedUser);
        } else {
          const errorText = await response.text();
          console.error(`❌ SYNC_LOGIN: Failed to sync user. Status: ${response.status}`, errorText);
        }
      } catch (error) {
        console.error('❌ SYNC_LOGIN: An exception occurred during fetch:', error);
      } finally {
        console.log('SYNC_LOGIN: Redirecting to dashboard...');
        router.push("/dashboard");
      }
    };

    syncUserWithBackend();
  }, [isLoaded, isSignedIn, user, userLoaded, getToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-4">Completing login...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}