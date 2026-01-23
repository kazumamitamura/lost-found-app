-- ============================================
-- RLSポリシーの修正: 認証なしで動作可能にする
-- ============================================

-- lf_items テーブルのポリシー修正
-- 既存の認証必須ポリシーを削除
DROP POLICY IF EXISTS "lf_items_insert_authenticated" ON lf_items;
DROP POLICY IF EXISTS "lf_items_update_authenticated" ON lf_items;
DROP POLICY IF EXISTS "lf_items_delete_authenticated" ON lf_items;

-- ポリシー: 誰でも挿入可能（公開登録）
CREATE POLICY "lf_items_insert_public" ON lf_items
    FOR INSERT
    WITH CHECK (true);

-- ポリシー: 誰でも更新可能（公開更新）
CREATE POLICY "lf_items_update_public" ON lf_items
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ポリシー: 誰でも削除可能（公開削除）
CREATE POLICY "lf_items_delete_public" ON lf_items
    FOR DELETE
    USING (true);

-- ============================================
-- lf_registrants テーブルのポリシー修正
-- ============================================

-- 既存の認証必須ポリシーを削除
DROP POLICY IF EXISTS "lf_registrants_select_authenticated" ON lf_registrants;
DROP POLICY IF EXISTS "lf_registrants_insert_authenticated" ON lf_registrants;
DROP POLICY IF EXISTS "lf_registrants_update_authenticated" ON lf_registrants;
DROP POLICY IF EXISTS "lf_registrants_delete_authenticated" ON lf_registrants;

-- ポリシー: 誰でも閲覧可能
CREATE POLICY "lf_registrants_select_public" ON lf_registrants
    FOR SELECT
    USING (true);

-- ポリシー: 誰でも挿入可能
CREATE POLICY "lf_registrants_insert_public" ON lf_registrants
    FOR INSERT
    WITH CHECK (true);

-- ポリシー: 誰でも更新可能
CREATE POLICY "lf_registrants_update_public" ON lf_registrants
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ポリシー: 誰でも削除可能
CREATE POLICY "lf_registrants_delete_public" ON lf_registrants
    FOR DELETE
    USING (true);
