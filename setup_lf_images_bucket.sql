-- ============================================
-- 既存の lf-images バケットをアプリに連携する
-- Supabase SQL Editor でこのファイルを実行してください
-- ============================================
-- このSQLは以下を行います：
-- 1. バケットが無い場合のみ lf-images を作成（既にある場合はスキップ）
-- 2. 既存バケットの許可ファイル形式を幅広く更新（PNG等が保存されない場合の対処）
-- 3. lf-images 用の Storage RLS ポリシーを設定（閲覧・アップロード・更新・削除）
-- ============================================

-- 許可する画像 MIME タイプ（幅広く対応）
-- jpeg, jpg, png, gif, webp, bmp, ico, svg, heic など
DO $$
DECLARE
  mimes text[] := ARRAY[
    'image/jpeg', 'image/jpg', 'image/pjpeg',
    'image/png', 'image/x-png',
    'image/gif', 'image/webp', 'image/bmp', 'image/x-ms-bmp',
    'image/x-icon', 'image/vnd.microsoft.icon',
    'image/svg+xml', 'image/heic', 'image/heif'
  ];
BEGIN
  -- 1. バケットが存在しない場合のみ作成
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('lf-images', 'lf-images', true, 10485760, mimes)
  ON CONFLICT (id) DO NOTHING;

  -- 2. 既存バケットの許可形式を更新（PNG 等が保存されない場合に実行）
  UPDATE storage.buckets
  SET allowed_mime_types = mimes,
      file_size_limit = 10485760
  WHERE id = 'lf-images';
END $$;

-- 2. 既存の lf-images 関連ポリシーを削除（重複防止）
DROP POLICY IF EXISTS "lf_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_insert_public" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_update_public" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_delete_public" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lf_images_delete_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "lost_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "lost_images_insert_public" ON storage.objects;
DROP POLICY IF EXISTS "lost_images_update_public" ON storage.objects;
DROP POLICY IF EXISTS "lost_images_delete_public" ON storage.objects;

-- 3. 誰でも画像を閲覧可能（一覧・詳細・返却ページで表示するため）
CREATE POLICY "lf_images_select_public" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'lf-images');

-- 4. 誰でもアップロード可能（忘れ物登録画面から写真をアップロードするため）
CREATE POLICY "lf_images_insert_public" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'lf-images');

-- 5. 誰でも更新可能（必要に応じて上書き）
CREATE POLICY "lf_images_update_public" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'lf-images')
    WITH CHECK (bucket_id = 'lf-images');

-- 6. 誰でも削除可能（管理画面から画像削除する場合）
CREATE POLICY "lf_images_delete_public" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'lf-images');

-- 実行後、Supabase Dashboard の Storage で「lf-images」が表示され、
-- アプリからアップロード・表示ができる状態になります。
