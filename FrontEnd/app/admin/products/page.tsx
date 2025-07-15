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
    price: "", // Thêm trường giá bán
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State cho popup chi tiết sản phẩm
  const [detailProduct, setDetailProduct] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Hàm lấy thông tin chi tiết sản phẩm với hình ảnh
  const fetchProductDetail = async (productId: string) => {
    try {
      const res = await fetch(`http://localhost:9004/api/products/profile/${productId}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      } else {
        console.error('Error fetching product detail:', res.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching product detail:', error);
      return null;
    }
  };

  // State cho popup sửa sản phẩm
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  // State cho danh sách sản phẩm (bỏ mẫu hardcode)
  const [products, setProducts] = useState<any[]>([]);

  // Fetch danh sách sản phẩm từ backend khi load trang
  useEffect(() => {
    async function fetchProducts() {
      try {
        // Sử dụng endpoint mới để lấy sản phẩm với hình ảnh
        const res = await fetch('http://localhost:9004/api/products/all-with-images');
        if (res.ok) {
          const data = await res.json();
          console.log('Products with images:', data);
          setProducts(data);

          // Debug: kiểm tra files trong uploads
          try {
            const uploadsRes = await fetch('http://localhost:9004/api/products/list-uploads');
            if (uploadsRes.ok) {
              const uploadsData = await uploadsRes.json();
              console.log('Files in uploads directory:', uploadsData);
            }
          } catch (uploadsError) {
            console.error('Error checking uploads:', uploadsError);
          }
        } else {
          // Fallback về endpoint cũ nếu endpoint mới chưa hoạt động
          const fallbackRes = await fetch('http://localhost:9004/api/products');
          const fallbackData = await fallbackRes.json();
          setProducts(fallbackData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback về endpoint cũ
        try {
          const fallbackRes = await fetch('http://localhost:9004/api/products');
          const fallbackData = await fallbackRes.json();
          setProducts(fallbackData);
        } catch (fallbackError) {
          console.error('Error with fallback:', fallbackError);
        }
      }
    }
    fetchProducts();
  }, []);
  // State xác nhận xóa
  const [deleteConfirm, setDeleteConfirm] = useState<any>({ open: false, product: null });

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
  // Sửa lại hàm handleSubmit để gửi FormData (multipart/form-data) khi thêm sản phẩm mới, phù hợp với backend nhận @RequestPart product (JSON) và @RequestPart image (file).
  async function handleSubmit(e: any) {
    e.preventDefault();
    // Tạo object sản phẩm (bỏ trường image nếu là file)
    const { image, ...productData } = form;
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));
    if (form.image && typeof form.image !== "string") {
      formData.append('image', form.image); // form.image là file
    }
    try {
      const res = await fetch('http://localhost:9004/api/products/add', {
        method: 'POST',
        body: formData,
        // KHÔNG set Content-Type, browser sẽ tự động
      });
      if (res.ok) {
        // Fetch lại danh sách sản phẩm từ backend để đảm bảo đồng bộ
        const listRes = await fetch('http://localhost:9004/api/products');
        const list = await listRes.json();
        setProducts(list);
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
          price: "",
        });
        setImagePreview(null);
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
        setProducts((prev: any[]) =>
          prev.map((p: any) =>
            (p.id || p.product_id) === (updated.id || updated.product_id)
              ? { ...p, ...updated }
              : p
          )
        );
        setShowEdit(false);
      } else {
        alert('Cập nhật sản phẩm thất bại!');
      }
    } catch (err) {
      alert('Có lỗi khi kết nối server!');
    }
  }

  // Hàm cập nhật hình ảnh sản phẩm
  const updateProductImage = async (productId: string, imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await fetch(`http://localhost:9004/api/products/${productId}/image`, {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        // Cập nhật danh sách sản phẩm
        setProducts((prev: any[]) =>
          prev.map((p: any) =>
            (p.id || p.product_id) === productId
              ? { ...p, thumbnailUrl: result.thumbnailUrl }
              : p
          )
        );
        return result;
      } else {
        throw new Error('Failed to update image');
      }
    } catch (error) {
      console.error('Error updating product image:', error);
      throw error;
    }
  };

  // Hàm xóa hình ảnh sản phẩm
  const deleteProductImage = async (productId: string) => {
    try {
      const res = await fetch(`http://localhost:9004/api/products/${productId}/image`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Cập nhật danh sách sản phẩm
        setProducts((prev: any[]) =>
          prev.map((p: any) =>
            (p.id || p.product_id) === productId
              ? { ...p, thumbnailUrl: null }
              : p
          )
        );
        return true;
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting product image:', error);
      throw error;
    }
  };

  function handleDelete(product: any) {
    setDeleteConfirm({ open: true, product });
  }
  // Sửa lại hàm xác nhận xóa để gọi API backend
  async function confirmDelete() {
    if (!deleteConfirm.product?.id && !deleteConfirm.product?.product_id) return;
    try {
      const res = await fetch(`http://localhost:9004/api/products/${deleteConfirm.product.id || deleteConfirm.product.product_id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev: any[]) => prev.filter((p: any) => (p.id || p.product_id) !== (deleteConfirm.product.id || deleteConfirm.product.product_id)));
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
        <div className="flex gap-2">
          {/* Nút debug để test ảnh */}
          {/* <button
            onClick={async () => {
              try {
                const res = await fetch('http://localhost:9004/api/products/list-uploads');
                if (res.ok) {
                  const files = await res.json();
                  console.log('Uploads files:', files);
                  alert('Files in uploads: ' + JSON.stringify(files));
                }
              } catch (error) {
                console.error('Debug error:', error);
                alert('Debug error: ' + error);
              }
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Debug Uploads
          </button> */}
        </div>
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
              <div className="grid grid-cols-4 gap-6 mb-2">
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
                <div className="space-y-2">
                  <label className="font-semibold text-base">Giá bán (VNĐ)</label>
                  <Input
                    name="price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={handleChange}
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
            {products.map((product: any) => {
              console.log("Product row:", product);
              return (
                <div key={product.id || product.product_id} className="grid grid-cols-12 gap-4 border-b px-6 py-3 items-center text-center hover:bg-rose-50/60 dark:hover:bg-[#23232b] transition-colors group">
                  <div className="font-mono">{product.productCode}</div>
                  <div className="font-medium">{product.name}</div>
                  <div>{(() => {
                    switch (product.category) {
                      case 'necklace': return 'Dây chuyền';
                      case 'bracelet': return 'Vòng tay';
                      case 'ring': return 'Nhẫn';
                      case 'earring': return 'Bông tai';
                      default: return product.category;
                    }
                  })()}</div>
                  <div>{product.material}</div>
                  <div>{product.karat}</div>
                  <div className="text-rose-600 font-bold">{product.price?.toLocaleString()}</div>
                  <div className="flex justify-center">
                    {product.thumbnailUrl ? (
                      <img
                        src={`http://localhost:9004${product.thumbnailUrl}`}
                        alt="thumb"
                        className="w-12 h-12 object-cover rounded-lg shadow-md border-2 border-rose-200 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          console.log('Image load error for:', product.thumbnailUrl);
                          // Fallback nếu ảnh không load được
                          e.currentTarget.src = product.thumbnail_url || '/default-avatar.png';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', product.thumbnailUrl);
                        }}
                      />
                    ) : product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt="thumb"
                        className="w-12 h-12 object-cover rounded-lg shadow-md border-2 border-rose-200 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          console.log('Fallback image load error for:', product.thumbnail_url);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  <div>
                    {product.quantity > 0 ? (
                      <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Còn hàng</span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Hết hàng</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{product.created_at}</div>
                  <div className="text-xs text-muted-foreground">{product.updated_at}</div>
                  <div>
                    <button onClick={async () => {
                      const detail = await fetchProductDetail(product.id || product.product_id);
                      setDetailProduct(detail || product);
                      setShowDetail(true);
                    }}
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
              )
            })}
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
                {detailProduct.thumbnailUrl ? (
                  <img
                    src={`http://localhost:9004${detailProduct.thumbnailUrl}`}
                    alt={detailProduct.name}
                    className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-rose-200"
                    onError={(e) => {
                      e.currentTarget.src = detailProduct.image_url || detailProduct.thumbnail_url || '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                    Không có ảnh
                  </div>
                )}
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
                {editProduct.thumbnailUrl ? (
                  <img
                    src={`http://localhost:9004${editProduct.thumbnailUrl}`}
                    alt={editProduct.name}
                    className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-rose-400"
                    onError={(e) => {
                      e.currentTarget.src = editProduct.image_url || editProduct.thumbnail_url || '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                    Không có ảnh
                  </div>
                )}
                {/* Upload ảnh mới */}
                <div className="space-y-2 w-full max-w-xs text-center">
                  <label className="font-semibold text-base">Cập nhật ảnh</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && editProduct) {
                        try {
                          await updateProductImage(editProduct.id || editProduct.product_id, file);
                          // Cập nhật editProduct với ảnh mới
                          const updatedProduct = await fetchProductDetail(editProduct.id || editProduct.product_id);
                          if (updatedProduct) {
                            setEditProduct(updatedProduct);
                          }
                        } catch (error) {
                          alert('Lỗi khi cập nhật ảnh!');
                        }
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600"
                  />
                </div>
                {/* Nút xóa ảnh */}
                {editProduct.thumbnailUrl && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (editProduct) {
                        try {
                          await deleteProductImage(editProduct.id || editProduct.product_id);
                          // Cập nhật editProduct sau khi xóa ảnh
                          const updatedProduct = await fetchProductDetail(editProduct.id || editProduct.product_id);
                          if (updatedProduct) {
                            setEditProduct(updatedProduct);
                          }
                        } catch (error) {
                          alert('Lỗi khi xóa ảnh!');
                        }
                      }
                    }}
                    className="text-red-500 text-sm hover:text-red-700 underline"
                  >
                    Xóa ảnh
                  </button>
                )}
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
      <Dialog open={deleteConfirm.open} onOpenChange={open => setDeleteConfirm({ ...deleteConfirm, open })}>
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
              onClick={() => setDeleteConfirm({ open: false, product: null })}
            >
              Hủy
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 