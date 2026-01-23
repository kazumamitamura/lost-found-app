"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { LostItem, LostItemUpdate } from "@/lib/types";

type LostItemUpdateWithDates = LostItemUpdate & {
  found_date?: string | null;
  registrant_name?: string | null;
};
import { supabase } from "@/lib/supabase";
import { formatDate, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<LostItemUpdateWithDates>({});

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const { data, error } = await supabase
        .from("lf_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const { error } = await supabase.from("lf_items").delete().eq("id", id);
      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("削除エラーが発生しました");
    }
  }

  async function handleUpdate(id: string) {
    try {
      const { error } = await supabase
        .from("lf_items")
        .update(editForm)
        .eq("id", id);

      if (error) throw error;
      setEditingId(null);
      setEditForm({});
      fetchItems();
    } catch (error) {
      console.error("Error updating item:", error);
      alert("更新エラーが発生しました");
    }
  }

  function handleExportCSV() {
    const headers = [
      "ID",
      "登録日時",
      "場所",
      "カテゴリ",
      "返却済み",
      "返却日時",
      "備考",
    ];
    const rows = items.map((item) => [
      item.id,
      formatDate(item.created_at),
      item.location,
      item.category,
      item.is_returned ? "はい" : "いいえ",
      formatDate(item.returned_at),
      item.description || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `忘れ物一覧_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  const columns = useMemo<ColumnDef<LostItem>[]>(
    () => [
      {
        accessorKey: "image_url",
        header: "写真",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="w-16 h-16 relative">
              {getImageUrl(item.image_url) ? (
                <Image
                  src={getImageUrl(item.image_url)!}
                  alt={item.category}
                  fill
                  className="object-cover rounded"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                  なし
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "カテゴリ",
        cell: ({ row }) => {
          const item = row.original;
          if (editingId === item.id) {
            return (
              <Select
                value={editForm.category || item.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                className="w-32"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            );
          }
          return <span>{item.category}</span>;
        },
      },
      {
        accessorKey: "location",
        header: "場所",
        cell: ({ row }) => {
          const item = row.original;
          if (editingId === item.id) {
            return (
              <Input
                value={editForm.location || item.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                className="w-32"
              />
            );
          }
          return <span>{item.location}</span>;
        },
      },
      {
        accessorKey: "found_date",
        header: "拾得日",
        cell: ({ row }) => {
          const item = row.original;
          if (editingId === item.id) {
            return (
              <Input
                type="date"
                value={editForm.found_date || item.found_date || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, found_date: e.target.value || null })
                }
                className="w-32"
                max={new Date().toISOString().split('T')[0]}
              />
            );
          }
          return (
            <span className="text-xs">
              {item.found_date ? formatDate(item.found_date) : formatDate(item.created_at)}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "登録日時",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        accessorKey: "registrant_name",
        header: "登録者",
        cell: ({ row }) => {
          const item = row.original;
          if (editingId === item.id) {
            return (
              <Input
                value={(editForm.registrant_name ?? item.registrant_name) ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, registrant_name: e.target.value || null })
                }
                className="w-24"
                placeholder="登録者名"
              />
            );
          }
          return <span className="text-xs">{item.registrant_name || "-"}</span>;
        },
      },
      {
        accessorKey: "is_returned",
        header: "状態",
        cell: ({ row }) => {
          const item = row.original;
          if (editingId === item.id) {
            return (
              <Select
                value={editForm.is_returned !== undefined ? String(editForm.is_returned) : String(item.is_returned)}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    is_returned: e.target.value === "true",
                    returned_at:
                      e.target.value === "true" && !item.is_returned
                        ? new Date().toISOString()
                        : item.returned_at,
                  })
                }
                className="w-24"
              >
                <option value="false">保管中</option>
                <option value="true">返却済</option>
              </Select>
            );
          }
          return (
            <span
              className={`px-2 py-1 rounded text-xs ${
                item.is_returned
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {item.is_returned ? "返却済" : "保管中"}
            </span>
          );
        },
      },
      {
        accessorKey: "returned_at",
        header: "返却日時",
        cell: ({ row }) => formatDate(row.original.returned_at),
      },
      {
        id: "actions",
        header: "操作",
        cell: ({ row }) => {
          const item = row.original;
          const isEditing = editingId === item.id;

          return (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(item.id)}
                    variant="success"
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setEditForm({});
                    }}
                  >
                    取消
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditForm({});
                    }}
                  >
                    編集
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    削除
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [editingId, editForm]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>管理ダッシュボード</CardTitle>
              <div className="flex gap-2">
                <Link href="/admin/register">
                  <Button>新規登録</Button>
                </Link>
                <Button variant="outline" onClick={handleExportCSV}>
                  CSV出力
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <Input
                placeholder="検索..."
                value={
                  (table.getColumn("category")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(e) =>
                  table.getColumn("category")?.setFilterValue(e.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left p-2 font-semibold text-sm"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-2 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              全 {items.length} 件
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
