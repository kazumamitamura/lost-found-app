import { LostItem } from "@/lib/types";
import { createServerClient } from "@/lib/supabase";
import { formatDate, getImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ItemsList } from "@/components/items-list";
import { Navigation } from "@/components/navigation";
import { ViewerGate } from "@/components/viewer-gate";

async function getStoredItems(): Promise<LostItem[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("lost_items")
      .select("*")
      .eq("is_returned", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching items:", error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    // 環境変数が設定されていない場合でもビルドを成功させる
    if (error.message?.includes('Missing Supabase environment variables')) {
      console.warn("⚠️ Supabase environment variables are not set. Please configure them in Vercel.");
      return [];
    }
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export default async function HomePage() {
  const items = await getStoredItems();

  return (
    <ViewerGate>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <ItemsList initialItems={items} />
        </main>
      </div>
    </ViewerGate>
  );
}
