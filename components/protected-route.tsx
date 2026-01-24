"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function verify() {
      const { authenticated } = await checkAuth();
      
      if (!authenticated) {
        router.push("/admin/login");
        return;
      }
      
      setIsAuthenticated(true);
    }

    verify();
  }, [router]);

  // 認証チェック中は読み込み画面を表示
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          <p className="mt-4 text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  // 認証済みの場合は子要素を表示
  return <>{children}</>;
}
