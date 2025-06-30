"use client"

import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";
import { FaRegHeart, FaTruck, FaSyncAlt, FaShieldAlt, FaComments } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

type Product = {
  id: number;
  name: string;
  images: string[];
  description: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  code?: string;
  colors?: string[];
  stock?: number;
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
    name: "Diamond Engagement Ring",
    images: [
      "/images/products/ring1.jpg",
      "/images/products/ring1-2.jpg",
      "/images/products/ring1-3.jpg"
    ],
    description: "Nhẫn cầu hôn Vàng 14K đá CZ",
    price: 5971000,
    rating: 4.9,
    reviews: 128,
    category: "Rings",
    code: "NDINO284",
    colors: ["#cccccc", "#ffe066"],
    stock: 10,
  },
  {
    id: 2,
    name: "Gold Tennis Bracelet",
    images: [
      "/images/products/bracelet1.jpg",
      "/images/products/bracelet1-2.jpg"
    ],
    description: "Elegant 14k gold bracelet with round cut diamonds",
    price: 2999,
    rating: 4.8,
    reviews: 95,
    category: "Bracelets",
  },
  {
    id: 4,
    name: "Diamond Stud Earrings",
    images: [
      "/images/products/earrings1.jpg"
    ],
    description: "Classic diamond studs with 1 carat total weight",
    price: 3499,
    rating: 4.9,
    reviews: 112,
    category: "Earrings",
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
        className="w-full border rounded p-2"
        required
      />
      <input type="file" multiple accept="image/*" onChange={handleImageChange} />
      <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Gửi</button>
    </form>
  );
}

function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div>
      {comments.map((cmt) => (
        <div key={cmt.id} className="border-b py-2">
          <div className="flex items-center gap-2">
            <img src={cmt.avatar} alt="" className="w-8 h-8 rounded-full" />
            <span className="font-semibold">{cmt.user}</span>
            <span className="text-xs text-gray-400">{new Date(cmt.createdAt).toLocaleString()}</span>
          </div>
          <p>{cmt.content}</p>
          <div className="flex gap-2 mt-1">
            {cmt.images.map((img) => (
              <img key={img} src={img} alt="" className="w-16 h-16 object-cover rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId;
  const product = mockProducts.find((p) => p.id.toString() === productId);
  const [selectedImg, setSelectedImg] = useState(product?.images[0]);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  if (!product) return notFound();

  const addToCart = (product: Product) => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.images[0],
      metadata: product.colors ? { color: selectedColor } : undefined,
    }, quantity);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: product.name,
    });
  };

  const buyNow = (product: Product) => {
    addToCart(product);
    router.push("/cart");
  };

  const goToCheckout = () => {
    router.push("/cart");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Ảnh sản phẩm */}
          <div className="flex-1 flex flex-col items-center">
            <img
              src={selectedImg}
              alt={product.name}
              className="w-full max-w-lg h-[480px] object-contain rounded-2xl shadow-2xl border-2 border-white bg-white"
            />
            <div className="flex gap-4 mt-6">
              {product.images.map((img) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  className={`w-20 h-20 object-cover rounded-xl border-4 cursor-pointer transition-all duration-150 shadow ${
                    selectedImg === img
                      ? "border-blue-500 ring-4 ring-blue-200 scale-105"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedImg(img)}
                />
              ))}
            </div>
          </div>
          {/* Thông tin sản phẩm */}
          <div className="flex-1 flex flex-col gap-4 bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
              <button className="text-gray-400 hover:text-red-500 text-2xl"><FaRegHeart /></button>
            </div>
            <p className="mb-1 text-lg text-gray-700 font-medium">{product.description}</p>
            <p className="mb-1 text-sm text-gray-500">Mã sản phẩm: <span className="font-semibold">{product.code}</span></p>
            <p className="mb-2 text-3xl font-extrabold text-rose-500">{product.price.toLocaleString()}₫</p>
            {/* Chọn màu */}
            {product.colors && (
              <div className="flex items-center gap-3 mb-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded-full border-2 ${selectedColor === color ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"}`}
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
                className="w-8 h-8 rounded bg-gray-200 text-lg font-bold"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >-</button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-12 text-center border rounded"
              />
              <button
                className="w-8 h-8 rounded bg-gray-200 text-lg font-bold"
                onClick={() => setQuantity(q => q + 1)}
              >+</button>
              <span className="ml-2 text-sm text-gray-500">{product.stock === 0 ? "Hết hàng" : null}</span>
            </div>
            {/* Nút đặt mua/giỏ hàng */}
            <div className="flex flex-wrap gap-4 mt-4">
              <button
                className="px-8 py-3 bg-rose-400 text-white rounded-full font-bold text-lg shadow hover:bg-rose-500 transition"
                disabled={product.stock === 0}
                onClick={() => alert("Đặt hàng thành công!")}
              >
                ĐẶT MỚI
              </button>
              <button
                className="px-8 py-3 bg-white border-2 border-rose-400 text-rose-500 rounded-full font-bold text-lg shadow hover:bg-rose-50 transition flex items-center gap-2"
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.52 17h8.96a1 1 0 00.87-1.47L17 13M7 13V6h13" /></svg>
                Thêm vào giỏ
              </button>
              <button
                className="px-8 py-3 bg-green-500 text-white rounded-full font-bold text-lg shadow hover:bg-green-600 transition flex items-center gap-2"
                onClick={() => buyNow(product)}
                disabled={product.stock === 0}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Mua ngay
              </button>
            </div>
            {/* Trả góp */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
                <div className="font-semibold">Trả góp 3 tháng</div>
                <div className="text-sm text-gray-500">(Chỉ từ {(product.price/3).toLocaleString()}₫/tháng)</div>
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
                <div className="font-semibold">Trả góp 6 tháng</div>
                <div className="text-sm text-gray-500">(Chỉ từ {(product.price/6).toLocaleString()}₫/tháng)</div>
              </div>
            </div>
            {/* Tiện ích */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center text-sm text-gray-600">
              <div className="flex flex-col items-center gap-1"><FaSyncAlt className="text-2xl" /> Đổi miễn phí trong 72 giờ</div>
              <div className="flex flex-col items-center gap-1"><FaTruck className="text-2xl" /> Miễn phí giao hàng toàn quốc</div>
              <div className="flex flex-col items-center gap-1"><FaShieldAlt className="text-2xl" /> Bảo hành trọn đời</div>
              <div className="flex flex-col items-center gap-1"><FaComments className="text-2xl" /> Tư vấn 24/7</div>
            </div>
          </div>
        </div>
        {/* Bình luận */}
        <div className="mt-12 bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Bình luận</h2>
          <CommentForm onSubmit={handleCommentSubmit} />
          <CommentList comments={comments} />
        </div>
      </div>
    </div>
  );
} 