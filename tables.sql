-- ============================================
-- 忘れ物管理システム (Lost & Found) データベース設計
-- プロジェクト: Portfolio-Master
-- テーブル接頭辞: lost_（他アプリと混同防止）
-- ============================================

-- 1. 忘れ物テーブル (lost_items)
CREATE TABLE IF NOT EXISTS lost_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'スマホ・周辺機器',
        '財布・ポーチ',
        '運動着',
        '制服',
        '靴・ベルト',
        '弁当箱',
        'バッグ',
        'その他'
    )),
    image_url TEXT,
    is_returned BOOLEAN DEFAULT FALSE,
    returned_at TIMESTAMP WITH TIME ZONE,
    description TEXT,
    qr_code_uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    registrant_name TEXT, -- 登録者名（拾得者）
    found_date DATE -- 拾得日（手動入力可能）
);

-- 既存のテーブルにカラムを追加（既にテーブルが存在する場合）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_items' AND column_name = 'registrant_name') THEN
        ALTER TABLE lost_items ADD COLUMN registrant_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lost_items' AND column_name = 'found_date') THEN
        ALTER TABLE lost_items ADD COLUMN found_date DATE;
    END IF;
END $$;

-- インデックスの作成（検索・フィルタリングの高速化）
CREATE INDEX IF NOT EXISTS idx_lost_items_is_returned ON lost_items(is_returned);
CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_items_location ON lost_items(location);
CREATE INDEX IF NOT EXISTS idx_lost_items_created_at ON lost_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_items_qr_code_uuid ON lost_items(qr_code_uuid);

-- RLS (Row Level Security) の有効化
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "lost_items_select_public" ON lost_items;
DROP POLICY IF EXISTS "lost_items_insert_authenticated" ON lost_items;
DROP POLICY IF EXISTS "lost_items_update_authenticated" ON lost_items;
DROP POLICY IF EXISTS "lost_items_delete_authenticated" ON lost_items;

-- ポリシー: 誰でも閲覧可能（公開データ）
CREATE POLICY "lost_items_select_public" ON lost_items
    FOR SELECT
    USING (true);

-- ポリシー: 認証済みユーザーのみ挿入可能
CREATE POLICY "lost_items_insert_authenticated" ON lost_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ポリシー: 認証済みユーザーのみ更新可能
CREATE POLICY "lost_items_update_authenticated" ON lost_items
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ポリシー: 認証済みユーザーのみ削除可能
CREATE POLICY "lost_items_delete_authenticated" ON lost_items
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- 2. Storage Bucket の作成
-- ============================================

-- Bucket作成（既に存在する場合はスキップ）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'lf-images',
    'lf-images',
    true, -- 公開アクセス可能
    5242880, -- 5MB制限
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- 既存のStorageポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "lf_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_delete_authenticated" ON storage.objects;

-- Storage ポリシー: 誰でも閲覧可能
CREATE POLICY "lf_images_select_public" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'lf-images');

-- Storage ポリシー: 認証済みユーザーのみアップロード可能
CREATE POLICY "lf_images_insert_authenticated" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'lf-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage ポリシー: 認証済みユーザーのみ更新可能
CREATE POLICY "lf_images_update_authenticated" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'lf-images' 
        AND auth.role() = 'authenticated'
    )
    WITH CHECK (
        bucket_id = 'lf-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage ポリシー: 認証済みユーザーのみ削除可能
CREATE POLICY "lf_images_delete_authenticated" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'lf-images' 
        AND auth.role() = 'authenticated'
    );

-- ============================================
-- 3. 便利な関数・ビュー（オプション）
-- ============================================

-- 返却済みアイテム数を取得する関数
CREATE OR REPLACE FUNCTION lost_get_returned_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM lost_items WHERE is_returned = true);
END;
$$ LANGUAGE plpgsql;

-- 保管中アイテム数を取得する関数
CREATE OR REPLACE FUNCTION lost_get_stored_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM lost_items WHERE is_returned = false);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 実行完了メッセージ
-- ============================================
-- このSQLをSupabaseのSQL Editorで実行してください。
-- 実行後、Next.jsアプリの実装を開始できます。
