"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {/* <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
            <CardDescription>
              Nhập thông tin để tạo tài khoản mới
            </CardDescription>
          </CardHeader> */}
          <CardContent>
            <SignUp 
              routing="path"
              path="/register"
              fallbackRedirectUrl="/register/sso-callback"
              signInUrl="/login"
            />
          </CardContent>
        {/* </Card> */}
      </main>
    </div>
  );
}