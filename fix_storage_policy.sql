-- ============================================
-- Storage アップロードポリシーの修正
-- 認証なしでアップロード可能にする
-- バケット名: lost-images（他アプリと混同防止）
-- ============================================

-- 既存のポリシーを削除（認証必須と公開の両方）
DROP POLICY IF EXISTS "lost_images_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lost_images_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lost_images_delete_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lost_images_insert_public" ON storage.objects;
DROP POLICY IF EXISTS "lost_images_update_public" ON storage.objects;
DROP POLICY IF EXISTS "lost_images_delete_public" ON storage.objects;
-- 旧 lf_ ポリシー名も削除（移行時）
DROP POLICY IF EXISTS "lf_images_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_delete_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_insert_public" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_update_public" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_delete_public" ON storage.objects;

-- Storage ポリシー: 誰でもアップロード可能（公開アップロード）
CREATE POLICY "lost_images_insert_public" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'lost-images');

-- Storage ポリシー: 誰でも更新可能
CREATE POLICY "lost_images_update_public" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'lost-images')
    WITH CHECK (bucket_id = 'lost-images');

-- Storage ポリシー: 誰でも削除可能
CREATE POLICY "lost_images_delete_public" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'lost-images');
