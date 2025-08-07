"use client"

import * as React from "react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Label } from "./label"

interface Category {
  value: string;
  label: string;
}

interface ProductFiltersProps {
  categories: Category[]
  priceRanges: { label: string; value: string }[]
  selectedCategory: string
  selectedPriceRange: string
  onCategoryChange: (value: string) => void
  onPriceRangeChange: (value: string) => void
  gender: string
  onGenderChange: (value: string) => void
}

export function ProductFilters({
  categories,
  priceRanges,
  selectedCategory,
  selectedPriceRange,
  onCategoryChange,
  onPriceRangeChange,
  gender,
  onGenderChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Loại sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedCategory}
            onValueChange={onCategoryChange}
            className="space-y-2"
          >
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <RadioGroupItem value={category.value} id={category.value} />
                <Label htmlFor={category.value} className="text-gray-900 dark:text-white">{category.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Mức giá</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedPriceRange}
            onValueChange={onPriceRangeChange}
            className="space-y-2"
          >
            {priceRanges.map((range) => (
              <div key={range.value} className="flex items-center space-x-2">
                <RadioGroupItem value={range.value} id={range.value} />
                <Label htmlFor={range.value} className="text-gray-900 dark:text-white">{range.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Giới tính</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={gender}
            onValueChange={onGenderChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="gender-all" />
              <Label htmlFor="gender-all" className="text-gray-900 dark:text-white">Tất cả</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <Label htmlFor="gender-female" className="text-gray-900 dark:text-white">Nữ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <Label htmlFor="gender-male" className="text-gray-900 dark:text-white">Nam</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => {
          onCategoryChange("all")
          onPriceRangeChange("all")
          onGenderChange("all")
        }}
      >
        Xóa bộ lọc
      </Button>
    </div>
  )
} 