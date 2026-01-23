"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast, ToastContainer } from "@/components/ui/toast";
import Link from "next/link";

type Registrant = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  role: string;
  is_active: boolean;
  notes: string | null;
};

export default function RegistrantsPage() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "教員",
    notes: "",
  });
  const [bulkInput, setBulkInput] = useState("");
  const [showBulkForm, setShowBulkForm] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetchRegistrants();
  }, []);

  async function fetchRegistrants() {
    try {
      const { data, error } = await supabase
        .from("lf_registrants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrants(data || []);
    } catch (error) {
      console.error("Error fetching registrants:", error);
      showToast("登録者の取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name) {
      showToast("名前は必須です", "error");
      return;
    }

    try {
      if (editingId) {
        // 更新
        const { error } = await supabase
          .from("lf_registrants")
          .update({
            name: formData.name,
            email: formData.email || null,
            role: formData.role,
            notes: formData.notes || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        showToast("登録者を更新しました", "success");
      } else {
        // 新規作成
        const { error } = await supabase
          .from("lf_registrants")
          .insert({
            name: formData.name,
            email: formData.email || null,
            role: formData.role,
            notes: formData.notes || null,
          });

        if (error) throw error;
        showToast("登録者を追加しました", "success");
      }

      setFormData({ name: "", email: "", role: "教員", notes: "" });
      setEditingId(null);
      fetchRegistrants();
    } catch (error: any) {
      console.error("Error saving registrant:", error);
      showToast(error.message || "保存に失敗しました", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const { error } = await supabase
        .from("lf_registrants")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showToast("登録者を削除しました", "success");
      fetchRegistrants();
    } catch (error) {
      console.error("Error deleting registrant:", error);
      showToast("削除に失敗しました", "error");
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("lf_registrants")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      fetchRegistrants();
    } catch (error) {
      console.error("Error toggling active status:", error);
      showToast("状態の更新に失敗しました", "error");
    }
  }

  function handleEdit(registrant: Registrant) {
    setFormData({
      name: registrant.name,
      email: registrant.email || "",
      role: registrant.role,
      notes: registrant.notes || "",
    });
    setEditingId(registrant.id);
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkInput.trim()) {
      showToast("一括登録データを入力してください", "error");
      return;
    }

    try {
      const lines = bulkInput.trim().split("\n").filter(line => line.trim());
      const registrantsToInsert = [];

      for (const line of lines) {
        const parts = line.split(",").map(p => p.trim());
        if (parts.length < 1) {
          showToast(`不正な形式の行があります: ${line}`, "error");
          return;
        }

        const name = parts[0];
        const email = parts[1] || null;

        if (!name) {
          showToast(`名前が空の行があります: ${line}`, "error");
          return;
        }

        // メールアドレスの形式チェック（任意）
        if (email && !email.includes("@")) {
          showToast(`メールアドレスの形式が不正です: ${line}`, "error");
          return;
        }

        registrantsToInsert.push({
          name,
          role: "教員", // デフォルトで教員
          email,
          notes: null,
        });
      }

      if (registrantsToInsert.length === 0) {
        showToast("登録するデータがありません", "error");
        return;
      }

      const { error } = await supabase
        .from("lf_registrants")
        .insert(registrantsToInsert);

      if (error) throw error;
      showToast(`${registrantsToInsert.length}件の登録者を追加しました`, "success");
      setBulkInput("");
      setShowBulkForm(false);
      fetchRegistrants();
    } catch (error: any) {
      console.error("Error bulk inserting registrants:", error);
      showToast(error.message || "一括登録に失敗しました", "error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="h-10">
              ← 忘れ物一覧に戻る
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>登録者を追加・編集</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBulkForm(!showBulkForm)}
              >
                {showBulkForm ? "個別登録" : "一括登録"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showBulkForm ? (
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    一括登録データ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="名前,メールアドレス&#10;例:&#10;田中太郎,tanaka@example.com&#10;佐藤花子,sato@example.com&#10;鈴木一郎,"
                    className="w-full h-48 p-3 border border-gray-300 rounded-md resize-y"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    1行に1人分のデータを入力してください。形式: 名前,メールアドレス（カンマ区切り、メールアドレスは任意）
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                    一括登録
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setBulkInput("");
                      setShowBulkForm(false);
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    名前 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="例: 田中太郎"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    役職 <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="教員">教員</option>
                    <option value="職員">職員</option>
                    <option value="その他">その他</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  メールアドレス（任意）
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="例: tanaka@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  備考（任意）
                </label>
                <Input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="備考があれば入力"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                  {editingId ? "更新" : "追加"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        name: "",
                        email: "",
                        role: "教員",
                        notes: "",
                      });
                      setEditingId(null);
                    }}
                  >
                    キャンセル
                  </Button>
                )}
              </div>
            </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>登録者一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold text-sm">名前</th>
                    <th className="text-left p-2 font-semibold text-sm">役職</th>
                    <th className="text-left p-2 font-semibold text-sm">メール</th>
                    <th className="text-left p-2 font-semibold text-sm">状態</th>
                    <th className="text-left p-2 font-semibold text-sm">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {registrants.map((registrant) => (
                    <tr
                      key={registrant.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-2 text-sm">{registrant.name}</td>
                      <td className="p-2 text-sm">{registrant.role}</td>
                      <td className="p-2 text-sm">
                        {registrant.email || "-"}
                      </td>
                      <td className="p-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            registrant.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {registrant.is_active ? "有効" : "無効"}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(registrant)}
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleToggleActive(
                                registrant.id,
                                registrant.is_active
                              )
                            }
                          >
                            {registrant.is_active ? "無効化" : "有効化"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(registrant.id)}
                          >
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {registrants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  登録者がいません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
