"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  VIEWER_COOKIE_NAME,
  VIEWER_COOKIE_DAYS,
  VIEWER_ALLOWED_EMAIL_DOMAIN,
  isAllowedViewerEmail,
} from "@/lib/viewer";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setViewerCookie() {
  const value = "1";
  const days = VIEWER_COOKIE_DAYS;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${VIEWER_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

export function ViewerGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const cookie = getCookie(VIEWER_COOKIE_NAME);
    setVerified(cookie === "1");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("メールアドレスを入力してください。");
      return;
    }
    if (!isAllowedViewerEmail(trimmed)) {
      setError(`学校のメールアドレス（${VIEWER_ALLOWED_EMAIL_DOMAIN}）で入力してください。`);
      return;
    }
    setViewerCookie();
    setVerified(true);
  };

  // マウント前・Cookie確認中は何も表示しない（またはスピナー）
  if (verified === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-gray-800 mb-2">忘れ物一覧を閲覧する</h1>
              <p className="text-sm text-gray-600">
                学校のメールアドレス（{VIEWER_ALLOWED_EMAIL_DOMAIN}）を入力してください。
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="viewer-email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <Input
                  id="viewer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`xxx${VIEWER_ALLOWED_EMAIL_DOMAIN}`}
                  className="w-full"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white h-11">
                閲覧する
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
