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
    if (!location || !category || !imageFile || !registrantName || !foundDate) {
      showToast("場所、カテゴリ、写真、登録者名、拾得日は必須です", "error");
      return;
    }

    setUploading(true);

    try {
      // 1. 画像をアップロード
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("lf-images")
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // より詳細なエラーメッセージを提供
        let errorMessage = `画像のアップロードに失敗しました: ${uploadError.message || 'Unknown error'}`;
        if (uploadError.message?.includes('new row violates row-level security') || uploadError.message?.includes('RLS')) {
          errorMessage = "画像のアップロードに失敗しました: Storageポリシーが正しく設定されていません。Supabaseでfix_storage_policy.sqlを実行してください。";
        } else if (uploadError.message?.includes('Failed to fetch') || uploadError.message?.includes('NetworkError')) {
          errorMessage = "画像のアップロードに失敗しました: ネットワークエラー。Supabaseの接続を確認してください。環境変数が正しく設定されているか確認してください。";
        } else if (uploadError.message?.includes('JWT') || uploadError.message?.includes('auth')) {
          errorMessage = "画像のアップロードに失敗しました: 認証エラー。Supabaseの環境変数を確認してください。";
        }
        throw new Error(errorMessage);
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

  async function handleDownloadPDF() {
    if (!registeredItem) return;
    
    try {
      // 動的にjsPDFとhtml2canvasをインポート
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const qrElement = document.getElementById('qr-label');
      if (!qrElement) {
        showToast("QRコード要素が見つかりません", "error");
        return;
      }

      showToast("PDFを生成中...", "info");
      
      const canvas = await html2canvas(qrElement, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        width: qrElement.scrollWidth,
        height: qrElement.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // PDFサイズをQRコードのアスペクト比に合わせて調整
      const aspectRatio = canvas.height / canvas.width;
      const pdfWidth = 100; // mm
      const pdfHeight = Math.max(pdfWidth * aspectRatio, 80); // 最小80mm
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      // QRコードが完全に収まるようにサイズを調整
      const imgWidth = pdfWidth;
      const imgHeight = pdfWidth * aspectRatio;
      
      // 中央に配置（縦方向の余白を考慮）
      const yOffset = (pdfHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', 0, Math.max(0, yOffset), imgWidth, imgHeight);
      pdf.save(`忘れ物ラベル_${registeredItem.id.substring(0, 8)}.pdf`);
      
      showToast("PDFをダウンロードしました", "success");
    } catch (error: any) {
      console.error("PDF生成エラー:", error);
      showToast("PDFの生成に失敗しました。印刷機能をお使いください。", "error");
    }
  }

  if (registeredItem) {
    const qrUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/return/${registeredItem.qr_code_uuid}`
      : `/return/${registeredItem.qr_code_uuid}`;
    return (
      <>
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
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="p-4">
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-2xl">✓ 登録完了</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                  <p className="text-lg font-semibold mb-4 text-green-600">
                    忘れ物を登録しました
                  </p>
                  
                  {/* 印刷用ラベル */}
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

                  <p className="text-sm text-gray-600 mb-2 mt-4 print:hidden">
                    QRコードを印刷して、忘れ物に貼り付けてください
                  </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 print:hidden">
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
                    className="flex-1 h-12"
                  >
                    ➕ 新しいアイテムを登録
                  </Button>
                  <Button 
                    onClick={handlePrint} 
                    className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white"
                  >
                    🖨️ 印刷
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    📄 PDF保存
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/admin/dashboard")}
                    className="flex-1 h-12"
                  >
                    📊 管理画面へ
                  </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-4">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="max-w-2xl mx-auto">
          <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">忘れ物登録</CardTitle>
            <p className="text-sm text-gray-500 text-center mt-2">
              スマホで撮影して10秒で登録
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 大きな写真撮影/アップロードボタン */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  写真 <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-blue-400 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer relative">
                  {imagePreview ? (
                    <div className="relative aspect-video mb-4 rounded-lg overflow-hidden bg-white">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="py-12">
                      <svg
                        className="mx-auto h-20 w-20 text-blue-500"
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
                      <p className="mt-6 text-lg font-semibold text-gray-700">
                        写真を撮影・アップロード
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        タップしてカメラを起動、またはファイルを選択
                      </p>
                    </div>
                  )}
                  <label className="mt-6 inline-block">
                    <span className="px-8 py-4 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors text-base font-semibold shadow-md">
                      {imagePreview ? "写真を変更" : "📷 写真を撮影・選択"}
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

              {/* 必須項目: 場所とカテゴリ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="h-11"
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
                    className="h-11"
                  >
                    <option value="">選択してください</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* 詳細情報（必須） */}
              <div className="border rounded-lg p-4 bg-white space-y-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  📝 詳細情報
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    登録者名（拾得者） <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={registrantName}
                    onChange={(e) => setRegistrantName(e.target.value)}
                    placeholder="例: 田中太郎"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    拾得日 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={foundDate}
                    onChange={(e) => setFoundDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    備考・特徴 <span className="text-gray-500 text-xs">（任意）</span>
                  </label>
                  <Input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="例: 黒い財布、赤いライン..."
                  />
                </div>
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
