// app/providers.tsx
'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';
import { CartProvider } from "@/contexts/cart-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ChatProvider } from "@/contexts/chat-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <CartProvider>
        <NotificationProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </NotificationProvider>
      </CartProvider>
    </ClerkProvider>
  );
}
