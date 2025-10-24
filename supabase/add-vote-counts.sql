-- ============================================
-- いいね/バッドカウント列の追加
-- ============================================
-- stanoffice_topics テーブルにいいね・バッドのカウント列を追加

-- カウント列を追加
ALTER TABLE stanoffice_topics 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dislike_count INTEGER DEFAULT 0;

-- 既存データのカウントを0で初期化（念のため）
UPDATE stanoffice_topics 
SET like_count = 0, dislike_count = 0 
WHERE like_count IS NULL OR dislike_count IS NULL;

-- インデックス追加（人気順ソート用）
CREATE INDEX IF NOT EXISTS idx_stanoffice_topics_like_count 
ON stanoffice_topics(like_count DESC);

-- 確認用クエリ
SELECT 
  'Vote Counts Check' as check_type,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'stanoffice_topics' 
  AND column_name IN ('like_count', 'dislike_count')
ORDER BY column_name;

COMMIT;