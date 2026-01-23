# GitHubとVercelへの連携手順

## ⚠️ 重要: まずデータベースを修正してください

登録エラーを解決するため、**最初に**以下を実行してください：

1. Supabaseダッシュボードを開く
2. SQL Editorを開く
3. `migration_add_columns.sql` の内容をコピーして実行

これで `registrant_name` と `found_date` カラムが追加され、登録ができるようになります。

---

## ステップ1: GitHubリポジトリの作成

### 1-1. GitHubでリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 右上の「+」→「New repository」をクリック
3. 以下の設定で作成：
   - **Repository name**: `lost-found-app`
   - **Description**: `忘れ物管理システム (Lost & Found Management System)`
   - **Visibility**: Public または Private（お好みで）
   - **Initialize this repository with**: チェックを**外す**（既にファイルがあるため）
4. 「Create repository」をクリック

### 1-2. ローカルからGitHubにプッシュ

ターミナル（PowerShell）で以下を実行：

```powershell
# プロジェクトディレクトリに移動
cd "C:\Users\PC_User\Desktop\アプリ\lost-found-app"

# リモートリポジトリを設定（まだの場合）
git remote add origin https://github.com/kazumamitamura/lost-found-app.git

# または、既に設定されている場合は更新
git remote set-url origin https://github.com/kazumamitamura/lost-found-app.git

# ブランチ名をmainに設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

**認証が必要な場合：**
- Personal Access Tokenを使用する必要がある場合があります
- GitHubのSettings → Developer settings → Personal access tokens → Tokens (classic) でトークンを作成

---

## ステップ2: Vercelへのデプロイ

### 2-1. Vercelアカウントの準備

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択してGitHubアカウントでログイン

### 2-2. プロジェクトのインポート

1. Vercelダッシュボードで「Add New Project」をクリック
2. 「Import Git Repository」で `lost-found-app` を選択
3. 「Import」をクリック

### 2-3. プロジェクト設定

1. **Framework Preset**: Next.js（自動検出）
2. **Root Directory**: `./`（そのまま）
3. **Build Command**: `npm run build`（自動設定）
4. **Output Directory**: `.next`（自動設定）

### 2-4. 環境変数の設定（重要）

「Environment Variables」セクションで以下を追加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-here` |

**環境変数の取得方法：**
1. Supabaseダッシュボードを開く
2. Settings → API を開く
3. `Project URL` をコピー → `NEXT_PUBLIC_SUPABASE_URL` に設定
4. `anon public` キーをコピー → `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定

### 2-5. デプロイ

1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待つ（約2-3分）
3. デプロイ完了後、Vercelが提供するURL（例: `https://lost-found-app.vercel.app`）でアクセス可能

---

## ステップ3: 動作確認

1. デプロイされたURLにアクセス
2. `/admin/register` で登録機能をテスト
3. データが正しく保存されることを確認

---

## トラブルシューティング

### GitHubへのプッシュが失敗する場合

**エラー: "Repository not found"**
→ GitHubリポジトリが作成されているか確認
→ リポジトリ名が正しいか確認
→ アクセス権限があるか確認

**エラー: "Authentication failed"**
→ Personal Access Tokenを使用する必要がある場合があります
→ GitHubのSettings → Developer settings → Personal access tokens でトークンを作成

### Vercelのデプロイが失敗する場合

**エラー: "Build failed"**
→ Vercelのデプロイログを確認
→ 環境変数が正しく設定されているか確認

**エラー: "Database connection failed"**
→ Supabaseの環境変数が正しく設定されているか確認
→ SupabaseのRLSポリシーを確認

### 登録ができない場合

**エラー: "Could not find the 'found_date' column"**
→ `migration_add_columns.sql` をSupabaseで実行してください

---

## 次のステップ

1. ✅ データベースマイグレーションを実行
2. ✅ GitHubリポジトリを作成
3. ✅ GitHubにプッシュ
4. ✅ Vercelでデプロイ
5. ✅ 動作確認

完了後、VercelのURLでアプリにアクセスできます！
