# Vercelデプロイメント作成ガイド

## 現在の状況

Vercelダッシュボードで「No Results」が表示されています。これは、まだデプロイが作成されていないことを示しています。

## 解決方法

### 方法1: Git Settingsを確認（推奨）

1. **右上の三点メニュー（...）をクリック**
2. **「Git Settings」を選択**
3. 以下を確認：
   - GitHubリポジトリが正しく接続されているか
   - ブランチが `main` に設定されているか
   - 自動デプロイが有効になっているか

### 方法2: 手動でデプロイを作成

1. **右上の三点メニュー（...）をクリック**
2. **「Create Deployment」を選択**
3. 以下の設定を入力：
   - **Branch**: `main` を選択
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `./`（そのまま）
   - **Build Command**: `npm run build`（自動設定）
   - **Output Directory**: `.next`（自動設定）
4. **環境変数を設定**（まだ設定していない場合）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **「Deploy」をクリック**

### 方法3: GitHubとの接続を再設定

GitHubとの接続に問題がある場合：

1. **Settings** → **Git** を開く
2. 現在の接続を確認
3. 必要に応じて、接続を削除して再接続

## 環境変数の設定

デプロイ前に、必ず環境変数を設定してください：

1. **Settings** → **Environment Variables** を開く
2. 以下を追加：

| Key | Value | 適用先 |
|-----|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://otsvbxdfsaanpkbncxhj.supabase.co` | Production, Preview, Development すべて |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development すべて |

**重要**: `SUPABASE_SERVICE_ROLE_KEY` は削除してください（このアプリでは不要です）。

## 推奨手順

### ステップ1: Git Settingsを確認

1. 三点メニュー → **「Git Settings」** を選択
2. GitHubリポジトリが正しく接続されているか確認
3. 自動デプロイが有効になっているか確認

### ステップ2: 環境変数を設定

1. **Settings** → **Environment Variables**
2. 必要な環境変数を追加
3. 重複している `SUPABASE_SERVICE_ROLE_KEY` を削除

### ステップ3: デプロイを作成

**オプションA: 自動デプロイ（GitHub接続済みの場合）**
- GitHubにプッシュすると自動的にデプロイが作成されます
- ネットワークが復旧したら `git push origin main` を実行

**オプションB: 手動デプロイ**
1. 三点メニュー → **「Create Deployment」** を選択
2. 設定を確認して「Deploy」をクリック

## トラブルシューティング

### 「No Results」が表示される

**原因**:
- まだデプロイが作成されていない
- GitHubとの接続に問題がある
- フィルターで除外されている

**解決方法**:
1. フィルターをクリア（「Clear Filters」をクリック）
2. Git Settingsで接続を確認
3. 手動でデプロイを作成

### デプロイが失敗する

**原因**:
- 環境変数が設定されていない
- ビルドエラー

**解決方法**:
1. 環境変数が正しく設定されているか確認
2. ビルドログを確認してエラーを特定
3. 必要に応じて修正して再デプロイ

## 次のステップ

1. ✅ **Git Settingsを確認** - GitHubリポジトリが接続されているか
2. ✅ **環境変数を設定** - Settings → Environment Variables
3. ✅ **デプロイを作成** - 三点メニュー → Create Deployment または GitHubにプッシュ
