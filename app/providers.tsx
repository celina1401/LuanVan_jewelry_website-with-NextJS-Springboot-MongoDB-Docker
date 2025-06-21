// app/providers.tsx
'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';
import { CartProvider } from "@/contexts/cart-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ClerkProvider>
  );
}
