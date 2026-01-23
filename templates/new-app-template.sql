-- ============================================
-- [アプリ名] データベース設計
-- プロジェクト: Master-Portfolio-DB
-- テーブル接頭辞: [prefix]_
-- Storage接頭辞: [prefix]-
-- ============================================
-- 
-- 使用方法:
-- 1. [アプリ名] を実際のアプリ名に置き換え
-- 2. [prefix] を一意の接頭辞に置き換え（例: todo_, blog_）
-- 3. app-prefix-registry.md で接頭辞が使用可能か確認
-- 4. このファイルをコピーして使用

-- ============================================
-- 1. テーブル作成
-- ============================================

-- メインテーブル例
CREATE TABLE IF NOT EXISTS [prefix]_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- ここにアプリ固有のカラムを追加
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID,
    status TEXT DEFAULT 'active'
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_[prefix]_items_user_id ON [prefix]_items(user_id);
CREATE INDEX IF NOT EXISTS idx_[prefix]_items_status ON [prefix]_items(status);
CREATE INDEX IF NOT EXISTS idx_[prefix]_items_created_at ON [prefix]_items(created_at DESC);

-- ============================================
-- 2. RLS (Row Level Security) の設定
-- ============================================

ALTER TABLE [prefix]_items ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "[prefix]_items_select_public" ON [prefix]_items;
DROP POLICY IF EXISTS "[prefix]_items_insert_authenticated" ON [prefix]_items;
DROP POLICY IF EXISTS "[prefix]_items_update_authenticated" ON [prefix]_items;
DROP POLICY IF EXISTS "[prefix]_items_delete_authenticated" ON [prefix]_items;

-- ポリシー: 誰でも閲覧可能（必要に応じて変更）
CREATE POLICY "[prefix]_items_select_public" ON [prefix]_items
    FOR SELECT
    USING (true);

-- ポリシー: 認証済みユーザーのみ挿入可能
CREATE POLICY "[prefix]_items_insert_authenticated" ON [prefix]_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ポリシー: 認証済みユーザーのみ更新可能
CREATE POLICY "[prefix]_items_update_authenticated" ON [prefix]_items
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ポリシー: 認証済みユーザーのみ削除可能
CREATE POLICY "[prefix]_items_delete_authenticated" ON [prefix]_items
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- 3. Storage Bucket の作成
-- ============================================

-- Bucket作成（既に存在する場合はスキップ）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    '[prefix]-images',  -- バケット名
    '[prefix]-images',
    true, -- 公開アクセス可能（必要に応じて変更）
    5242880, -- 5MB制限（必要に応じて変更）
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- 既存のStorageポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "[prefix]_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "[prefix]_images_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "[prefix]_images_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "[prefix]_images_delete_authenticated" ON storage.objects;

-- Storage ポリシー: 誰でも閲覧可能
CREATE POLICY "[prefix]_images_select_public" ON storage.objects
    FOR SELECT
    USING (bucket_id = '[prefix]-images');

-- Storage ポリシー: 認証済みユーザーのみアップロード可能
CREATE POLICY "[prefix]_images_insert_authenticated" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = '[prefix]-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage ポリシー: 認証済みユーザーのみ更新可能
CREATE POLICY "[prefix]_images_update_authenticated" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = '[prefix]-images' 
        AND auth.role() = 'authenticated'
    )
    WITH CHECK (
        bucket_id = '[prefix]-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage ポリシー: 認証済みユーザーのみ削除可能
CREATE POLICY "[prefix]_images_delete_authenticated" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = '[prefix]-images' 
        AND auth.role() = 'authenticated'
    );

-- ============================================
-- 4. 便利な関数（オプション）
-- ============================================

-- 例: アイテム数を取得する関数
CREATE OR REPLACE FUNCTION [prefix]_get_items_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM [prefix]_items);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 実行完了メッセージ
-- ============================================
-- このSQLをSupabaseのSQL Editorで実行してください。
-- 実行後、Next.jsアプリの実装を開始できます。
