"use client";

import { useCart } from "@/contexts/cart-context";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useUser, useAuth } from "@clerk/nextjs";
// import type { Address } from "@/app/dashboard/page";
import AddAddressForm, { Address } from "@/app/components/AddAddressForm";


const provinces = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"];
const districts = ["Quận 1", "Quận 2", "Quận 3"];
const wards = ["Phường A", "Phường B", "Phường C"];
const paymentMethods = [
  { label: "Thanh toán tiền mặt khi nhận hàng (COD)", value: "cod" },
  { label: "Thanh toán VNPAY", value: "vnpay" },
];

export default function OrderPage() {
  const { items, total, clearCart, updateQuantity } = useCart();
  const { user } = useUser();
  const { getToken } = useAuth();

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
  const [sms, setSms] = useState(false);
  const [invoice, setInvoice] = useState(false);
  const [promo, setPromo] = useState("");

  // ✅ Tự động load thông tin người dùng
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:9001/api/users/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
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

  //Tinh gia vang dong
  useEffect(() => {
    async function fetchPrices() {
      const result: { [id: string]: number } = {};
      await Promise.all(
        items.map(async (item) => {
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
    if (items.length > 0) fetchPrices();
  }, [items]);

  const shipping = deliveryType === "home" ? 0 : 0;
  const discount = 0;
  const finalTotal = items.reduce((sum, item) => {
    const unitPrice = dynamicPrices[item.id] ?? item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;

    const orderId = `ORD${Date.now()}`; // mã đơn hàng ngẫu nhiên

    // if (payment === "vnpay") {
    //   try {
    //     const res = await fetch(`http://localhost:9006/api/payment/vnpay?orderId=${orderId}&amount=${finalTotal}`);
    //     const data = await res.json();
    //     if (data.url) {
    //       window.location.href = data.url;
    //       return;
    //     }
    //   } catch (err) {
    //     alert("Không thể kết nối VNPAY");
    //     return;
    //   }
    // } 
    if (payment === "vnpay") {
      try {
        const token = await getToken();
    
        // Bước 1: Gửi đơn hàng lên OrderService
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
            items: items.map((item) => ({
              productId: item.id,
              productName: item.name,
              productImage: item.image,
              quantity: item.quantity,
              price: dynamicPrices[item.id] ?? item.price,
              totalPrice: (dynamicPrices[item.id] ?? item.price) * item.quantity,
              weight: item.metadata?.weight,
              goldAge: item.metadata?.goldAge,
              wage: item.metadata?.wage,
              category: item.metadata?.category,
              brand: item.metadata?.brand,
            })),
            subtotal: finalTotal,
            shippingFee: shipping,
            discount,
            total: finalTotal,
            paymentMethod: "VNPAY",
            paymentStatus: "Chờ thanh toán",
            note,
            smsNotification: sms,
            invoiceRequest: invoice,
            promoCode: promo,
          }),
        });
    
        if (!orderRes.ok) {
          const text = await orderRes.text();
          alert("Lỗi khi tạo đơn hàng: " + text);
          return;
        }
    
        const savedOrder = await orderRes.json();
        const createdOrderId = savedOrder.id; // Hoặc orderNumber nếu bạn dùng
    
        // Bước 2: Lấy URL thanh toán từ PaymentService
        const res = await fetch(
          `http://localhost:9006/api/payment/vnpay?orderId=${createdOrderId}&amount=${finalTotal}`
        );
        const data = await res.json();
    
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Không nhận được URL VNPay");
        }
    
        return;
      } catch (err) {
        console.error("VNPay error:", err);
        alert("Không thể kết nối VNPay");
        return;
      }
    }
    
    else {
      if (payment === "cod") {
        try {
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
              items: items.map((item) => ({
                productId: item.id,
                productName: item.name,
                productImage: item.image,
                quantity: item.quantity,
                price: dynamicPrices[item.id] ?? item.price,
                totalPrice: (dynamicPrices[item.id] ?? item.price) * item.quantity,
                weight: item.metadata?.weight,
                goldAge: item.metadata?.goldAge,
                wage: item.metadata?.wage,
                category: item.metadata?.category,
                brand: item.metadata?.brand,
              })),
              subtotal: finalTotal,
              shippingFee: shipping,
              discount,
              total: finalTotal,
              paymentMethod: "COD",
              paymentStatus: "Chưa thanh toán",
              note,
              smsNotification: sms,
              invoiceRequest: invoice,
              promoCode: promo,
            }),
          });

          if (res.ok) {
            setSuccess(true);
            clearCart();
          } else {
            const text = await res.text();
            alert("Lỗi khi tạo đơn hàng: " + text);
          }
        } catch (err) {
          console.error("Lỗi tạo đơn hàng COD:", err);
          alert("Không thể kết nối server để đặt hàng COD.");
        }
        return;
      }

    }

    // Xử lý COD như cũ
    setSuccess(true);
    clearCart();
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
        <h1 className="text-3xl font-bold mb-6">Thông tin đặt hàng</h1>
        {success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded">
            Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại T&C Jewelry.
          </div>
        ) : (
          <form onSubmit={handleOrder} className="space-y-6">
            <div className="bg-white dark:bg-[#18181b] rounded-xl shadow p-4 mb-4">
              <h2 className="text-xl font-semibold mb-2">Sản phẩm</h2>
              {items.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống.</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => {
                    const unitPrice = dynamicPrices[item.id] ?? item.price;
                    return (
                      <li key={item.id} className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-3">
                          {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />}
                          <span>{item.name}</span>
                          <div className="flex items-center gap-1 ml-2">
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1, item.metadata)} disabled={item.quantity <= 1} className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-700 text-lg font-bold">-</button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1, item.metadata)} className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-700 text-lg font-bold">+</button>
                          </div>
                        </div>
                        <span>{(unitPrice * item.quantity).toLocaleString()}₫</span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span>Tạm tính</span><span>{finalTotal.toLocaleString()}₫</span></div>
                <div className="flex justify-between"><span>Giao hàng</span><span>{shipping === 0 ? "Miễn phí" : shipping + "₫"}</span></div>
                <div className="flex justify-between"><span>Giảm giá</span><span>- {discount}₫</span></div>
                <div className="flex justify-between font-bold text-lg"><span>Tổng tiền</span><span>{finalTotal.toLocaleString()}₫</span></div>
              </div>
              <div className="mt-4 flex gap-2 items-center">
                <input className="border rounded p-2 flex-1" placeholder="Nhập mã ưu đãi" value={promo} onChange={e => setPromo(e.target.value)} />
                <button type="button" className="bg-rose-400 text-white px-4 py-2 rounded font-semibold">Áp dụng</button>
              </div>
            </div>

            {/* giao hang */}

            <div className="bg-white dark:bg-[#18181b] rounded-xl shadow p-4">
              <h2 className="font-semibold mb-2">Hình thức nhận hàng</h2>
              <div className="flex gap-4 mb-4">

                <button type="button" onClick={() => setDeliveryType("home")} className={`flex-1 border rounded-lg p-3 flex flex-col items-center gap-1 ${deliveryType === "home" ? "bg-yellow-100 border-yellow-400" : "bg-gray-50 dark:bg-gray-900"}`}>
                  <span className="font-bold text-yellow-600">Giao hàng tận nơi</span>
                  <span className="text-xs text-gray-500 dark:text-gray-900">Miễn phí toàn quốc</span>
                </button>
                <button type="button" onClick={() => setDeliveryType("store")} className={`flex-1 border rounded-lg p-3 flex flex-col items-center gap-1 ${deliveryType === "store" ? "bg-purple-100 border-purple-400" : "bg-gray-50 dark:bg-gray-900"}`}>
                  <span className="font-bold text-purple-600">Nhận tại cửa hàng</span>
                </button>
              </div>

              {deliveryType === "home" && (
                <>
                  <label className="block mb-1 font-medium">Chọn địa chỉ giao hàng</label>
                  <select
                    className="w-full border p-2 rounded mb-2"
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
                          <option key={defaultIdx} value={defaultIdx}>
                            ⭐ {`${addresses[defaultIdx].receiverName} - ${addresses[defaultIdx].street}, ${addresses[defaultIdx].ward}, ${addresses[defaultIdx].district}, ${addresses[defaultIdx].province}`}
                          </option>,
                          ...addresses.map((addr, idx) =>
                            idx !== defaultIdx ? (
                              <option key={idx} value={idx}>
                                {`${addr.receiverName} - ${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}
                              </option>
                            ) : null
                          )
                        ];
                      }
                      return [
                        <option key={-1} value={-1}>Chọn địa chỉ giao hàng</option>,
                        ...addresses.map((addr, idx) => (
                          <option key={idx} value={idx}>
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



              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={sms} onChange={e => setSms(e.target.checked)} />
                <label className="text-sm">Tôi muốn gửi thiệp và lời chúc qua SMS</label>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={invoice} onChange={e => setInvoice(e.target.checked)} />
                <label className="text-sm">Xuất hóa đơn công ty</label>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} required />
                <label className="text-sm">Đồng ý xử lý dữ liệu cá nhân</label>
              </div>
            </div>

            <div className="bg-white dark:bg-[#18181b] rounded-xl shadow p-4">
              <h2 className="font-semibold mb-2">Phương thức thanh toán</h2>
              <div className="flex flex-col gap-2">
                {paymentMethods.map(pm => (
                  <label key={pm.value} className={`flex items-center gap-2 border rounded p-2 cursor-pointer ${payment === pm.value ? "border-rose-400 bg-rose-50 dark:bg-rose-900/30" : ""}`}>
                    <input type="radio" name="payment" value={pm.value} checked={payment === pm.value} onChange={e => setPayment(e.target.value)} />
                    <span>{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-[#18181b] rounded-xl shadow p-4">
              <h2 className="font-semibold mb-2">Thông tin người mua</h2>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-1">
                  <input type="radio" name="gender" value="female" checked={gender === "female"} onChange={() => setGender("female")} />
                  Chị
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="gender" value="male" checked={gender === "male"} onChange={() => setGender("male")} />
                  Anh
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border rounded p-2" placeholder="Họ và tên" value={name} onChange={e => setName(e.target.value)} required />
                <input className="border rounded p-2" placeholder="Số điện thoại" value={phone} onChange={e => setPhone(e.target.value)} required />
                <input className="border rounded p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
                <input className="border rounded p-2" placeholder="Ngày sinh" value={dob} onChange={e => setDob(e.target.value)} type="date" />
              </div>
            </div>
            <div className="bg-white dark:bg-[#18181b] rounded-xl shadow p-4">
              <h2 className="font-semibold mb-2">Ghi chú đơn hàng (Không bắt buộc)</h2>
              <textarea className="w-full border rounded p-2" placeholder="Vui lòng ghi chú thêm để T&C Jewelry hỗ trợ tốt nhất cho Quý khách!" value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-rose-500 text-white py-3 rounded font-bold text-lg hover:bg-rose-600 transition" disabled={items.length === 0 || !agree}>
              Xác nhận đặt hàng
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
