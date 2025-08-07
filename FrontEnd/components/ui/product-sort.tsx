"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

interface ProductSortProps {
  options: { label: string; value: string }[]
  value: string
  onValueChange: (value: string) => void
}

export function ProductSort({ options, value, onValueChange }: ProductSortProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
        <SelectValue placeholder="Sắp xếp theo" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 