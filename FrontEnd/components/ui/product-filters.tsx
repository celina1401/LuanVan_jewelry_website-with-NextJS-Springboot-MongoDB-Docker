"use client"

import * as React from "react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Label } from "./label"

interface ProductFiltersProps {
  categories: string[]
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
      <Card>
        <CardHeader>
          <CardTitle>Loại sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedCategory}
            onValueChange={onCategoryChange}
            className="space-y-2"
          >
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={category} />
                <Label htmlFor={category}>{category}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mức giá</CardTitle>
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
                <Label htmlFor={range.value}>{range.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Giới tính</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={gender}
            onValueChange={onGenderChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="gender-all" />
              <Label htmlFor="gender-all">Tất cả</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <Label htmlFor="gender-female">Nữ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <Label htmlFor="gender-male">Nam</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          onCategoryChange("Tất cả")
          onPriceRangeChange("all")
        }}
      >
        Xóa bộ lọc
      </Button>
    </div>
  )
} 