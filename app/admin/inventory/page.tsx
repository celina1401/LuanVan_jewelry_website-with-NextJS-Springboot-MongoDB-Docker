import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inventory Management | Admin Dashboard",
  description: "Manage product inventory and stock levels",
}

export default function InventoryPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
          Add New Item
        </button>
      </div>
      
      <div className="rounded-lg border">
        <div className="p-4">
          <div className="grid grid-cols-6 gap-4 font-medium border-b pb-2">
            <div>Product</div>
            <div>SKU</div>
            <div>Category</div>
            <div>Stock</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          <div className="text-center py-8 text-muted-foreground">
            Inventory items will be displayed here
          </div>
        </div>
      </div>
    </div>
  )
} 