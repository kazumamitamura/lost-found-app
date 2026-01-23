# 複数アプリを1つのSupabaseプロジェクトで管理する方法

## 概要

「Master-Portfolio-DB」という1つのSupabaseプロジェクトで複数のアプリケーションを管理する場合、以下の命名規則とベストプラクティスに従ってください。

## 命名規則

### 1. テーブル名の接頭辞

各アプリごとに**一意の接頭辞**を使用します。

| アプリ名 | 接頭辞 | 例 |
|---------|--------|-----|
| 忘れ物管理システム | `lf_` | `lf_items`, `lf_categories` |
| TODOアプリ | `todo_` | `todo_tasks`, `todo_users` |
| ブログアプリ | `blog_` | `blog_posts`, `blog_comments` |
| 予約システム | `booking_` | `booking_reservations`, `booking_slots` |

### 2. Storageバケット名の接頭辞

各アプリごとに異なるバケット名を使用します。

| アプリ名 | バケット名 | 用途 |
|---------|-----------|------|
| 忘れ物管理システム | `lf-images` | 忘れ物の写真 |
| TODOアプリ | `todo-attachments` | 添付ファイル |
| ブログアプリ | `blog-images` | ブログ画像 |
| 予約システム | `booking-documents` | 予約関連書類 |

### 3. RLSポリシー名の接頭辞

RLSポリシー名にも接頭辞を使用します。

```sql
-- 忘れ物管理システム
CREATE POLICY "lf_items_select_public" ON lf_items FOR SELECT USING (true);

-- TODOアプリ
CREATE POLICY "todo_tasks_select_user" ON todo_tasks FOR SELECT USING (auth.uid() = user_id);
```

## 実装例

### 新しいアプリを追加する場合

#### ステップ1: テーブル作成時の命名

```sql
-- TODOアプリのテーブル例
CREATE TABLE IF NOT EXISTS todo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID,
    completed BOOLEAN DEFAULT FALSE,
    todo_category_id UUID
);

-- インデックスも接頭辞付きで命名
CREATE INDEX IF NOT EXISTS idx_todo_tasks_user_id ON todo_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_completed ON todo_tasks(completed);
```

#### ステップ2: Storageバケットの作成

```sql
-- TODOアプリ用のバケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'todo-attachments',
    'todo-attachments',
    false, -- 認証が必要
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ポリシーも接頭辞付き
CREATE POLICY "todo_attachments_select_user" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'todo-attachments' AND auth.uid() = owner);
```

#### ステップ3: 関数名の命名

```sql
-- 関数名にも接頭辞を使用
CREATE OR REPLACE FUNCTION todo_get_user_tasks(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    completed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.title, t.completed
    FROM todo_tasks t
    WHERE t.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;
```

## ベストプラクティス

### 1. 接頭辞の選択ルール

- **短く、明確に**: 2-5文字程度
- **一意性**: 他のアプリと重複しない
- **意味が分かる**: アプリ名の略称など

### 2. ドキュメント化

各アプリのSQLファイルに、使用している接頭辞を明記：

```sql
-- ============================================
-- TODOアプリ データベース設計
-- プロジェクト: Master-Portfolio-DB
-- テーブル接頭辞: todo_
-- Storage接頭辞: todo-
-- ============================================
```

### 3. 環境変数の管理

各アプリで同じSupabase接続情報を使用しますが、アプリごとに異なる環境変数ファイルを用意：

```env
# .env.local (忘れ物管理システム)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_APP_NAME=lost-found

# .env.local (TODOアプリ)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  # 同じ
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx  # 同じ
NEXT_PUBLIC_APP_NAME=todo
```

### 4. クエリの分離

各アプリのクエリは、必ず接頭辞付きテーブルを参照：

```typescript
// ✅ 正しい例
const { data } = await supabase
  .from("lf_items")  // 接頭辞付き
  .select("*");

// ❌ 間違った例（他のアプリのテーブルを参照してしまう可能性）
const { data } = await supabase
  .from("items")  // 接頭辞なし
  .select("*");
```

## 既存アプリとの共存

### 忘れ物管理システム（lf_）との共存

現在の忘れ物管理システムは既に `lf_` 接頭辞を使用しているため、新しいアプリは異なる接頭辞を使用してください。

**例：新しいTODOアプリを追加する場合**

```sql
-- 既存: lf_items, lf_images (Storage: lf-images)
-- 新規: todo_tasks, todo_attachments (Storage: todo-attachments)
```

## トラブルシューティング

### テーブル名の衝突

**問題**: 同じテーブル名が複数のアプリで使用されている

**解決策**: 
- 接頭辞を確認
- 各アプリで一意の接頭辞を使用しているか確認

### Storageバケットの衝突

**問題**: 同じバケット名が複数のアプリで使用されている

**解決策**:
- バケット名に接頭辞を含める
- 例: `lf-images`, `todo-attachments`, `blog-images`

### RLSポリシーの競合

**問題**: ポリシー名が重複している

**解決策**:
- ポリシー名にも接頭辞を含める
- 例: `lf_items_select_public`, `todo_tasks_select_user`

## チェックリスト

新しいアプリを追加する際のチェックリスト：

- [ ] テーブル名に接頭辞を付けたか
- [ ] Storageバケット名に接頭辞を付けたか
- [ ] RLSポリシー名に接頭辞を付けたか
- [ ] インデックス名に接頭辞を付けたか
- [ ] 関数名に接頭辞を付けたか
- [ ] SQLファイルに接頭辞を明記したか
- [ ] 既存のアプリと接頭辞が重複していないか

## まとめ

1つのSupabaseプロジェクトで複数のアプリを管理する場合：

1. **接頭辞で区別**: テーブル、バケット、ポリシーなどすべてに接頭辞を使用
2. **一意性を保つ**: 各アプリで異なる接頭辞を使用
3. **ドキュメント化**: どの接頭辞を使用しているか明確に記録
4. **命名規則を統一**: チーム全体で同じ規則に従う

これにより、1つのSupabaseプロジェクトで複数のアプリを安全に管理できます。
