// components/AuthActions.tsx
'use client';

import { useUser, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function AuthActions() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null; // chờ load xong

  // Lấy role từ publicMetadata
  const role = user?.publicMetadata?.role as string | "user";
  console.log(role)

  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost">Đăng nhập</Button>
        </SignInButton>
        <SignUpButton mode="modal" >
          <Button>Đăng ký</Button>
        </SignUpButton>
      </SignedOut>

      <SignedIn>
        {/* Nếu admin, thêm 1 button Admin */}
        {role === 'admin' && (
          <Button variant="outline" size="sm" asChild>
            <a href="/admin">Quản trị</a>
          </Button>
        )}

        {/* Nút profile / sign out */}
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}
