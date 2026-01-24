"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "react-qr-code";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { Navigation } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";

function RegisterPageContent() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [foundDate, setFoundDate] = useState(new Date().toISOString().split("T")[0]);
  const [registrantName, setRegistrantName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [registeredItem, setRegisteredItem] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!category || !location || !foundDate || !registrantName) {
      alert("カテゴリ、拾得場所、拾得日、登録者名は必須です。");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;

      // 画像アップロード
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("lf-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          alert(
            `画像のアップロードに失敗しました: ${uploadError.message}\n\n` +
            `ヒント:\n` +
            `1. Supabase Storage の "lf-images" バケットが作成されているか確認してください\n` +
            `2. Storage の RLS ポリシーが正しく設定されているか確認してください\n` +
            `3. 画像ファイルのサイズが大きすぎないか確認してください（推奨: 5MB以下）`
          );
          setUploading(false);
          return;
        }

        imageUrl = uploadData.path;
      }

      // データベースに登録
      const { data, error } = await supabase
        .from("lf_items")
        .insert({
          category,
          location,
          found_date: foundDate,
          registrant_name: registrantName,
          description: description || null,
          features: features || null,
          image_url: imageUrl,
          is_returned: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Database insert error:", error);
        alert(
          `登録に失敗しました: ${error.message}\n\n` +
          `ヒント:\n` +
          `1. Supabaseの "lf_items" テーブルが作成されているか確認してください\n` +
          `2. RLS (Row Level Security) ポリシーが正しく設定されているか確認してください\n` +
          `3. ネットワーク接続を確認してください`
        );
        setUploading(false);
        return;
      }

      setRegisteredItem(data);
      toast("忘れ物を登録しました！");
    } catch (error: any) {
      console.error("Unexpected error:", error);
      alert(`予期しないエラーが発生しました: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePDFDownload = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      const element = document.getElementById("qr-label");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [100, 80],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 100, 80);
      pdf.save(`忘れ物QRコード_${registeredItem.id.substring(0, 8)}.pdf`);
    } catch (error: any) {
      console.error("PDF generation error:", error);
      alert(`PDF生成に失敗しました: ${error.message}`);
    }
  };

  const handleNewRegistration = () => {
    setCategory("");
    setLocation("");
    setFoundDate(new Date().toISOString().split("T")[0]);
    setRegistrantName("");
    setDescription("");
    setFeatures("");
    setImageFile(null);
    setImagePreview(null);
    setRegisteredItem(null);
  };

  if (registeredItem) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const qrUrl = `${baseUrl}/return/${registeredItem.id}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Navigation />
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #qr-label, #qr-label * {
              visibility: visible;
            }
            #qr-label {
              position: absolute;
              left: 0;
              top: 0;
              width: 100mm;
              height: 60mm;
            }
            @page {
              size: 100mm 60mm;
              margin: 0;
            }
          }
        `}} />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-2xl text-center text-green-800">
                ✓ 登録完了しました！
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  忘れ物ID: <span className="text-blue-600">{registeredItem.id.substring(0, 8)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  QRコードをスキャンして返却手続きができます
                </p>
              </div>

              <div
                id="qr-label"
                className="bg-white border-2 border-gray-300 rounded-lg p-6 mx-auto print:border-0 print:shadow-none"
                style={{ width: '100mm', minHeight: '80mm', padding: '15mm' }}
              >
                <div className="text-center" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2" style={{ fontSize: '10pt' }}>忘れ物管理システム</p>
                    <div className="flex justify-center mb-3">
                      <div className="bg-white p-3 rounded border border-gray-200" style={{ display: 'inline-block', maxWidth: '100%' }}>
                        <QRCode value={qrUrl} size={180} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mt-3" style={{ fontSize: '9pt', fontWeight: 'bold' }}>
                      ID: {registeredItem.id.substring(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1" style={{ fontSize: '8pt' }}>
                      このQRコードをスキャンして返却手続きを行います
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 print:hidden">
                <Button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
                >
                  🖨️ 印刷
                </Button>
                <Button
                  onClick={handlePDFDownload}
                  className="bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg"
                >
                  📄 PDF保存
                </Button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg print:hidden">
                <p><strong>登録内容:</strong></p>
                <p>・カテゴリ: {registeredItem.category}</p>
                <p>・拾得場所: {registeredItem.location}</p>
                <p>・拾得日: {registeredItem.found_date}</p>
                <p>・登録者: {registeredItem.registrant_name}</p>
                {registeredItem.description && <p>・詳細: {registeredItem.description}</p>}
              </div>

              <div className="flex gap-4 print:hidden">
                <Button
                  onClick={handleNewRegistration}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white h-12 text-lg"
                >
                  続けて登録する
                </Button>
                <Link href="/admin/dashboard" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg">
                    忘れ物一覧へ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <Navigation />
      <ToastContainer />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-sky-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-sky-800">
                📝 忘れ物登録
              </CardTitle>
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="bg-white">
                  忘れ物一覧
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 画像アップロード */}
              <div className="border-2 border-dashed border-sky-300 rounded-lg p-6 bg-sky-50">
                <label
                  htmlFor="image-upload"
                  className="block cursor-pointer text-center"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-64 mx-auto">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  ) : (
                    <div className="py-12">
                      <div className="text-6xl mb-4">📸</div>
                      <p className="text-lg font-semibold text-gray-700">
                        写真を撮影/アップロード
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        クリックして画像を選択
                      </p>
                    </div>
                  )}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* カテゴリ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-base"
                  required
                >
                  <option value="">選択してください</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 拾得場所 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  拾得場所 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例: 体育館、教室1-A、図書室"
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* 拾得日 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  拾得日 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={foundDate}
                  onChange={(e) => setFoundDate(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* 登録者名 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  登録者名 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={registrantName}
                  onChange={(e) => setRegistrantName(e.target.value)}
                  placeholder="例: 田中太郎"
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* 詳細情報 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  詳細情報
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例: 黒い水筒、名前なし"
                  className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-base resize-none"
                />
              </div>

              {/* 備考・特徴 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  備考・特徴 <span className="text-gray-500 text-xs">(任意)</span>
                </label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="例: 取っ手に傷あり"
                  className="w-full h-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-base resize-none"
                />
              </div>

              {/* 登録ボタン */}
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                disabled={uploading}
              >
                {uploading ? "登録中..." : "✓ 登録する"}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ProtectedRoute>
      <RegisterPageContent />
    </ProtectedRoute>
  );
}
