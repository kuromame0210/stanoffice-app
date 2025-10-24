-- ============================================
-- INSERT ポリシーの修正
-- ============================================
-- 投稿時の権限エラー (42501) を修正

-- 現在のINSERTポリシーを削除
DROP POLICY IF EXISTS "Anyone can insert topics" ON stanoffice_topics;

-- 新しいINSERTポリシーを作成（pending statusで投稿可能）
CREATE POLICY "Anyone can insert topics"
  ON stanoffice_topics FOR INSERT
  TO public
  WITH CHECK (
    status IN ('pending', 'test') AND
    title IS NOT NULL AND
    body IS NOT NULL
  );

-- 確認用クエリ
SELECT 
  'INSERT Policy Check' as check_type,
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'stanoffice_topics' 
  AND cmd = 'INSERT';

COMMIT;