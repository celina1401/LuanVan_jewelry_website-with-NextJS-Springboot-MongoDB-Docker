// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { CartProvider } from '../contexts/cart-context';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';
import { ClerkProvider } from '@clerk/nextjs';
import { RedirectAdmin } from './components/RedirectAdmin';

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
      signInUrl="/login"
      signUpUrl="/register"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <RedirectAdmin/>
          <Providers>
            <CartProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </CartProvider>
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
