"use client"

import { notFound, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";
import { FaRegHeart, FaTruck, FaSyncAlt, FaShieldAlt, FaComments } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useFavorites } from "@/hooks/use-favorites";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatBox from "@/app/components/chatbox/ChatBox";
import { translateProductTag } from "@/lib/utils";
import { MagnifierImage } from "@/app/components/MagnifierImage";
import ReviewSection from "@/components/ReviewSection";
import ReviewSummary from "@/components/ReviewSummary";


type Product = {
  id: number;
  name: string;
  tags: string[];
  images: string[];
  description: string;
  price: number;
  rating?: number; // sẽ tính động
  reviews: number;
  category: string;
  code?: string;
  colors?: string[];
  stockQuantity?: number;
  sold?: number;
  ratings?: number[]; // mảng điểm đánh giá
  productCode?: string; // Thêm trường mã sản phẩm
  weight?: number; // Khối lượng
  goldAge?: string; // Tuổi vàng
  goldPrice?: number; // Giá tuổi vàng
  wage?: number; // Tiền công
  karat?: string; // Tuổi vàng (có thể từ backend)
};

type Comment = {
  id: number;
  user: string;
  avatar: string;
  content: string;
  images: string[];
  createdAt: string;
};

// Giả lập dữ liệu sản phẩm (bạn nên thay bằng fetch từ API hoặc DB thực tế)
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Nhẫn đính hôn kim cương",
    tags: ["Nhẫn", "Mới"],
    images: [
      "/images/products/ring1.jpg",
      "/images/products/ring1-2.jpg",
      "/images/products/ring1-3.jpg"
    ],
    description: "Nhẫn cầu hôn Vàng 14K đá CZ",
    price: 5971000,
    reviews: 128,
    category: "Nhẫn",
    code: "NDINO284",
    colors: ["#cccccc", "#ffe066"],
    stockQuantity: 10,
    sold: 100,
    ratings: [5, 5, 4, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 5, 4, 5, 5, 5, 5, 4],
    productCode: "NDH284",
    weight: 10,
    goldAge: "10K",
    goldPrice: 500000,
    wage: 100000,
  },
  {
    id: 2,
    name: "Vòng tay vàng",
    tags: ["Vòng tay"],
    images: [
      "/images/products/bracelet1.jpg",
      "/images/products/bracelet1-2.jpg"
    ],
    description: "Vòng tay vàng 14k sang trọng đính kim cương cắt tròn",
    price: 2999000,
    reviews: 95,
    category: "Vòng tay",
    sold: 50,
    ratings: [5, 4, 5, 4, 5, 5, 4, 5, 4, 5],
    productCode: "VT284",
    weight: 5,
    goldAge: "14K",
    goldPrice: 400000,
    wage: 50000,
  },
];

// Giả lập user đăng nhập (bạn nên thay bằng context Clerk thực tế)
const mockUser = {
  id: "user1",
  name: "Alice",
  avatar: "/images/users/alice.jpg"
};

// Giả lập bình luận
const mockComments: Comment[] = [
  {
    id: 1,
    user: "Alice",
    avatar: "/images/users/alice.jpg",
    content: "Sản phẩm rất đẹp!",
    images: ["/images/products/ring1-2.jpg"],
    createdAt: "2024-06-21T10:00:00Z"
  },
  {
    id: 2,
    user: "Bob",
    avatar: "/images/users/bob.jpg",
    content: "Chất lượng tuyệt vời, sẽ ủng hộ tiếp!",
    images: [],
    createdAt: "2024-06-21T12:00:00Z"
  }
];

function CommentForm({ onSubmit }: { onSubmit: (data: { content: string; images: File[] }) => void }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ content, images });
    setContent("");
    setImages([]);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Nhập bình luận..."
        className="w-full border rounded p-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
        required
      />
      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="mt-2 dark:text-gray-100" />
      <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">Gửi</button>
    </form>
  );
}

