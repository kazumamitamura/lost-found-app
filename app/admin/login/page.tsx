"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // メールアドレスが登録者リストに存在するか確認
      const { data: registrant, error: registrantError } = await supabase
        .from("lf_registrants")
        .select("*")
        .eq("email", email)
        .single();

      if (registrantError || !registrant) {
        setError("登録されていないメールアドレスです。管理者に連絡してください。");
        setLoading(false);
        return;
      }

      // Supabase Authでログイン
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("メールアドレスまたはパスワードが正しくありません。");
        } else {
          setError(`ログインエラー: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      // ログイン成功
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(`予期しないエラーが発生しました: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              管理者ログイン
            </h1>
            <p className="text-gray-600">
              忘れ物管理システム
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@school.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white h-12 text-lg"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-sky-600 hover:text-sky-700"
            >
              ← 検索ページに戻る
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>初回ログイン時：</strong><br />
              管理者から提供されたメールアドレスとパスワードを使用してください。<br />
              アカウントがない場合は、管理者に連絡してアカウントを作成してもらってください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
