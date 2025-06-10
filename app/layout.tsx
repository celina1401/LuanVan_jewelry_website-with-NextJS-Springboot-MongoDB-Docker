import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { CartProvider } from '../contexts/cart-context';
import { Toaster } from '@/components/ui/toaster';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'T&C Jewelry',
  description: 'Next.js + Spring Boot + MongoDB full stack application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    console.error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables.');
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey ?? ''}
      // afterSignInUrl="/dashboard"
      // afterSignUpUrl="/dashboard"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <CartProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
            <Toaster />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
