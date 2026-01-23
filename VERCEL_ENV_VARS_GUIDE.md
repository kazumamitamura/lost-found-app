# Vercel環境変数設定ガイド

## 問題: 環境変数の重複エラー

エラーメッセージ：
```
A variable with the name 'SUPABASE_SERVICE_ROLE_KEY' already exists for the targets 'production', 'preview' and 'development'.
```

これは、同じ環境変数名が複数回追加されていることを示しています。

## 解決方法

### ステップ1: 重複している環境変数を削除

1. Vercelダッシュボードでプロジェクトを開く
2. **Settings** → **Environment Variables** を開く
3. `SUPABASE_SERVICE_ROLE_KEY` を検索
4. **重複しているエントリをすべて削除**（右側の削除アイコンをクリック）
5. 1つだけ残すか、すべて削除して新しく追加

### ステップ2: 必要な環境変数を追加

以下の環境変数のみを追加してください：

| Key | Value | 説明 |
|-----|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://otsvbxdfsaanpkbncxhj.supabase.co` | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Supabaseのanon公開キー |

**注意**: `SUPABASE_SERVICE_ROLE_KEY` は通常、このアプリでは不要です。削除してください。

## 環境変数の設定場所

### Vercelでの設定方法

1. **プロジェクト設定から**
   - Vercelダッシュボード → プロジェクトを選択
   - **Settings** → **Environment Variables**
   - 「Add New」をクリック
   - Key と Value を入力
   - 適用先を選択（Production, Preview, Development）

2. **デプロイ時に設定**
   - 新しいプロジェクトを作成する際
   - 「Environment Variables」セクションで設定
   - デプロイ後に Settings から編集可能

### 設定の適用先

各環境変数には以下の適用先を設定できます：

- **Production**: 本番環境（`vercel.app`ドメイン）
- **Preview**: プレビュー環境（プルリクエストなど）
- **Development**: 開発環境（`vercel dev`コマンド使用時）

通常は、すべての環境で同じ値を使用するため、3つすべてにチェックを入れます。

## 複数アプリでの環境変数管理

### 同じSupabaseプロジェクトを使用する場合

**重要**: 複数のアプリで同じSupabaseプロジェクト（Master-Portfolio-DB）を使用する場合：

1. **各アプリは独立したVercelプロジェクト**
   - 忘れ物管理システム = 1つのVercelプロジェクト
   - TODOアプリ = 別のVercelプロジェクト
   - 各プロジェクトで環境変数を個別に設定

2. **環境変数の値は同じ**
   - すべてのアプリで同じ `NEXT_PUBLIC_SUPABASE_URL` を使用
   - すべてのアプリで同じ `NEXT_PUBLIC_SUPABASE_ANON_KEY` を使用
   - これは問題ありません（同じSupabaseプロジェクトを使うため）

3. **重複の心配は不要**
   - Vercelのプロジェクトごとに環境変数は独立
   - 他のアプリの環境変数と重複することはありません
   - 各プロジェクトは独自の環境変数を持ちます

### 例: 3つのアプリがある場合

```
Vercelプロジェクト1: 忘れ物管理システム
  - NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY = xxx

Vercelプロジェクト2: TODOアプリ
  - NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co  (同じ値)
  - NEXT_PUBLIC_SUPABASE_ANON_KEY = xxx  (同じ値)

Vercelプロジェクト3: ブログアプリ
  - NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co  (同じ値)
  - NEXT_PUBLIC_SUPABASE_ANON_KEY = xxx  (同じ値)
```

**重要**: 値は同じでも、各プロジェクトで個別に設定する必要があります。

## 環境変数の取得方法

### Supabaseダッシュボードから取得

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクト「Master-Portfolio-DB」を選択
3. 左メニューから **Settings** → **API** を開く
4. 以下の情報をコピー：

   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` に設定
     - 例: `https://otsvbxdfsaanpkbncxhj.supabase.co`

   - **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定
     - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## トラブルシューティング

### エラー: "A variable with the name 'XXX' already exists"

**原因**: 同じ環境変数名が複数回追加されている

**解決方法**:
1. Settings → Environment Variables を開く
2. 重複している変数を検索
3. 重複しているエントリをすべて削除
4. 1つだけ新しく追加

### 環境変数が反映されない

**原因**: デプロイ後に環境変数を追加した場合

**解決方法**:
1. 環境変数を追加/変更後
2. 新しいデプロイを実行（Redeploy）
3. ビルドキャッシュをクリアして再デプロイ

### 他のアプリと重複する心配

**答え**: 心配不要です

- Vercelのプロジェクトごとに環境変数は独立
- 同じSupabaseプロジェクトを使う場合、値が同じでも問題ありません
- 各アプリは独自のVercelプロジェクトとして管理されます

## 推奨設定

### 忘れ物管理システムに必要な環境変数

以下の2つのみを設定してください：

```
NEXT_PUBLIC_SUPABASE_URL=https://otsvbxdfsaanpkbncxhj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**不要な環境変数**:
- `SUPABASE_SERVICE_ROLE_KEY` - このアプリでは使用しません（削除してください）

## チェックリスト

- [ ] 重複している環境変数を削除
- [ ] `NEXT_PUBLIC_SUPABASE_URL` を設定
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
- [ ] `SUPABASE_SERVICE_ROLE_KEY` を削除（不要な場合）
- [ ] すべての環境（Production, Preview, Development）に適用
- [ ] 新しいデプロイを実行
