import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Product Management | Admin Dashboard",
  description: "Manage product catalog and details",
}

export default function ProductsPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
          Add New Product
        </button>
      </div>

      <div className="grid gap-6">
        {/* Filters */}
        <div className="flex gap-4 p-4 border rounded-lg">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <select className="px-3 py-2 border rounded-md">
            <option value="">All Categories</option>
            <option value="rings">Rings</option>
            <option value="necklaces">Necklaces</option>
            <option value="earrings">Earrings</option>
          </select>
          <select className="px-3 py-2 border rounded-md">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="rounded-lg border">
          <div className="p-4">
            <div className="grid grid-cols-6 gap-4 font-medium border-b pb-2">
              <div>Product</div>
              <div>Price</div>
              <div>Category</div>
              <div>Stock</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            
            <div className="text-center py-8 text-muted-foreground">
              Products will be displayed here
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 