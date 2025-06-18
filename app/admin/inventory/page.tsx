"use client";

import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader as DialogModalHeader, DialogTitle as DialogModalTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import Barcode from "react-barcode";

export default function InventoryPage() {
  const [form, setForm] = useState({
    name: "",
    weight: "",
    origin: "",
    brand: "",
    goldAge: "",
    category: "",
    sku: "",
    image: "" as string | File,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Tự động sinh SKU khi nhập thông tin
  useEffect(() => {
    const sku = [
      form.name.replace(/\s+/g, '').slice(0, 3).toUpperCase(),
      form.weight,
      form.origin.replace(/\s+/g, '').slice(0, 2).toUpperCase(),
      form.brand.replace(/\s+/g, '').slice(0, 2).toUpperCase(),
      form.goldAge,
      form.category.slice(0, 2).toUpperCase()
    ].filter(Boolean).join("-");
    setForm(f => ({ ...f, sku }));
  }, [form.name, form.weight, form.origin, form.brand, form.goldAge, form.category]);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
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
  function handleSubmit(e: any) {
    e.preventDefault();
    console.log("New product:", form);
    // TODO: call API or update state
  }
  return (
    <div className="w-full max-w-6xl mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Inventory Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold shadow hover:bg-primary/90 transition-colors">
              Add New Item
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full overflow-y-auto max-h-screen">
            <DialogModalHeader>
              <DialogModalTitle className="text-2xl font-bold mb-2">Add New Product</DialogModalTitle>
            </DialogModalHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="font-semibold text-base mb-1">Product Name</label>
                  <Input name="name" value={form.name} onChange={handleChange} required className="rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="font-semibold text-base mb-1">Weight (g)</label>
                    <Input name="weight" type="number" min={0} value={form.weight} onChange={handleChange} required className="rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="flex-1">
                    <label className="font-semibold text-base mb-1">Gold Age</label>
                    <Input name="goldAge" value={form.goldAge} onChange={handleChange} required className="rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-base mb-1">Origin</label>
                  <Input name="origin" value={form.origin} onChange={handleChange} required className="rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="font-semibold text-base mb-1">Brand</label>
                  <Input name="brand" value={form.brand} onChange={handleChange} required className="rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="font-semibold text-base mb-1">Category</label>
                  <Select value={form.category} onValueChange={v => handleSelect("category", v)}>
                    <SelectTrigger className="rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ring">Ring</SelectItem>
                      <SelectItem value="necklace">Necklace</SelectItem>
                      <SelectItem value="earring">Earring</SelectItem>
                      <SelectItem value="bracelet">Bracelet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-semibold text-base mb-1">SKU (auto)</label>
                  <Input name="sku" value={form.sku} readOnly className="bg-muted rounded-xl px-4 py-3 text-base" />
                </div>
              </div>
              {/* Right column: Upload image + barcode */}
              <div className="flex flex-col gap-4 items-center justify-center">
                <label className="font-semibold text-base mb-1">Product Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-xl border" />
                )}
                <div className="mt-4 flex justify-center w-full">
                  <Barcode value={form.sku || "SKU"} height={60} width={2} fontSize={16} displayValue={true} />
                </div>
              </div>
              <DialogFooter className="md:col-span-2">
                <button type="submit" className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-xl text-lg font-bold hover:bg-primary/90 transition-colors mt-2">Add Product</button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-lg font-bold">Product Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-4 font-semibold border-b px-6 py-3 bg-background">
              <div>Product</div>
              <div>SKU</div>
              <div>Category</div>
              <div>Stock</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            <div className="text-center py-12 text-muted-foreground text-lg">
              Inventory items will be displayed here
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 