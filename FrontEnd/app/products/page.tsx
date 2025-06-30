"use client"

import * as React from "react"
import { Navbar } from "../../components/navbar"
import { ProductGrid } from "../../components/ui/product-grid"
import { ProductFilters } from "../../components/ui/product-filters"
import { ProductSort } from "../../components/ui/product-sort"

const categories = [
  "All",
  "Rings",
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Watches"
]

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under $1,000", value: "0-1000" },
  { label: "$1,000 - $2,000", value: "1000-2000" },
  { label: "$2,000 - $5,000", value: "2000-5000" },
  { label: "Over $5,000", value: "5000+" }
]

const sortOptions = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" }
]

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All")
  const [selectedPriceRange, setSelectedPriceRange] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("popular")
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold">Our Collection</h1>
            <div className="flex items-center gap-4">
              <button
                className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                Filters
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
                selectedCategory={selectedCategory}
                selectedPriceRange={selectedPriceRange}
                onCategoryChange={setSelectedCategory}
                onPriceRangeChange={setSelectedPriceRange}
              />
            </div>
            <div className="md:col-span-3">
              <ProductGrid
                category={selectedCategory}
                priceRange={selectedPriceRange}
                sortBy={sortBy}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 