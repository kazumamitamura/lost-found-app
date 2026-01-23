-- ============================================
-- TODO管理アプリ データベース設計
-- プロジェクト: Master-Portfolio-DB
-- テーブル接頭辞: todo_
-- Storage接頭辞: todo-
-- ============================================
-- 
-- このファイルは、新しいアプリを追加する際の実践例です。
-- 実際のTODOアプリを追加する場合は、このファイルを参考にしてください。

-- ============================================
-- 1. テーブル作成
-- ============================================

-- タスクテーブル
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

-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS todo_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    color TEXT,
    user_id UUID
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_todo_tasks_user_id ON todo_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_status ON todo_tasks(status);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_category_id ON todo_tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_created_at ON todo_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todo_categories_user_id ON todo_categories(user_id);

-- ============================================
-- 2. RLS (Row Level Security) の設定
-- ============================================

ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_categories ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "todo_tasks_select_user" ON todo_tasks;
DROP POLICY IF EXISTS "todo_tasks_insert_user" ON todo_tasks;
DROP POLICY IF EXISTS "todo_tasks_update_user" ON todo_tasks;
DROP POLICY IF EXISTS "todo_tasks_delete_user" ON todo_tasks;

DROP POLICY IF EXISTS "todo_categories_select_user" ON todo_categories;
DROP POLICY IF EXISTS "todo_categories_insert_user" ON todo_categories;
DROP POLICY IF EXISTS "todo_categories_update_user" ON todo_categories;
DROP POLICY IF EXISTS "todo_categories_delete_user" ON todo_categories;

-- タスクテーブルのポリシー: ユーザーは自分のタスクのみ閲覧・操作可能
CREATE POLICY "todo_tasks_select_user" ON todo_tasks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "todo_tasks_insert_user" ON todo_tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todo_tasks_update_user" ON todo_tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todo_tasks_delete_user" ON todo_tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- カテゴリテーブルのポリシー: ユーザーは自分のカテゴリのみ閲覧・操作可能
CREATE POLICY "todo_categories_select_user" ON todo_categories
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "todo_categories_insert_user" ON todo_categories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todo_categories_update_user" ON todo_categories
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todo_categories_delete_user" ON todo_categories
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 3. Storage Bucket の作成
-- ============================================

-- 添付ファイル用バケット
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'todo-attachments',
    'todo-attachments',
    false, -- 認証が必要
    10485760, -- 10MB制限
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- 既存のStorageポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "todo_attachments_select_user" ON storage.objects;
DROP POLICY IF EXISTS "todo_attachments_insert_user" ON storage.objects;
DROP POLICY IF EXISTS "todo_attachments_update_user" ON storage.objects;
DROP POLICY IF EXISTS "todo_attachments_delete_user" ON storage.objects;

-- Storage ポリシー: ユーザーは自分のファイルのみ閲覧・操作可能
CREATE POLICY "todo_attachments_select_user" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'todo-attachments' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "todo_attachments_insert_user" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'todo-attachments' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "todo_attachments_update_user" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'todo-attachments' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'todo-attachments' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "todo_attachments_delete_user" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'todo-attachments' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================
-- 4. 便利な関数
-- ============================================

-- ユーザーのタスク数を取得
CREATE OR REPLACE FUNCTION todo_get_user_tasks_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM todo_tasks WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- 完了済みタスク数を取得
CREATE OR REPLACE FUNCTION todo_get_completed_tasks_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM todo_tasks WHERE user_id = user_uuid AND status = 'completed');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 実行完了メッセージ
-- ============================================
-- このSQLをSupabaseのSQL Editorで実行してください。
-- 実行後、Next.jsアプリの実装を開始できます。
