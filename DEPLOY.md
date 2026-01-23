# デプロイ手順

## 1. データベースの修正（重要）

登録エラーを解決するため、まずデータベースにカラムを追加してください。

### Supabaseで実行

1. Supabaseダッシュボードを開く
2. SQL Editorを開く
3. `migration_add_columns.sql` の内容をコピーして実行

これで `registrant_name` と `found_date` カラムが追加されます。

## 2. GitHubへのプッシュ

### ステップ1: すべての変更をコミット

```bash
git add .
git commit -m "Add migration, Vercel config, and feature improvements"
```

### ステップ2: GitHubにプッシュ

```bash
git push -u origin main
```

## 3. Vercelへのデプロイ

### ステップ1: Vercelアカウントの準備

1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン
3. "Add New Project"をクリック

### ステップ2: リポジトリのインポート

1. GitHubリポジトリ `kazumamitamura/lost-found-app` を選択
2. "Import"をクリック

### ステップ3: プロジェクト設定

1. **Framework Preset**: Next.js（自動検出されるはず）
2. **Root Directory**: `./`（そのまま）
3. **Build Command**: `npm run build`（自動設定）
4. **Output Directory**: `.next`（自動設定）

### ステップ4: 環境変数の設定

**重要**: 以下の環境変数を追加してください：

1. "Environment Variables"セクションを開く
2. 以下の2つの変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
```

**環境変数の取得方法：**
- Supabaseダッシュボード → Settings → API
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ステップ5: デプロイ

1. "Deploy"ボタンをクリック
2. デプロイが完了するまで待つ（約2-3分）
3. デプロイ完了後、Vercelが提供するURL（例: `https://lost-found-app.vercel.app`）でアクセス可能になります

## 4. 動作確認

1. デプロイされたURLにアクセス
2. `/admin/register` で登録機能をテスト
3. データベースに正しく保存されることを確認

## トラブルシューティング

### デプロイエラーが発生する場合

1. **環境変数が設定されていない**
   → Vercelのプロジェクト設定で環境変数を確認

2. **ビルドエラー**
   → Vercelのデプロイログを確認し、エラーメッセージを確認

3. **データベース接続エラー**
   → SupabaseのRLSポリシーを確認
   → 環境変数が正しく設定されているか確認

### データベースカラムが存在しないエラー

→ `migration_add_columns.sql` をSupabaseで実行してください
