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
import { CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";

function DashboardPageContent() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<LostItemUpdateWithDates>({});
  const [showReturned, setShowReturned] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showNewRegistrantForm, setShowNewRegistrantForm] = useState(false);
  const [newRegistrantName, setNewRegistrantName] = useState("");
  const [newRegistrantEmail, setNewRegistrantEmail] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [showReturned]);

  async function fetchItems() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lost_items")
        .select("*")
        .eq("is_returned", showReturned)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching items:", error);
        alert(`データの取得に失敗しました: ${error.message}`);
        return;
      }

      setItems(data || []);
    } catch (error: any) {
      console.error("Error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const { error } = await supabase.from("lost_items").delete().eq("id", id);

      if (error) {
        console.error("Error deleting item:", error);
        alert(`削除に失敗しました: ${error.message}`);
        return;
      }

      await fetchItems();
      alert("削除しました");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    }
  }

  async function handleSave(id: string) {
    try {
      const { error } = await supabase
        .from("lost_items")
        .update(editForm)
        .eq("id", id);

      if (error) {
        console.error("Error updating item:", error);
        alert(`更新に失敗しました: ${error.message}`);
        return;
      }

      setEditingId(null);
      setEditForm({});
      await fetchItems();
      alert("更新しました");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    }
  }

  async function handleReturn(id: string) {
    if (!confirm("返却済みにしますか？")) return;

    try {
      const { error } = await supabase
        .from("lost_items")
        .update({
          is_returned: true,
          returned_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error returning item:", error);
        alert(`返却処理に失敗しました: ${error.message}`);
        return;
      }

      await fetchItems();
      alert("返却済みにしました");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    }
  }

  async function handleNewRegistrantSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegistering(true);

    try {
      const { error } = await supabase.from("lf_registrants").insert({
        name: newRegistrantName,
        email: newRegistrantEmail || null,
        role: "教員",
        is_active: true,
      });

      if (error) {
        console.error("Error adding registrant:", error);
        alert(`登録者の追加に失敗しました: ${error.message}\n\nヒント: Supabaseの設定を確認してください。`);
        return;
      }

      alert("登録者を追加しました");
      setNewRegistrantName("");
      setNewRegistrantEmail("");
      setShowNewRegistrantForm(false);
    } catch (error: any) {
      console.error("Error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    } finally {
      setRegistering(false);
    }
  }

  function handleExportCSV() {
    const headers = [
      "ID",
      "カテゴリ",
      "場所",
      "拾得日",
      "登録者",
      "説明",
      "返却済み",
      "返却日時",
      "登録日時",
    ];

    const rows = items.map((item) => [
      item.id,
      item.category,
      item.location,
      item.found_date || "",
      item.registrant_name || "",
      item.description || "",
      item.is_returned ? "はい" : "いいえ",
      item.returned_at ? formatDate(item.returned_at) : "",
      formatDate(item.created_at),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `忘れ物一覧_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  const columns: ColumnDef<LostItem>[] = useMemo(
    () => [
      {
        accessorKey: "image_url",
        header: "画像",
        cell: ({ row }) => {
          const imageUrl = getImageUrl(row.original.image_url);
          if (!imageUrl) return <span className="text-gray-400 text-xs">なし</span>;
          return (
            <div 
              className="w-16 h-16 relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setEnlargedImage(imageUrl)}
            >
              <Image
                src={imageUrl}
                alt="Item"
                fill
                className="object-cover rounded"
                sizes="64px"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "カテゴリ",
        cell: ({ row }) =>
          editingId === row.original.id ? (
            <Input
              value={editForm.category || row.original.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
              className="w-32"
            />
          ) : (
            row.original.category
          ),
      },
      {
        accessorKey: "location",
        header: "場所",
        cell: ({ row }) =>
          editingId === row.original.id ? (
            <Input
              value={editForm.location || row.original.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              className="w-32"
            />
          ) : (
            row.original.location
          ),
      },
      {
        accessorKey: "found_date",
        header: "拾得日",
        cell: ({ row }) =>
          editingId === row.original.id ? (
            <Input
              type="date"
              value={editForm.found_date || row.original.found_date || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, found_date: e.target.value })
              }
              className="w-40"
            />
          ) : (
            row.original.found_date || "-"
          ),
      },
      {
        accessorKey: "registrant_name",
        header: "登録者",
        cell: ({ row }) =>
          editingId === row.original.id ? (
            <Input
              value={editForm.registrant_name || row.original.registrant_name || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, registrant_name: e.target.value })
              }
              className="w-32"
            />
          ) : (
            row.original.registrant_name || "-"
          ),
      },
      {
        accessorKey: "description",
        header: "説明",
        cell: ({ row }) =>
          editingId === row.original.id ? (
            <Input
              value={editForm.description || row.original.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="w-48"
            />
          ) : (
            <span className="line-clamp-2">
              {row.original.description || "-"}
            </span>
          ),
      },
      {
        accessorKey: "is_returned",
        header: "返却済み",
        cell: ({ row }) =>
          row.original.is_returned ? (
            <span className="font-bold text-red-600">返却済み</span>
          ) : (
            <span className="text-orange-600">未返却</span>
          ),
      },
      {
        id: "actions",
        header: "操作",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex gap-2">
              {editingId === item.id ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleSave(item.id)}
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
                    キャンセル
                  </Button>
                </>
              ) : (
                <>
                  {!item.is_returned && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleReturn(item.id)}
                    >
                      返却
                    </Button>
                  )}
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
    <>
      {/* 画像拡大表示モーダル */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
              <Image
                src={enlargedImage}
                alt="拡大画像"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
          <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>管理ダッシュボード</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Link href="/admin/register">
                  <Button>忘れ物を登録</Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => setShowNewRegistrantForm(!showNewRegistrantForm)}
                >
                  {showNewRegistrantForm ? "キャンセル" : "新規登録者"}
                </Button>
                <Link href="/admin/registrants">
                  <Button variant="outline">登録者管理</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">🔍 検索ページ</Button>
                </Link>
                <Button variant="outline" onClick={handleExportCSV}>
                  CSV出力
                </Button>
              </div>
            </div>
          </CardHeader>
          {showNewRegistrantForm && (
            <div className="px-6 py-4 bg-blue-50 border-b">
              <form onSubmit={handleNewRegistrantSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      氏名 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={newRegistrantName}
                      onChange={(e) => setNewRegistrantName(e.target.value)}
                      placeholder="例: 田中太郎"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      メールアドレス
                    </label>
                    <Input
                      type="email"
                      value={newRegistrantEmail}
                      onChange={(e) => setNewRegistrantEmail(e.target.value)}
                      placeholder="例: tanaka@example.com"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      disabled={registering}
                    >
                      {registering ? "登録中..." : "登録"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
          <CardContent>
            <div className="mb-4 space-y-2">
              <div className="flex gap-4 items-center">
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
                <div className="flex gap-2">
                  <Button
                    variant={!showReturned ? "default" : "outline"}
                    onClick={() => setShowReturned(false)}
                  >
                    未返却
                  </Button>
                  <Button
                    variant={showReturned ? "default" : "outline"}
                    onClick={() => setShowReturned(true)}
                  >
                    返却済み
                  </Button>
                </div>
              </div>
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
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
