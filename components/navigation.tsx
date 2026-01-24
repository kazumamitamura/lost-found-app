"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { checkAuth, logout } from "@/lib/auth";

export function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function verify() {
      const { authenticated } = await checkAuth();
      setIsAuthenticated(authenticated);
    }
    verify();
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary">
            忘れ物管理システム
          </Link>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                🔍 検索
              </Button>
            </Link>
            <Link href="/admin/register">
              <Button variant="outline" size="sm" className="bg-sky-50">
                📝 登録
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="bg-blue-50">
                📊 管理
              </Button>
            </Link>
            {isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-red-50 hover:bg-red-100"
              >
                🚪 ログアウト
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
