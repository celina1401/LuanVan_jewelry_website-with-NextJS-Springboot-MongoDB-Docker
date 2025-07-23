export interface Message {
    sender: string;
    role: "user" | "admin";
    content: string;
    timestamp: string;
  }
  