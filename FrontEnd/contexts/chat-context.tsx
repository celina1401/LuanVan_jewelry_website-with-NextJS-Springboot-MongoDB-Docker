"use client";
import React, {
  createContext,
  useRef,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import SockJS from "sockjs-client";
import { Client, over } from "stompjs";
import { Message } from "@/lib/type";

interface ChatContextValue {
  connect: (userId: string) => void;
  disconnect: () => void;
  sendMessage: (msg: Message, userId: string) => void;
  subscribe: (topic: string, cb: (msg: Message) => void) => void;
  unsubscribe: (topic: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const clientRef = useRef<Client | null>(null);
  const listeners = useRef<Map<string, (msg: Message) => void>>(new Map());

  // Kết nối WebSocket
  const connect = useCallback((userId: string) => {
    if (clientRef.current) return;
    const sock = new SockJS("http://localhost:9007/ws");
    const stompClient = over(sock);
    clientRef.current = stompClient;

    stompClient.connect({}, () => {
      console.log("✅ WebSocket connected");

      // Re-subscribe tất cả khi kết nối thành công
      listeners.current.forEach((cb, topic) => {
        stompClient.subscribe(topic, (msg) => cb(JSON.parse(msg.body)));
      });
    });
  }, []);

  const disconnect = useCallback(() => {
    const client = clientRef.current;
    if (client && typeof client.disconnect === "function") {
      client.disconnect(() => {
        console.log("🛑 WebSocket disconnected");
      });
      clientRef.current = null;
      listeners.current.clear();
    }
  }, []);

  const subscribe = useCallback(
    (topic: string, cb: (msg: Message) => void) => {
      listeners.current.set(topic, cb);
      if (clientRef.current?.connected) {
        clientRef.current.subscribe(topic, (msg) => cb(JSON.parse(msg.body)));
      }
    },
    []
  );

  const unsubscribe = useCallback((topic: string) => {
    listeners.current.delete(topic);
    // ⚠️ stompjs không hỗ trợ hủy subscribe bằng topic name
  }, []);

  const sendMessage = useCallback(
    (msg: Message, userId: string) => {
      clientRef.current?.send("/app/chat", { userId }, JSON.stringify(msg));
    },
    []
  );

  return (
    <ChatContext.Provider
      value={{ connect, disconnect, sendMessage, subscribe, unsubscribe }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};

