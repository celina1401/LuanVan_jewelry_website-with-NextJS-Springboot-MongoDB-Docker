// app/providers.tsx
'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';
import { CartProvider } from "@/contexts/cart-context";
import { NotificationProvider } from "@/contexts/notification-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <CartProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </CartProvider>
    </ClerkProvider>
  );
}