function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div>
      {comments.map((cmt) => (
        <div key={cmt.id} className="border-b py-2 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <img src={cmt.avatar} alt="" className="w-8 h-8 rounded-full" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">{cmt.user}</span>
            <span className="text-xs text-gray-400">{new Date(cmt.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-gray-900 dark:text-gray-100">{cmt.content}</p>
          <div className="flex gap-2 mt-1">
            {cmt.images.map((img) => (
              <img key={img} src={img} alt="" className="w-16 h-16 object-cover rounded border dark:border-gray-700" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Hàm tính điểm đánh giá trung bình từ mảng ratings
function calculateAverageRating(ratings: number[] = []) {
  if (!ratings || ratings.length === 0) return 5.0;
  const total = ratings.reduce((sum, r) => sum + r, 0);
  return total / ratings.length;
}

// Hook lấy giá vàng động (theo chỉ)
function useCurrentGoldPricePerChi(age: string | undefined) {
  const [price, setPrice] = useState<number | null>(null);
  useEffect(() => {
    if (!age) return;
    fetch(`/api/gold-price/latest?age=${age}`)
      .then(res => res.json())
      .then(data => {
        console.log('[CLIENT] API trả về:', data);
        if (data.pricePerChi) setPrice(data.pricePerChi);
        // fallback nếu chỉ có pricePerGram (giữ lại cho backward compatibility)
        else if (data.pricePerGram) setPrice(data.pricePerGram * 3.75);
      });
  }, [age]);
  return price;
}

export default function ProductDetailPage() {
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const params = useParams<{ productId: string }>();
  const productId = params.productId;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Function để cập nhật rating khi có review mới
  const handleReviewAdded = async () => {
    try {
      // Fetch lại thông tin sản phẩm để cập nhật rating
      const response = await fetch(`http://localhost:9004/api/products/profile/${productId}`);
      if (response.ok) {
        const updatedProduct = await response.json();
        setProduct(updatedProduct);
        console.log("[DEBUG] Rating updated after new review:", updatedProduct.rating);
      }
    } catch (error) {
      console.error("[DEBUG] Error updating rating:", error);
    }
  };

  // Đảm bảo hook luôn được gọi ở đầu component
  const currentGoldPricePerChi = useCurrentGoldPricePerChi(product?.goldAge || product?.karat || "");

  // Log giá vàng theo tuổi vàng khi vào chi tiết sản phẩm hoặc khi giá vàng thay đổi
  useEffect(() => {
    if (product?.goldAge || product?.karat) {
      console.log("[LOG] Tuổi vàng:", product.goldAge || product.karat, "- Giá vàng theo tuổi:", currentGoldPricePerChi);
    }
  }, [product?.goldAge, product?.karat, currentGoldPricePerChi]);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`http://localhost:9004/api/products/profile/${productId}`)
      .then(res => res.json())
      .then((data: Product) => {
        // console.log('[DEBUG] Product data from backend:', data);
        setProduct(data);
        setSelectedImg((data.images && data.images.length > 0) ? data.images[0] : "/images/no-image.png");
        setSelectedColor(data.colors?.[0] || "");
        setLoading(false);
      })
      .catch((error) => {
        // console.error('[DEBUG] Error fetching product:', error);
        setProduct(null);
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => { setMounted(true); }, []);

  if (loading) return <div>Đang tải...</div>;
  if (!product) return notFound();

  // Tính tổng tiền động
  const totalPrice = currentGoldPricePerChi && product.weight
    ? currentGoldPricePerChi * product.weight + (product.wage || 0)
    : null;

  // Sử dụng rating từ backend (đã được tính từ ReviewService)
  const avgRating = product.rating || 0;
    
  // Debug log
  console.log(`[DEBUG] Product Detail ${product.id}:`, {
    name: product.name,
    rating: product.rating,
    reviews: product.reviews
  });

  const addToCart = (product: Product) => {
    if (product.stockQuantity === 0) {
      toast({
        title: "Sản phẩm đã hết hàng!",
        description: product.name,
        variant: "destructive"
      });
      return;
    }
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: getProductImageUrl(product),
      metadata: product.colors ? { color: selectedColor } : undefined,
    }, quantity);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: product.name,
    });
  };

  const buyNow = (product: Product) => {
    addToCart(product);
    router.push("/order");
  };

  const goToCheckout = () => {
    router.push("/order");
  };

  const handleCommentSubmit = ({ content, images }: { content: string; images: File[] }) => {
    const newComment: Comment = {
      id: comments.length + 1,
      user: mockUser.name,
      avatar: mockUser.avatar,
      content,
      images: images.map(img => URL.createObjectURL(img)),
      createdAt: new Date().toISOString()
    };
    setComments([newComment, ...comments]);
  };

  // Gợi ý sản phẩm liên quan theo tag
  const relatedProducts = mockProducts.filter(
    (p) =>
      p.id !== product.id &&
      p.tags &&
      product.tags &&
      p.tags.some(tag => product.tags!.includes(tag))
  );

  // Hàm lấy URL ảnh sản phẩm giống trang admin
  function getProductImageUrl(product: any): string {
    if (product.id || product.product_id) {
      return `http://localhost:9004/api/products/image/${product.id || product.product_id}`;
    }
    return "/no-image.png";
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Ảnh sản phẩm */}
          <div className="flex-1 flex flex-col items-center">
            {/* <img
              src={getProductImageUrl(product)}
              alt={product.name}
              className="w-full max-w-lg h-[480px] object-contain rounded-2xl shadow-2xl border-2 border-white bg-white"
            /> */}

            <MagnifierImage
              src={getProductImageUrl(product)}
              alt={product.name}
              width={480}
              height={480}
              zoom={1.5} // Tăng zoom rõ hơn một chút
              lensSize={320} // Thu nhỏ vùng kính lúp xuống 80x80 pixel
            />
            <div className="flex gap-4 mt-6">
              {[getProductImageUrl(product)].map((img) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  className={`w-20 h-20 object-cover rounded-xl border-4 cursor-pointer transition-all duration-150 shadow ${selectedImg === img
                      ? "border-blue-500 ring-4 ring-blue-200 scale-105"
                      : "border-gray-200 hover:border-blue-300"
                    }`}
                  onClick={() => setSelectedImg(img)}
                />
              ))}
            </div>
          </div>
          {/* Thông tin sản phẩm */}
          <div className="flex-1 flex flex-col gap-4 bg-white dark:bg-[#18181b] rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{product.name}</h1>
              <button
                className={`text-2xl transition-colors ${mounted && isFavorite(product.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                onClick={() => toggleFavorite(product.id)}
              >
                <FaRegHeart />
              </button>
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2 text-sm">
              <div><span className="font-semibold text-gray-500">Mã sản phẩm:</span> <span className="font-medium">{product.productCode || '-'}</span></div>
              <div><span className="font-semibold text-gray-500">Loại:</span> <span className="font-medium">{translateProductTag(product.category)}</span></div>
              <div><span className="font-semibold text-gray-500">Tồn kho:</span> <span className={`font-medium ${product.stockQuantity && product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>{product.stockQuantity && product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span></div>
              <div><span className="font-semibold text-gray-500">Khối lượng:</span> <span className="font-medium">{product.weight || '-'} chỉ</span></div>
              <div><span className="font-semibold text-gray-500">Tuổi vàng:</span> <span className="font-medium">{product.goldAge || product.karat || '-'}</span></div>
              <div><span className="font-semibold text-gray-500">Tiền công:</span> <span className="font-medium">{product.wage ? Number(product.wage).toLocaleString() : '-'}₫</span></div>
            </div>
            <p className="mb-1 text-lg text-gray-700 dark:text-gray-300 font-medium">{product.description}</p>
            {/* Tổng tiền động phía dưới mô tả sản phẩm */}
            <p className="mb-2 text-3xl font-extrabold text-rose-500">
              {totalPrice ? totalPrice.toLocaleString() + '₫' : '-'}
            </p>
            {/* Chọn màu */}
            {product.colors && (
              <div className="flex items-center gap-3 mb-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded-full border-2 ${selectedColor === color ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300 dark:border-gray-700"}`}
                    style={{ background: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            )}
            {/* Số lượng */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Số lượng:</span>
              <button
                className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 text-lg font-bold"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >-</button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-12 text-center border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
              <button
                className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 text-lg font-bold"
                onClick={() => setQuantity(q => q + 1)}
              >+</button>
              <span className="ml-2 text-sm text-gray-500">{product.stockQuantity === 0 ? "Hết hàng" : null}</span>
            </div>
            {/* Nút đặt mua/giỏ hàng */}
            <div className="flex flex-wrap gap-4 mt-4">
              <button
                className="px-8 py-3 bg-rose-400 text-white rounded-full font-bold text-lg shadow hover:bg-rose-500 transition"
                disabled={product.stockQuantity === 0}
                onClick={() => alert("Đặt hàng thành công!")}
              >
                Đặt hàng
              </button>
              <button
                className="px-8 py-3 bg-white dark:bg-[#23272f] border-2 border-rose-400 dark:text-rose-400 dark:border-rose-400 rounded-full font-bold text-lg shadow hover:bg-rose-50 dark:hover:bg-[#2d323b] transition flex items-center gap-2"
                onClick={() => addToCart(product)}
                disabled={product.stockQuantity === 0}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.52 17h8.96a1 1 0 00.87-1.47L17 13M7 13V6h13" /></svg>
                Thêm vào giỏ
              </button>
              <button
                className="px-8 py-3 bg-green-500 text-white rounded-full font-bold text-lg shadow hover:bg-green-600 transition flex items-center gap-2"
                onClick={() => buyNow(product)}
                disabled={product.stockQuantity === 0}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Mua ngay
              </button>
            </div>
            {/* Trả góp */}
            {/* <div className="flex gap-4 mt-4">
              <div className="flex-1 bg-gray-100 dark:bg-[#23272f] rounded-lg p-3 text-center">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Trả góp 3 tháng</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">(Chỉ từ {(product.price/3).toLocaleString()}₫/tháng)</div>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-[#23272f] rounded-lg p-3 text-center">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Trả góp 6 tháng</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">(Chỉ từ {(product.price/6).toLocaleString()}₫/tháng)</div>
              </div>
            </div> */}
            {/* Tiện ích */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              <div className="flex flex-col items-center gap-1"><FaSyncAlt className="text-2xl" /> Đổi miễn phí trong 72 giờ</div>
              <div className="flex flex-col items-center gap-1"><FaTruck className="text-2xl" /> Miễn phí giao hàng toàn quốc</div>
              <div className="flex flex-col items-center gap-1"><FaShieldAlt className="text-2xl" /> Bảo hành trọn đời</div>
              <div className="flex flex-col items-center gap-1"><FaComments className="text-2xl" /> Tư vấn 24/7</div>
            </div>
            {/* Công thức tính điểm đánh giá */}
            {/* <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Công thức: <span className="font-mono">Tổng số điểm đánh giá / Tổng số lượt đánh giá</span><br />
              Ví dụ: ({product.ratings?.join(" + ")}) / {product.ratings?.length} = <b>{avgRating.toFixed(2)}</b>
            </div> */}
          </div>
        </div>
        {/* Bình luận */}
        <div className="mt-12 bg-white dark:bg-[#18181b] rounded-xl shadow p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Đánh giá & Bình luận
            </h2>
            <ReviewSummary productId={productId} onReviewAdded={handleReviewAdded} />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <ReviewSection productId={productId} onReviewAdded={handleReviewAdded} />
          </div>
        </div>
        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Sản phẩm cùng tag</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition"
                  onClick={() => router.push(`/products/${item.id}`)}
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-square">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                      <Badge className="absolute top-2 right-2">{translateProductTag(item.category)}</Badge>
                      {item.tags?.includes("Mới") && (
                        <Badge variant="secondary" className="absolute top-2 left-2">Mới</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                          const itemRating = item.rating || 0;
                          const fullStars = Math.floor(itemRating);
                          const hasHalfStar = itemRating - fullStars >= 0.25 && itemRating - fullStars < 0.75;
                          
                          if (i < fullStars) {
                            return (
                              <svg
                                key={i}
                                className="w-4 h-4 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          } else if (i === fullStars && hasHalfStar) {
                            return (
                              <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
                                <defs>
                                  <linearGradient id={`half-star-related-${item.id}-${i}`}>
                                    <stop offset="50%" stopColor="#facc15" />
                                    <stop offset="50%" stopColor="#d1d5db" />
                                  </linearGradient>
                                </defs>
                                <path fill={`url(#half-star-related-${item.id}-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          } else {
                            return (
                              <svg
                                key={i}
                                className="w-4 h-4 text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          }
                        })}
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">
                        {(item.rating || 0).toFixed(1)} ({item.reviews || 0})
                      </span>
                    </div>
                    <p className="text-lg font-semibold mt-2 text-rose-500">
                      {item.price.toLocaleString()}₫
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <a
                      href={`/products/${item.id}`}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-center font-semibold block"
                    >
                      Xem chi tiết
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      <ChatBox />
    </div>
  );
} 