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
import { Navigation } from "@/components/navigation";

export default function DashboardPage() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<LostItemUpdateWithDates>({});
  const [showReturned, setShowReturned] = useState(false); // 返却済み表示フラグ
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null); // 拡大表示中の画像URL
  const [showNewRegistrantForm, setShowNewRegistrantForm] = useState(false); // 新規登録者フォーム表示フラグ
  const [newRegistrantName, setNewRegistrantName] = useState(""); // 新規登録者名
  const [newRegistrantEmail, setNewRegistrantEmail] = useState(""); // 新規登録者メール
  const [registering, setRegistering] = useState(false); // 登録中フラグ

  async function fetchItems() {
    try {
      let query = supabase.from("lf_items").select("*");
      
      // 返却済み表示フラグに応じてフィルタリング
      if (showReturned) {
        // 返却済みのみ表示
        query = query.eq("is_returned", true);
      } else {
        // 未返却のみ表示
        query = query.eq("is_returned", false);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReturned]);

  async function handleReturn(id: string) {
    if (!confirm("この忘れ物を返却済みにしますか？")) return;

    try {
      const { error } = await supabase
        .from("lf_items")
        .update({
          is_returned: true,
          returned_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      fetchItems();
      alert("返却済みに更新しました");
    } catch (error) {
      console.error("Error returning item:", error);
      alert("返却処理中にエラーが発生しました");
    }
  }

  async function handleNewRegistrantSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newRegistrantName.trim()) {
      alert("氏名を入力してください");
      return;
    }

    setRegistering(true);
    try {
      const { error } = await supabase
        .from("lf_registrants")
        .insert({
          name: newRegistrantName.trim(),
          email: newRegistrantEmail.trim() || null,
          role: "教員",
        });

      if (error) throw error;
      
      alert("登録者を追加しました");
      setNewRegistrantName("");
      setNewRegistrantEmail("");
      setShowNewRegistrantForm(false);
    } catch (error: any) {
      console.error("Error adding registrant:", error);
      let errorMessage = `登録に失敗しました: ${error.message || 'Unknown error'}`;
      
      // より詳細なエラーメッセージを提供
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = "登録に失敗しました: ネットワークエラー。Supabaseの接続を確認してください。環境変数が正しく設定されているか確認してください。";
      } else if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        errorMessage = "登録に失敗しました: RLSポリシーが正しく設定されていません。Supabaseでfix_rls_policies.sqlを実行してください。";
      } else if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        errorMessage = "登録に失敗しました: 認証エラー。Supabaseの環境変数を確認してください。";
      }
      
      alert(errorMessage);
    } finally {
      setRegistering(false);
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
          const imageUrl = getImageUrl(item.image_url);
          return (
            <div 
              className="w-16 h-16 relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => imageUrl && setEnlargedImage(imageUrl)}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
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
                value={(editForm.found_date ?? item.found_date) ?? ""}
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
        id: "return_status",
        header: "返却済み",
        cell: ({ row }) => {
          const item = row.original;
          if (item.is_returned) {
            return (
              <span className="font-bold text-red-600 text-lg">
                返却済み
              </span>
            );
          }
          return <span className="text-gray-500">-</span>;
        },
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
                  {!item.is_returned && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-500 hover:bg-green-600 text-white"
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
