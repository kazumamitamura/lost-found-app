import { LostItem } from "@/lib/types";
import { createServerClient } from "@/lib/supabase";
import { formatDate, getImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ItemsList } from "@/components/items-list";

async function getStoredItems(): Promise<LostItem[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("lf_items")
      .select("*")
      .eq("is_returned", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching items:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return [];
  }
}

export default async function HomePage() {
  const items = await getStoredItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">忘れ物管理システム</h1>
          <p className="text-sm text-gray-600 mt-1">Lost & Found</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <ItemsList initialItems={items} />
      </main>
    </div>
  );
}
