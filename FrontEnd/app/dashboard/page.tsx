'use client';
import { useUser } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useUser();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-xl p-8 border border-rose-300 shadow-xl bg-background">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-xl font-bold mb-2">Thông tin người dùng</CardTitle>
          <CardDescription className="text-sm">Chi tiết về người dùng đã xác thực</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center w-full">
          {user ? (
            <div className="space-y-4 text-base text-center w-full">
              <p className="break-words whitespace-pre-line"><b>Mã người dùng:</b> {user.id}</p>
              <p><b>Tên đăng nhập:</b> {user.username}</p>
              <p><b>Email:</b> {user.emailAddresses[0]?.emailAddress}</p>
              <p><b>Vai trò:</b> {typeof user.publicMetadata?.role === "string" ? user.publicMetadata.role : (user.publicMetadata?.role ? JSON.stringify(user.publicMetadata.role) : "user")}</p>
              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="User Avatar"
                  className="w-28 h-28 rounded-full mt-6 border-2 border-rose-300 mx-auto shadow object-cover"
                />
              )}
            </div>
          ) : (
            <p>Đang tải dữ liệu người dùng...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}