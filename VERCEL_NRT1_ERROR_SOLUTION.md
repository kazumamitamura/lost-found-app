# Vercel "Invalid region selector: nrt1" エラー完全解決ガイド

## 問題の原因

1. **入力フィールドの間違い**: URLではなくブランチ名を入力する必要がある
2. **Vercelプロジェクト設定**: どこかに`nrt1`が残っている可能性

## 解決方法

### 方法1: 入力フィールドを正しく修正（まず試す）

1. **「Create Deployment」モーダルで**
2. 入力フィールド内の `https://github.com/kazumamitamura/lost-found-app` を**すべて削除**
3. 入力フィールドに **`main`** と入力（URLではない）
4. 「Create Deployment」をクリック

### 方法2: Vercelプロジェクト設定を完全にリセット

#### ステップ1: プロジェクトを削除して再作成（推奨）

1. **Settings** → **General** を開く
2. 一番下の「Delete Project」セクションまでスクロール
3. 「Delete Project」ボタンをクリック
4. 確認ダイアログで削除を確認

#### ステップ2: 新しいプロジェクトを作成

1. Vercelダッシュボードのトップページに戻る
2. 「Add New Project」をクリック
3. GitHubリポジトリ `kazumamitamura/lost-found-app` を選択
4. 「Import」をクリック

#### ステップ3: プロジェクト設定

1. **Framework Preset**: Next.js（自動検出）
2. **Root Directory**: `./`
3. **Build Command**: `npm run build`（自動設定）
4. **Output Directory**: `.next`（自動設定）

**重要**: リージョン設定は**指定しない**（Vercelが自動選択）

#### ステップ4: 環境変数を設定

「Environment Variables」セクションで：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://otsvbxdfsaanpkbncxhj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**注意**: `SUPABASE_SERVICE_ROLE_KEY` は**追加しない**（このアプリでは不要）

#### ステップ5: デプロイ

1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待つ

### 方法3: Vercel CLIを使用（代替方法）

ターミナルで以下を実行：

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# プロジェクトディレクトリで
cd "C:\Users\PC_User\Desktop\アプリ\lost-found-app"

# デプロイ（対話形式で設定）
vercel --prod
```

## 重要なポイント

### 入力フィールドについて

「Commit or Branch Reference」フィールドには：
- ✅ **正しい**: `main`（ブランチ名）
- ❌ **間違い**: `https://github.com/kazumamitamura/lost-found-app`（URL）

### リージョン設定について

- **Function Region**: `hnd1` (Tokyo) は有効 ✅
- **デプロイメント全体のリージョン**: 指定しない（Vercelが自動選択）
- **vercel.json**: `regions` フィールドは含めない

## 推奨手順（最も確実）

### ステップ1: プロジェクトを削除

1. Settings → General → 「Delete Project」
2. プロジェクトを削除

### ステップ2: 新規プロジェクトを作成

1. 「Add New Project」
2. GitHubリポジトリを選択
3. **リージョン設定は指定しない**（デフォルトのまま）
4. 環境変数のみ設定
5. 「Deploy」をクリック

これで、`nrt1`のエラーは完全に解消されるはずです。

## トラブルシューティング

### エラーが続く場合

1. **ブラウザのキャッシュをクリア**
2. **Vercelからログアウトして再ログイン**
3. **プロジェクトを完全に削除して再作成**

### デプロイが成功したら

1. デプロイされたURLで動作確認
2. `/admin/register` で登録機能をテスト
3. データが正しく保存されることを確認
