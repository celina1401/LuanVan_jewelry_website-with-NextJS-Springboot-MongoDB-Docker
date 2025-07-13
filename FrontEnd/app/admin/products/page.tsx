"use client";

import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader as DialogModalHeader, DialogTitle as DialogModalTitle, DialogFooter } from "@/components/ui/dialog";
import { Dialog as DetailDialog, DialogContent as DetailDialogContent, DialogHeader as DetailDialogHeader, DialogTitle as DetailDialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import Barcode from "react-barcode";

export default function ProductPage() {
  const [form, setForm] = useState({
    name: "",
    weight: "",
    origin: "",
    brand: "",
    goldAge: "",
    category: "",
    sku: "",
    image: "" as string | File,
    tags: [] as string[],
    wage: "", // Thêm trường tiền công
    quantity: "", // Thêm trường số lượng
    productCode: "", // Thêm trường mã sản phẩm
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State cho popup chi tiết sản phẩm
  const [detailProduct, setDetailProduct] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // State cho popup sửa sản phẩm
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  // State cho danh sách sản phẩm mẫu (có thể thay bằng fetch API sau)
  const [products, setProducts] = useState([
    {
      product_id: "SP001",
      name: "Nhẫn vàng 18K",
      category: "Nhẫn",
      material: "Vàng 18K",
      karat: "18K",
      price: 5000000,
      thumbnail_url: "/images/products/ring1.jpg",
      status: "Còn hàng",
      created_at: "2024-05-01",
      updated_at: "2024-06-01",
      // Thông tin chi tiết
      detail_id: "D001",
      weight: 3.5,
      design: "Hoa văn cổ điển",
      origin: "Việt Nam",
      stock_quantity: 12,
      image_url: "/images/products/ring1.jpg",
      certification_number: "CERT-123456",
      note: "Sản phẩm nhập khẩu, bảo hành 12 tháng."
    }
  ]);
  // State xác nhận xóa
  const [deleteConfirm, setDeleteConfirm] = useState<{open: boolean, product: any | null}>({open: false, product: null});

  // Hàm chuyển tiếng Việt có dấu sang không dấu (không dùng \p{Diacritic})
  function removeVietnameseTones(str: string) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Remove combining diacritics
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    return str;
  }

  // Tự động sinh SKU khi nhập thông tin
  useEffect(() => {
    const sku = [
      removeVietnameseTones(form.name).replace(/\s+/g, '').slice(0, 3).toUpperCase(),
      form.weight,
      removeVietnameseTones(form.origin).replace(/\s+/g, '').slice(0, 2).toUpperCase(),
      removeVietnameseTones(form.brand).replace(/\s+/g, '').slice(0, 2).toUpperCase(),
      form.goldAge,
      form.category.slice(0, 2).toUpperCase()
    ].filter(Boolean).join("-");
    setForm(f => ({ ...f, sku }));
  }, [form.name, form.weight, form.origin, form.brand, form.goldAge, form.category]);

  // Tự động sinh mã sản phẩm khi chọn loại
  useEffect(() => {
    let code = "";
    switch (form.category) {
      case "necklace": code = "D001"; break;
      case "ring": code = "N001"; break;
      case "earring": code = "E001"; break;
      case "bracelet": code = "B001"; break;
      default: code = "";
    }
    setForm(f => ({ ...f, productCode: code }));
  }, [form.category]);

  function handleChange(e: any) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleWageBlur(e: any) {
    const value = e.target.value;
    if (value.length > 0 && value.length < 5 && !value.endsWith('.000')) {
      setForm(prev => ({ ...prev, wage: value + '.000' }));
    }
  }
  function handleSelect(name: string, value: string) {
    setForm({ ...form, [name]: value });
  }
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setForm({ ...form, image: "" });
    }
  }
  // Sửa lại hàm handleSubmit để gọi API backend khi thêm sản phẩm
  async function handleSubmit(e: any) {
    e.preventDefault();
    // Chuẩn bị payload, map trường nếu cần
    const payload = {
      ...form,
      // Nếu backend dùng 'id' thay vì 'product_id', có thể map lại ở đây
      // id: form.product_id,
    };
    try {
      const res = await fetch('http://localhost:9004/api/products/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newProduct = await res.json();
        setProducts(prev => [...prev, newProduct]);
        // Reset form
        setForm({
          name: "",
          weight: "",
          origin: "",
          brand: "",
          goldAge: "",
          category: "",
          sku: "",
          image: "",
          tags: [],
          wage: "",
          quantity: "",
          productCode: "",
        });
        setImagePreview(null);
        // Đóng dialog thêm mới nếu dùng DialogTrigger
        // setShowAdd(false);
      } else {
        alert('Thêm sản phẩm thất bại!');
      }
    } catch (err) {
      alert('Có lỗi khi kết nối server!');
    }
  }
  function handleTagChange(tag: string) {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  }

  // Hàm mở popup sửa, prefill dữ liệu
  function handleEdit(product: any) {
    setEditProduct({ ...product });
    setShowEdit(true);
  }
  // Hàm xử lý thay đổi form sửa
  function handleEditChange(e: any) {
    const { name, value } = e.target;
    setEditProduct((prev: any) => ({ ...prev, [name]: value }));
  }
  // Sửa lại hàm lưu sản phẩm đã sửa để gọi API backend
  async function handleEditSave(e: any) {
    e.preventDefault();
    if (!editProduct || !editProduct.product_id) return;
    try {
      const res = await fetch(`http://localhost:9004/api/products/${editProduct.product_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev =>
          prev.map(p => p.product_id === updated.id ? { ...p, ...updated } : p)
        );
        setShowEdit(false);
      } else {
        alert('Cập nhật sản phẩm thất bại!');
      }
    } catch (err) {
      alert('Có lỗi khi kết nối server!');
    }
  }

  function handleDelete(product: any) {
    setDeleteConfirm({open: true, product});
  }
  // Sửa lại hàm xác nhận xóa để gọi API backend
  async function confirmDelete() {
    if (!deleteConfirm.product?.product_id) return;
    try {
      const res = await fetch(`http://localhost:8080/api/products/${deleteConfirm.product.product_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.product_id !== deleteConfirm.product.product_id));
        setDeleteConfirm({ open: false, product: null });
      } else {
        alert('Xóa sản phẩm thất bại!');
      }
    } catch (err) {
      alert('Có lỗi khi kết nối server!');
    }
  }
  return (
    <div className="w-full max-w-6xl mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Quản lý sản phẩm</h1>
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold shadow hover:bg-primary/90 transition-colors">
              Thêm mới
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full overflow-y-auto max-h-screen border-2 border-rose-400 bg-[#111113] text-white rounded-2xl shadow-2xl">
            <DialogModalHeader>
              <DialogModalTitle className="text-2xl font-bold mb-2">Thêm sản phẩm mới</DialogModalTitle>
            </DialogModalHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* Hàng 1: Tên sản phẩm */}
              <div className="space-y-2 mb-2">
                <label className="font-semibold text-base">Tên sản phẩm</label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border border-rose-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white w-full"
                />
              </div>
              {/* Hàng 2: Loại sản phẩm - Mã sản phẩm - Số lượng */}
              <div className="grid grid-cols-3 gap-6 mb-2">
                <div className="space-y-2">
                  <label className="font-semibold text-base">Loại sản phẩm</label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => handleSelect("category", v)}
                  >
                    <SelectTrigger className="border border-rose-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white w-full">
                      <SelectValue placeholder="Chọn loại sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ring">Nhẫn</SelectItem>
                      <SelectItem value="necklace">Dây chuyền</SelectItem>
                      <SelectItem value="earring">Bông tai</SelectItem>
                      <SelectItem value="bracelet">Vòng tay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Mã sản phẩm</label>
                  <Input
                    name="productCode"
                    value={form.productCode}
                    readOnly
                    className="bg-muted border border-rose-300 rounded-lg px-4 py-3 text-base w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Số lượng</label>
                  <Input
                    name="quantity"
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    className="border border-rose-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white w-full"
                  />
                </div>
              </div>
              {/* Hàng 3: Khối lượng - Tuổi vàng - Tiền công */}
              <div className="grid grid-cols-3 gap-6 mb-2">
                <div className="space-y-2">
                  <label className="font-semibold text-base">Khối lượng (g)</label>
                  <Input
                    name="weight"
                    type="number"
                    min={0}
                    value={form.weight}
                    onChange={handleChange}
                    required
                    className="border border-rose-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Tuổi vàng</label>
                  <Select
                    value={form.goldAge}
                    onValueChange={(v) => handleSelect("goldAge", v)}
                    required
                  >
                    <SelectTrigger className="border border-rose-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white w-full">
                      <SelectValue placeholder="Chọn tuổi vàng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="983">983</SelectItem>
                      <SelectItem value="999">999</SelectItem>
                      <SelectItem value="9999">9999</SelectItem>
                      <SelectItem value="15k">15k</SelectItem>
                      <SelectItem value="16k">16k</SelectItem>
                      <SelectItem value="17k">17k</SelectItem>
                      <SelectItem value="10k">10k</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Tiền công (VNĐ)</label>
                  <Input
                    name="wage"
                    type="number"
                    min={0}
                    value={form.wage}
                    onChange={handleChange}
                    onBlur={handleWageBlur}
                    required
                    className="border border-rose-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white w-full"
                  />
                </div>
              </div>
              {/* Hàng 4: Xuất xứ - Thương hiệu */}
              <div className="grid grid-cols-2 gap-6 mb-2">
                <div className="space-y-2">
                  <label className="font-semibold text-base">Xuất xứ</label>
                  <Input
                    name="origin"
                    value={form.origin}
                    onChange={handleChange}
                    required
                    className="border border-rose-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Thương hiệu</label>
                  <Input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    required
                    className="border border-rose-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400 bg-[#18181b] text-white w-full"
                  />
                </div>
              </div>
              {/* Mã SKU: chiếm 2 cột */}
              <div className="col-span-2 space-y-2">
                <label className="font-semibold text-base">Mã SKU (tự động)</label>
                <Input
                  name="sku"
                  value={form.sku}
                  readOnly
                  className="bg-muted border border-rose-300 rounded-lg px-4 py-3 text-base w-full"
                />
              </div>
              {/* Nhãn */}
              <div className="space-y-2">
                <label className="font-semibold text-base">Nhãn</label>
                <div className="flex gap-4 flex-wrap">
                  {['Mới nhất', 'Phổ biến nhất', 'Bán chạy', 'Khuyến mãi'].map(tag => (
                    <label key={tag} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={form.tags.includes(tag)}
                        onChange={() => handleTagChange(tag)}
                        className="accent-rose-500 w-4 h-4"
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>
              {/* Phần upload ảnh ở cuối form */}
              <div className="flex flex-col items-center justify-center w-full mt-4">
                <div className="space-y-2 w-full max-w-xs text-center">
                  <label className="font-semibold text-base">Ảnh sản phẩm</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600"
                  />
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-28 h-28 object-cover rounded-xl border border-rose-300 mt-2"
                  />
                )}
                <div className="mt-4 flex justify-center w-full">
                  <Barcode
                    value={form.sku || "SKU"}
                    height={60}
                    width={2}
                    fontSize={16}
                    displayValue={true}
                  />
                </div>
              </div>
              {/* Nút submit */}
              <DialogFooter>
                <button
                  type="submit"
                  className="w-full bg-rose-500 text-white px-4 py-3 rounded-lg text-lg font-bold hover:bg-rose-600 border border-rose-400 shadow-sm mt-2"
                >
                  Thêm sản phẩm
                </button>
              </DialogFooter>
            </form>

          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-lg border-0">
        {/* <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-lg font-bold">Danh sách sản phẩm trong kho</CardTitle>
        </CardHeader> */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 gap-4 font-semibold border-b px-6 py-3 bg-gradient-to-r from-rose-100/80 to-rose-200/80 dark:from-[#23232b] dark:to-[#18181b] text-center rounded-t-lg">
              <div>Mã SP</div>
              <div>Tên SP</div>
              <div>Loại</div>
              <div>Chất liệu</div>
              <div>Hàm lượng</div>
              <div>Giá bán</div>
              <div>Ảnh</div>
              <div>Trạng thái</div>
              <div>Ngày tạo</div>
              <div>Ngày cập nhật</div>
              <div>Chi tiết sản phẩm</div>
              <div>Thao tác</div>
            </div>
            {/* Hiển thị danh sách sản phẩm */}
            {products.map((product: any) => (
              <div key={product.product_id} className="grid grid-cols-12 gap-4 border-b px-6 py-3 items-center text-center hover:bg-rose-50/60 dark:hover:bg-[#23232b] transition-colors group">
                <div className="font-mono">{product.product_id}</div>
                <div className="font-medium">{product.name}</div>
                <div>{product.category}</div>
                <div>{product.material}</div>
                <div>{product.karat}</div>
                <div className="text-rose-600 font-bold">{product.price?.toLocaleString()}</div>
                <div className="flex justify-center"><img src={product.thumbnail_url} alt="thumb" className="w-12 h-12 object-cover rounded-lg shadow-md border-2 border-rose-200 group-hover:scale-105 transition-transform" /></div>
                <div><span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">{product.status}</span></div>
                <div className="text-xs text-muted-foreground">{product.created_at}</div>
                <div className="text-xs text-muted-foreground">{product.updated_at}</div>
                <div>
                  <button onClick={() => { setDetailProduct(product); setShowDetail(true); }}
                    className="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors"
                  >Xem chi tiết</button>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    className="text-yellow-600 font-semibold hover:underline hover:text-yellow-700 transition-colors"
                    onClick={() => handleEdit(product)}
                  >Sửa</button>
                  <button
                    className="text-red-500 font-semibold hover:underline hover:text-red-700 transition-colors"
                    onClick={() => handleDelete(product)}
                  >Xóa</button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-lg">
                Sản phẩm sẽ được hiển thị tại đây
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Popup chi tiết sản phẩm */}
      <DetailDialog open={showDetail} onOpenChange={setShowDetail}>
        <DetailDialogContent className="max-w-3xl w-full bg-card rounded-2xl shadow-2xl border-2 border-rose-300 p-0 overflow-hidden">
          <DetailDialogHeader className="px-8 pt-8 pb-2">
            <DetailDialogTitle className="text-3xl font-extrabold mb-2 text-primary">Chi tiết sản phẩm</DetailDialogTitle>
          </DetailDialogHeader>
          {detailProduct && (
            <div className="flex flex-col md:flex-row gap-8 px-8 pb-8">
              {/* Ảnh sản phẩm */}
              <div className="flex flex-col items-center gap-4 md:w-1/3 w-full">
                <img src={detailProduct.image_url || detailProduct.thumbnail_url} alt={detailProduct.name} className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-rose-200" />
                {/* Gallery nhỏ nếu có nhiều ảnh, hiện tại chỉ 1 ảnh */}
                {/* <div className="flex gap-2 mt-2">
                  <img src={detailProduct.image_url} alt="Ảnh chi tiết" className="w-14 h-14 object-cover rounded border" />
                </div> */}
              </div>
              {/* Thông tin sản phẩm */}
              <div className="flex-1 grid grid-cols-1 gap-y-2 text-base">
                <div><span className="font-semibold text-gray-500">ID chi tiết:</span> <span className="font-medium">{detailProduct.detail_id || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Mã sản phẩm:</span> <span className="font-medium">{detailProduct.product_id || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Tên sản phẩm:</span> <span className="font-medium">{detailProduct.name || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Loại:</span> <span className="font-medium">{detailProduct.category || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Chất liệu:</span> <span className="font-medium">{detailProduct.material || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Hàm lượng:</span> <span className="font-medium">{detailProduct.karat || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Trọng lượng:</span> <span className="font-medium">{detailProduct.weight || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Thiết kế:</span> <span className="font-medium">{detailProduct.design || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Xuất xứ:</span> <span className="font-medium">{detailProduct.origin || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Số lượng tồn kho:</span> <span className="font-medium">{detailProduct.stock_quantity || '-'}</span></div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold text-gray-500">Giá bán:</span>
                  <span className="text-2xl font-bold text-rose-600">{detailProduct.price ? detailProduct.price.toLocaleString() + ' VNĐ' : '-'}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-gray-500">Trạng thái:</span>
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold shadow-sm">{detailProduct.status || '-'}</span>
                </div>
                <div><span className="font-semibold text-gray-500">Mã kiểm định:</span> <span className="font-medium">{detailProduct.certification_number || '-'}</span></div>
                <div><span className="font-semibold text-gray-500">Ghi chú:</span> <span className="font-medium">{detailProduct.note || '-'}</span></div>
                <div className="flex flex-row items-center justify-start gap-8 mt-2">
                  <div className="whitespace-nowrap"><span className="font-semibold text-gray-500">Ngày tạo:</span> <span className="font-medium">{detailProduct.created_at || '-'}</span></div>
                  <div className="whitespace-nowrap"><span className="font-semibold text-gray-500">Ngày cập nhật:</span> <span className="font-medium">{detailProduct.updated_at || '-'}</span></div>
                </div>
              </div>
            </div>
          )}
        </DetailDialogContent>
      </DetailDialog>
      {/* Popup sửa sản phẩm */}
      <DetailDialog open={showEdit} onOpenChange={setShowEdit}>
        <DetailDialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-2xl border-2 border-rose-400 p-0">
          <DetailDialogHeader className="px-8 pt-8 pb-2">
            <DetailDialogTitle className="text-3xl font-extrabold mb-2 text-white">Sửa sản phẩm</DetailDialogTitle>
          </DetailDialogHeader>
          {editProduct && (
            <form className="flex flex-col md:flex-row gap-8 px-8 pb-8" onSubmit={handleEditSave}>
              <div className="flex flex-col items-center gap-4 md:w-1/3 w-full">
                <img src={editProduct.image_url || editProduct.thumbnail_url} alt={editProduct.name} className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-rose-400" />
                {/* Có thể thêm upload ảnh ở đây */}
              </div>
              <div className="flex-1 grid grid-cols-1 gap-y-3 text-base">
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Tên sản phẩm:</span>
                  <input name="name" value={editProduct.name} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Loại:</span>
                  <input name="category" value={editProduct.category} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Chất liệu:</span>
                  <input name="material" value={editProduct.material} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Hàm lượng:</span>
                  <input name="karat" value={editProduct.karat} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Trọng lượng:</span>
                  <input name="weight" value={editProduct.weight} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Thiết kế:</span>
                  <input name="design" value={editProduct.design} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Xuất xứ:</span>
                  <input name="origin" value={editProduct.origin} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Số lượng tồn kho:</span>
                  <input name="stock_quantity" value={editProduct.stock_quantity} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Giá bán:</span>
                  <input name="price" value={editProduct.price} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Trạng thái:</span>
                  <input name="status" value={editProduct.status} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Mã kiểm định:</span>
                  <input name="certification_number" value={editProduct.certification_number} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-500">Ghi chú:</span>
                  <input name="note" value={editProduct.note} onChange={handleEditChange} className="border rounded px-3 py-2" />
                </label>
                {/* Có thể thêm upload ảnh ở đây */}
                <div className="flex flex-row items-center justify-start gap-8 mt-2">
                  <div className="whitespace-nowrap"><span className="font-semibold text-gray-500">Ngày tạo:</span> <span className="font-medium">{editProduct.created_at || '-'}</span></div>
                  <div className="whitespace-nowrap"><span className="font-semibold text-gray-500">Ngày cập nhật:</span> <span className="font-medium">{editProduct.updated_at || '-'}</span></div>
                </div>
                <button type="submit" className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-600 transition-colors">Lưu</button>
              </div>
            </form>
          )}
        </DetailDialogContent>
      </DetailDialog>
      {/* Popup xác nhận xóa */}
      <Dialog open={deleteConfirm.open} onOpenChange={open => setDeleteConfirm(d => ({...d, open}))}>
        <DialogContent>
          <DialogModalHeader>
            <DialogModalTitle>Bạn có chắc muốn xóa sản phẩm này?</DialogModalTitle>
          </DialogModalHeader>
          <div className="py-4">
            <div className="font-semibold">{deleteConfirm.product?.name}</div>
          </div>
          <DialogFooter>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
              onClick={confirmDelete}
            >
              Xóa
            </button>
            <button
              className="px-4 py-2 rounded-lg border"
              onClick={() => setDeleteConfirm({open: false, product: null})}
            >
              Hủy
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 