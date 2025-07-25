// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';
import { ClerkProvider } from '@clerk/nextjs';
import { RedirectAdmin } from './components/RedirectAdmin';
import UserSyncClient from './components/UserSyncClient';
import ClientChatBoxWrapper from "@/app/ClientChatBoxWrapper";

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
    >
      {/* <html lang="en" suppressHydrationWarning> */}
      {/* <link rel="icon" href="images/logo.png" />
        <body className={inter.className} suppressHydrationWarning> */}
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/images/logo.png" />
        </head>
        <body className={inter.className} suppressHydrationWarning>

          <RedirectAdmin />
          <UserSyncClient />
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <ClientChatBoxWrapper />
            </ThemeProvider>
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
