-- ============================================
-- 登録者管理テーブル (lost_registrants)
-- 接頭語 lost_ で他アプリと混同防止
-- ============================================

-- 登録者テーブルの作成
CREATE TABLE IF NOT EXISTS lost_registrants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('教員', '職員', 'その他')),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_lost_registrants_is_active ON lost_registrants(is_active);
CREATE INDEX IF NOT EXISTS idx_lost_registrants_name ON lost_registrants(name);

-- RLS (Row Level Security) の有効化
ALTER TABLE lost_registrants ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "lost_registrants_select_public" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_insert_authenticated" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_update_authenticated" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_delete_authenticated" ON lost_registrants;

-- ポリシー: 誰でも閲覧可能（公開データ）
CREATE POLICY "lost_registrants_select_public" ON lost_registrants
    FOR SELECT
    USING (true);

-- ポリシー: 認証済みユーザーのみ挿入可能
CREATE POLICY "lost_registrants_insert_authenticated" ON lost_registrants
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ポリシー: 認証済みユーザーのみ更新可能
CREATE POLICY "lost_registrants_update_authenticated" ON lost_registrants
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ポリシー: 認証済みユーザーのみ削除可能
CREATE POLICY "lost_registrants_delete_authenticated" ON lost_registrants
    FOR DELETE
    USING (auth.role() = 'authenticated');
