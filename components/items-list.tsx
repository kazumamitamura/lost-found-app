"use client";

import { useState, useMemo } from "react";
import { LostItem, CATEGORIES } from "@/lib/types";
import { formatDate, getImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";

interface ItemsListProps {
  initialItems: LostItem[];
}

export function ItemsList({ initialItems }: ItemsListProps) {
  const [locationQuery, setLocationQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const matchesLocation =
        !locationQuery ||
        item.location.toLowerCase().includes(locationQuery.toLowerCase());
      const matchesCategory = !categoryQuery || item.category === categoryQuery;
      return matchesLocation && matchesCategory;
    });
  }, [initialItems, locationQuery, categoryQuery]);

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">検索・絞り込み</h2>
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
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {initialItems.length === 0
              ? "現在、保管中の忘れ物はありません"
              : "検索条件に一致する忘れ物が見つかりませんでした"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Link 
              key={item.id} 
              href={`/item/${item.id}`}
              className="block h-full"
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="aspect-square relative bg-gray-100">
                  {getImageUrl(item.image_url) ? (
                    <Image
                      src={getImageUrl(item.image_url)!}
                      alt={item.category}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-semibold text-sm mb-1 line-clamp-1">
                    {item.category}
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    {item.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.found_date
                      ? formatDate(item.found_date)
                      : formatDate(item.created_at)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
