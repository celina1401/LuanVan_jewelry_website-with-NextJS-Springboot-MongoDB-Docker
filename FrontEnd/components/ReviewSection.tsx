"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Send, Image as ImageIcon, MessageCircle, ThumbsUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

interface ReviewSectionProps {
  productId: string;
  onReviewAdded?: () => void; // Callback để cập nhật rating
}

export default function ReviewSection({ productId, onReviewAdded }: ReviewSectionProps) {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]); // For debugging - all reviews including inactive

  useEffect(() => {
    fetchReviews();
    setupSSEConnection();
  }, [productId]);

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      // Cleanup will be handled by the SSE connection itself
    };
  }, []);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      // Cleanup object URLs to prevent memory leaks
      selectedFiles.forEach(file => {
        if (file) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, [selectedFiles]);

  const setupSSEConnection = () => {
    const eventSource = new EventSource(`http://localhost:9008/api/reviews/sse/${productId}`);
    
    eventSource.onopen = () => {
      console.log('SSE connection established for product:', productId);
      toast.success("Kết nối real-time thành công!", {
        description: "Sẽ nhận thông báo khi admin trả lời"
      });
    };

    eventSource.onmessage = (event) => {
      console.log('SSE message received:', event);
    };

    eventSource.addEventListener('connect', (event) => {
      console.log('SSE connected:', event.data);
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
        
        // Show notification to user
        toast.success("Admin đã trả lời!", {
          description: updatedReview.adminReply?.substring(0, 100) + (updatedReview.adminReply && updatedReview.adminReply.length > 100 ? '...' : '')
        });
      } catch (error) {
        console.error('Error parsing admin reply update:', error);
        toast.error("Lỗi khi nhận trả lời từ admin");
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
      // console.log(`[DEBUG] Fetching reviews for product: ${productId}`);
      
      // Fetch active reviews (normal endpoint)
      const response = await fetch(`http://localhost:9008/api/reviews/product/${productId}`);
      let activeReviews: Review[] = [];
      if (response.ok) {
        const data = await response.json();
        // console.log(`[DEBUG] Received active reviews data:`, data);
        activeReviews = data;
        setReviews(data);
      } else {
        // console.error(`[DEBUG] Error fetching active reviews: ${response.status} ${response.statusText}`);
        toast.error("Không thể tải bình luận");
      }

      // Fetch all reviews (including inactive) for debugging
      const allResponse = await fetch(`http://localhost:9008/api/reviews/product/${productId}/all`);
      if (allResponse.ok) {
        const allData = await allResponse.json();
        // console.log(`[DEBUG] Received ALL reviews data:`, allData);
        
        // Store all reviews for debugging
        setAllReviews(allData);
        
        // Log inactive reviews for debugging
        const inactiveReviews = allData.filter((review: Review) => review.isActive === false);
        console.log(`${inactiveReviews.length} inactive reviews:`, inactiveReviews);
        if (inactiveReviews.length > 0) {
          // console.log(`[DEBUG] Found ${inactiveReviews.length} inactive reviews:`, inactiveReviews);
        }
        
        // console.log(`[DEBUG] Active reviews count: ${activeReviews.length}/${allData.length}`);
      } else {
        // console.error(`[DEBUG] Error fetching all reviews: ${allResponse.status} ${allResponse.statusText}`);
      }
    } catch (error) {
      // console.error("[DEBUG] Error fetching reviews:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file count
      if (files.length > 5) {
        toast.error("Chỉ được chọn tối đa 5 ảnh");
        return;
      }
      
      // Validate each file
      const validFiles: File[] = [];
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      for (const file of files) {
        if (file.size > maxFileSize) {
          toast.error(`File ${file.name} quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Kích thước tối đa là 5MB`);
          continue;
        }
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File ${file.name} không đúng định dạng. Chỉ chấp nhận JPG, PNG, WEBP`);
          continue;
        }
        validFiles.push(file);
      }
      
      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        toast.success(`Đã chọn ${validFiles.length} ảnh hợp lệ`, {
          description: "Bạn có thể xem preview bên dưới"
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
    toast.info("Đã xóa ảnh");
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }
  
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    // Validate file size and type
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    for (const file of selectedFiles) {
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} quá lớn. Kích thước tối đa là 5MB`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} không đúng định dạng. Chỉ chấp nhận JPG, PNG, WEBP`);
        return;
      }
    }
  
    setSubmitting(true);
    try {
      // Upload images first (if any) directly to Cloudinary
      const imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        toast.info("Đang tải ảnh lên...", {
          description: `Đang upload ${selectedFiles.length} ảnh, vui lòng chờ trong giây lát`
        });
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          try {
            toast.info(`Đang upload ảnh ${i + 1}/${selectedFiles.length}...`);
            const result = await uploadToCloudinary(file, { folder: "reviews" });
            imageUrls.push(result.secure_url);
            console.log(`Uploaded image ${i + 1}:`, result.secure_url);
          } catch (uploadError) {
            console.error(`Error uploading image ${file.name}:`, uploadError);
            toast.error(`Không thể upload ảnh ${file.name}. Vui lòng thử lại.`);
            setUploadingImages(false);
            return;
          }
        }
        
        setUploadingImages(false);
        toast.success(`Đã upload thành công ${imageUrls.length} ảnh!`);
      }
  
      // Create review
      const reviewData = {
        productId,
        userId: user.id,
        userName: user.fullName || user.username || "Anonymous",
        comment: comment.trim(),
        rating,
        images: imageUrls,
      };

      console.log("Submitting review data:", reviewData);
  
      const response = await fetch("http://localhost:9008/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });
  
      if (response.ok) {
        const newReview = await response.json();
        console.log("Review created successfully:", newReview);
        
        toast.success("Gửi bình luận thành công!", {
          description: "Bình luận của bạn đã được đăng và admin sẽ được thông báo"
        });
        
        // Reset form
        setComment("");
        setRating(5);
        setSelectedFiles([]);
        setShowReviewForm(false);
        
        // Refresh reviews
        await fetchReviews();
        
        // Gọi callback để cập nhật rating
        if (onReviewAdded) {
          onReviewAdded();
        }
        
        // Dispatch event để ReviewSummary cập nhật
        window.dispatchEvent(new Event('reviewAdded'));
        
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('newReviewSubmitted', { 
          detail: { review: newReview, productId } 
        }));
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        // Try to parse error as JSON for better error messages
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || "Failed to submit review");
        } catch {
          throw new Error("Failed to submit review");
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error instanceof Error ? error.message : "Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };
  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5: return "Tuyệt vời";
      case 4: return "Rất tốt";
      case 3: return "Tốt";
      case 2: return "Trung bình";
      case 1: return "Kém";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="mt-2 text-gray-600">Đang tải bình luận...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-yellow-400 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-yellow-400" />
            Viết đánh giá của bạn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showReviewForm ? (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Viết đánh giá
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Đánh giá của bạn:</label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {getRatingText(rating)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nội dung:</label>
                <Textarea
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Hình ảnh (tùy chọn):
                </label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tối đa 5 ảnh, mỗi ảnh tối đa 5MB. Định dạng: JPG, PNG, WEBP
                  </p>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ảnh đã chọn ({selectedFiles.length}/5):
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFiles([])}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Xóa tất cả
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-400 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <button
                              onClick={() => removeFile(index)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 right-1">
                            <p className="text-xs text-white bg-black bg-opacity-70 rounded px-1 py-0.5 truncate">
                              {file.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || !comment.trim() || uploadingImages}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                >
                  {uploadingImages ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Đang upload ảnh...
                    </>
                  ) : submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gửi đánh giá
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    setComment("");
                    setRating(5);
                    setSelectedFiles([]);
                  }}
                  disabled={submitting || uploadingImages}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-yellow-400" />
            Tất cả bình luận ({reviews.length})
          </h3>
          {reviews.length > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              {reviews.length} đánh giá
            </Badge>
          )}
        </div>
        
        {reviews.length === 0 ? (
          <Card className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">Chưa có bình luận nào</h4>
            <p className="text-gray-500">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.userName}`} />
                      <AvatarFallback className="bg-yellow-100 text-yellow-800">
                        {review.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {review.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            {getRatingText(review.rating)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                        {review.comment}
                      </p>
                      
                      {/* Admin Reply Display */}
                      {review.adminReply && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 mb-3 rounded-r">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">A</span>
                            </div>
                            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                              Trả lời từ Admin {review.adminName && `(${review.adminName})`}
                            </span>
                          </div>
                          <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                            {review.adminReply}
                          </p>
                          {review.adminReplyDate && (
                            <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
                              {formatDate(review.adminReplyDate)}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {review.images.map((image, index) => {
                            // Convert relative URL to full backend URL
                            const imageUrl = image.startsWith('/uploads/') 
                              ? `http://localhost:9008/api/reviews/image/${image.split('/').pop()}`
                              : image;
                            
                            return (
                              <div key={index} className="relative group">
                                <img
                                  src={imageUrl}
                                  alt={`Review image ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                  onError={(e) => {
                                    console.error('Failed to load image:', imageUrl);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  onLoad={() => {
                                    console.log(`Image ${index + 1} loaded successfully:`, imageUrl);
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="bg-white bg-opacity-90 rounded-full p-1">
                                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Debug Section - Show inactive reviews for admin debugging */}
      {/* {allReviews.length > reviews.length && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-black rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h4 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
              Debug: Hidden/Deleted Reviews ({allReviews.length - reviews.length})
            </h4>
          </div>
          <div className="space-y-3">
            {allReviews
              .filter((review) => !review.isActive || review.isHidden)
              .map((review) => (
                <div key={review.id} className="p-3 bg-white dark:bg-black rounded border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {review.userName}
                      </span>
                      <div className="flex gap-1">
                        {!review.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            DELETED
                          </Badge>
                        )}
                        {review.isActive && review.isHidden && (
                          <Badge variant="secondary" className="text-xs">
                            HIDDEN
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-through">
                    {review.comment}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-500 ml-1">
                      {getRatingText(review.rating)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )} */}
    </div>
  );
} 