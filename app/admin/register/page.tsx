"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "react-qr-code";
import { useToast, ToastContainer } from "@/components/ui/toast";

export default function RegisterPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [registrantName, setRegistrantName] = useState("");
  const [foundDate, setFoundDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [registeredItem, setRegisteredItem] = useState<{
    id: string;
    qr_code_uuid: string;
  } | null>(null);
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!location || !category || !imageFile) {
      showToast("場所、カテゴリ、写真は必須です", "error");
      return;
    }

    setUploading(true);

    try {
      // 1. 画像をアップロード
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("lf-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`);
      }

      // 2. データベースに登録
      const { data, error: insertError } = await supabase
        .from("lf_items")
        .insert({
          location,
          category,
          description: description || null,
          image_url: fileName,
          registrant_name: registrantName || null,
          found_date: foundDate || null,
        })
        .select("id, qr_code_uuid")
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`データの登録に失敗しました: ${insertError.message}`);
      }

      showToast("忘れ物を登録しました！", "success");
      setRegisteredItem(data);
    } catch (error: any) {
      console.error("Error registering item:", error);
      showToast(error.message || "登録中にエラーが発生しました", "error");
    } finally {
      setUploading(false);
    }
  }

  function handlePrint() {
    if (!registeredItem) return;
    window.print();
  }

  if (registeredItem) {
    const qrUrl = `${window.location.origin}/return/${registeredItem.qr_code_uuid}`;
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="max-w-2xl mx-auto">
          <Card className="print:shadow-none">
            <CardHeader>
              <CardTitle className="text-center">登録完了</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg font-semibold mb-4">
                  忘れ物を登録しました
                </p>
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                    <QRCode value={qrUrl} size={200} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  QRコードを印刷して、忘れ物に貼り付けてください
                </p>
                <p className="text-xs text-gray-500">
                  ID: {registeredItem.id}
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRegisteredItem(null);
                    setImageFile(null);
                    setImagePreview(null);
                    setLocation("");
                    setCategory("");
                    setDescription("");
                    setRegistrantName("");
                    setFoundDate("");
                  }}
                  className="flex-1"
                >
                  新しいアイテムを登録
                </Button>
                <Button onClick={handlePrint} className="flex-1">
                  印刷
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/admin/dashboard")}
                  className="flex-1"
                >
                  管理画面へ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>忘れ物登録</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  写真 <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
                  {imagePreview ? (
                    <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <svg
                        className="mx-auto h-16 w-16 text-primary"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-4 text-base font-semibold text-gray-700">
                        写真をアップロード
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        クリックしてファイルを選択、またはスマホで撮影
                      </p>
                    </div>
                  )}
                  <label className="mt-4 inline-block">
                    <span className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
                      {imagePreview ? "写真を変更" : "写真を選択"}
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      capture="environment"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  登録者名（拾得者） <span className="text-gray-500 text-xs">（任意）</span>
                </label>
                <Input
                  type="text"
                  value={registrantName}
                  onChange={(e) => setRegistrantName(e.target.value)}
                  placeholder="例: 田中太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  拾得日 <span className="text-gray-500 text-xs">（任意）</span>
                </label>
                <Input
                  type="date"
                  value={foundDate}
                  onChange={(e) => setFoundDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="mt-1 text-xs text-gray-500">
                  未入力の場合は登録日時が使用されます
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  拾得場所 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例: 体育館、図書館、1階廊下..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">選択してください</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  備考・特徴（任意）
                </label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例: 黒い財布、赤いライン..."
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={uploading}
              >
                {uploading ? "登録中..." : "登録する"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
