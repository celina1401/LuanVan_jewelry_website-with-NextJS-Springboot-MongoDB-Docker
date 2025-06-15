"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignIn } from "@clerk/nextjs"; // Sửa từ SignUp thành SignIn

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                  footerActionLink: 
                    'text-primary hover:text-primary/90',
                }
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}