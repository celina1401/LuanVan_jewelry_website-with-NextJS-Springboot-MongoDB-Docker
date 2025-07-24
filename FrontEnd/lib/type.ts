export interface Message {
  sender: string;
  receiver?: string; // 👈 THÊM
  role: "user" | "admin";
  content: string;
  timestamp: string;
}
