-- ============================================
-- Storage アップロードポリシーの修正
-- 認証なしでアップロード可能にする
-- ============================================

-- 既存の認証必須ポリシーを削除
DROP POLICY IF EXISTS "lf_images_insert_authenticated" ON storage.objects;

-- Storage ポリシー: 誰でもアップロード可能（公開アップロード）
CREATE POLICY "lf_images_insert_public" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'lf-images');

-- 既存の更新・削除ポリシーも公開に変更（必要に応じて）
DROP POLICY IF EXISTS "lf_images_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_delete_authenticated" ON storage.objects;

-- Storage ポリシー: 誰でも更新可能（必要に応じて）
CREATE POLICY "lf_images_update_public" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'lf-images')
    WITH CHECK (bucket_id = 'lf-images');

-- Storage ポリシー: 誰でも削除可能（必要に応じて）
CREATE POLICY "lf_images_delete_public" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'lf-images');
