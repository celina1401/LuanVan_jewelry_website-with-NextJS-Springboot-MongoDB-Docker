"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, MessageSquare, Edit, X, Bell, Star } from "lucide-react";
import { toast } from "sonner";

// Types
interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  comment: string;
  rating: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isHidden: boolean;
  adminReply?: string;
  adminReplyDate?: string;
  adminId?: string;
  adminName?: string;
  isNew?: boolean;
}

// Constants
const API_BASE_URL = "http://localhost:9008/api";
const SSE_URL = `${API_BASE_URL}/reviews/sse/admin`;

// Utility functions
const formatDate = (dateString: string): string => {
  try {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'N/A';
    }
    
    let date: Date;
    
    // Parse different date formats
    if (dateString.includes('T') && dateString.includes('Z')) {
      date = new Date(dateString);
    } else if (dateString.includes('T')) {
      date = new Date(dateString + 'Z');
    } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = new Date(dateString + 'T00:00:00.000Z');
    } else if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      date = new Date(dateString.replace(' ', 'T') + 'Z');
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    // Validate date reasonableness
    const now = new Date();
    const currentYear = now.getFullYear();
    const parsedYear = date.getFullYear();
    
    if (parsedYear > currentYear + 1 || parsedYear < currentYear - 10) {
      const parts = dateString.split(/[\/\- :]/);
      if (parts.length >= 3) {
        const testDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00.000Z`);
        if (!isNaN(testDate.getTime()) && 
            testDate.getFullYear() >= currentYear - 1 && 
            testDate.getFullYear() <= currentYear + 1) {
          date = testDate;
        }
      }
    }
    
    // Format for Vietnam timezone
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    
    // Fallback
    try {
      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate.toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit", 
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
      }
    } catch (fallbackError) {
      console.error('Fallback date formatting failed:', fallbackError);
    }
    
    return dateString;
  }
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star 
      key={i} 
      className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
    />
  ));
};

// Components
const ReviewCard = ({ 
  review, 
  onDelete, 
  onHide, 
  onUnhide, 
  onReply, 
  onEditReply, 
  onRemoveReply, 
  onMarkAsRead,
  editingReply,
  replyText,
  setReplyText,
  onSaveReply,
  onCancelReply
}: {
  review: Review;
  onDelete: (id: string) => void;
  onHide: (id: string) => void;
  onUnhide: (id: string) => void;
  onReply: (review: Review) => void;
  onEditReply: (review: Review) => void;
  onRemoveReply: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  editingReply: string | null;
  replyText: string;
  setReplyText: (text: string) => void;
  onSaveReply: (reviewId: string) => void;
  onCancelReply: () => void;
}) => {
  const isEditing = editingReply === review.id;
  
  return (
    <Card 
      className={`p-4 bg-white dark:bg-black border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer ${
        review.isNew ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md' : ''
      }`}
      onClick={() => review.isNew && onMarkAsRead(review.id)}
      title={review.isNew ? "Nhấp để đánh dấu đã đọc" : ""}
    >
      <div className="flex justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900 dark:text-white">
                {review.userName}
              </span>
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <div className="flex gap-2">
                {review.isNew && (
                  <Badge variant="default" className="bg-blue-500 text-white animate-pulse">
                    NEW
                  </Badge>
                )}
                
                {!review.isActive ? (
                  <Badge variant="destructive">Đã xóa vĩnh viễn</Badge>
                ) : review.isHidden ? (
                  <Badge variant="secondary">Đã ẩn</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Hoạt động
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Comment */}
          <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-2">
              {review.images.map((image, index) => {
                const imageUrl = image.startsWith('/uploads/')
                  ? `${API_BASE_URL}/reviews/image/${image.split('/').pop()}`
                  : image;

                return (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Review image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border dark:border-gray-600"
                    onError={(e) => {
                      console.error('Failed to load image:', imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Admin Reply */}
          {review.adminReply && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 mb-2 rounded-r">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  Trả lời từ Admin ({review.adminName})
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditReply(review);
                    }}
                    disabled={!review.isActive}
                    className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveReply(review.id);
                    }}
                    disabled={!review.isActive}
                    className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-800"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">{review.adminReply}</p>
              {review.adminReplyDate && (
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                  {formatDate(review.adminReplyDate)}
                </p>
              )}
            </div>
          )}

          {/* Reply Input */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập trả lời của admin..."
                className="w-full p-2 border rounded resize-none bg-white dark:bg-black text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                rows={3}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveReply(review.id);
                  }}
                  disabled={!review.isActive}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {review.adminReply ? "Cập nhật" : "Gửi"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelReply();
                  }}
                  className="border-gray-300 dark:border-gray-600"
                >
                  Hủy
                </Button>
              </div>
            </div>
          ) : !review.adminReply && (
            <div className="mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onReply(review);
                }}
                disabled={!review.isActive}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Trả lời
              </Button>
            </div>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div>Sản phẩm ID: {review.productId}</div>
            <div>Người dùng ID: {review.userId}</div>
            <div>Ngày tạo: {formatDate(review.createdAt)}</div>
            {review.updatedAt !== review.createdAt && (
              <div>Ngày cập nhật: {formatDate(review.updatedAt)}</div>
            )}
          </div>
        </div>

        {/* Actions */}
        {/* <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/products/${review.productId}`, '_blank');
            }}
            className="border-gray-300 dark:border-gray-600"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant={review.isHidden ? "default" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              review.isHidden ? onUnhide(review.id) : onHide(review.id);
            }}
            disabled={!review.isActive}
            className={review.isHidden ? "bg-green-500 hover:bg-green-600" : "border-gray-300 dark:border-gray-600"}
          >
            {review.isHidden ? "Hiện lại" : "Ẩn"}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(review.id);
            }}
            disabled={!review.isActive}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div> */}
      </div>
    </Card>
  );
};

