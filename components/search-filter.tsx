"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/types";

interface SearchFilterProps {
  onLocationChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function SearchFilter({ onLocationChange, onCategoryChange }: SearchFilterProps) {
  const [locationQuery, setLocationQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");

  useEffect(() => {
    onLocationChange(locationQuery);
  }, [locationQuery, onLocationChange]);

  useEffect(() => {
    onCategoryChange(categoryQuery);
  }, [categoryQuery, onCategoryChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">場所で検索</label>
        <Input
          type="text"
          placeholder="例: 体育館、図書館..."
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">カテゴリ</label>
        <Select
          value={categoryQuery}
          onChange={(e) => setCategoryQuery(e.target.value)}
        >
          <option value="">すべて</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
