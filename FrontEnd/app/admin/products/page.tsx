"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader as DialogModalHeader, DialogTitle as DialogModalTitle, DialogFooter } from "@/components/ui/dialog";
import { Dialog as DetailDialog, DialogContent as DetailDialogContent, DialogHeader as DetailDialogHeader, DialogTitle as DetailDialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import Barcode from "react-barcode";
import { Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

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
    description: "", // Thêm trường mô tả chi tiết
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

  // Hàm fetch danh sách sản phẩm từ backend
  async function fetchProducts() {
    try {
      // Sử dụng endpoint mới để lấy sản phẩm với hình ảnh
      const res = await fetch('http://localhost:9004/api/products/all-with-images');
      if (res.ok) {
        const data = await res.json();
        // Sắp xếp theo mã sản phẩm (productCode) tăng dần (A-Z, 0-9)
        const sorted = [...data].sort((a, b) => {
          if (!a.productCode) return 1;
          if (!b.productCode) return -1;
          return a.productCode.localeCompare(b.productCode, undefined, { numeric: true, sensitivity: 'base' });
        });
        setProducts(sorted);
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

  // Fetch danh sách sản phẩm khi load trang
  useEffect(() => {
    fetchProducts();
  }, []);
  // State xác nhận xóa
  const [deleteConfirm, setDeleteConfirm] = useState<any>({ open: false, product: null });
  const [showAdd, setShowAdd] = useState(false);

  // Lưu lại category ban đầu khi mở popup sửa
  const [originalEditCategory, setOriginalEditCategory] = useState<string | undefined>(undefined);
  // Lưu lại productCode ban đầu khi mở popup sửa
  const [originalEditProductCode, setOriginalEditProductCode] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (showEdit && editProduct) {
      setOriginalEditCategory(editProduct.category);
      setOriginalEditProductCode(editProduct.productCode);
    }
    // eslint-disable-next-line
  }, [showEdit]);

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

  // Tự động sinh mã sản phẩm khi chọn loại trong form sửa
  useEffect(() => {
    if (!showEdit || !editProduct || !originalEditCategory) return;
    // Nếu không thay đổi loại sản phẩm thì hiển thị lại mã ban đầu
    if (originalEditCategory === editProduct.category) {
      setEditProduct((prev: any) => ({ ...prev, productCode: originalEditProductCode }));
      return;
    }
    let prefix = "";
    switch (editProduct.category) {
      case "necklace": prefix = "D"; break;
      case "ring": prefix = "N"; break;
      case "earring": prefix = "E"; break;
      case "bracelet": prefix = "B"; break;
      default: prefix = "X";
    }
    async function fetchNextProductCodeForEdit() {
      try {
        const res = await fetch(`http://localhost:9004/api/products/search/category?q=${editProduct.category}`);
        if (res.ok) {
          const data = await res.json();
          let maxCode = 0;
          data.forEach((p: any) => {
            if (p.productCode && p.productCode.startsWith(prefix)) {
              const num = parseInt(p.productCode.substring(1));
              if (!isNaN(num) && num > maxCode) maxCode = num;
            }
          });
          const nextCode = prefix + String(maxCode + 1).padStart(3, '0');
          setEditProduct((prev: any) => ({ ...prev, productCode: nextCode }));
        } else {
          setEditProduct((prev: any) => ({ ...prev, productCode: prefix + '001' }));
        }
      } catch {
        setEditProduct((prev: any) => ({ ...prev, productCode: prefix + '001' }));
      }
    }
    fetchNextProductCodeForEdit();
  }, [showEdit, editProduct?.category, originalEditCategory, originalEditProductCode]);

  // Hàm fetch mã sản phẩm tiếp theo cho form thêm mới
  async function fetchNextProductCode(category: string, prefix: string) {
    try {
      const res = await fetch(`http://localhost:9004/api/products/search/category?q=${category}`);
      if (res.ok) {
        const data = await res.json();
        let maxCode = 0;
        data.forEach((p: any) => {
          if (p.productCode && p.productCode.startsWith(prefix)) {
            const num = parseInt(p.productCode.substring(1));
            if (!isNaN(num) && num > maxCode) maxCode = num;
          }
        });
        const nextCode = prefix + String(maxCode + 1).padStart(3, '0');
        setForm(f => ({ ...f, productCode: nextCode }));
      } else {
        setForm(f => ({ ...f, productCode: prefix + '001' }));
      }
    } catch {
      setForm(f => ({ ...f, productCode: prefix + '001' }));
    }
  }

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
    // Nếu chọn category ở form thêm mới, tự động sinh mã sản phẩm
    if (name === 'category') {
      let prefix = '';
      switch (value) {
        case 'necklace': prefix = 'D'; break;
        case 'ring': prefix = 'N'; break;
        case 'earring': prefix = 'E'; break;
        case 'bracelet': prefix = 'B'; break;
        default: prefix = 'X';
      }
      fetchNextProductCode(value, prefix);
    }
  }
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
      setForm({ ...form, image: "" });
    }
  }
  // Sửa lại hàm handleSubmit để gửi FormData (multipart/form-data) khi thêm sản phẩm mới, phù hợp với backend nhận @RequestPart product (JSON) và @RequestPart image (file).
  async function handleSubmit(e: any) {
    e.preventDefault();
    const { image, weight: weightStr, ...productData } = form;
    // Xử lý weight - chuyển đổi thành double
    let weight: number | null = null;
    if (weightStr && !isNaN(Number(weightStr))) {
      // Chuyển đổi dấu phẩy thành dấu chấm nếu có
      const cleanWeightStr = weightStr.replace(',', '.');
      // Chuyển thành double
      weight = parseFloat(cleanWeightStr);
    }
    const formData = new FormData();
    formData.append('product', JSON.stringify({ ...productData, weight }));
    if (form.image && typeof form.image !== "string") {
      formData.append('image', form.image); // form.image là file
    }
    try {
      const res = await fetch('http://localhost:9004/api/products/add', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        // Fetch lại danh sách sản phẩm từ backend để đảm bảo đồng bộ
        const listRes = await fetch('http://localhost:9004/api/products/all-with-images');
        const list = await listRes.json();
        setProducts(sortProductsByCode(list)); // Khi thêm mới
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
          description: "",
        });
        setImagePreview(null);
        setShowAdd(false); // Đóng popup khi thêm thành công
        toast.success("Thêm sản phẩm thành công!", {
          description: "Sản phẩm đã được thêm vào hệ thống"
        });
      } else {
        toast.error("Thêm sản phẩm thất bại!", {
          description: "Vui lòng kiểm tra lại thông tin và thử lại"
        });
      }
    } catch (err) {
      toast.error("Có lỗi khi kết nối server!", {
        description: "Vui lòng kiểm tra kết nối mạng và thử lại"
      });
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
  async function handleEdit(product: any) {
    const detail = await fetchProductDetail(product.id || product.product_id);
    // Đồng bộ các trường về camelCase nếu cần
    const stockQty = detail.stockQuantity ?? detail.stock_quantity ?? detail.quantity ?? '';
    setEditProduct({
      ...detail,
      stockQuantity: stockQty,
      quantity: stockQty, // đồng bộ luôn quantity nếu cần dùng ở chỗ khác
      thumbnailUrl: detail.thumbnailUrl ?? detail.thumbnail_url,
      wage: detail.wage ?? detail.wage,
      // Thêm các trường khác nếu cần
    });
    setShowEdit(true);
  }
  // Hàm xử lý thay đổi form sửa
  function handleEditChange(e: any) {
    const { name, value, type } = e.target;
    // Nếu là input type number, chuyển về số hoặc null nếu rỗng
    if (["price", "quantity", "stockQuantity", "wage"].includes(name)) {
      setEditProduct((prev: any) => ({
        ...prev,
        [name]: value === '' ? null : Number(value)
      }));
    } else {
      // Xử lý weight như string để có thể nhập dấu phẩy
      setEditProduct((prev: any) => ({ ...prev, [name]: value }));
    }
  }
  // Sửa lại hàm lưu sản phẩm đã sửa để gọi API backend
  async function handleEditSave(e: any) {
    e.preventDefault();
    if (!editProduct || !(editProduct.id || editProduct.product_id)) return;
    try {
      const { createdAt, weight: weightStr, ...dataToSend } = editProduct;
      // Xử lý weight - chuyển đổi thành double
      let weight: number | null = null;
      if (weightStr) {
        let weightString = weightStr;
        if (typeof weightStr === 'number') {
          weightString = weightStr.toString();
        } else if (typeof weightStr === 'string') {
          weightString = weightStr;
        } else {
          weightString = '';
        }
        // Luôn chuyển dấu phẩy thành dấu chấm trước khi kiểm tra
        const cleanWeightStr = weightString.replace(',', '.');
        if (!isNaN(Number(cleanWeightStr))) {
          weight = parseFloat(cleanWeightStr);
        }
      }
      
      // Xử lý wage - đảm bảo là number
      let wage = dataToSend.wage;
      if (wage !== null && wage !== undefined) {
        if (typeof wage === 'string') {
          wage = parseFloat(wage);
        } else if (typeof wage === 'number') {
          wage = wage;
        } else {
          wage = null;
        }
      } else {
        wage = null;
      }
      
      const payload = { ...dataToSend, weight, wage };
      
      // Log dữ liệu gửi lên để debug
      console.log('Data being sent to backend:', payload);
      console.log('Product ID:', editProduct.id || editProduct.product_id);
      
      const res = await fetch(`http://localhost:9004/api/products/${editProduct.id || editProduct.product_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      // Log response để debug
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (res.ok) {
        const result = await res.json();
        console.log('Success response:', result);
        await fetchProducts(); // Cập nhật bảng ngay sau khi lưu
        setShowEdit(false);
        toast.success("Cập nhật sản phẩm thành công!", {
          description: "Thông tin sản phẩm đã được lưu và cập nhật"
        });
      } else {
        // Lấy lỗi thực tế từ backend
        let errorMessage = "Cập nhật sản phẩm thất bại!";
        try {
          const errorData = await res.text();
          console.error('Backend error response:', errorData);
          if (errorData) {
            try {
              const errorJson = JSON.parse(errorData);
              errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch {
              errorMessage = errorData || errorMessage;
            }
          }
        } catch (error) {
          console.error('Error parsing error response:', error);
        }
        
        toast.error("Cập nhật sản phẩm thất bại!", {
          description: errorMessage
        });
      }
    } catch (err) {
      console.error('Network error:', err);
      toast.error("Có lỗi khi kết nối server!", {
        description: err instanceof Error ? err.message : "Vui lòng kiểm tra kết nối mạng và thử lại"
      });
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
        toast.success("Cập nhật ảnh thành công!", {
          description: "Ảnh sản phẩm đã được cập nhật"
        });
        return result;
      } else {
        throw new Error('Failed to update image');
      }
    } catch (error) {
      console.error('Error updating product image:', error);
      toast.error("Lỗi khi cập nhật ảnh!", {
        description: "Vui lòng thử lại sau"
      });
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
        toast.success("Xóa ảnh thành công!", {
          description: "Ảnh sản phẩm đã được xóa"
        });
        return true;
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting product image:', error);
      toast.error("Lỗi khi xóa ảnh!", {
        description: "Vui lòng thử lại sau"
      });
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
        setProducts((prev: any[]) => sortProductsByCode(prev.filter((p: any) => (p.id || p.product_id) !== (deleteConfirm.product.id || deleteConfirm.product.product_id)))); // Khi xóa
        setDeleteConfirm({ open: false, product: null });
        toast.success("Xóa sản phẩm thành công!", {
          description: "Sản phẩm đã được xóa khỏi hệ thống"
        });
      } else {
        toast.error("Xóa sản phẩm thất bại!", {
          description: "Vui lòng thử lại sau"
        });
      }
    } catch (err) {
      toast.error("Có lỗi khi kết nối server!", {
        description: "Vui lòng kiểm tra kết nối mạng và thử lại"
      });
    }
  }

  // Hàm sắp xếp sản phẩm theo productCode
  function sortProductsByCode(list: any[]) {
    return [...list].sort((a, b) => {
      if (!a.productCode) return 1;
      if (!b.productCode) return -1;
      return a.productCode.localeCompare(b.productCode, undefined, { numeric: true, sensitivity: 'base' });
    });
  }
  return (
    <div className="w-full max-w-6xl mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Quản lý sản phẩm</h1>
        <div className="flex gap-2">
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd} modal>
          <DialogTrigger asChild>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold shadow hover:bg-primary/90 transition-colors" onClick={() => setShowAdd(true)}>
              Thêm mới
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full overflow-y-auto max-h-screen border-2 border-border bg-card text-foreground rounded-2xl shadow-2xl" onInteractOutside={e => e.preventDefault()}>
            <DialogModalHeader>
              <DialogModalTitle className="text-2xl font-bold mb-2">Thêm sản phẩm mới</DialogModalTitle>
            </DialogModalHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* Hàng 1: Tên sản phẩm */}
              <div className="space-y-2 mb-2">
                <label className="font-semibold text-base">Tên sản phẩm</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                  style={{ outline: 'none', boxShadow: 'none' }}
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
                    <SelectTrigger className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none">
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
                  <input
                    name="productCode"
                    value={form.productCode}
                    readOnly
                    className="bg-muted border border-border rounded-lg px-4 py-3 text-base w-full text-foreground shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Số lượng</label>
                  <input
                    name="quantity"
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>
              {/* Hàng 3: Khối lượng - Tuổi vàng - Tiền công */}
              <div className="grid grid-cols-4 gap-6 mb-2">
                <div className="space-y-2">
                  <label className="font-semibold text-base">Khối lượng (chỉ)</label>
                  <input
                    name="weight"
                    type="text"
                    min={0}
                    value={form.weight}
                    onChange={e => {
                      let value = e.target.value;
                      // Cho phép nhập dấu phẩy và dấu chấm
                      // Chỉ cho phép số, dấu phẩy và dấu chấm
                      value = value.replace(/[^0-9,.]/g, '');
                      // Chỉ cho phép một dấu phẩy hoặc một dấu chấm
                      const commaCount = (value.match(/,/g) || []).length;
                      const dotCount = (value.match(/\./g) || []).length;
                      
                      if (commaCount > 1) {
                        // Nếu có nhiều dấu phẩy, chỉ giữ lại dấu phẩy đầu tiên
                        const parts = value.split(',');
                        value = parts[0] + ',' + parts.slice(1).join('');
                      }
                      
                      if (dotCount > 1) {
                        // Nếu có nhiều dấu chấm, chỉ giữ lại dấu chấm đầu tiên
                        const parts = value.split('.');
                        value = parts[0] + '.' + parts.slice(1).join('');
                      }
                      
                      // Không cho phép cả dấu phẩy và dấu chấm cùng lúc
                      if (commaCount > 0 && dotCount > 0) {
                        // Nếu có cả dấu phẩy và dấu chấm, chỉ giữ lại dấu phẩy
                        value = value.replace(/\./g, '');
                      }
                      
                      // Giới hạn số thập phân
                      if (value.includes(',') || value.includes('.')) {
                        const separator = value.includes(',') ? ',' : '.';
                        const parts = value.split(separator);
                        if (parts.length > 1) {
                          const decimal = parts[1].slice(0, 3); // Chỉ cho phép tối đa 3 chữ số thập phân
                          value = parts[0] + separator + decimal;
                        }
                      }
                      
                      setForm(f => ({ ...f, weight: value }));
                    }}
                    required
                    placeholder="Nhập khối lượng theo chỉ (VD: 3,45)"
                    className={`border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none ${form.weight && typeof form.weight === 'string' && isNaN(Number(form.weight.replace(',', '.'))) ? 'border-red-500' : ''}`}
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Tuổi vàng</label>
                  <Select
                    value={form.goldAge}
                    onValueChange={(v) => handleSelect("goldAge", v)}
                    required
                  >
                    <SelectTrigger className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground w-full">
                      <SelectValue placeholder="Chọn tuổi vàng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="983">983</SelectItem>
                      <SelectItem value="999">999</SelectItem>
                      {/* <SelectItem value="9999">9999</SelectItem> */}
                      <SelectItem value="15k">15k</SelectItem>
                      <SelectItem value="16k">16k</SelectItem>
                      <SelectItem value="17k">17k</SelectItem>
                      <SelectItem value="10k">10k</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Tiền công (VNĐ)</label>
                  <input
                    name="wage"
                    type="number"
                    min={0}
                    value={form.wage}
                    onChange={handleChange}
                    onBlur={handleWageBlur}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Giá bán (VNĐ)</label>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>
              {/* Hàng 4: Xuất xứ - Thương hiệu */}
              <div className="grid grid-cols-2 gap-6 mb-2">
                <div className="space-y-2">
                  <label className="font-semibold text-base">Xuất xứ</label>
                  <input
                    name="origin"
                    value={form.origin}
                    onChange={handleChange}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Thương hiệu</label>
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>
              {/* Mã SKU: chiếm 2 cột */}
              <div className="col-span-2 space-y-2">
                <label className="font-semibold text-base">Mã SKU (tự động)</label>
                <input
                  name="sku"
                  value={form.sku}
                  readOnly
                  className="bg-muted border border-border rounded-lg px-4 py-3 text-base w-full text-foreground shadow-none"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
              </div>

              {/* Mô tả chi tiết */}
              <div className="space-y-2 mb-2">
                <label className="font-semibold text-base">Mô tả chi tiết</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full resize-none shadow-none"
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
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
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600 bg-background border border-border"
                  />
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-28 h-28 object-cover rounded-xl border border-border mt-2"
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
              {/* Nút submit và cancel */}
              <DialogFooter>
                <button
                  type="submit"
                  className="w-full bg-rose-500 text-white px-4 py-3 rounded-lg text-lg font-bold hover:bg-rose-600 border border-rose-400 shadow-sm mt-2"
                >
                  Thêm sản phẩm
                </button>
                <button
                  type="button"
                  className="w-full mt-2 bg-gray-400 text-white px-4 py-3 rounded-lg text-lg font-bold hover:bg-gray-500 border border-gray-300 shadow-sm"
                  onClick={() => {
                    setShowAdd(false);
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
                      description: "",
                    });
                    setImagePreview(null);
                  }}
                >
                  Hủy
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
              <div className="col-span-1 whitespace-nowrap">Mã SP</div>
              <div className="col-span-2 whitespace">Tên SP</div>
              <div className="col-span-1 whitespace-nowrap">Loại</div>
              <div className="col-span-1 whitespace">Hàm lượng</div>
              <div className="col-span-1 whitespace-nowrap">Tiền công</div>
              <div className="col-span-1 whitespace-nowrap">Ảnh</div>
              <div className="col-span-1 whitespace-nowrap">Trạng thái</div>
              <div className="col-span-1 whitespace-nowrap">Ngày tạo</div>
              <div className="col-span-1 whitespace">Ngày cập nhật</div>
              <div className="col-span-1 whitespace">Chi tiết sản phẩm</div>
              <div className="col-span-1 whitespace-nowrap">Thao tác</div>
            </div>
            {/* Hiển thị danh sách sản phẩm */}
            {products.map((product: any) => {
              // console.log("Product row:", product);
              const stockQty = product?.stockQuantity ?? product?.quantity ?? 0;

              return (
                <div key={product.id || product.product_id} className="grid grid-cols-12 gap-4 border-b px-6 py-3 items-center text-center hover:bg-rose-50/60 dark:hover:bg-[#23232b] transition-colors group">
                  <div className="col-span-1 font-mono">{product.productCode}</div>
                  <div className="col-span-2 font-medium text-left">{product.name}</div>
                  <div className="col-span-1">{(() => {
                    switch (product.category) {
                      case 'necklace': return 'Dây chuyền';
                      case 'bracelet': return 'Vòng tay';
                      case 'ring': return 'Nhẫn';
                      case 'earring': return 'Bông tai';
                      default: return product.category;
                    }
                  })()}</div>
                  <div className="col-span-1">{product.goldAge || product.karat || '-'}</div>
                  <div className="col-span-1 text-rose-600 font-bold">{product.wage?.toLocaleString() || '-'}</div>
                  <div className="col-span-1 flex justify-center">
                    {(product.id || product.product_id) ? (
                      <img
                        // src={`http://localhost:9004/api/products/image/${product.id || product.product_id}`}
                        src={`http://localhost:9004/api/products/image/${product.id || product.product_id}?t=${Date.now()}`}
                        alt="thumb"
                        className="w-12 h-12 object-cover rounded-lg shadow-md border-2 border-rose-200 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="col-span-1">
                    {stockQty > 0 ? (
                      <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        Còn hàng
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        Hết hàng
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 text-xs text-muted-foreground">{product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : (product.created_at ? new Date(product.created_at).toLocaleDateString('vi-VN') : '-')}</div>
                  <div className="col-span-1 text-xs text-muted-foreground">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : (product.updated_at ? new Date(product.updated_at).toLocaleDateString('vi-VN') : '-')}</div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={async () => {
                      const detail = await fetchProductDetail(product.id || product.product_id);
                      setDetailProduct(detail || product);
                      setShowDetail(true);
                    }}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Xem chi tiết sản phẩm"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="col-span-1 flex gap-2 justify-center">
                    <button
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      onClick={() => handleEdit(product)}
                      title="Sửa sản phẩm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(product)}
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
      {showDetail && detailProduct && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-black p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative">
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold" 
              onClick={() => setShowDetail(false)}
            >
              ×
            </button>
            
            <h2 className="text-xl font-bold mb-4">Chi tiết sản phẩm #{detailProduct.productCode}</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Ảnh sản phẩm */}
              <div className="flex flex-col items-center gap-4 md:w-1/3 w-full">
                {(detailProduct.id || detailProduct.product_id) ? (
                  <img
                    src={`http://localhost:9004/api/products/image/${detailProduct.id || detailProduct.product_id}`}
                    alt={detailProduct.name}
                    className="w-64 h-64 object-cover rounded-xl shadow-lg border-2 border-rose-200"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.png';
                    }}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                    Không có ảnh
                  </div>
                )}
              </div>
              
              {/* Thông tin sản phẩm */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-gray-500">Mã sản phẩm:</span>
                    <p className="font-medium text-lg">{detailProduct.productCode || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Tên sản phẩm:</span>
                    <p className="font-medium text-lg">{detailProduct.name || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Loại:</span>
                    <p className="font-medium">{(() => {
                      switch (detailProduct.category) {
                        case 'necklace': return 'Dây chuyền';
                        case 'bracelet': return 'Vòng tay';
                        case 'ring': return 'Nhẫn';
                        case 'earring': return 'Bông tai';
                        default: return detailProduct.category || '-';
                      }
                    })()}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Chất liệu:</span>
                    <p className="font-medium">Vàng</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Hàm lượng:</span>
                    <p className="font-medium">{detailProduct.karat || detailProduct.goldAge || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Trọng lượng:</span>
                    <p className="font-medium">{detailProduct.weight ? `${detailProduct.weight} chỉ` : '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Xuất xứ:</span>
                    <p className="font-medium">{detailProduct.origin || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Số lượng tồn kho:</span>
                    <p className="font-medium">{detailProduct.stockQuantity || detailProduct.quantity || '0'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Tiền công:</span>
                    <p className="font-medium text-rose-600 font-bold">
                      {detailProduct.wage ? `${detailProduct.wage.toLocaleString()}₫` : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Giá bán:</span>
                    <p className="font-medium text-rose-600 font-bold">
                      {detailProduct.price ? `${detailProduct.price.toLocaleString()}₫` : '-'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-500">Mô tả chi tiết:</span>
                  <p className="font-medium mt-1">{detailProduct.description || 'Không có mô tả'}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-500">Trạng thái:</span>
                  {(detailProduct.stockQuantity || detailProduct.quantity || 0) > 0 ? (
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold shadow-sm">
                      Còn hàng
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold shadow-sm">
                      Hết hàng
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Ngày tạo:</span>
                    <p className="font-medium">
                      {detailProduct.createdAt ? new Date(detailProduct.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Ngày cập nhật:</span>
                    <p className="font-medium">
                      {detailProduct.updatedAt ? new Date(detailProduct.updatedAt).toLocaleDateString('vi-VN') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setShowDetail(false)}
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600"
                onClick={() => {
                  setShowDetail(false);
                  handleEdit(detailProduct);
                }}
              >
                Sửa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup sửa sản phẩm */}
      <DetailDialog open={showEdit} onOpenChange={setShowEdit}>
        <DetailDialogContent className="max-w-4xl w-full overflow-y-auto max-h-screen border-2 border-border bg-card text-foreground rounded-2xl shadow-2xl">
          <DetailDialogHeader>
            <DetailDialogTitle className="text-2xl font-bold mb-2">Sửa sản phẩm</DetailDialogTitle>
          </DetailDialogHeader>
          {editProduct && (
            <form onSubmit={handleEditSave} className="flex flex-col gap-8">
              {/* Hàng 1: Tên sản phẩm */}
              <div className="space-y-2 mb-2">
                <label className="font-semibold text-base">Tên sản phẩm</label>
                <input
                  name="name"
                  value={editProduct.name}
                  onChange={handleEditChange}
                  required
                  className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
              </div>
              {/* Hàng 2: Loại sản phẩm - Mã sản phẩm - Số lượng */}
              <div className="grid grid-cols-3 gap-6 mb-2">
                <div className="space-y-2">
                  <label className="font-semibold text-base">Loại sản phẩm</label>
                  <Select
                    value={editProduct.category}
                    onValueChange={(v) => setEditProduct((prev: any) => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none">
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
                  <input
                    name="productCode"
                    value={editProduct.productCode}
                    readOnly
                    className="bg-muted border border-border rounded-lg px-4 py-3 text-base w-full text-foreground shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Số lượng tồn kho</label>
                  <input
                    name="stockQuantity"
                    type="number"
                    min={0}
                    value={editProduct.stockQuantity ?? ''}
                    onChange={handleEditChange}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>
              {/* Hàng 3: Khối lượng - Tuổi vàng - Tiền công - Giá bán */}
              <div className="grid grid-cols-4 gap-6 mb-2">
                <div className="space-y-2">
                  <label className="font-semibold text-base">Khối lượng (chỉ)</label>
                  <input
                    name="weight"
                    type="text"
                    min={0}
                    value={editProduct.weight}
                    onChange={e => {
                      let value = e.target.value;
                      // Cho phép nhập dấu phẩy và dấu chấm
                      // Chỉ cho phép số, dấu phẩy và dấu chấm
                      value = value.replace(/[^0-9,.]/g, '');
                      // Chỉ cho phép một dấu phẩy hoặc một dấu chấm
                      const commaCount = (value.match(/,/g) || []).length;
                      const dotCount = (value.match(/\./g) || []).length;
                      
                      if (commaCount > 1) {
                        // Nếu có nhiều dấu phẩy, chỉ giữ lại dấu phẩy đầu tiên
                        const parts = value.split(',');
                        value = parts[0] + ',' + parts.slice(1).join('');
                      }
                      
                      if (dotCount > 1) {
                        // Nếu có nhiều dấu chấm, chỉ giữ lại dấu chấm đầu tiên
                        const parts = value.split('.');
                        value = parts[0] + '.' + parts.slice(1).join('');
                      }
                      
                      // Không cho phép cả dấu phẩy và dấu chấm cùng lúc
                      if (commaCount > 0 && dotCount > 0) {
                        // Nếu có cả dấu phẩy và dấu chấm, chỉ giữ lại dấu phẩy
                        value = value.replace(/\./g, '');
                      }
                      
                      // Giới hạn số thập phân
                      if (value.includes(',') || value.includes('.')) {
                        const separator = value.includes(',') ? ',' : '.';
                        const parts = value.split(separator);
                        if (parts.length > 1) {
                          const decimal = parts[1].slice(0, 3); // Chỉ cho phép tối đa 3 chữ số thập phân
                          value = parts[0] + separator + decimal;
                        }
                      }
                      
                      setEditProduct((prev: any) => ({ ...prev, weight: value }));
                    }}
                    required
                    placeholder="Nhập khối lượng theo chỉ (VD: 3,45)"
                    className={`border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none ${editProduct.weight && typeof editProduct.weight === 'string' && isNaN(Number(editProduct.weight.replace(',', '.'))) ? 'border-red-500' : ''}`}
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Tuổi vàng</label>
                  <Select
                    value={editProduct.karat || editProduct.goldAge || ''}
                    onValueChange={(v) => setEditProduct((prev: any) => ({ ...prev, karat: v, goldAge: v }))}
                  >
                    <SelectTrigger className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground w-full">
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
                  <input
                    name="wage"
                    type="number"
                    min={0}
                    value={editProduct.wage || ''}
                    onChange={handleEditChange}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Giá bán (VNĐ)</label>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    value={editProduct.price}
                    onChange={handleEditChange}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>
              {/* Hàng 4: Xuất xứ - Thương hiệu */}
              <div className="grid grid-cols-2 gap-6 mb-2">
                <div className="space-y-2">
                  <label className="font-semibold text-base">Xuất xứ</label>
                  <input
                    name="origin"
                    value={editProduct.origin || ''}
                    onChange={handleEditChange}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-base">Thương hiệu</label>
                  <input
                    name="brand"
                    value={editProduct.brand || ''}
                    onChange={handleEditChange}
                    required
                    className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full shadow-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>
              {/* Mã SKU: chiếm 2 cột */}
              <div className="col-span-2 space-y-2">
                <label className="font-semibold text-base">Mã SKU (tự động)</label>
                <input
                  name="sku"
                  value={editProduct.sku || ''}
                  readOnly
                  className="bg-muted border border-border rounded-lg px-4 py-3 text-base w-full text-foreground shadow-none"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
              </div>
              {/* Mô tả chi tiết */}
              <div className="space-y-2 mb-2">
                <label className="font-semibold text-base">Mô tả chi tiết</label>
                <textarea
                  name="description"
                  value={editProduct.description || ''}
                  onChange={handleEditChange}
                  rows={3}
                  className="border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-0 focus:border-rose-400 bg-background text-foreground w-full resize-none shadow-none"
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
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
                        checked={editProduct.tags?.includes(tag)}
                        onChange={() => {
                          setEditProduct((prev: any) => ({
                            ...prev,
                            tags: prev.tags?.includes(tag)
                              ? prev.tags.filter((t: string) => t !== tag)
                              : [...(prev.tags || []), tag]
                          }));
                        }}
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
                  {(editProduct.id || editProduct.product_id) ? (
                    <img
                      src={`http://localhost:9004/api/products/image/${editProduct.id || editProduct.product_id}?t=${Date.now()}`}
                      alt={editProduct.name}
                      className="w-28 h-28 object-cover rounded-xl border border-border mt-2"
                      onError={(e) => {
                        e.currentTarget.src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="w-28 h-28 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 mt-2">
                      Không có ảnh
                    </div>
                  )}
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
                          toast.error('Lỗi khi cập nhật ảnh!');
                        }
                      }
                    }}
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600 bg-background border border-border"
                  />
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
                            toast.error('Lỗi khi xóa ảnh!');
                          }
                        }
                      }}
                      className="text-red-500 text-sm hover:text-red-700 underline mt-2"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
                <div className="mt-4 flex justify-center w-full">
                  <Barcode
                    value={editProduct.sku || 'SKU'}
                    height={60}
                    width={2}
                    fontSize={16}
                    displayValue={true}
                  />
                </div>
              </div>
              {/* Nút submit và cancel */}
              <DialogFooter>
                <button
                  type="submit"
                  className="w-full bg-rose-500 text-white px-4 py-3 rounded-lg text-lg font-bold hover:bg-rose-600 border border-rose-400 shadow-sm mt-2"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  className="w-full mt-2 bg-gray-400 text-white px-4 py-3 rounded-lg text-lg font-bold hover:bg-gray-500 border border-gray-300 shadow-sm"
                  onClick={() => setShowEdit(false)}
                >
                  Hủy
                </button>
              </DialogFooter>
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