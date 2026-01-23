# 新しいアプリを追加する手順

このガイドでは、Master-Portfolio-DBプロジェクトに新しいアプリを追加する手順を説明します。

## 📋 事前準備

1. `app-prefix-registry.md` を確認して、使用可能な接頭辞を確認
2. 新しいアプリの名前と目的を明確にする
3. 必要なテーブルと機能を設計する

## 🚀 ステップバイステップ手順

### ステップ1: 接頭辞の選択と登録

#### 1-1. 接頭辞を選択

- **短く、明確に**: 2-5文字程度
- **一意性**: 既存のアプリと重複しない
- **意味が分かる**: アプリ名の略称

**例:**
- TODOアプリ → `todo_`
- ブログアプリ → `blog_`
- 予約システム → `booking_`

#### 1-2. 接頭辞レジストリを更新

`app-prefix-registry.md` を開き、新しいアプリを追加：

```markdown
| アプリ名 | 接頭辞 | テーブル例 | Storageバケット | 作成日 | 備考 |
|---------|--------|----------|----------------|--------|------|
| 忘れ物管理システム | `lf_` | `lf_items` | `lf-images` | 2026-01-23 | Lost & Found |
| TODOアプリ | `todo_` | `todo_tasks` | `todo-attachments` | 2026-01-23 | 新規追加 |
```

### ステップ2: SQLファイルの作成

#### 2-1. テンプレートをコピー

```bash
# プロジェクトルートで実行
cp templates/new-app-template.sql apps/todo-app/tables.sql
```

または、手動で：
1. `templates/new-app-template.sql` を開く
2. 内容をコピー
3. 新しいファイル `apps/[アプリ名]/tables.sql` を作成
4. 内容を貼り付け

#### 2-2. プレースホルダーを置き換え

以下の文字列を実際の値に置き換えます：

| プレースホルダー | 置き換え内容 | 例 |
|----------------|------------|-----|
| `[アプリ名]` | アプリの正式名称 | `TODO管理アプリ` |
| `[prefix]` | 選択した接頭辞 | `todo` |

**置き換え例（TODOアプリの場合）:**

```sql
-- 置き換え前
CREATE TABLE IF NOT EXISTS [prefix]_items (

-- 置き換え後
CREATE TABLE IF NOT EXISTS todo_tasks (
```

**一括置き換えのコツ:**
- エディタの「検索と置換」機能を使用
- `[prefix]` → `todo` に一括置換
- `[prefix]-` → `todo-` に一括置換（Storageバケット名用）

#### 2-3. テーブル構造をカスタマイズ

アプリの要件に合わせてテーブル構造を修正：

```sql
-- 例: TODOアプリのタスクテーブル
CREATE TABLE IF NOT EXISTS todo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    category_id UUID
);
```

### ステップ3: SupabaseでSQLを実行

#### 3-1. Supabaseダッシュボードを開く

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. 「Master-Portfolio-DB」プロジェクトを選択
3. 左メニューから「SQL Editor」をクリック

#### 3-2. SQLを実行

1. 作成した `tables.sql` の内容をコピー
2. SQL Editorに貼り付け
3. 「Run」ボタンをクリック
4. エラーがないか確認

**実行確認:**
- テーブルが作成されたか確認（Table Editorで確認）
- Storageバケットが作成されたか確認（Storageで確認）
- RLSポリシーが設定されたか確認

### ステップ4: Next.jsプロジェクトの作成

#### 4-1. 新しいNext.jsプロジェクトを作成

```bash
# プロジェクトルートの親ディレクトリで実行
cd "C:\Users\PC_User\Desktop\アプリ"

# Next.jsプロジェクトを作成
npx create-next-app@latest todo-app --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes

# プロジェクトディレクトリに移動
cd todo-app
```

#### 4-2. 依存関係のインストール

```bash
npm install @supabase/supabase-js
# その他、必要なパッケージをインストール
```

#### 4-3. 環境変数の設定

`.env.local` ファイルを作成：

```env
# 既存のSupabaseプロジェクトを使用
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_PREFIX=todo
```

**重要**: 同じSupabaseプロジェクトの接続情報を使用します。

#### 4-4. Supabaseクライアントの設定

`lib/supabase.ts` を作成（既存のアプリと同じ設定）：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

#### 4-5. 型定義の作成

`lib/types.ts` を作成：

```typescript
// TODOアプリの例
export type TodoTask = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  user_id: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  category_id: string | null;
};

export type TodoTaskInsert = Omit<TodoTask, 'id' | 'created_at' | 'updated_at'>;
export type TodoTaskUpdate = Partial<Pick<TodoTask, 'title' | 'description' | 'status' | 'priority' | 'due_date'>>;
```

**重要**: テーブル名は接頭辞付きで指定：

```typescript
// ✅ 正しい例
const { data } = await supabase
  .from("todo_tasks")  // 接頭辞付き
  .select("*");

// ❌ 間違った例
const { data } = await supabase
  .from("tasks")  // 接頭辞なし（他のアプリと衝突する可能性）
  .select("*");
```

### ステップ5: アプリの実装

#### 5-1. 基本的なページ構造を作成

