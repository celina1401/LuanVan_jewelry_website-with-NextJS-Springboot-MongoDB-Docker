'use client';

import { useState } from "react";
import VietMapAddressPicker from "@/components/VietMapAddressPicker";

export type Address = {
  receiverName: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  isDefault?: boolean;
};

export default function AddAddressForm({
  onAdd,
  onCancel,
  showCancel,
}: {
  onAdd: (addr: Address) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}) {
  const [receiverName, setReceiverName] = useState("");
  const [street, setStreet] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!receiverName || !street || !ward || !district || !province) return;
    onAdd({ receiverName, street, ward, district, province, isDefault });
    setReceiverName("");
    setStreet("");
    setWard("");
    setDistrict("");
    setProvince("");
    setIsDefault(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900 dark:text-zinc-200">Tên người nhận</label>
        <input
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          value={receiverName}
          onChange={e => setReceiverName(e.target.value)}
          placeholder="Nhập tên người nhận"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-900 dark:text-zinc-200">Địa chỉ (số nhà, đường)</label>
        <input
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          value={street}
          onChange={e => setStreet(e.target.value)}
          placeholder="Nhập địa chỉ (số nhà, đường)"
          required
        />
      </div>
      <VietMapAddressPicker
        onChange={({ province, ward }) => {
          setProvince(province?.name_with_type || "");
          // Lấy district từ ward.path nếu có, ví dụ: "Phường A, Quận 1, Hồ Chí Minh"
          const district = ward?.path?.split(", ")[1] || "";
          setDistrict(district);
          setWard(ward?.name_with_type || "");
        }}
      />
      <label className="flex items-center gap-2 text-gray-900 dark:text-zinc-200 mt-2">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={e => setIsDefault(e.target.checked)}
          className="accent-rose-500"
        />
        Địa chỉ mặc định
      </label>
      <div className="flex gap-3 mt-2">
        {showCancel && (
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-400 bg-transparent text-gray-700 dark:text-gray-300 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            onClick={onCancel}
          >
            Hủy
          </button>
        )}
        <button
          type="button"
          className="flex-1 px-6 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow transition"
          onClick={handleAdd}
        >
          Thêm địa chỉ
        </button>
      </div>
    </div>
  );
}
