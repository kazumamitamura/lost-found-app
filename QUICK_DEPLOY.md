# クイックデプロイ手順

## ステップ1: 変更をコミットしてプッシュ

```bash
# すべての変更をステージング
git add .

# コミット
git commit -m "登録者一括登録機能の簡素化と画像拡大表示機能の追加"

# GitHubにプッシュ
git push origin main
```

## ステップ2: Vercelでデプロイ確認

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト `lost-found-app` を開く
3. 「Deployments」タブで最新のデプロイを確認
4. 自動デプロイが開始されない場合は、「Redeploy」をクリック

## ステップ3: QRコードの動作確認

### 3-1. デプロイURLを確認

デプロイ完了後、Vercelが提供するURL（例: `https://lost-found-app-xxx.vercel.app`）を確認

### 3-2. QRコードの生成とテスト

1. **登録画面でアイテムを登録**
   - URL: `https://your-app.vercel.app/admin/register`
   - 写真、場所、カテゴリ、登録者名、拾得日を入力
   - 「登録する」をクリック

2. **QRコードを確認**
   - 登録完了後、QRコードが表示される
   - 「PDF保存」でPDFをダウンロード

3. **QRコードをスキャン**
   - スマートフォンでQRコードをスキャン
   - 返却画面（`https://your-app.vercel.app/return/[uuid]`）が開くことを確認
   - 「返却する」ボタンが表示されることを確認

4. **返却処理をテスト**
   - 「返却する」ボタンをクリック
   - 返却完了メッセージが表示されることを確認

5. **管理ダッシュボードで確認**
   - URL: `https://your-app.vercel.app/admin/dashboard`
   - 「返却済み」タブを開く
   - 返却したアイテムが「返却済み」として表示されることを確認

## 重要なポイント

- QRコードのURLは自動的にデプロイされたURLを使用します
- ローカルホスト（`localhost:3000`）のURLは使用されません
- デプロイ後は必ずWeb上でQRコードをテストしてください

## トラブルシューティング

### QRコードが読み取れない場合

1. **QRコードのURLを確認**
   - PDFを開いて、QRコードに含まれるURLを確認
   - `https://your-app.vercel.app/return/[uuid]` の形式になっているか確認

2. **データベースの確認**
   - Supabaseで `lf_items` テーブルを確認
   - `qr_code_uuid` が正しく保存されているか確認

3. **環境変数の確認**
   - Vercelの環境変数が正しく設定されているか確認
