"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const ROLES = [
  { value: "教員", label: "教員" },
  { value: "職員", label: "職員" },
  { value: "その他", label: "その他" },
] as const;

export default function SignupPage() {
  const [signupKey, setSignupKey] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState<string>("教員");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/verify-signup-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: signupKey }),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    if (!data.ok) {
      setError("登録キーが正しくありません。管理者に登録キーを確認してください。");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError("パスワードが一致しません。");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      setLoading(false);
      return;
    }

    try {
      // 1. Supabase Auth でアカウント作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: undefined },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("このメールアドレスは既に登録されています。ログインしてください。");
        } else {
          setError(`登録エラー: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      // 2. 登録者テーブルに追加（同じメールが既にあればスキップ）
      const { error: insertError } = await supabase.from("lost_registrants").insert({
        name: name.trim(),
        email: email.trim(),
        role,
        is_active: true,
        notes: null,
      });

      if (insertError) {
        // 重複メールの場合は「既に登録済み」として扱う
        if (insertError.code === "23505") {
          setError("このメールアドレスは既に登録者一覧に存在します。ログインしてください。");
        } else {
          setError(`登録者リストの登録に失敗しました: ${insertError.message}`);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "予期しないエラーが発生しました。";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-2">登録が完了しました</h1>
              <p className="text-gray-600 mb-6">
                ログインページから、登録したメールアドレスとパスワードでログインしてください。
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/admin/login">
                  <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white h-12">
                    ログイン画面へ
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full h-10 text-sm">
                    検索ページに戻る
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">新規登録</h1>
            <p className="text-gray-600">教員・職員の方はこちらから登録してください</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="signupKey" className="block text-sm font-medium text-gray-700 mb-1">
                管理者登録用パスワード <span className="text-red-500">*</span>
              </label>
              <Input
                id="signupKey"
                type="password"
                value={signupKey}
                onChange={(e) => setSignupKey(e.target.value)}
                placeholder="登録キーを入力"
                required
                autoComplete="off"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">管理者から伝えられたパスワードを入力してください</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                氏名 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
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
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                役割
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                required
                minLength={6}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <Input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="もう一度入力"
                required
                minLength={6}
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white h-12 text-lg"
            >
              {loading ? "登録中..." : "登録する"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちの方は
              <Link href="/admin/login" className="ml-1 text-sky-600 hover:text-sky-700 font-medium">
                ログイン
              </Link>
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="block w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← 検索ページに戻る
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
