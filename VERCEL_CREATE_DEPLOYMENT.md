# Vercel手動デプロイ作成ガイド

## 「Create Deployment」モーダルの使い方

### 入力フィールドの説明

「Commit or Branch Reference」フィールドには、**URLではなく、ブランチ名またはコミットハッシュ**を入力します。

### 正しい入力方法

#### 方法1: ブランチ名を入力（推奨）

入力フィールドに以下を入力：

```
main
```

これで、`main`ブランチの最新コミットからデプロイが作成されます。

#### 方法2: コミットハッシュを入力

特定のコミットからデプロイしたい場合：

```
00d0d41
```

または完全なコミットハッシュ：

```
00d0d41 Fix Vercel config: Remove invalid region selector
```

## 手順

### ステップ1: 入力フィールドをクリア

1. 入力フィールド内の `https://github.com/kazumamitamura/lost-found-app` を削除
2. フィールドを空にする

### ステップ2: ブランチ名を入力

1. 入力フィールドに `main` と入力
2. または、最新のコミットハッシュを入力

### ステップ3: デプロイを作成

1. 「Create Deployment」ボタンをクリック
2. デプロイが開始されます
3. ビルドログを確認

## 注意事項

### 環境変数の設定

デプロイ前に、必ず環境変数を設定してください：

1. **Settings** → **Environment Variables** を開く
2. 以下を設定：
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://otsvbxdfsaanpkbncxhj.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = （Supabaseから取得したキー）
   - `SUPABASE_SERVICE_ROLE_KEY` は削除（不要）

### デプロイ後の確認

1. ビルドログでエラーがないか確認
2. デプロイが成功したら、本番URLで動作確認

## トラブルシューティング

### エラー: "Invalid commit reference"

**原因**: 無効なコミットハッシュまたはブランチ名

**解決方法**:
- `main` と入力（ブランチ名）
- または、有効なコミットハッシュを入力

### デプロイが失敗する

**原因**: 環境変数が設定されていない、ビルドエラー

**解決方法**:
1. 環境変数が正しく設定されているか確認
2. ビルドログを確認してエラーを特定
