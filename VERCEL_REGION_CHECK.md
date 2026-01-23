# Vercelリージョン設定の確認

## 現在の設定

「Function Region」で「Tokyo, Japan (Northeast) - hnd1」が選択されています。これは**有効なリージョン**です。

## エラーが続く場合の確認事項

### 1. Build and Deploymentセクションを確認

「Function Region」とは別に、デプロイメント全体のリージョン設定がある可能性があります：

1. 左サイドバーで **「Build and Deployment」** をクリック
2. 「Region」または「Deployment Region」という項目を探す
3. `nrt1` が設定されている場合、変更してください

### 2. vercel.jsonを確認

プロジェクトルートの `vercel.json` に `regions` が含まれていないか確認：

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**重要**: `regions` フィールドが含まれていないことを確認してください。

### 3. デプロイを再試行

設定を確認・変更した後：

1. 「Save」ボタンをクリック（変更した場合）
2. 「Deployments」タブに戻る
3. 三点メニュー（...）→ 「Create Deployment」
4. 入力フィールドに `main` と入力
5. 「Create Deployment」をクリック

## 現在の設定の確認

- ✅ Function Region: `hnd1` (Tokyo, Japan) - **有効**
- ⚠️ デプロイメント全体のリージョン設定を確認する必要がある可能性

## 推奨手順

1. **「Build and Deployment」セクションを確認**
   - 左サイドバーで「Build and Deployment」をクリック
   - 「Region」設定を確認

2. **設定を保存**
   - 変更した場合は「Save」をクリック

3. **デプロイを再試行**
   - 「Deployments」タブで新しいデプロイを作成

## 有効なリージョンコード

- `hnd1` - Tokyo, Japan (Northeast) ✅ 現在選択中
- `iad1` - Washington, D.C., USA (East)
- `sfo1` - San Francisco, USA (West)
- `syd1` - Sydney, Australia
- `sin1` - Singapore

**無効**: `nrt1` ❌
