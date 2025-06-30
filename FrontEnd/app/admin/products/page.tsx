import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quản lý sản phẩm | Quản trị viên",
  description: "Quản lý danh mục và chi tiết sản phẩm",
}

export default function ProductsPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
          Thêm sản phẩm mới
        </button>
      </div>

      <div className="grid gap-6">
        {/* Filters */}
        <div className="flex gap-4 p-4 border rounded-lg">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <select className="px-3 py-2 border rounded-md">
            <option value="">Tất cả loại</option>
            <option value="rings">Nhẫn</option>
            <option value="necklaces">Dây chuyền</option>
            <option value="earrings">Bông tai</option>
          </select>
          <select className="px-3 py-2 border rounded-md">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="draft">Nháp</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="rounded-lg border">
          <div className="p-4">
            <div className="grid grid-cols-6 gap-4 font-medium border-b pb-2">
              <div>Product</div>
              <div>Giá</div>
              <div>Loại</div>
              <div>Tồn kho</div>
              <div>Trạng thái</div>
              <div>Thao tác</div>
            </div>
            
            <div className="text-center py-8 text-muted-foreground">
              Sản phẩm sẽ được hiển thị tại đây
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 