import { useState, useEffect } from 'react';

interface Province {
  code: string;
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
}

interface Ward {
  code: string;
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  parent_code: string;
  path: string;
  path_with_type: string;
}

interface VietMapAddressPickerProps {
  onChange: (value: { province?: Province; ward?: Ward }) => void;
}

export default function VietMapAddressPicker({ onChange }: VietMapAddressPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  useEffect(() => {
    fetch('/api/locations/provinces')
      .then(res => res.json())
      .then((data) => {
        // data là object, chuyển thành array
        setProvinces(Object.values(data));
      });
    fetch('/api/locations/wards')
      .then(res => res.json())
      .then((data) => {
        setWards(Object.values(data));
      });
  }, []);

  const filteredWards = selectedProvince
    ? wards.filter(w => w.parent_code === selectedProvince)
    : [];

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
    setSelectedWard("");
    const province = provinces.find(p => p.code === e.target.value);
    onChange({ province });
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(e.target.value);
    const province = provinces.find(p => p.code === selectedProvince);
    const ward = wards.find(w => w.code === e.target.value);
    onChange({ province, ward });
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium">Tỉnh/Thành phố</label>
      <select
        className="border rounded px-2 py-1"
        value={selectedProvince}
        onChange={handleProvinceChange}
      >
        <option value="">-- Chọn Tỉnh/Thành phố --</option>
        {provinces.map((p) => (
          <option key={p.code} value={p.code}>{p.name_with_type}</option>
        ))}
      </select>

      <label className="font-medium">Xã/Phường/Thị trấn</label>
      <select
        className="border rounded px-2 py-1"
        value={selectedWard}
        onChange={handleWardChange}
        disabled={!selectedProvince}
      >
        <option value="">-- Chọn Xã/Phường/Thị trấn --</option>
        {filteredWards.map((w) => (
          <option key={w.code} value={w.code}>{w.name_with_type}</option>
        ))}
      </select>
    </div>
  );
} 