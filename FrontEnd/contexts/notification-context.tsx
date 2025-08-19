"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';

interface Notification {
  id: string;
  userId: string;
  orderId?: string; // Optional for admin message
  orderNumber?: string; // Optional for admin message
  title: string;
  message: string;
  type: string;
  status: 'READ' | 'UNREAD';
  createdAt: string;
  readAt?: string;
  customerName?: string; // Optional for admin message
  customerEmail?: string; // Optional for admin message
  customerPhone?: string; // Optional for admin message
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
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
        console.log('🌐 Trying notification service URL:', url);
        const res = await fetch(url, init);
        if (res.ok || (res.status >= 400 && res.status < 500)) {
          console.log('🌐 Success with URL:', url, 'Status:', res.status);
          return res;
        }
        console.log('🌐 Failed with URL:', url, 'Status:', res.status);
        lastError = new Error(`HTTP ${res.status}`);
      } catch (e) {
        console.log('🌐 Error with URL:', base, 'Error:', e);
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('All notification service URLs failed');
  };



  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      


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
        const unreadCount = data.filter((n: Notification) => n.status === 'UNREAD').length;
        setUnreadCount(unreadCount);
        console.log('📋 Fetched notifications:', data);
        console.log('📋 Total notifications:', data.length);
        console.log('📋 Unread notifications:', unreadCount);
        
        // Log each notification type for debugging
        data.forEach((n: Notification, index: number) => {
          console.log(`📋 Notification ${index + 1}:`, {
            id: n.id,
            type: n.type,
            status: n.status,
            title: n.title
          });
        });
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
        console.log('🔢 Fetched unread count:', count);
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
    console.log('✅ Marking notification as read:', notificationId);
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
    console.log('🗑️ Deleting notification:', notificationId);
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
        console.log('Notification service returned 500 error for delete');
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

  const markAllAsRead = async () => {
    console.log('✅ Marking all notifications as read');
    try {
      // Get all unread notifications
      const unreadNotifications = notifications.filter(n => n.status === 'UNREAD');
      
      if (unreadNotifications.length === 0) {
        console.log('No unread notifications to mark');
        return;
      }

      // Mark each unread notification as read individually
      const markPromises = unreadNotifications.map(async (notification) => {
        try {
          const response = await requestWithFallback(`/api/notifications/${notification.id}/read`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: createTimeoutSignal(3000),
          });
          
          if (response.ok) {
            return notification.id;
          } else {
            console.warn(`Failed to mark notification ${notification.id} as read:`, response.status);
            return null;
          }
        } catch (error) {
          console.warn(`Error marking notification ${notification.id} as read:`, error);
          return null;
        }
      });

      const results = await Promise.all(markPromises);
      const successfulIds = results.filter(Boolean);
      
      if (successfulIds.length > 0) {
        // Update local state for successfully marked notifications
        setNotifications(prev => 
          prev.map(n => 
            successfulIds.includes(n.id) 
              ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() }
              : n
          )
        );
        
        // Update unread count
        const newUnreadCount = Math.max(0, unreadCount - successfulIds.length);
        setUnreadCount(newUnreadCount);
        
        console.log(`✅ Successfully marked ${successfulIds.length} notifications as read`);
      }
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Request timeout for mark all as read');
      }
      // Update locally even if service fails
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'READ' as const, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
  };

  const deleteAllNotifications = async () => {
    console.log('🗑️ Deleting all notifications');
    try {
      if (!userId) {
        console.warn('No user ID available for delete all notifications');
        return;
      }

      const response = await requestWithFallback(`/api/notifications/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: createTimeoutSignal(3000),
      });
      
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        console.log('✅ Successfully deleted all notifications');
      } else if (response.status === 500) {
        console.warn('Notification service returned 500 error for delete all');
        // Delete locally even if service fails
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Error deleting all notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Request timeout for delete all notifications');
      }
      // Delete locally even if service fails
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const refreshNotifications = async () => {
    console.log('🔄 Refreshing notifications...');
    await fetchNotifications();
  };

  useEffect(() => {
    if (userId) {
      console.log('👤 User ID changed, fetching notifications for:', userId);
      console.log('👤 Current notifications state:', { notifications: notifications.length, unreadCount });
      // Fetch once after a short delay; remove forced-failure retry logic
      const timer = setTimeout(async () => {
        console.log('⏰ Timer fired, fetching notifications...');
        await fetchNotifications();
        await fetchUnreadCount();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [userId]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!userId) {
      console.log('🔌 No user ID, skipping WebSocket connection');
      return;
    }
    console.log('🔌 Setting up WebSocket connection for user:', userId);
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      if (clientRef.current) {
        console.log('🔌 Client already exists, skipping connection');
        return; // prevent duplicate connects (StrictMode)
      }
      console.log('🔌 Creating new WebSocket connection to:', WS_URL);
      console.log('🔌 User ID for WebSocket:', userId);
      try {
        const sock = new SockJS(WS_URL);
        const stompClient = over(sock);
        clientRef.current = stompClient;

        stompClient.connect({}, () => {
          console.log('🔌 Notification STOMP connected to:', WS_URL);
          const topic = `/topic/notifications/${userId}`;
          console.log('🔌 Subscribing to topic:', topic);
                  stompClient.subscribe(topic, (msg) => {
          try {
            console.log('🔔 WebSocket notification received:', msg.body);
            const notification = JSON.parse(msg.body);
            console.log('🔔 Parsed notification:', notification);
            console.log('🔔 Notification type:', notification.type);
            console.log('🔔 Notification status:', notification.status);
            setNotifications(prev => [notification, ...prev]);
            if (notification.status === 'UNREAD') {
              setUnreadCount(prev => {
                const newCount = prev + 1;
                console.log('🔔 Unread count updated:', newCount);
                return newCount;
              });
            }
          } catch (e) {
            console.error('Error parsing notification message', e);
          }
        });
        }, (error) => {
          // onError: attempt reconnect
          console.error('🔌 Notification STOMP connection error:', error);
          reconnectTimeout = setTimeout(connect, 5000);
        });
      } catch (e) {
        console.error('🔌 Failed to connect STOMP for notifications:', e);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    const timer = setTimeout(() => {
      console.log('⏰ WebSocket timer fired, connecting...');
      connect();
    }, 1000);

    return () => {
      console.log('🔌 Cleaning up WebSocket connection...');
      clearTimeout(timer);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      const client = clientRef.current;
      if (client && typeof client.disconnect === 'function') {
        client.disconnect(() => {
          console.log('🔌 Notification STOMP disconnected');
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
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
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
