# デプロイ手順ガイド

## 前提条件

- GitHubリポジトリが作成済み
- Vercelアカウントが作成済み
- Supabaseプロジェクトが作成済み

## ステップ1: コードをGitHubにプッシュ

### 1-1. 変更をコミット

```bash
git add .
git commit -m "登録者一括登録機能の簡素化とQRコード動作確認の準備"
```

### 1-2. GitHubにプッシュ

```bash
git push origin main
```

## ステップ2: Vercelでデプロイ

### 2-1. Vercelプロジェクトの確認

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト `lost-found-app` を開く
3. 既にGitHubと連携されている場合は、自動的にデプロイが開始されます

### 2-2. 手動でデプロイをトリガーする場合

1. Vercelダッシュボードでプロジェクトを開く
2. 「Deployments」タブを開く
3. 「Redeploy」ボタンをクリック
4. または、GitHubにプッシュすると自動的にデプロイが開始されます

### 2-3. 環境変数の確認

Vercelのプロジェクト設定で、以下の環境変数が設定されているか確認：

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseのプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseのanon key |

**設定場所**: Settings → Environment Variables

## ステップ3: デプロイ完了後の確認

### 3-1. デプロイURLの確認

1. Vercelダッシュボードでデプロイが完了するまで待つ（約2-3分）
2. デプロイ完了後、提供されるURL（例: `https://lost-found-app.vercel.app`）を確認

### 3-2. 動作確認

以下のページにアクセスして動作を確認：

1. **トップページ（生徒用）**
   - URL: `https://your-app.vercel.app/`
   - 忘れ物一覧が表示されることを確認

2. **登録画面**
   - URL: `https://your-app.vercel.app/admin/register`
   - 登録機能が動作することを確認

3. **管理ダッシュボード**
   - URL: `https://your-app.vercel.app/admin/dashboard`
   - 忘れ物一覧が表示されることを確認

4. **登録者管理**
   - URL: `https://your-app.vercel.app/admin/registrants`
   - 一括登録機能が動作することを確認

## ステップ4: QRコードの動作確認

### 4-1. QRコードの生成

1. 登録画面で忘れ物を登録
2. 登録完了後、QRコードが表示されることを確認
3. 「PDF保存」ボタンでPDFをダウンロード

### 4-2. QRコードの読み取り

1. スマートフォンでQRコードをスキャン
2. 返却画面（`https://your-app.vercel.app/return/[qr_code_uuid]`）が表示されることを確認
3. 「返却する」ボタンが表示されることを確認
4. 返却ボタンをクリックして、返却処理が正常に動作することを確認

### 4-3. 返却後の確認

1. 管理ダッシュボードで「返却済み」タブを開く
2. 返却したアイテムが「返却済み」として表示されることを確認

## トラブルシューティング

### デプロイが失敗する場合

1. **ビルドエラーの確認**
   - Vercelダッシュボードの「Deployments」タブでエラーログを確認
   - エラーメッセージに基づいて修正

2. **環境変数の確認**
   - Settings → Environment Variables で環境変数が正しく設定されているか確認
   - 特に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を確認

3. **データベーステーブルの確認**
   - SupabaseのSQL Editorで `tables.sql` と `tables_registrants.sql` が実行されているか確認

### QRコードが読み取れない場合

1. **URLの確認**
   - QRコードに含まれるURLが正しいか確認（`https://your-app.vercel.app/return/[uuid]`）
   - ローカルホストのURL（`localhost:3000`）が含まれていないか確認

2. **CORS設定の確認**
   - Supabaseの設定で、Vercelのドメインが許可されているか確認

3. **データベースの確認**
   - `lf_items` テーブルに `qr_code_uuid` が正しく保存されているか確認

### 画像が表示されない場合

1. **Supabase Storageの確認**
   - Storageバケット `lf-images` が作成されているか確認
   - Storageポリシーが正しく設定されているか確認

2. **画像URLの確認**
   - ブラウザの開発者ツール（F12）で画像URLを確認
   - 画像URLが正しく生成されているか確認

## 次のステップ

デプロイが完了し、動作確認ができたら：

1. 実際の使用環境でテスト
2. 必要に応じてカスタムドメインを設定
3. パフォーマンスの最適化

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
