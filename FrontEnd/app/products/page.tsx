"use client"

import * as React from "react"
import { Navbar } from "../../components/navbar"
import { ProductGrid } from "../../components/ui/product-grid"
import { ProductFilters } from "../../components/ui/product-filters"
import { ProductSort } from "../../components/ui/product-sort"
import { translateProductTag } from "@/lib/utils";
import { Footer } from "../../components/Footer";

// Define categories with both English (for filtering) and Vietnamese (for display)
const categories = [
  { value: "all", label: "Tất cả" },
  { value: "ring", label: "Nhẫn" },
  { value: "necklace", label: "Dây chuyền" },
  { value: "earring", label: "Bông tai" },
  { value: "bracelet", label: "Vòng tay" },
  { value: "anklet", label: "Lắc chân" },
  { value: "ankle-bracelet", label: "Lắc tay" },
  { value: "pendant", label: "Mặt dây chuyền" },
];

const priceRanges = [
  { label: "Tất cả", value: "all" },
  { label: "Dưới 1.000.000₫", value: "0-1000000" },
  { label: "1.000.000₫ - 2.000.000₫", value: "1000000-2000000" },
  { label: "2.000.000₫ - 5.000.000₫", value: "2000000-5000000" },
  { label: "Trên 5.000.000₫", value: "5000000+" }
];

const goldAges = [
  { label: "Tất cả", value: "all" },
  { label: "10K", value: "10K" },
  { label: "14K", value: "14K" },
  { label: "15K", value: "15K" },
  { label: "16K", value: "16K" },
  { label: "17K", value: "17K" },
  { label: "23K", value: "23K" },
  { label: "24K", value: "24K" }
];

const sortOptions = [
  { label: "Phổ biến nhất", value: "popular" },
  { label: "Mới nhất", value: "newest" },
  { label: "Giá: Thấp đến Cao", value: "price-asc" },
  { label: "Giá: Cao đến Thấp", value: "price-desc" },
  { label: "Yêu thích", value: "favorite" },
]

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [selectedPriceRange, setSelectedPriceRange] = React.useState("all")
  const [selectedGoldAge, setSelectedGoldAge] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("popular")
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [gender, setGender] = React.useState("all")

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bộ sưu tập của chúng tôi</h1>
            <div className="flex items-center gap-4">
              <button
                className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                Bộ lọc
              </button>
              <ProductSort
                options={sortOptions}
                value={sortBy}
                onValueChange={setSortBy}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
            <div className={`md:block ${isFilterOpen ? "block" : "hidden"}`}>
              <ProductFilters
                categories={categories}
                priceRanges={priceRanges}
                goldAges={goldAges}
                selectedCategory={selectedCategory}
                selectedPriceRange={selectedPriceRange}
                selectedGoldAge={selectedGoldAge}
                onCategoryChange={setSelectedCategory}
                onPriceRangeChange={setSelectedPriceRange}
                onGoldAgeChange={setSelectedGoldAge}
                gender={gender}
                onGenderChange={setGender}
              />
            </div>
            <div className="md:col-span-3">
              <ProductGrid
                category={selectedCategory}
                priceRange={selectedPriceRange}
                goldAge={selectedGoldAge}
                sortBy={sortBy}
                gender={gender}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 