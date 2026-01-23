# Vercelリージョン設定の場所

## リージョン設定の確認方法

### ステップ1: Build and Deploymentセクションを開く

1. Vercelダッシュボードでプロジェクトを開く
2. 左サイドバーで **「Build and Deployment」** をクリック
3. このセクション内に「Region」設定があります

### ステップ2: Region設定を確認

「Build and Deployment」セクション内で以下を確認：

1. **「Region」** という項目を探す
2. ドロップダウンまたは選択肢が表示されます
3. `nrt1` が選択されている場合：
   - **「Default」** または **「Auto」** を選択
   - または、有効なリージョンを選択

### もし「Region」が見つからない場合

Vercelのバージョンによっては、リージョン設定が表示されない場合があります。その場合：

1. **「Build and Output Settings」** セクションを確認
2. または、**「Advanced」** セクションを確認
3. それでも見つからない場合、リージョン設定は不要です（Vercelが自動選択）

## 代替方法: vercel.jsonで確認

`vercel.json` ファイルに `regions` が含まれていないか確認：

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**重要**: `regions` フィールドが含まれていないことを確認してください。

## エラーが続く場合

もし「Region」設定が見つからず、エラーが続く場合：

1. **プロジェクトを削除して再作成**（最終手段）
2. または、Vercelサポートに問い合わせ

## 推奨手順

1. ✅ 左サイドバーで **「Build and Deployment」** をクリック
2. ✅ 「Region」セクションを探す
3. ✅ 「Default」または「Auto」に設定
4. ✅ 保存してデプロイを再試行
