"use client";
import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export const useUserSync = () => {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    if (!authLoaded || !userLoaded || !isSignedIn || !user) return;

    const syncUser = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.warn('⚠️ No token found, skipping user sync');
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

        const API_URL = 'http://localhost:9001';
        const response = await fetch(`${API_URL}/api/users/sync-role`, {
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
          console.error(`❌ Failed to sync user. Status: ${response.status}. Message: ${errorText}`);
        }
      } catch (error: any) {
        console.error('❌ Error syncing user:', error?.message || error);
      }
    };

    syncUser();
  }, [authLoaded, userLoaded, isSignedIn, user, getToken]);

  return { isLoaded: authLoaded && userLoaded, isSignedIn, user };
};
