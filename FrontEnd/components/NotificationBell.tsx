"use client";

import React, { useState } from 'react';
import { Bell, X, Check, Trash2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../contexts/notification-context';
import { useChat } from '../contexts/chat-context';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, error, loading } = useNotifications();
  const { openChat } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Debug logging
  console.log('🔔 NotificationBell render:', { unreadCount, notificationsCount: notifications.length, error, loading });

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAll = async () => {
    setShowDeleteConfirm(false);
    await deleteAllNotifications();
  };

  const handleOpenChat = () => {
    // Close notification modal
    setIsOpen(false);
    // Open chat box using context
    openChat();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_STATUS':
        return '📦';
      case 'SHIPPING_STATUS':
        return '🚚';
      case 'ADMIN_MESSAGE':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <Bell className="h-5 w-5 text-gray-900 dark:text-white" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[400px] z-50">
          <div className="bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Thông báo</CardTitle>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAllAsRead()}
                            className="h-8 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Đánh dấu đọc tất cả
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="h-8 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Xóa tất cả
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4 text-gray-900 dark:text-white" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {error && (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error === 'Notification service is not available' 
                          ? 'Dịch vụ thông báo hiện không khả dụng. Vui lòng thử lại sau.'
                          : error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Đang tải thông báo...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      {error ? 'Không thể tải thông báo' : 'Không có thông báo nào'}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            notification.status === 'UNREAD' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <h4 className="font-medium text-sm">
                                  {notification.title}
                                </h4>
                                {notification.status === 'UNREAD' && (
                                  <Badge variant="secondary" className="text-xs">
                                    Mới
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(notification.createdAt)}
                                </span>
                                <div className="flex items-center gap-1">
                                  {/* Action button for admin messages */}
                                  {notification.type === 'ADMIN_MESSAGE' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenChat()}
                                      className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                    >
                                      Mở Chat
                                    </Button>
                                  )}
                                  {notification.status === 'UNREAD' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Check className="h-3 w-3 text-gray-900 dark:text-white" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(notification.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Confirmation Dialog for Delete All - positioned in center of screen */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] rounded-lg">
              <div className="bg-white dark:bg-black rounded-lg p-6 max-w-sm mx-4 border border-red-200 dark:border-red-800 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                    ⚠️ Xác nhận xóa
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Bạn có chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAll}
                  >
                    Xóa tất cả
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
