"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';

interface Notification {
  id: string;
  userId: string;
  orderId: string;
  orderNumber: string;
  title: string;
  message: string;
  type: string;
  status: 'READ' | 'UNREAD';
  createdAt: string;
  readAt?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper function for timeout
const createTimeoutSignal = (timeoutMs: number): AbortSignal => {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  } else {
    // Fallback for browsers that don't support AbortSignal.timeout
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
  }
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  // Must be declared at component level (not inside effects)
  const clientRef = useRef<Client | null>(null);

  // Base URLs (support fallback through gateway or direct service)
  const BASE_URLS: string[] = (process.env.NEXT_PUBLIC_NOTIFICATION_BASE_URLS ?? 'http://localhost:9002,http://localhost:9006')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const WS_URL: string = process.env.NEXT_PUBLIC_NOTIFICATION_WS_URL ?? 'http://localhost:9002/ws';

  // Generic fetch with fallback over multiple base URLs
  const requestWithFallback = async (path: string, init?: RequestInit): Promise<Response> => {
    let lastError: unknown = null;
    for (const base of BASE_URLS) {
      try {
        const url = `${base.replace(/\/$/, '')}${path}`;
        const res = await fetch(url, init);
        if (res.ok || (res.status >= 400 && res.status < 500)) {
          return res;
        }
        lastError = new Error(`HTTP ${res.status}`);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('All notification service URLs failed');
  };

  // Test connection function with retry
  // const testConnection = async (retries = 3): Promise<boolean> => {
  //   for (let i = 0; i < retries; i++) {
  //     try {
  //       const response = await fetch('http://localhost:9002/api/notifications/health', {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         signal: createTimeoutSignal(3000), // Reduced timeout
  //       });
  //       if (response.ok) {
  //         return true;
  //       }
  //     } catch (error) {
  //       console.warn(`Connection attempt ${i + 1} failed:`, error);
  //       if (i < retries - 1) {
  //         // Wait before retry with exponential backoff
  //         await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
  //       }
  //     }
  //   }
  //   return false;
  // };

  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Test connection first
      // const isConnected = await testConnection();
      // if (!isConnected) {
      //   setError('Notification service is not available');
      //   setNotifications([]);
      //   setUnreadCount(0);
      //   return;
      // }

      const response = await requestWithFallback(`/api/notifications/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(10000),
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => n.status === 'UNREAD').length);
      } else if (response.status === 500) {
        console.warn('Notification service returned 500 error - service may not be running');
        setError('Notification service is not available');
        // Set empty notifications instead of throwing error
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Error fetching notifications:', response.status, response.statusText);
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Request timeout - service may be slow to respond');
      } else {
        setError('Failed to connect to notification service');
      }
      // Set empty notifications instead of throwing error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    try {
      // Test connection first
      // const isConnected = await testConnection(1); // Only try once for unread count
      // if (!isConnected) {
      //   console.warn('Notification service not available for unread count');
      //   setUnreadCount(0);
      //   return;
      // }

      const response = await requestWithFallback(`/api/notifications/user/${userId}/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(3000), // Reduced timeout
      });
      
      if (response.ok) {
        const count = await response.json();
        setUnreadCount(count);
      } else if (response.status === 500) {
        console.warn('Notification service returned 500 error for unread count');
        setUnreadCount(0);
      } else {
        console.error('Error fetching unread count:', response.status, response.statusText);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Request timeout for unread count');
      }
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await requestWithFallback(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(3000), // Reduced timeout
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else if (response.status === 500) {
        console.warn('Notification service returned 500 error for mark as read');
        // Update locally even if service fails
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Error marking notification as read:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Request timeout for mark as read');
      }
      // Update locally even if service fails
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await requestWithFallback(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(3000), // Reduced timeout
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        await fetchUnreadCount();
      } else if (response.status === 500) {
        console.warn('Notification service returned 500 error for delete');
        // Delete locally even if service fails
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Error deleting notification:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Request timeout for delete notification');
      }
      // Delete locally even if service fails
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  useEffect(() => {
    if (userId) {
      // Fetch once after a short delay; remove forced-failure retry logic
      const timer = setTimeout(async () => {
        await fetchNotifications();
        await fetchUnreadCount();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [userId]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!userId) return;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      if (clientRef.current) return; // prevent duplicate connects (StrictMode)
      try {
        const sock = new SockJS(WS_URL);
        const stompClient = over(sock);
        clientRef.current = stompClient;

        stompClient.connect({}, () => {
          console.log('Notification STOMP connected');
          const topic = `/topic/notifications/${userId}`;
          stompClient.subscribe(topic, (msg) => {
            try {
              const notification = JSON.parse(msg.body);
              setNotifications(prev => [notification, ...prev]);
              if (notification.status === 'UNREAD') {
                setUnreadCount(prev => prev + 1);
              }
            } catch (e) {
              console.error('Error parsing notification message', e);
            }
          });
        }, () => {
          // onError: attempt reconnect
          reconnectTimeout = setTimeout(connect, 5000);
        });
      } catch (e) {
        console.warn('Failed to connect STOMP for notifications', e);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    const timer = setTimeout(connect, 1000);

    return () => {
      clearTimeout(timer);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      const client = clientRef.current;
      if (client && typeof client.disconnect === 'function') {
        client.disconnect(() => {
          console.log('Notification STOMP disconnected');
        });
      }
      clientRef.current = null;
    };
  }, [userId]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      deleteNotification,
      refreshNotifications,
      loading,
      error
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
