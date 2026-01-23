import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary">
            忘れ物管理システム
          </Link>
          <div className="flex gap-2">
            <Link href="/admin/register">
              <Button variant="outline" size="sm">
                登録
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                管理
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