// Main component
export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reviews`);
      if (response.ok) {
        const data = await response.json();
        const reviewsWithNewFlag = data.map((review: Review) => ({ ...review, isNew: false }));
        setReviews(reviewsWithNewFlag);
      } else {
        toast.error("Không thể tải danh sách bình luận");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup SSE connection
  useEffect(() => {
    const eventSource = new EventSource(SSE_URL);
    
    eventSource.onopen = () => {
      toast.success("Kết nối real-time thành công!", {
        description: "Sẽ nhận thông báo khi có bình luận mới"
      });
    };

    eventSource.addEventListener('connect', (event) => {
      console.log('Admin SSE connected:', event.data);
    });

    eventSource.addEventListener('newReview', (event) => {
      try {
        const newReview = JSON.parse(event.data);
        const reviewWithNewFlag = { ...newReview, isNew: true };
        
        setReviews(prevReviews => [reviewWithNewFlag, ...prevReviews]);
        
        toast.success("Bình luận mới!", {
          description: `${newReview.userName} đã đánh giá ${newReview.rating}⭐ - "${newReview.comment.substring(0, 50)}${newReview.comment.length > 50 ? '...' : ''}"`
        });
      } catch (error) {
        console.error('Error parsing new review:', error);
        toast.error("Lỗi khi nhận bình luận mới");
      }
    });

    eventSource.addEventListener('adminReplyUpdate', (event) => {
      try {
        const updatedReview = JSON.parse(event.data);
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === updatedReview.id ? updatedReview : review
          )
        );
        
        toast.info("Cập nhật trả lời thành công!", {
          description: "Trả lời đã được gửi tới khách hàng"
        });
      } catch (error) {
        console.error('Error parsing admin reply update:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      toast.error("Mất kết nối real-time", {
        description: "Đang thử kết nối lại..."
      });
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Action handlers
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Đã xóa đánh giá thành công!", {
          description: "Đánh giá đã bị xóa vĩnh viễn"
        });
        fetchReviews();
      } else {
        toast.error("Không thể xóa đánh giá");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Lỗi khi xóa đánh giá");
    }
  };

  const handleHideReview = async (reviewId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/hide`, {
        method: "PUT",
      });

      if (response.ok) {
        toast.success("Đã ẩn đánh giá thành công!", {
          description: "Khách hàng sẽ không thấy đánh giá này"
        });
        fetchReviews();
      } else {
        toast.error("Không thể ẩn đánh giá");
      }
    } catch (error) {
      console.error("Error hiding review:", error);
      toast.error("Lỗi khi ẩn đánh giá");
    }
  };

  const handleUnhideReview = async (reviewId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/unhide`, {
        method: "PUT",
      });

      if (response.ok) {
        toast.success("Đã hiện lại đánh giá thành công!", {
          description: "Khách hàng có thể thấy đánh giá này"
        });
        fetchReviews();
      } else {
        toast.error("Không thể hiện lại đánh giá");
      }
    } catch (error) {
      console.error("Error unhiding review:", error);
      toast.error("Lỗi khi hiện lại đánh giá");
    }
  };

  const handleAddAdminReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/admin-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminReply: replyText.trim(),
          adminId: "admin-001",
          adminName: "Admin",
        }),
      });

      if (response.ok) {
        toast.success("Đã thêm trả lời thành công!", {
          description: "Khách hàng sẽ nhận được thông báo"
        });
        setEditingReply(null);
        setReplyText("");
        fetchReviews();
      } else {
        toast.error("Không thể thêm trả lời");
      }
    } catch (error) {
      console.error("Error adding admin reply:", error);
      toast.error("Lỗi khi thêm trả lời");
    }
  };

  const handleUpdateAdminReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/admin-reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminReply: replyText.trim(),
          adminId: "admin-001",
          adminName: "Admin",
        }),
      });

      if (response.ok) {
        toast.success("Đã cập nhật trả lời thành công!", {
          description: "Nội dung trả lời đã được cập nhật"
        });
        setEditingReply(null);
        setReplyText("");
        fetchReviews();
      } else {
        toast.error("Không thể cập nhật trả lời");
      }
    } catch (error) {
      console.error("Error updating admin reply:", error);
      toast.error("Lỗi khi cập nhật trả lời");
    }
  };

  const handleRemoveAdminReply = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trả lời này?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/admin-reply`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Đã xóa trả lời thành công!", {
          description: "Trả lời đã bị xóa khỏi bình luận"
        });
        fetchReviews();
      } else {
        toast.error("Không thể xóa trả lời");
      }
    } catch (error) {
      console.error("Error removing admin reply:", error);
      toast.error("Lỗi khi xóa trả lời");
    }
  };

  const handleStartEditingReply = (review: Review) => {
    setEditingReply(review.id);
    setReplyText(review.adminReply || "");
    toast.info("Chế độ chỉnh sửa", {
      description: "Bạn có thể chỉnh sửa trả lời hiện tại"
    });
  };

  const handleCancelEditingReply = () => {
    setEditingReply(null);
    setReplyText("");
    toast.info("Đã hủy chỉnh sửa");
  };

  const handleMarkReviewAsRead = (reviewId: string) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId ? { ...review, isNew: false } : review
      )
    );
    toast.success("Đã đánh dấu đã đọc", { duration: 1000 });
  };

  const handleMarkAllAsRead = () => {
    const newReviewsCount = reviews.filter(review => review.isNew).length;
    if (newReviewsCount === 0) {
      toast.info("Không có bình luận mới nào");
      return;
    }
    
    setReviews(prevReviews => 
      prevReviews.map(review => ({ ...review, isNew: false }))
    );
    
    toast.success(`Đã đánh dấu ${newReviewsCount} bình luận mới là đã đọc`);
  };

  const handleSaveReply = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review?.adminReply) {
      handleUpdateAdminReply(reviewId);
    } else {
      handleAddAdminReply(reviewId);
    }
  };

  const newReviewsCount = reviews.filter(review => review.isNew).length;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Quản lý đánh giá & bình luận
            <div className="ml-auto flex gap-2">
              {newReviewsCount > 0 && (
                <>
                  <Badge variant="default" className="bg-red-500 text-white animate-pulse">
                    {newReviewsCount} mới
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    Đánh dấu tất cả đã đọc
                  </Button>
                </>
              )}
              <Badge variant="secondary" className="bg-white/20 text-white">
                {reviews.length} đánh giá
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Đang tải...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Không có đánh giá nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onDelete={handleDeleteReview}
                  onHide={handleHideReview}
                  onUnhide={handleUnhideReview}
                  onReply={handleStartEditingReply}
                  onEditReply={handleStartEditingReply}
                  onRemoveReply={handleRemoveAdminReply}
                  onMarkAsRead={handleMarkReviewAsRead}
                  editingReply={editingReply}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onSaveReply={handleSaveReply}
                  onCancelReply={handleCancelEditingReply}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 