"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReviewSummaryProps {
  productId: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export default function ReviewSummary({ productId }: ReviewSummaryProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewStats();
  }, [productId]);

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`http://localhost:9008/api/reviews/product/${productId}`);
      if (response.ok) {
        const reviews = await response.json();
        
        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
        
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((review: any) => {
          ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        });

        setStats({
          totalReviews,
          averageRating,
          ratingDistribution,
        });
      }
    } catch (error) {
      console.error("Error fetching review stats:", error);
    } finally {
      setLoading(false);
    }
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

  const getRatingPercentage = (count: number) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
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
        <p className="mt-2 text-gray-600">Đang tải thống kê đánh giá...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Star className="w-6 h-6 text-yellow-400" />
          Tổng quan đánh giá
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {getRatingText(Math.round(stats.averageRating))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalReviews} đánh giá
            </div>
          </div>

          {/* Total Reviews */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalReviews}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tổng số đánh giá
            </div>
          </div>

          {/* Rating Trend */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.ratingDistribution[5] || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Đánh giá 5 sao
            </div>
          </div>
        </div>
        
        {/* Rating Distribution */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            Chi tiết đánh giá
          </h4>
          
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
            const percentage = getRatingPercentage(count);
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-16">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex items-center gap-2 w-20">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {count}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {percentage}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        {stats.totalReviews > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {Math.round((stats.ratingDistribution[5] / stats.totalReviews) * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">5 sao</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {Math.round((stats.ratingDistribution[4] / stats.totalReviews) * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">4 sao</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {Math.round((stats.ratingDistribution[3] / stats.totalReviews) * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">3 sao</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {Math.round(((stats.ratingDistribution[2] + stats.ratingDistribution[1]) / stats.totalReviews) * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Dưới 3 sao</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 