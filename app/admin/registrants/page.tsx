"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";

type Registrant = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  role: string | null;
  is_active: boolean;
  notes: string | null;
};

function RegistrantsPageContent() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Registrant>>({});
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkRegistering, setBulkRegistering] = useState(false);

  useEffect(() => {
    fetchRegistrants();
  }, []);

  async function fetchRegistrants() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lost_registrants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching registrants:", error);
        alert(`登録者の取得に失敗しました: ${error.message}`);
        return;
      }

      setRegistrants(data || []);
    } catch (error: any) {
      console.error("Error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(id: string) {
    try {
      const { error } = await supabase
        .from("lost_registrants")
        .update(editForm)
        .eq("id", id);

      if (error) {
        console.error("Error updating registrant:", error);
        alert(`更新に失敗しました: ${error.message}`);
        return;
      }

      setEditingId(null);
      setEditForm({});
      await fetchRegistrants();
      alert("更新しました");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const { error } = await supabase
        .from("lost_registrants")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting registrant:", error);
        alert(`削除に失敗しました: ${error.message}`);
        return;
      }

      await fetchRegistrants();
      alert("削除しました");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    }
  }

  async function handleBulkRegister() {
    if (!bulkInput.trim()) {
      alert("登録内容を入力してください");
      return;
    }

    setBulkRegistering(true);

    try {
      const lines = bulkInput.trim().split("\n");
      const registrantsToAdd = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const [name, email] = trimmed.split(",").map((s) => s.trim());
        if (name) {
          registrantsToAdd.push({
            name,
            email: email || null,
            role: "教員",
            is_active: true,
            notes: null,
          });
        }
      }

      if (registrantsToAdd.length === 0) {
        alert("有効なデータがありません");
        setBulkRegistering(false);
        return;
      }

      const { error } = await supabase
        .from("lost_registrants")
        .insert(registrantsToAdd);

      if (error) {
        console.error("Error bulk registering:", error);
        alert(`一括登録に失敗しました: ${error.message}`);
        setBulkRegistering(false);
        return;
      }

      alert(`${registrantsToAdd.length}件の登録者を追加しました`);
      setBulkInput("");
      setShowBulkForm(false);
      await fetchRegistrants();
    } catch (error: any) {
      console.error("Error:", error);
      alert(`エラーが発生しました: ${error.message}`);
    } finally {
      setBulkRegistering(false);
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">登録者管理</h1>
              <div className="flex gap-2">
                <Link href="/admin/dashboard">
                  <Button variant="outline" size="sm">
                    ← 忘れ物一覧に戻る
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    🔍 検索ページへ
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkForm(!showBulkForm)}
                  className="bg-blue-50"
                >
                  {showBulkForm ? "キャンセル" : "一括登録"}
                </Button>
              </div>
            </div>

            {showBulkForm && (
              <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h2 className="text-lg font-semibold mb-2">一括登録</h2>
                <p className="text-sm text-gray-600 mb-3">
                  1行に1人ずつ、カンマ区切りで入力してください。<br />
                  形式: <code className="bg-white px-1 rounded">名前,メールアドレス</code>（メールアドレスは省略可）
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  例:<br />
                  <code className="bg-white px-2 py-1 rounded block mt-1">
                    田中太郎,tanaka@example.com<br />
                    佐藤花子,sato@example.com<br />
                    鈴木次郎
                  </code>
                </p>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="田中太郎,tanaka@example.com&#10;佐藤花子,sato@example.com&#10;鈴木次郎"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleBulkRegister}
                    disabled={bulkRegistering}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {bulkRegistering ? "登録中..." : "一括登録実行"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBulkForm(false);
                      setBulkInput("");
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold text-sm">氏名</th>
                    <th className="text-left p-3 font-semibold text-sm">メールアドレス</th>
                    <th className="text-left p-3 font-semibold text-sm">役職</th>
                    <th className="text-left p-3 font-semibold text-sm">備考</th>
                    <th className="text-left p-3 font-semibold text-sm">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {registrants.map((registrant) => (
                    <tr key={registrant.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">
                        {editingId === registrant.id ? (
                          <Input
                            value={editForm.name || registrant.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-32"
                          />
                        ) : (
                          registrant.name
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {editingId === registrant.id ? (
                          <Input
                            type="email"
                            value={editForm.email || registrant.email || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, email: e.target.value })
                            }
                            className="w-48"
                          />
                        ) : (
                          registrant.email || "-"
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {editingId === registrant.id ? (
                          <select
                            value={editForm.role ?? registrant.role ?? "教員"}
                            onChange={(e) =>
                              setEditForm({ ...editForm, role: e.target.value })
                            }
                            className="w-32 border rounded px-2 py-1.5 text-sm"
                          >
                            <option value="教員">教員</option>
                            <option value="職員">職員</option>
                            <option value="その他">その他</option>
                          </select>
                        ) : (
                          registrant.role || "-"
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {editingId === registrant.id ? (
                          <Input
                            value={editForm.notes || registrant.notes || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, notes: e.target.value })
                            }
                            className="w-48"
                          />
                        ) : (
                          registrant.notes || "-"
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {editingId === registrant.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSave(registrant.id)}
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingId(registrant.id);
                                  setEditForm({});
                                }}
                              >
                                編集
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(registrant.id)}
                              >
                                削除
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              全 {registrants.length} 件
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegistrantsPage() {
  return (
    <ProtectedRoute>
      <RegistrantsPageContent />
    </ProtectedRoute>
  );
}
