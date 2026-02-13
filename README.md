# 忘れ物管理システム (Lost & Found)

学校内で発生する「忘れ物」を管理し、QRコードで返却を効率化するスマホ対応アプリです。

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **UI Library**: Shadcn/UI, Tailwind CSS
- **QR Code**: react-qr-code
- **Table**: @tanstack/react-table

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを**手動で作成**し、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**重要**: `.env.local` ファイルはGitにコミットされません（`.gitignore`で除外されています）。各環境で個別に作成してください。

既存のSupabaseプロジェクト「Portfolio-Master」の接続情報を使用してください。

### 3. データベースのセットアップ

1. SupabaseのSQL Editorを開く
2. `tables.sql` の内容をコピーして実行
3. Storageバケット `lf-images` が作成され、適切なポリシーが設定されます

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

### 生徒用機能

- **トップページ (`/`)**: 保管中の忘れ物をカード形式で一覧表示
  - スマホ2列、PC4列のレスポンシブグリッド
  - 場所・カテゴリでの絞り込み検索
  - 返却済みアイテムは非表示

### 管理者・先生用機能

- **登録画面 (`/admin/register`)**: 忘れ物の登録
  - 写真撮影/アップロード
  - 場所・カテゴリ選択
  - 登録後、QRコードを自動生成・印刷可能

- **管理ダッシュボード (`/admin/dashboard`)**: 全データの管理
  - TanStack Tableによる表形式表示
  - 検索・ソート機能
  - 行単位での編集・削除
  - CSVエクスポート機能

### 返却フロー

- **返却ページ (`/return/[id]`)**: QRコード読み取り後のアクション
  - QRコードを読み取るとこのページへ遷移
  - アイテム詳細を表示
  - 「持ち主に返却する」ボタンで返却処理

## データベース設計

### テーブル: `lost_items`（忘れ物一覧）

- `id`: UUID (Primary Key)
- `created_at`: 登録日時
- `location`: 拾得場所
- `category`: カテゴリ
- `image_url`: 画像パス
- `is_returned`: 返却済みフラグ
- `returned_at`: 返却日時
- `description`: 備考
- `qr_code_uuid`: QRコード用UUID

### テーブル: `lost_registrants`（登録者・管理者）

- このアプリに登録した人（教員・職員など）を管理。ログイン可能な管理者はここにメールが登録されている必要があります。

### Storage: `lf-images`

- 公開閲覧可能
- 認証済みユーザーのみアップロード可能

## カテゴリ一覧

- スマホ・周辺機器
- 財布・ポーチ
- 運動着
- 制服
- 靴・ベルト
- 弁当箱
- バッグ
- その他

## デザイン

- **ベースカラー**: ホワイト、ライトグレー
- **メインカラー**: スカイブルー (#2563EB)
- **成功カラー**: グリーン (#16A34A)
- **警告カラー**: オレンジ

## 注意事項

- このアプリは既存のSupabaseプロジェクト「Master-Portfolio-DB」を使用します
- テーブル名には接頭辞 `lf_` が付いています（複数アプリ管理のため）
- 認証はSupabaseの認証システムを使用します（管理者機能には認証が必要）

## 複数アプリの管理

このプロジェクトは、1つのSupabaseプロジェクト（Master-Portfolio-DB）で複数のアプリを管理する設計になっています。

- **接頭辞システム**: 各アプリは一意の接頭辞を使用（例: `lf_`）
- **詳細**: `MULTI_APP_GUIDE.md` を参照
- **接頭辞レジストリ**: `app-prefix-registry.md` を参照
- **新規アプリテンプレート**: `templates/new-app-template.sql` を参照

## データベースマイグレーション

既存のテーブルに新しいカラムを追加する場合、`migration_add_columns.sql` をSupabaseのSQL Editorで実行してください。

## Vercelへのデプロイ

### 1. GitHubリポジトリの準備

```bash
git add .
git commit -m "Add migration and Vercel config"
git push origin main
```

### 2. Vercelでの設定

1. [Vercel](https://vercel.com)にログイン
2. "New Project"をクリック
3. GitHubリポジトリを選択
4. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseのプロジェクトURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseのanon key
5. "Deploy"をクリック

### 3. 環境変数の設定

Vercelのプロジェクト設定で、以下の環境変数を追加してください：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
