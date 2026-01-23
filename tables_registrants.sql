-- ============================================
-- 登録者管理テーブル (lf_registrants)
-- ============================================

-- 登録者テーブルの作成
CREATE TABLE IF NOT EXISTS lf_registrants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('教員', '職員', 'その他')),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_lf_registrants_is_active ON lf_registrants(is_active);
CREATE INDEX IF NOT EXISTS idx_lf_registrants_name ON lf_registrants(name);

-- RLS (Row Level Security) の有効化
ALTER TABLE lf_registrants ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "lf_registrants_select_public" ON lf_registrants;
DROP POLICY IF EXISTS "lf_registrants_insert_authenticated" ON lf_registrants;
DROP POLICY IF EXISTS "lf_registrants_update_authenticated" ON lf_registrants;
DROP POLICY IF EXISTS "lf_registrants_delete_authenticated" ON lf_registrants;

-- ポリシー: 誰でも閲覧可能（公開データ）
CREATE POLICY "lf_registrants_select_public" ON lf_registrants
    FOR SELECT
    USING (true);

-- ポリシー: 認証済みユーザーのみ挿入可能
CREATE POLICY "lf_registrants_insert_authenticated" ON lf_registrants
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ポリシー: 認証済みユーザーのみ更新可能
CREATE POLICY "lf_registrants_update_authenticated" ON lf_registrants
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ポリシー: 認証済みユーザーのみ削除可能
CREATE POLICY "lf_registrants_delete_authenticated" ON lf_registrants
    FOR DELETE
    USING (auth.role() = 'authenticated');
