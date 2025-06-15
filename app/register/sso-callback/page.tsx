// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth, useUser } from "@clerk/nextjs";

// export default function SSOCallback() {
//   const router = useRouter();
//   const { isLoaded, userId } = useAuth();
//   const { user } = useUser();

//   useEffect(() => {
//     if (!isLoaded) return;

//     if (!userId || !user) {
//       console.error("Không có thông tin người dùng hoặc userId");
//       return;
//     }

//     const syncUserWithBackend = async () => {
//       try {
//         // Get user data from Clerk
//         const userData = {
//           userId: user.id,
//           email: user.emailAddresses[0]?.emailAddress,
//           username: user.username || user.emailAddresses[0]?.emailAddress,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           imageUrl: user.imageUrl,
//           provider: user.externalAccounts?.[0]?.provider || 'clerk', // Thêm kiểm tra an toàn
//           role: user.publicMetadata?.role || 'user'
//         };

//         // Sync user data with backend
//         const response = await fetch('/api/users/sync-role', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(userData),
//         });

//         if (!response.ok) {
//           throw new Error('Failed to sync user data');
//         }

//         // Redirect to homepage after successful registration
//         router.push("/");

//       } catch (error) {
//         console.error('Error syncing user data:', error);
//         // Thêm thông báo lỗi chi tiết hơn
//         router.push("/register?error=sync_failed");
//       }
//     };

//     syncUserWithBackend();
//   }, [isLoaded, userId, user, router]);

//   return (
//     <div className="flex min-h-screen items-center justify-center">
//       <div className="text-center">
//         <p className="text-lg mb-4">Completing registration...</p>
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";

export default function SSOCallback() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    // Handle Clerk's SSO redirect callback
    const processSSOCallback = async () => {
      try {
        await handleRedirectCallback({
          redirectUrl: "/", // Redirect to homepage on success
          afterSignInUrl: "/", // Fallback for sign-in
          afterSignUpUrl: "/", // Fallback for sign-up
        });
      } catch (error) {
        console.error("Error processing SSO callback:", error);
        router.push("/register?error=sso_failed");
      }
    };

    processSSOCallback();
  }, [handleRedirectCallback, router]);

  useEffect(() => {
    // Only sync user data with backend if user is loaded, signed in, and user data exists
    if (!isLoaded || !isSignedIn || !user) return;

    const syncUserWithBackend = async () => {
      try {
        const userData = {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          username: user.username || user.primaryEmailAddress?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl || "",
          provider: user.externalAccounts?.[0]?.provider || "clerk",
          role: user.publicMetadata?.role || "user",
        };

        const response = await fetch("/api/users/sync-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error("Failed to sync user data");
        }

        router.push("/");
      } catch (error) {
        console.error("Error syncing user data:", error);
        router.push("/register?error=sync_failed");
      }
    };

    syncUserWithBackend();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-4">Completing registration...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}