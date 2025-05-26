"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "../api/apiClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const api = useApi();
  const { toast } = useToast();

  const [adminContent, setAdminContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      // Clerk is not yet loaded, do nothing
      return;
    }

    // Redirect to login if not signed in (optional if using Clerk middleware)
    if (!userId) {
      router.push("/login");
      return;
    }

    // Check if user has admin role before fetching (optional, backend will also check)
    if (user?.publicMetadata.role !== "admin") {
        // Redirect or show unauthorized message
        toast({
            title: "Access Denied",
            description: "You do not have permission to view this page.",
            variant: "destructive",
        });
        router.push("/dashboard"); // Redirect non-admins
        return;
    }

    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // Fetch admin content from the new endpoint
        const adminData = await api.get("/role/admin");
        setAdminContent(adminData);
      } catch (error: any) {
        console.error("Failed to fetch admin data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch admin data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();

  }, [isLoaded, userId, user, router, api, toast]); // Add dependencies

  // Show loading state while Clerk is loading or data is fetching
  if (!isLoaded || isLoading) {
    return <div>Loading admin page...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <SignedIn>
          <div className="w-full max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            {/* Card to display admin-specific content */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Content</CardTitle>
                <CardDescription>Content visible only to administrators</CardDescription>
              </CardHeader>
              <CardContent>
                {adminContent ? (
                  <p>{adminContent}</p>
                ) : (
                  <p className="text-muted-foreground">No admin content available or loading...</p>
                )}
              </CardContent>
            </Card>

            {/* Add more admin specific UI elements here */}

          </div>
        </SignedIn>
        <SignedOut>
          {/* This part might be redundant if using Clerk middleware for route protection */}
          <div>Redirecting to login...</div>
        </SignedOut>
      </main>
    </div>
  );
} 