-- ============================================
-- RLSポリシーの修正: 認証なしで動作可能にする
-- テーブル接頭語: lost_（他アプリと混同防止）
-- ============================================

-- lost_items テーブルのポリシー修正
-- 既存のポリシーを削除（認証必須と公開の両方）
DROP POLICY IF EXISTS "lost_items_insert_authenticated" ON lost_items;
DROP POLICY IF EXISTS "lost_items_update_authenticated" ON lost_items;
DROP POLICY IF EXISTS "lost_items_delete_authenticated" ON lost_items;
DROP POLICY IF EXISTS "lost_items_insert_public" ON lost_items;
DROP POLICY IF EXISTS "lost_items_update_public" ON lost_items;
DROP POLICY IF EXISTS "lost_items_delete_public" ON lost_items;

-- ポリシー: 誰でも挿入可能（公開登録）
CREATE POLICY "lost_items_insert_public" ON lost_items
    FOR INSERT
    WITH CHECK (true);

-- ポリシー: 誰でも更新可能（公開更新）
CREATE POLICY "lost_items_update_public" ON lost_items
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ポリシー: 誰でも削除可能（公開削除）
CREATE POLICY "lost_items_delete_public" ON lost_items
    FOR DELETE
    USING (true);

-- ============================================
-- lost_registrants テーブルのポリシー修正
-- ============================================

-- 既存のポリシーを削除（認証必須と公開の両方）
DROP POLICY IF EXISTS "lost_registrants_select_authenticated" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_insert_authenticated" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_update_authenticated" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_delete_authenticated" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_select_public" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_insert_public" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_update_public" ON lost_registrants;
DROP POLICY IF EXISTS "lost_registrants_delete_public" ON lost_registrants;

-- ポリシー: 誰でも閲覧可能
CREATE POLICY "lost_registrants_select_public" ON lost_registrants
    FOR SELECT
    USING (true);

-- ポリシー: 誰でも挿入可能
CREATE POLICY "lost_registrants_insert_public" ON lost_registrants
    FOR INSERT
    WITH CHECK (true);

-- ポリシー: 誰でも更新可能
CREATE POLICY "lost_registrants_update_public" ON lost_registrants
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ポリシー: 誰でも削除可能
CREATE POLICY "lost_registrants_delete_public" ON lost_registrants
    FOR DELETE
    USING (true);
