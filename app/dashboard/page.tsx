"use client"

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "../api/apiClient";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, SignedIn, SignedOut } from "@clerk/nextjs";

export default function DashboardPage() {
  const { isLoaded, userId, sessionId, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded || !userId || !user) {
      return;
    }

    // Lấy role từ public_metadata
    const userRole = user.publicMetadata?.role;
    console.log("User Role:", userRole);
    
    // Chuyển hướng dựa trên role
    if (userRole === "admin") {
      router.push("/admin");
      return;
    }
    
    // Đồng bộ role với backend
    const syncRole = async () => {
      try {
        await api.post("/api/users/sync-role", {
          userId: user.id,
          role: userRole || "user" // Mặc định là "user" nếu không có role
        });
        console.log("Role synced with backend");
      } catch (error) {
        console.error("Failed to sync role with backend", error);
      }
    };

    syncRole();
  }, [isLoaded, userId, user]);
  const router = useRouter();
  const api = useApi();
  const { toast } = useToast();
  const [userContent, setUserContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId || !isSignedIn) {
      // Optionally redirect to login if user is not authenticated and isLoaded is true
      if (isLoaded) {
        router.push("/login");
      }
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user content
        const userData = await api.get("/role/user");
        setUserContent(userData.message); // Access the message property

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
  }, [isLoaded, userId, isSignedIn, router, api, user, toast]);

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
                        <p><b>User ID:</b> {user.id}</p>
                        <p><b>Username:</b> {user.username}</p>
                        <p><b>Email:</b> {user.emailAddresses[0]?.emailAddress}</p>
                        <p><b>Role:</b> {typeof user.publicMetadata?.role === "string" ? user.publicMetadata.role : (user.publicMetadata?.role ? JSON.stringify(user.publicMetadata.role) : "user")}</p>
                        {user.imageUrl && (
                          <img
                            src={user.imageUrl}
                            alt="User Avatar"
                            className="w-16 h-16 rounded-full mt-2"
                          />
                        )}
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
