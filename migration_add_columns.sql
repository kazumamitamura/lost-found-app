-- ============================================
-- 既存テーブルにカラムを追加するマイグレーション
-- テーブル名: lost_items（接頭語 lost_）
-- このSQLをSupabaseのSQL Editorで実行してください
-- ============================================

-- 登録者名（拾得者）カラムの追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_items' 
        AND column_name = 'registrant_name'
    ) THEN
        ALTER TABLE lost_items ADD COLUMN registrant_name TEXT;
        RAISE NOTICE 'registrant_nameカラムを追加しました';
    ELSE
        RAISE NOTICE 'registrant_nameカラムは既に存在します';
    END IF;
END $$;

-- 拾得日カラムの追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_items' 
        AND column_name = 'found_date'
    ) THEN
        ALTER TABLE lost_items ADD COLUMN found_date DATE;
        RAISE NOTICE 'found_dateカラムを追加しました';
    ELSE
        RAISE NOTICE 'found_dateカラムは既に存在します';
    END IF;
END $$;

-- 完了メッセージ
SELECT 'マイグレーションが完了しました。' AS message;
