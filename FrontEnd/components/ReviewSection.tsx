"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Send, Image as ImageIcon, MessageCircle, ThumbsUp, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]); // For debugging - all reviews including inactive

  useEffect(() => {
    fetchReviews();
  }, [productId]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập để bình luận",
        variant: "destructive",
      });
      return;
    }
  
    if (!comment.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung bình luận",
        variant: "destructive",
      });
      return;
    }
  
    setSubmitting(true);
    try {
      // Upload images first (if any)
      const imageUrls: string[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("image", file);
  
        const uploadResponse = await fetch("http://localhost:9008/api/reviews/upload", {
          method: "POST",
          body: formData,
        });
  
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrls.push(uploadData.url);
        } else {
          throw new Error("Failed to upload image");
        }
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
  
      const response = await fetch("http://localhost:9008/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });
  
      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Bình luận đã được gửi",
        });
        setComment("");
        setRating(5);
        setSelectedFiles([]);
        setShowReviewForm(false);
        fetchReviews();
        
        // Gọi callback để cập nhật rating
        if (onReviewAdded) {
          onReviewAdded();
        }
        
        // Dispatch event để ReviewSummary cập nhật
        window.dispatchEvent(new Event('reviewAdded'));
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi bình luận. Vui lòng thử lại.",
        variant: "destructive",
      });
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
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <button
                          onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || !comment.trim()}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    setComment("");
                    setRating(5);
                    setSelectedFiles([]);
                  }}
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
                      
                                             {review.images && review.images.length > 0 && (
                         <div className="flex gap-2 overflow-x-auto pb-2">
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
                                 className="w-20 h-20 object-cover rounded-lg border shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                 onClick={() => window.open(imageUrl, '_blank')}
                                 onError={(e) => {
                                   console.error('Failed to load image:', imageUrl);
                                   e.currentTarget.style.display = 'none';
                                 }}
                               />
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
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
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
                <div key={review.id} className="p-3 bg-white dark:bg-gray-700 rounded border border-orange-200 dark:border-orange-700">
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