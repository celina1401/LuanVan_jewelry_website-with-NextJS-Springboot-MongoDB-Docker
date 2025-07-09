import { Metadata } from "next";
import UsersPageClient from "./UsersPageClient";

export const metadata: Metadata = {
  title: "Quản lý người dùng | Quản trị viên",
  description: "Quản lý tài khoản và phân quyền người dùng",
};

export default function UsersPage() {
  return <UsersPageClient />;
} 