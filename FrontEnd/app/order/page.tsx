"use client";

import { useCart } from "@/contexts/cart-context";
import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { useUser, useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
// import type { Address } from "@/app/dashboard/page";
import AddAddressForm, { Address } from "@/app/components/AddAddressForm";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { safeCurrencyFormat } from "@/lib/utils";


const paymentMethods = [
  { label: "Thanh toán tiền mặt khi nhận hàng (COD)", value: "cod" },
  { label: "Thanh toán VNPAY", value: "vnpay" },
];

function OrderPageContent() {
  const { items, total, clearCart, updateQuantity } = useCart();
  const { user } = useUser();
  const { getToken } = useAuth();
  
  // ✅ Xử lý buyNow - mua ngay một sản phẩm cụ thể
  const searchParams = useSearchParams();
  const buyNowProductId = searchParams.get('productId');
  const buyNowQuantity = parseInt(searchParams.get('quantity') || '1');
  const isBuyNow = searchParams.get('buyNow') === 'true';
  
  // Debug log để kiểm tra URL parameters
  
  // ✅ Nếu là buyNow, tạo item đơn lẻ từ thông tin URL
  const [buyNowItem, setBuyNowItem] = useState<any>(null);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const [dynamicPrices, setDynamicPrices] = useState<{ [id: string]: number }>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("female");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [deliveryType, setDeliveryType] = useState("home");
  const [payment, setPayment] = useState("cod");
  const [agree, setAgree] = useState(false);
  const [promo, setPromo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm loading state

  // ✅ Tự động load thông tin người dùng
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 🎯 Membership discount functionality
  const [membershipInfo, setMembershipInfo] = useState<any>(null);
  const [membershipLoading, setMembershipLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:9001/api/users/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();  // Use .text() to see the raw response
        console.log(text);
        // const data = await res.json();
        const data = JSON.parse(text); 
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setDob(data.dob || "");
        setGender(data.gender || "female");
        setName(
          data.username
        );
        const addrList = data.addresses || [];
        setAddresses(addrList);
        const defaultAddr = addrList.find((a: any) => a.isDefault);
        if (defaultAddr) {
          setName(defaultAddr.receiverName || "");
          setProvince(defaultAddr.province || "");
          setDistrict(defaultAddr.district || "");
          setWard(defaultAddr.ward || "");
          setAddress(defaultAddr.street || "");
        }
      } catch (err) {
        console.error("Không thể lấy thông tin user:", err);
      }
    };
    fetchUserInfo();
  }, [user, getToken]);

  // 🎯 Fetch membership info for discount calculation
  useEffect(() => {
    const fetchMembershipInfo = async () => {
      if (!user) return;
      try {
        setMembershipLoading(true);
        const response = await fetch(`http://localhost:9001/api/users/membership/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setMembershipInfo(data);
          console.log('✅ Membership info loaded:', data);
        } else {
          console.warn('⚠️ Could not load membership info');
        }
      } catch (error) {
        console.error('❌ Error loading membership info:', error);
      } finally {
        setMembershipLoading(false);
      }
    };
    fetchMembershipInfo();
  }, [user]);

  // 🎯 Fetch buyNow product info if needed
  useEffect(() => {
    const fetchBuyNowProduct = async () => {
      if (!isBuyNow || !buyNowProductId) return;
      
      console.log('🔄 Fetching buyNow product:', { buyNowProductId, buyNowQuantity });
      
      try {
        setBuyNowLoading(true);
        console.log('🔄 Fetching from API:', `http://localhost:9004/api/products/${buyNowProductId}`);
        
        const response = await fetch(`http://localhost:9004/api/products/${buyNowProductId}`);
        console.log('📡 API Response status:', response.status);
        
        if (response.ok) {
          const product = await response.json();
          console.log('✅ Received product data:', product);
          
          const buyNowItemData = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.thumbnailUrl || product.images?.[0] || '/default-avatar.png',
            quantity: buyNowQuantity,
            metadata: {
              weight: product.weight,
              goldAge: product.goldAge || product.karat,
              wage: product.wage,
              category: product.category,
              brand: product.brand,
              stock: product.stockQuantity || 0, // Thêm thông tin tồn kho vào metadata
              ...product.metadata
            }
          };
          
          console.log('🎯 Setting buyNowItem:', buyNowItemData);
          setBuyNowItem(buyNowItemData);
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to fetch product:', response.status, response.statusText, errorText);
          
          // Fallback: tạo item từ URL params nếu API fail
          console.log('🔄 Creating fallback item from URL params...');
          const fallbackItem = {
            id: buyNowProductId,
            name: `Sản phẩm ${buyNowProductId}`,
            price: 0, // Sẽ được tính sau
            image: '/default-avatar.png',
            quantity: buyNowQuantity,
            metadata: {
              stock: 0 // Giả sử hết hàng nếu không fetch được
            }
          };
          setBuyNowItem(fallbackItem);
          toast.warning('Không thể tải thông tin sản phẩm, sử dụng thông tin cơ bản');
        }
      } catch (error) {
        console.error('❌ Error fetching buyNow product:', error);
        
        // Fallback: tạo item từ URL params nếu API fail
        console.log('🔄 Creating fallback item from URL params due to network error...');
        const fallbackItem = {
          id: buyNowProductId,
          name: `Sản phẩm ${buyNowProductId}`,
          price: 0, // Sẽ được tính sau
          image: '/default-avatar.png',
          quantity: buyNowQuantity,
          metadata: {
            stock: 0 // Giả sử hết hàng nếu không fetch được
          }
        };
        setBuyNowItem(fallbackItem);
        toast.warning('Không thể kết nối server, sử dụng thông tin cơ bản');
      } finally {
        setBuyNowLoading(false);
      }
    };
    
    fetchBuyNowProduct();
  }, [isBuyNow, buyNowProductId, buyNowQuantity]);

  //Tinh gia vang dong
  useEffect(() => {
    async function fetchPrices() {
      const result: { [id: string]: number } = {};
      const itemsToProcess = isBuyNow && buyNowItem ? [buyNowItem] : items;
      
      await Promise.all(
        itemsToProcess.map(async (item) => {
          const { weight, wage = 0, goldAge } = item.metadata || {};
          if (weight && goldAge) {
            try {
              const res = await fetch(`/api/gold-price/latest?age=${goldAge}`);
              const data = await res.json();
              if (data.pricePerChi) {
                result[item.id] = data.pricePerChi * weight + wage;
              }
            } catch (err) {
              result[item.id] = item.price;
            }
          } else {
            result[item.id] = item.price;
          }
        })
      );
      setDynamicPrices(result);
    }
    
    if ((isBuyNow && buyNowItem) || items.length > 0) {
      fetchPrices();
    }
  }, [items, isBuyNow, buyNowItem]);

  const shipping = deliveryType === "home" ? 0 : 0;
  
  // 🎯 Calculate membership discount (rounded to integer VND)
  // Ưu tiên BuyNow: nếu có buyNowItem thì chỉ dùng buyNowItem, không dùng items từ giỏ hàng
  const itemsToCalculate = isBuyNow && buyNowItem ? [buyNowItem] : (isBuyNow ? [] : items);
  
  // Debug log để kiểm tra
  console.log('🔍 Debug itemsToCalculate:', {
    isBuyNow,
    buyNowProductId,
    buyNowQuantity,
    buyNowItem: buyNowItem ? { 
      id: buyNowItem.id, 
      name: buyNowItem.name, 
      quantity: buyNowItem.quantity,
      price: buyNowItem.price,
      stock: buyNowItem.metadata?.stock || 0,
      metadata: buyNowItem.metadata
    } : null,
    itemsCount: items.length,
    itemsToCalculateCount: itemsToCalculate.length,
    itemsToCalculate: itemsToCalculate.map(item => ({ 
      id: item.id, 
      name: item.name, 
      quantity: item.quantity,
      price: item.price,
      stock: item.metadata?.stock || 0,
      metadata: item.metadata
    }))
  });
  
  // Debug log chi tiết hơn để kiểm tra
  if (isBuyNow) {
    console.log('🎯 BuyNow Mode:', {
      buyNowProductId,
      buyNowQuantity,
      buyNowItem: buyNowItem,
      itemsToCalculate: itemsToCalculate,
      shouldShowOnlyBuyNowItem: itemsToCalculate.length === 1 && itemsToCalculate[0]?.id === buyNowProductId
    });
  } else {
    console.log('🛒 Cart Mode:', {
      itemsCount: items.length,
      itemsToCalculate: itemsToCalculate
    });
  }
  
  // 🎯 Kiểm tra tồn kho và tính toán giá
  const hasOutOfStockItems = itemsToCalculate.some(item => {
    const itemStock = item.metadata?.stock || 0;
    return itemStock < item.quantity;
  });
  
  const rawSubtotal = itemsToCalculate.reduce((sum, item) => {
    const itemStock = item.metadata?.stock || 0;
    // Nếu hết hàng hoặc không đủ số lượng, không tính vào tổng
    if (itemStock < item.quantity) {
      return sum;
    }
    const unitPrice = dynamicPrices[item.id] ?? item.price;
    return sum + unitPrice * item.quantity;
  }, 0);
  const subtotal = Math.round(rawSubtotal);
  const membershipDiscount = membershipInfo ? Math.round(subtotal * membershipInfo.discountRate) : 0;
  const discount = membershipDiscount;
  const finalTotal = Math.max(0, Math.round(subtotal - discount + shipping));

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      toast.error('Vui lòng đồng ý với điều khoản', {
        description: 'Bạn cần đồng ý với điều khoản để tiếp tục'
      });
      return;
    }

    // Validation cơ bản
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên', {
        description: 'Tên không được để trống'
      });
      return;
    }

         if (!phone.trim()) {
       toast.error('Vui lòng nhập số điện thoại', {
         description: 'Số điện thoại không được để trống'
       });
       return;
     }

     if (phone.length !== 10) {
       toast.error('Số điện thoại không hợp lệ', {
         description: 'Số điện thoại phải có đúng 10 số'
       });
       return;
     }

    if (!address.trim()) {
      toast.error('Vui lòng nhập địa chỉ', {
        description: 'Địa chỉ không được để trống'
      });
      return;
    }

    if (itemsToCalculate.length === 0) {
      toast.error('Không có sản phẩm nào', {
        description: 'Vui lòng thêm sản phẩm vào giỏ hàng hoặc chọn mua ngay'
      });
      return;
    }

    // 🎯 Kiểm tra tồn kho trước khi đặt hàng
    if (hasOutOfStockItems) {
      toast.error('Không thể đặt hàng', {
        description: 'Một số sản phẩm đã hết hàng hoặc không đủ số lượng. Vui lòng kiểm tra lại.'
      });
      return;
    }

    setIsSubmitting(true); // Bắt đầu loading

    try {
      const orderId = `ORD${Date.now()}`; // mã đơn hàng ngẫu nhiên

      if (payment === "vnpay") {
        const token = await getToken();

        // Bước 1: Gửi đơn hàng lên OrderService
        console.log('🔄 Đang tạo đơn hàng VNPay...');
        const orderRes = await fetch("http://localhost:9003/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            receiverName: name,
            street: address,
            ward,
            district,
            province,
            items: itemsToCalculate.map((item) => ({
              productId: item.id,
              productName: item.name,
              productImage: item.image,
              quantity: item.quantity,
              price: dynamicPrices[item.id] ?? item.price,
               totalPrice: Math.round((dynamicPrices[item.id] ?? item.price) * item.quantity),
              weight: item.metadata?.weight,
              goldAge: item.metadata?.goldAge,
              wage: item.metadata?.wage,
              category: item.metadata?.category,
              brand: item.metadata?.brand,
            })),
             subtotal: Math.round(subtotal),
            shippingFee: shipping,
            discount,
             total: Math.round(finalTotal),
            paymentMethod: "VNPAY",
            paymentStatus: "Chờ thanh toán",
            note,
            // smsNotification: sms,

            promoCode: promo,
          }),
        });

        if (!orderRes.ok) {
          const text = await orderRes.text();
          console.error('❌ Lỗi khi tạo đơn hàng:', text);
          toast.error('Lỗi khi tạo đơn hàng', {
            description: text || 'Vui lòng thử lại sau'
          });
          return;
        }

        const savedOrder = await orderRes.json();
        const createdOrderId = savedOrder.orderNumber; // Hoặc orderNumber nếu bạn dùng
        console.log('✅ Đã tạo đơn hàng thành công:', createdOrderId);



        // Bước 2: Lấy URL thanh toán từ PaymentService với retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        // Chuyển đổi amount thành số nguyên VND (không có xu)
        const amountInVND = Math.round(finalTotal);
        console.log(`💰 Số tiền thanh toán: ${finalTotal} → ${amountInVND} VND (đã làm tròn)`);
        
        while (retryCount < maxRetries) {
          try {
            // console.log(`🔄 Đang kết nối PaymentService cho đơn hàng #${createdOrderId}... (Lần thử ${retryCount + 1}/${maxRetries})`);
            // console.log(`📊 Tham số: orderId=${createdOrderId}, amount=${amountInVND}`);
            
            const res = await fetch(
              `http://localhost:9006/api/payment/vnpay?orderId=${createdOrderId}&amount=${amountInVND}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                // Thêm timeout để tránh chờ quá lâu
                signal: AbortSignal.timeout(10000) // 10 giây timeout
              }
            );

            if (!res.ok) {
              const errorText = await res.text();
              console.error(`❌ PaymentService trả về lỗi ${res.status}:`, errorText);
              
              // Xử lý lỗi cụ thể cho vấn đề amount
              if (res.status === 400 && errorText.includes('amount')) {
                throw new Error(`Lỗi định dạng số tiền: ${errorText}`);
              }
              
              throw new Error(`PaymentService trả về lỗi: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            console.log('✅ Nhận được response từ PaymentService:', data);

            if (data.url && data.url.startsWith('http')) {
              // console.log('🔄 Chuyển hướng đến VNPay...');
              window.location.href = data.url;
              return; // Thoát khỏi function
            } else if (data.paymentUrl && data.paymentUrl.startsWith('http')) {
              // Fallback cho trường hợp backend trả về paymentUrl thay vì url
              // console.log('🔄 Chuyển hướng đến VNPay (fallback)...');
              window.location.href = data.paymentUrl;
              return; // Thoát khỏi function
            } else {
              // console.error('❌ Response không hợp lệ từ PaymentService:', data);
              throw new Error('Không nhận được URL thanh toán hợp lệ từ PaymentService');
            }

          } catch (paymentError) {
            retryCount++;
            // console.error(`❌ Lỗi khi kết nối PaymentService (Lần thử ${retryCount}/${maxRetries}):`, paymentError);
            
            if (retryCount >= maxRetries) {
              // Đã hết số lần thử, hiển thị lỗi cuối cùng
              let errorMessage = 'Không thể kết nối PaymentService sau nhiều lần thử';
              
              if (paymentError instanceof Error) {
                if (paymentError.name === 'AbortError') {
                  errorMessage = 'Kết nối PaymentService bị timeout. Vui lòng thử lại.';
                } else if (paymentError.message.includes('PaymentService trả về lỗi')) {
                  errorMessage = paymentError.message;
                } else if (paymentError.message.includes('Failed to fetch')) {
                  errorMessage = 'PaymentService không khả dụng. Vui lòng thử lại sau.';
                }
              }
              
              // Hiển thị thông báo lỗi với toast
              toast.error(errorMessage, {
                description: 'Đơn hàng đã được tạo nhưng không thể chuyển đến trang thanh toán. Vui lòng liên hệ admin.',
                duration: 8000
              });
              
              // Vẫn hiển thị thành công vì đơn hàng đã được tạo
              setSuccess(true);
              clearCart();
              return;
            }
            
            // Chờ một chút trước khi thử lại
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }

      } else if (payment === "cod") {
        try {
          console.log('🔄 Đang tạo đơn hàng COD...');
          const token = await getToken();
          const res = await fetch("http://localhost:9003/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: user?.id,
              customerName: name,
              customerPhone: phone,
              customerEmail: email,
              receiverName: name,
              street: address,
              ward,
              district,
              province,
              items: itemsToCalculate.map((item) => ({
                productId: item.id,
                productName: item.name,
                productImage: item.image,
                quantity: item.quantity,
                price: dynamicPrices[item.id] ?? item.price,
               totalPrice: Math.round((dynamicPrices[item.id] ?? item.price) * item.quantity),
                weight: item.metadata?.weight,
                goldAge: item.metadata?.goldAge,
                wage: item.metadata?.wage,
                category: item.metadata?.category,
                brand: item.metadata?.brand,
              })),
                           subtotal: Math.round(subtotal),
            shippingFee: shipping,
            discount,
             total: Math.round(finalTotal),
              paymentMethod: "COD",
              paymentStatus: "Chưa thanh toán",
              note,
              // smsNotification: sms,

              promoCode: promo,
            }),
          });

          if (res.ok) {
            console.log('✅ Đã tạo đơn hàng COD thành công');
            toast.success('Đặt hàng thành công!', {
              description: 'Cảm ơn bạn đã mua sắm tại T&C Jewelry'
            });
            setSuccess(true);
            clearCart();
          } else {
            const text = await res.text();
            console.error('❌ Lỗi khi tạo đơn hàng COD:', text);
            toast.error('Lỗi khi tạo đơn hàng', {
              description: text || 'Vui lòng thử lại sau'
            });
          }
        } catch (err) {
          console.error("❌ Lỗi tạo đơn hàng COD:", err);
          toast.error('Không thể kết nối server', {
            description: 'Vui lòng kiểm tra kết nối mạng và thử lại'
          });
        }
      }
    } catch (error) {
      console.error('❌ Lỗi chung khi xử lý đơn hàng:', error);
      toast.error('Có lỗi xảy ra', {
        description: 'Vui lòng thử lại sau hoặc liên hệ admin'
      });
    } finally {
      setIsSubmitting(false); // Kết thúc loading
    }

  };

  const handleAddAddress = (newAddress: Address) => {
    let updatedAddresses = addresses;
    if (newAddress.isDefault) {
      updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }
    setAddresses([...updatedAddresses, newAddress]);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Thông tin đặt hàng</h1>
        {success ? (
          <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
              <p className="text-lg mb-4">Cảm ơn bạn đã mua sắm tại T&C Jewelry.</p>
              <div className="space-y-2 text-sm text-green-600 dark:text-green-400">
                <p>• Đơn hàng của bạn đã được ghi nhận</p>
                <p>• Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất</p>
                <p>• Bạn có thể theo dõi đơn hàng trong trang Dashboard</p>
              </div>
              <button
                onClick={() => window.location.href = `/dashboard/orders`}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Xem đơn hàng của tôi
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleOrder} className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {isBuyNow ? 'Sản phẩm mua ngay' : 'Sản phẩm'}
              </h2>
              {isBuyNow && buyNowLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-900 dark:text-white">Đang tải thông tin sản phẩm...</p>
                </div>
              ) : itemsToCalculate.length === 0 ? (
                <p className="text-gray-900 dark:text-white">
                  {isBuyNow ? 'Không có sản phẩm nào được chọn.' : 'Giỏ hàng của bạn đang trống.'}
                </p>
              ) : (
                <ul className="space-y-2">
                  {itemsToCalculate.map((item) => {
                    const unitPrice = dynamicPrices[item.id] ?? item.price;
                    const itemStock = item.metadata?.stock || 0;
                    const isOutOfStock = itemStock < item.quantity;
                    const availableStock = Math.min(itemStock, item.quantity);
                    
                    return (
                      <li key={item.id} className="flex flex-col gap-1 justify-between">
                        <div className="flex items-center gap-3">
                          {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />}
                          <div className="flex-1">
                            <span className="text-gray-900 dark:text-white">{item.name}</span>
                            {/* Cảnh báo hết hàng */}
                            {isOutOfStock && (
                              <div className="text-red-500 text-sm font-medium mt-1">
                                ⚠️ Hết hàng! Chỉ còn {itemStock} sản phẩm
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button 
                              type="button" 
                              onClick={() => {
                                if (isBuyNow && buyNowItem) {
                                  // Cập nhật số lượng cho buyNow item
                                  setBuyNowItem({...buyNowItem, quantity: Math.max(1, buyNowItem.quantity - 1)});
                                } else {
                                  updateQuantity(item.id, item.quantity - 1, item.metadata);
                                }
                              }} 
                              disabled={item.quantity <= 1 || isOutOfStock} 
                              className={`w-7 h-7 rounded text-lg font-bold ${
                                isOutOfStock 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-gray-200 dark:bg-black text-gray-900 dark:text-white'
                              }`}
                            >
                              -
                            </button>
                            <span className={`w-8 text-center ${
                              isOutOfStock ? 'text-red-500' : 'text-gray-900 dark:text-white'
                            }`}>
                              {item.quantity}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => {
                                if (isBuyNow && buyNowItem) {
                                  // Cập nhật số lượng cho buyNow item
                                  setBuyNowItem({...buyNowItem, quantity: buyNowItem.quantity + 1});
                                } else {
                                  updateQuantity(item.id, item.quantity + 1, item.metadata);
                                }
                              }} 
                              disabled={isOutOfStock || item.quantity >= itemStock}
                              className={`w-7 h-7 rounded text-lg font-bold ${
                                isOutOfStock || item.quantity >= itemStock
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-gray-200 dark:bg-black text-gray-900 dark:text-white'
                              }`}
                            >
                              +
                            </button>
                          </div>
                          {/* Hiển thị giá hoặc thông báo hết hàng */}
                          {isOutOfStock ? (
                            <span className="text-red-500 font-medium">Hết hàng</span>
                          ) : (
                            <span className="text-gray-900 dark:text-white">
                              {safeCurrencyFormat(Math.round(unitPrice * item.quantity))}
                            </span>
                          )}
                          {/* Nút xóa sản phẩm */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isBuyNow && buyNowItem) {
                                // Xóa sản phẩm mua ngay - chuyển về trang sản phẩm
                                toast.success('Đã xóa sản phẩm khỏi đơn hàng');
                                window.location.href = `/products/${buyNowProductId}`;
                              } else {
                                // Xóa sản phẩm khỏi giỏ hàng
                                updateQuantity(item.id, 0, item.metadata);
                                toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
                              }
                            }}
                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        {/* Thông tin khối lượng × giá vàng + tiền công - chỉ hiển thị khi còn hàng */}
                        {!isOutOfStock && (
                          <div className="ml-20 text-xs text-gray-600 dark:text-gray-300">
                            {(() => {
                              const weight = item.metadata?.weight;
                              const wage = item.metadata?.wage || 0;
                              const goldAge = item.metadata?.goldAge;
                              const pricePerChi = (dynamicPrices[item.id] && weight)
                                ? ((dynamicPrices[item.id] - wage) / weight)
                                : null;
                              if (weight && pricePerChi !== null && pricePerChi !== undefined) {
                                return (
                                  <span>
                                    (Khối lượng: <b className="text-gray-900 dark:text-white">{weight}</b> chỉ × Giá vàng: <b className="text-gray-900 dark:text-white">{safeCurrencyFormat(Math.round(pricePerChi))}</b> + Tiền công: <b className="text-gray-900 dark:text-white">{safeCurrencyFormat(Math.round(wage))}</b>) × Số lượng: <b className="text-gray-900 dark:text-white">{item.quantity}</b> = <b className="text-gray-900 dark:text-white">{safeCurrencyFormat(Math.round(dynamicPrices[item.id] * item.quantity))}</b>
                                  </span>
                                );
                              } else if (weight && goldAge) {
                                return (
                                  <span>
                                    (Khối lượng: <b className="text-gray-900 dark:text-white">{weight}</b> chỉ × Giá vàng + Tiền công: <b className="text-gray-900 dark:text-white">{safeCurrencyFormat(Math.round(wage))}</b>) × Số lượng: <b className="text-gray-900 dark:text-white">{item.quantity}</b> = <b className="text-gray-900 dark:text-white">{safeCurrencyFormat(Math.round(dynamicPrices[item.id] * item.quantity))}</b>
                                  </span>
                                );
                              } else {
                                return null;
                              }
                            })()}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-900 dark:text-white">Tạm tính</span><span className="text-gray-900 dark:text-white">{safeCurrencyFormat(Math.round(subtotal))}</span></div>
                <div className="flex justify-between"><span className="text-gray-900 dark:text-white">Giao hàng</span><span className="text-gray-900 dark:text-white">{shipping === 0 ? "Miễn phí" : shipping + "₫"}</span></div>
                
                {/* 🎯 Membership Discount Display */}
                {membershipInfo && membershipInfo.discountRate > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-white">
                      Giảm giá hạng {membershipInfo.tierDisplayName} 
                      <span className="text-xs text-gray-500 ml-1">({(membershipInfo.discountRate * 100).toFixed(0)}%)</span>
                    </span>
                    <span className="text-green-600 font-medium">-{safeCurrencyFormat(Math.round(discount))}</span>
                  </div>
                )}
                
                {(!membershipInfo || membershipInfo.discountRate === 0) && (
                  <div className="flex justify-between">
                    <span className="text-gray-900 dark:text-white">Giảm giá</span>
                    <span className="text-gray-500">0₫</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span className="text-gray-900 dark:text-white">Tổng tiền</span>
                  <span className="text-rose-600">{safeCurrencyFormat(Math.round(finalTotal))}</span>
                </div>

              </div>


              {/* 🎯 Cảnh báo hết hàng */}
              {hasOutOfStockItems && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="font-medium">Không thể đặt hàng</span>
                  </div>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    Một số sản phẩm đã hết hàng hoặc không đủ số lượng. Vui lòng kiểm tra lại hoặc xóa sản phẩm hết hàng.
                  </p>
                </div>
              )}
            </div>
            {/* giao hang */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Hình thức nhận hàng</h2>
              <div className="flex gap-4 mb-4">
                <button type="button" onClick={() => setDeliveryType("home")} className={`flex-1 border rounded-lg p-3 flex flex-col items-center gap-1 ${deliveryType === "home" ? "bg-yellow-100 border-yellow-400" : "bg-gray-50 dark:bg-black"}`}>
                  <span className="font-bold text-yellow-600">Giao hàng tận nơi</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Miễn phí toàn quốc</span>
                </button>
                <button type="button" onClick={() => setDeliveryType("store")} className={`flex-1 border rounded-lg p-3 flex flex-col items-center gap-1 ${deliveryType === "store" ? "bg-purple-100 border-purple-400" : "bg-gray-50 dark:bg-black"}`}>
                  <span className="font-bold text-purple-600">Nhận tại cửa hàng</span>
                </button>
              </div>
              {deliveryType === "home" && (
                <>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-white">Chọn địa chỉ giao hàng</label>
                  <select
                    className="w-full border p-2 rounded mb-2 text-gray-900 dark:text-white"
                    value={selectedIndex}
                    onChange={(e) => {
                      const index = parseInt(e.target.value, 10);
                      setSelectedIndex(index);
                      const addr = addresses[index];
                      if (addr) {
                        setName(addr.receiverName);
                        setProvince(addr.province);
                        setDistrict(addr.district);
                        setWard(addr.ward);
                        setAddress(addr.street);
                      }
                    }}
                  >
                    {(() => {
                      const defaultIdx = addresses.findIndex(addr => addr.isDefault);
                      if (addresses.length === 0) {
                        return <option value={-1}>Chưa có địa chỉ giao hàng</option>;
                      }
                      if (defaultIdx !== -1) {
                        return [
                          <option key={defaultIdx} value={defaultIdx} className="text-gray-900 dark:text-white">
                            ⭐ {`${addresses[defaultIdx].receiverName} - ${addresses[defaultIdx].street}, ${addresses[defaultIdx].ward}, ${addresses[defaultIdx].district}, ${addresses[defaultIdx].province}`}
                          </option>,
                          ...addresses.map((addr, idx) =>
                            idx !== defaultIdx ? (
                              <option key={idx} value={idx} className="text-gray-900 dark:text-white">
                                {`${addr.receiverName} - ${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}
                              </option>
                            ) : null
                          )
                        ];
                      }
                      return [
                        <option key={-1} value={-1} className="text-gray-900 dark:text-white">Chọn địa chỉ giao hàng</option>,
                        ...addresses.map((addr, idx) => (
                          <option key={idx} value={idx} className="text-gray-900 dark:text-white">
                            {`${addr.receiverName} - ${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}
                          </option>
                        ))
                      ];
                    })()}
                  </select>
                  {!showAddAddress ? (
                    <button
                      type="button"
                      className="text-sm text-rose-500 hover:underline mb-2"
                      onClick={() => setShowAddAddress(true)}
                    >
                      + Thêm địa chỉ mới
                    </button>
                  ) : (
                    <AddAddressForm
                      onAdd={async (newAddr) => {
                        handleAddAddress(newAddr);
                        try {
                          const token = await getToken();
                          let updatedAddresses = addresses;
                          if (newAddr.isDefault) {
                            updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
                          }
                          updatedAddresses = [...updatedAddresses, newAddr];
                          const res = await fetch(`http://localhost:9001/api/users/update_user/${user?.id}`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ phone, addresses: updatedAddresses }),
                          });
                          if (!res.ok) {
                            const errorText = await res.text();
                            console.error("API error:", res.status, errorText);
                            alert("Không thể thêm địa chỉ mới! " + errorText);
                            return;
                          }
                          const data = await res.json();
                          setAddresses(data.addresses || []);
                          const index = (data.addresses || []).length - 1;
                          setSelectedIndex(index);
                          setName(newAddr.receiverName);
                          setProvince(newAddr.province);
                          setDistrict(newAddr.district);
                          setWard(newAddr.ward);
                          setAddress(newAddr.street);
                          setShowAddAddress(false);
                        } catch (err) {
                          console.error("Thêm địa chỉ lỗi:", err);
                          alert("Không thể thêm địa chỉ mới!");
                        }
                      }}
                      onCancel={() => setShowAddAddress(false)}
                      showCancel
                    />
                  )}
                </>
              )}
              {/* <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={sms} onChange={e => setSms(e.target.checked)} />
                <label className="text-sm text-gray-900 dark:text-white">Tôi muốn gửi thiệp và lời chúc qua SMS</label>
              </div> */}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Phương thức thanh toán</h2>
              <div className="flex flex-col gap-2">
                {paymentMethods.map(pm => (
                  <label key={pm.value} className={`flex items-center gap-2 border rounded p-2 cursor-pointer ${payment === pm.value ? "border-rose-400 bg-rose-50 dark:bg-rose-900/30" : ""} text-gray-900 dark:text-white`}>
                    <input type="radio" name="payment" value={pm.value} checked={payment === pm.value} onChange={e => setPayment(e.target.value)} />
                    <span>{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Thông tin người mua</h2>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-1 text-gray-900 dark:text-white">
                  <input type="radio" name="gender" value="female" checked={gender === "female"} onChange={() => setGender("female")} />
                  Chị
                </label>
                <label className="flex items-center gap-1 text-gray-900 dark:text-white">
                  <input type="radio" name="gender" value="male" checked={gender === "male"} onChange={() => setGender("male")} />
                  Anh
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-300" placeholder="Họ và tên" value={name} onChange={e => setName(e.target.value)} required />
                                 <input 
                   className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-300" 
                   placeholder="Số điện thoại (10 số)" 
                   value={phone} 
                   onChange={e => {
                     const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép số
                     if (value.length <= 10) { // Giới hạn tối đa 10 số
                       setPhone(value);
                     }
                   }} 
                   pattern="[0-9]{10}"
                   title="Số điện thoại phải có đúng 10 số"
                   required 
                 />
                <input className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-300" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
                <input className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-300" placeholder="Ngày sinh" value={dob} onChange={e => setDob(e.target.value)} type="date" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Ghi chú đơn hàng (Không bắt buộc)</h2>
              <textarea className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-300" placeholder="Vui lòng ghi chú thêm để T&C Jewelry hỗ trợ tốt nhất cho Quý khách!" value={note} onChange={e => setNote(e.target.value)} />
            </div>
            
            {/* Checkbox đồng ý xử lý dữ liệu cá nhân */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  id="agree-privacy"
                  checked={agree} 
                  onChange={e => setAgree(e.target.checked)} 
                  required 
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
                />
                <div className="flex-1">
                  <label htmlFor="agree-privacy" className="text-sm font-medium text-blue-900 dark:text-blue-100 cursor-pointer">
                    Tôi đồng ý cho phép T&C Jewelry xử lý thông tin cá nhân của mình
                  </label>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Thông tin của bạn sẽ được bảo mật và chỉ sử dụng để xử lý đơn hàng, giao hàng và chăm sóc khách hàng.
                  </p>
                </div>
              </div>
            </div>
            
            <button type="submit" className="w-full bg-rose-500 text-white py-3 rounded font-bold text-lg hover:bg-rose-600 transition" disabled={itemsToCalculate.length === 0 || !agree || isSubmitting || hasOutOfStockItems}
            >
              {isSubmitting ? "Đang xử lý..." : 
               hasOutOfStockItems ? "Không thể đặt hàng (Hết hàng)" :
               (isBuyNow ? "Mua ngay" : "Xác nhận đặt hàng")}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-10 px-4 text-gray-900 dark:text-white">Đang tải...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}
