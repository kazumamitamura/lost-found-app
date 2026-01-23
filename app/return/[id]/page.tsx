"use client";

import { useState, useEffect } from "react";
import { LostItem } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { formatDate, getImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);
  const [returned, setReturned] = useState(false);
  const router = useRouter();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchItem(p.id);
    });
  }, [params]);

  async function fetchItem(itemId: string) {
    try {
      const { data, error } = await supabase
        .from("lf_items")
        .select("*")
        .eq("qr_code_uuid", itemId)
        .single();

      if (error) throw error;
      setItem(data);
      if (data?.is_returned) {
        setReturned(true);
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn() {
    if (!item || item.is_returned) return;

    setReturning(true);
    try {
      const { error } = await supabase
        .from("lf_items")
        .update({
          is_returned: true,
          returned_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;
      setReturned(true);
    } catch (error) {
      console.error("Error returning item:", error);
      alert("返却処理中にエラーが発生しました");
    } finally {
      setReturning(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">アイテムが見つかりませんでした</p>
          <Link href="/" className="text-primary hover:underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-primary hover:underline">
            ← トップページに戻る
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <div className="aspect-video relative bg-gray-100">
            {getImageUrl(item.image_url) ? (
              <Image
                src={getImageUrl(item.image_url)!}
                alt={item.category}
                fill
                className="object-contain"
                sizes="100vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-24 h-24"
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
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">{item.category}</h1>
            <div className="space-y-2 mb-6">
              <div>
                <span className="font-semibold">拾得場所:</span> {item.location}
              </div>
              <div>
                <span className="font-semibold">登録日時:</span>{" "}
                {formatDate(item.created_at)}
              </div>
              {item.description && (
                <div>
                  <span className="font-semibold">備考:</span> {item.description}
                </div>
              )}
            </div>

            {returned || item.is_returned ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="text-green-800 font-semibold text-lg mb-2">
                  ✓ 返却完了しました
                </p>
                <p className="text-green-700 text-sm">
                  返却日時: {formatDate(item.returned_at)}
                </p>
              </div>
            ) : (
              <Button
                variant="success"
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleReturn}
                disabled={returning}
              >
                {returning ? "処理中..." : "持ち主に返却する"}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
