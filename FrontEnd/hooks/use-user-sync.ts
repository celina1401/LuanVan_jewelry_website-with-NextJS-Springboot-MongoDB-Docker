"use client"
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export const useUserSync = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !userLoaded) return;

    const syncUser = async () => {
      try {
        const token = await getToken();
        if (!token) return;

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

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9001"}/api/users/sync-role`, {
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
          console.log('✅ User synced to backend:', syncedUser);
        } else {
          const errorText = await response.text();
          console.error(`❌ Failed to sync user data. Status: ${response.status}. Message: ${errorText}`);
        }
      } catch (error) {
        console.error('❌ Error syncing user data:', error);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user, userLoaded, getToken]);

  return { isLoaded, isSignedIn, user };
};