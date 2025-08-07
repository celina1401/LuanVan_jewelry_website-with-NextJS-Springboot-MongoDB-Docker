"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, MessageSquare, Edit, X, Bell } from "lucide-react";
import { toast } from "sonner";

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
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
    setupSSEConnection();
  }, []);

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      // Cleanup will be handled by the SSE connection itself
    };
  }, []);

  const setupSSEConnection = () => {
    const eventSource = new EventSource("http://localhost:9008/api/reviews/sse/admin");
    
    eventSource.onopen = () => {
      console.log('SSE connection established for admin');
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
        console.log('New review received:', newReview);
        
        // Add new review to the top of the list
        setReviews(prevReviews => [newReview, ...prevReviews]);
        
        // Show notification with more details
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
        console.log('Admin reply update received:', updatedReview);
        
        // Update the specific review in the state
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

    // Store eventSource for cleanup
    return () => {
      eventSource.close();
    };
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:9008/api/reviews");
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
        // toast.success(`Đã tải ${data.length} bình luận`);
      } else {
        toast.error("Không thể tải danh sách bình luận");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:9008/api/reviews/${reviewId}`, {
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

  const hideReview = async (reviewId: string) => {
    try {
      const response = await fetch(`http://localhost:9008/api/reviews/${reviewId}/hide`, {
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

  const unhideReview = async (reviewId: string) => {
    try {
      const response = await fetch(`http://localhost:9008/api/reviews/${reviewId}/unhide`, {
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

  const addAdminReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      const response = await fetch(`http://localhost:9008/api/reviews/${reviewId}/admin-reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminReply: replyText.trim(),
          adminId: "admin-001", // You can get this from auth context
          adminName: "Admin", // You can get this from auth context
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

  const updateAdminReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      const response = await fetch(`http://localhost:9008/api/reviews/${reviewId}/admin-reply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminReply: replyText.trim(),
          adminId: "admin-001", // You can get this from auth context
          adminName: "Admin", // You can get this from auth context
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

  const removeAdminReply = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trả lời này?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:9008/api/reviews/${reviewId}/admin-reply`, {
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

  const startEditingReply = (review: Review) => {
    setEditingReply(review.id);
    setReplyText(review.adminReply || "");
    toast.info("Chế độ chỉnh sửa", {
      description: "Bạn có thể chỉnh sửa trả lời hiện tại"
    });
  };

  const cancelEditingReply = () => {
    setEditingReply(null);
    setReplyText("");
    toast.info("Đã hủy chỉnh sửa");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  return (
    <div className="container mx-auto p-6 min-h-screen ">
      <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Quản lý đánh giá & bình luận
            <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
              {reviews.length} đánh giá
            </Badge>
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
                <Card key={review.id} className="p-4 bg-white dark:bg-black border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-900 dark:text-white">{review.userName}</span>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <div className="flex gap-2">
                            {(() => {
                              console.log('Review status:', {
                                id: review.id,
                                userName: review.userName,
                                isActive: review.isActive,
                                isHidden: review.isHidden,
                                status: !review.isActive ? 'DELETED' : (review.isHidden ? 'HIDDEN' : 'ACTIVE')
                              });
                              return null;
                            })()}

                            {!review.isActive ? (
                              <Badge variant="destructive">Đã xóa vĩnh viễn</Badge>
                            ) : review.isHidden ? (
                              <Badge variant="secondary">Đã ẩn</Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Hoạt động</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-2">
                          {review.images.map((image, index) => {
                            // Convert relative URL to full backend URL
                            const imageUrl = image.startsWith('/uploads/')
                              ? `http://localhost:9008/api/reviews/image/${image.split('/').pop()}`
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

                      {/* Admin Reply Section */}
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
                                onClick={() => startEditingReply(review)}
                                disabled={!review.isActive}
                                className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAdminReply(review.id)}
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

                      {/* Reply Input Section */}
                      {editingReply === review.id ? (
                        <div className="mb-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Nhập trả lời của admin..."
                            className="w-full p-2 border rounded resize-none bg-white dark:bg-black text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => review.adminReply ? updateAdminReply(review.id) : addAdminReply(review.id)}
                              disabled={!review.isActive}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              {review.adminReply ? "Cập nhật" : "Gửi"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditingReply}
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
                            onClick={() => startEditingReply(review)}
                            disabled={!review.isActive}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Trả lời
                          </Button>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <div>Sản phẩm ID: {review.productId}</div>
                        <div>Người dùng ID: {review.userId}</div>
                        <div>Ngày tạo: {formatDate(review.createdAt)}</div>
                        {review.updatedAt !== review.createdAt && (
                          <div>Ngày cập nhật: {formatDate(review.updatedAt)}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/products/${review.productId}`, '_blank')}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {/* Hide/Unhide button */}
                      <Button
                        variant={review.isHidden ? "default" : "outline"}
                        size="sm"
                        onClick={() => review.isHidden ? unhideReview(review.id) : hideReview(review.id)}
                        disabled={!review.isActive}
                        className={review.isHidden ? "bg-green-500 hover:bg-green-600" : "border-gray-300 dark:border-gray-600"}
                      >
                        {review.isHidden ? "Hiện lại" : "Ẩn"}
                      </Button>

                      {/* Delete button - only for active reviews */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteReview(review.id)}
                        disabled={!review.isActive}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 