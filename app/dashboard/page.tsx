"use client"

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useApi } from "../api/apiClient";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const api = useApi();
  const { toast } = useToast();
  const [userContent, setUserContent] = useState<string | null>(null);
  const [adminContent, setAdminContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user content
        const userData = await api.get("/test/user");
        setUserContent(userData);

        // Try to fetch admin content if the user has admin role
        if (user?.roles.includes("ROLE_ADMIN")) {
          try {
            const adminData = await api.get("/test/admin");
            setAdminContent(adminData);
          } catch (error) {
            console.log("User is not an admin");
          }
        }
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
  }, [isAuthenticated, router, api, user, toast]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.username}</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-medium">{user?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Roles:</span>
                    <span className="font-medium">{user?.roles.join(", ")}</span>
                  </div>
                </div>
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
            
            {user?.roles.includes("ROLE_ADMIN") && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Content</CardTitle>
                  <CardDescription>Content for administrators only</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-20 flex items-center justify-center">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : (
                    <p>{adminContent}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}