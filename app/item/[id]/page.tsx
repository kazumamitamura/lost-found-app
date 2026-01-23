import { LostItem } from "@/lib/types";
import { createServerClient } from "@/lib/supabase";
import { formatDate, getImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getItem(id: string): Promise<LostItem | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("lf_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-primary hover:underline">
            ← 一覧に戻る
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
            {item.is_returned ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-semibold">
                  返却済み ({formatDate(item.returned_at)})
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <p className="text-orange-800 font-semibold">保管中</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
