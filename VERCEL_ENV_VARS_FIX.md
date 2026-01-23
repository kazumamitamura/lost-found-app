# Vercel環境変数設定ガイド

## 問題

デプロイ時に以下のエラーが発生：
```
Error: getaddrinfo ENOTFOUND placeholder.supabase.co
```

これは、Vercelの環境変数が設定されていないために発生しています。

## 解決方法

### ステップ1: Vercelで環境変数を設定

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト `lost-found-app` を開く
3. **Settings** → **Environment Variables** を開く

### ステップ2: 環境変数を追加

以下の2つの環境変数を追加してください：

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://otsvbxdfsaanpkbncxhj.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（完全なキー） | Production, Preview, Development |

**重要**: 
- 両方の環境変数を追加してください
- 「Environment」は「Production」「Preview」「Development」すべてにチェックを入れてください

### ステップ3: 環境変数の取得方法

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクト「Master-Portfolio-DB」を開く
3. **Settings** → **API** を開く
4. **Project URL** をコピー → `NEXT_PUBLIC_SUPABASE_URL` に設定
5. **anon public** キーをコピー → `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定

### ステップ4: デプロイを再実行

1. 環境変数を追加した後、**「Redeploy」** をクリック
2. または、GitHubに新しいコミットをプッシュして自動デプロイをトリガー

### ステップ5: 動作確認

デプロイ完了後、以下のURLにアクセスして動作を確認：

- トップページ: `https://your-app.vercel.app/`
- 登録画面: `https://your-app.vercel.app/admin/register`
- 管理ダッシュボード: `https://your-app.vercel.app/admin/dashboard`

## 確認事項

- [ ] `NEXT_PUBLIC_SUPABASE_URL` が設定されている
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されている
- [ ] 環境変数が「Production」「Preview」「Development」すべてに適用されている
- [ ] デプロイが成功している
- [ ] アプリが正常に動作している

## トラブルシューティング

### 環境変数を追加してもエラーが続く場合

1. **環境変数の値が正しいか確認**
   - Supabaseダッシュボードで再度確認
   - コピー＆ペーストで誤字がないか確認

2. **デプロイを再実行**
   - 環境変数を追加した後、必ず「Redeploy」をクリック
   - または、空のコミットをプッシュして再デプロイをトリガー

3. **ビルドログを確認**
   - Vercelの「Deployments」タブでビルドログを確認
   - エラーメッセージを確認

### まだエラーが発生する場合

環境変数が正しく設定されているにもかかわらずエラーが発生する場合は、以下を確認：

1. **環境変数の名前が正確か**
   - `NEXT_PUBLIC_SUPABASE_URL`（大文字小文字を正確に）
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`（大文字小文字を正確に）

2. **環境変数の値に余分なスペースがないか**
   - コピー＆ペースト時に前後にスペースが入っていないか確認

3. **Vercelのキャッシュをクリア**
   - Settings → Build & Development Settings → Clear Build Cache
