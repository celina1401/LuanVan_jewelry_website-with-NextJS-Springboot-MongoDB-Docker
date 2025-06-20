'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

export function RedirectAdmin() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user.publicMetadata?.role;
    const isAdminRoute = pathname.startsWith('/admin');

    if (isAdminRoute && role !== 'admin') {
      router.replace('/'); // hoặc "/unauthorized" nếu muốn
    }
  }, [user, isLoaded, router, pathname]);

  return null;
}