```
app/
  ├── page.tsx          # トップページ
  ├── layout.tsx       # レイアウト
  └── globals.css      # グローバルスタイル
```

#### 5-2. データ取得の実装

```typescript
// app/page.tsx の例
import { supabase } from "@/lib/supabase";
import { TodoTask } from "@/lib/types";

async function getTasks(): Promise<TodoTask[]> {
  const { data, error } = await supabase
    .from("todo_tasks")  // 接頭辞付きテーブル名
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data || [];
}
```

### ステップ6: 動作確認

#### 6-1. 開発サーバーを起動

```bash
npm run dev
```

#### 6-2. 動作確認チェックリスト

- [ ] アプリが正常に起動する
- [ ] データベースからデータを取得できる
- [ ] データの作成（INSERT）ができる
- [ ] データの更新（UPDATE）ができる
- [ ] データの削除（DELETE）ができる
- [ ] Storageへの画像アップロードができる（必要な場合）
- [ ] RLSポリシーが正しく動作する

### ステップ7: ドキュメントの更新

#### 7-1. README.md を作成

新しいアプリのREADME.mdを作成：

```markdown
# TODO管理アプリ

## 概要
[アプリの説明]

## 技術スタック
- Next.js 15
- TypeScript
- Supabase
- Tailwind CSS

## セットアップ
[セットアップ手順]

## データベース
- 接頭辞: `todo_`
- テーブル: `todo_tasks`, `todo_categories`
- Storage: `todo-attachments`
```

#### 7-2. メインプロジェクトのREADMEを更新（必要に応じて）

## 📝 チェックリスト

新しいアプリを追加する際の完全なチェックリスト：

### 準備段階
- [ ] アプリの目的と機能を明確にした
- [ ] 必要なテーブル構造を設計した
- [ ] 接頭辞を選択した（既存のものと重複しない）
- [ ] `app-prefix-registry.md` を更新した

### データベース
- [ ] `templates/new-app-template.sql` をコピーした
- [ ] プレースホルダーを実際の値に置き換えた
- [ ] テーブル構造をカスタマイズした
- [ ] SupabaseでSQLを実行した
- [ ] テーブルが正しく作成されたことを確認した
- [ ] Storageバケットが作成されたことを確認した
- [ ] RLSポリシーが設定されたことを確認した

### Next.jsアプリ
- [ ] Next.jsプロジェクトを作成した
- [ ] 依存関係をインストールした
- [ ] `.env.local` を設定した（既存のSupabase接続情報を使用）
- [ ] Supabaseクライアントを設定した
- [ ] 型定義を作成した（接頭辞付きテーブル名を使用）
- [ ] 基本的なページを実装した
- [ ] データ取得・作成・更新・削除が動作することを確認した

### ドキュメント
- [ ] アプリのREADME.mdを作成した
- [ ] 接頭辞レジストリを更新した

## 🎯 実践例: TODOアプリを追加する場合

### 1. 接頭辞の選択
- 接頭辞: `todo_`
- Storage: `todo-attachments`

### 2. SQLファイルの作成

```sql
-- apps/todo-app/tables.sql
CREATE TABLE IF NOT EXISTS todo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID,
    status TEXT DEFAULT 'pending',
    completed BOOLEAN DEFAULT FALSE
);

-- Storageバケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'todo-attachments',
    'todo-attachments',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;
```

### 3. Next.jsアプリでの使用

```typescript
// データ取得
const { data } = await supabase
  .from("todo_tasks")  // 接頭辞付き
  .select("*");

// データ作成
const { data } = await supabase
  .from("todo_tasks")
  .insert({ title: "新しいタスク", status: "pending" });

// Storage使用
const { data } = await supabase.storage
  .from("todo-attachments")  // 接頭辞付きバケット名
  .upload("file.pdf", file);
```

## ⚠️ 注意事項

1. **接頭辞の一意性**: 必ず既存のアプリと重複しない接頭辞を使用
2. **テーブル名の統一**: すべてのクエリで接頭辞付きテーブル名を使用
3. **Storageバケット名**: ハイフン区切りで接頭辞を使用（例: `todo-attachments`）
4. **RLSポリシー**: アプリごとに適切なセキュリティポリシーを設定
5. **環境変数**: 同じSupabaseプロジェクトを使用するため、接続情報は同じ

## 🆘 トラブルシューティング

### エラー: "relation does not exist"
→ テーブル名に接頭辞が付いているか確認
→ SupabaseでSQLが正しく実行されたか確認

### エラー: "bucket does not exist"
→ Storageバケット名に接頭辞が付いているか確認
→ SupabaseのStorageでバケットが作成されたか確認

### データが表示されない
→ RLSポリシーが正しく設定されているか確認
→ クエリで正しいテーブル名（接頭辞付き）を使用しているか確認

## 📚 参考資料

- `MULTI_APP_GUIDE.md` - 複数アプリ管理の詳細ガイド
- `app-prefix-registry.md` - 接頭辞レジストリ
- `templates/new-app-template.sql` - SQLテンプレート

---

これで、Master-Portfolio-DBプロジェクトに新しいアプリを安全に追加できます！
