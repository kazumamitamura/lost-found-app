# Vercel プロジェクト名エラー解決ガイド

## エラー内容
「Project "lost-found-app" already exists, please use a new name.」

既存のプロジェクトが存在するため、新しいプロジェクトを作成できません。

## 解決方法

### 方法1: 既存プロジェクトを削除して再作成（推奨）

#### ステップ1: 既存プロジェクトを削除

1. Vercelダッシュボードのトップページに移動
   - URL: `https://vercel.com/dashboard`
   - または、ブラウザの戻るボタンでダッシュボードに戻る

2. プロジェクト一覧から「lost-found-app」を探す
   - 左サイドバーまたはメインエリアに表示されているはずです

3. 「lost-found-app」プロジェクトをクリックして開く

4. **Settings** をクリック（上部のナビゲーションバー）

5. **General** をクリック（左サイドバー）

6. 一番下までスクロール

7. **「Delete Project」** セクションを見つける

8. **「Delete Project」** ボタンをクリック

9. 確認ダイアログが表示される
   - プロジェクト名を入力して確認
   - 「Delete」ボタンをクリック

#### ステップ2: 新しいプロジェクトを作成

1. Vercelダッシュボードのトップページに戻る

2. **「Add New Project」** ボタンをクリック

3. GitHubリポジトリを選択
   - `kazumamitamura/lost-found-app` を選択
   - 「Import」をクリック

4. プロジェクト設定
   - **Project Name**: `lost-found-app`（これで問題なく作成できるはず）
   - **Framework Preset**: Next.js（自動検出）
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`（自動設定）
   - **Output Directory**: `Next.js default`（自動設定）

5. **環境変数を設定**
   - 「Environment Variables」セクションを開く
   - 以下の2つを追加：

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://otsvbxdfsaanpkbncxhj.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（完全なキー） |

   **重要**: `SUPABASE_SERVICE_ROLE_KEY` は**追加しない**

6. **「Deploy」ボタンをクリック**

### 方法2: プロジェクト名を変更（代替方法）

既存のプロジェクトを削除したくない場合：

1. 現在の画面で、**「Project Name」** フィールドを見つける

2. プロジェクト名を変更
   - 例: `lost-found-app-v2`
   - 例: `lost-found-app-new`
   - 例: `lost-found-app-2024`

3. 環境変数を設定（上記と同じ）

4. **「Deploy」ボタンをクリック**

## 環境変数の確認

現在の画面で設定されている環境変数：

✅ **正しい設定:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

❌ **追加しない:**
- `SUPABASE_SERVICE_ROLE_KEY`（このアプリでは不要）

## 推奨手順

**最も確実な方法は「方法1」です：**

1. 既存プロジェクトを削除
2. 新規プロジェクトを作成
3. 環境変数を設定
4. デプロイ

これで、`nrt1`エラーも解消され、正常にデプロイできるはずです。
