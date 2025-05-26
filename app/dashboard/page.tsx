"use client"

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "../api/apiClient";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, SignedIn, SignedOut } from "@clerk/nextjs";

export default function DashboardPage() {
  const { isLoaded, userId, sessionId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const api = useApi();
  const { toast } = useToast();
  const [userContent, setUserContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!userId) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user content
        const userData = await api.get("/role/user");
        setUserContent(userData);

      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, userId, router, api, user, toast]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {!isLoaded ? (
          <div>Loading...</div>
        ) : (
          <>
            <SignedIn>
              <div className="w-full max-w-4xl space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>

                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Details about the authenticated user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user ? (
                      <div>
                        <p>User ID: {user.id}</p>
                        <p>Username: {user.username}</p>
                        <p>Email: {user.emailAddresses[0].emailAddress}</p>
                      </div>
                    ) : (
                      <p>Loading user data...</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Content</CardTitle>
                    <CardDescription>Content for authenticated users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-20 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading...</p>
                      </div>
                    ) : (
                      <p>{userContent}</p>
                    )}
                  </CardContent>
                </Card>

              </div>
            </SignedIn>
            <SignedOut>
              <div>Redirecting to login...</div>
            </SignedOut>
          </>
        )}
      </main>
    </div>
  );
}