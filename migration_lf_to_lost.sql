-- ============================================
-- 既存の lf_ テーブルを lost_ にリネームするマイグレーション
-- 他アプリと混同しないよう接頭語を統一します。
-- 既に lf_items / lf_registrants を使っている場合のみ実行してください。
-- ============================================

-- テーブル名の変更
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lf_items')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lost_items') THEN
        ALTER TABLE lf_items RENAME TO lost_items;
        RAISE NOTICE 'lf_items を lost_items にリネームしました';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lf_registrants')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lost_registrants') THEN
        ALTER TABLE lf_registrants RENAME TO lost_registrants;
        RAISE NOTICE 'lf_registrants を lost_registrants にリネームしました';
    END IF;
END $$;

-- 注意: Storage バケット 'lf-images' はリネームできません。
-- 新規に 'lost-images' バケットを Supabase Dashboard の Storage で作成し、
-- 必要ならファイルを手動で移動したうえで、アプリは lost-images を参照します。
-- 既存の lf-images をそのまま使う場合は、lib/utils.ts と register の
-- バケット名を lf-images に戻すか、lost-images バケットを作成して切り替えてください。

SELECT 'リネームマイグレーションを確認しました。' AS message;
