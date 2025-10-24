-- ============================================
-- コメント投稿ポリシーの修正
-- ============================================
-- コメント投稿時の権限エラー (42501) を修正

-- 現在のコメント関連ポリシーを削除
DROP POLICY IF EXISTS "Anyone can view comments on approved topics" ON stanoffice_comments;
DROP POLICY IF EXISTS "Anyone can insert comments on approved topics" ON stanoffice_comments;

-- 新しいSELECTポリシーを作成（approved + test トピックのコメント閲覧可能）
CREATE POLICY "Anyone can view comments on approved and test topics"
  ON stanoffice_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stanoffice_topics
      WHERE stanoffice_topics.id = stanoffice_comments.topic_id
      AND stanoffice_topics.status IN ('approved', 'test')
    )
  );

-- 新しいINSERTポリシーを作成（approved + test トピックにコメント投稿可能）
CREATE POLICY "Anyone can insert comments on approved and test topics"
  ON stanoffice_comments FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stanoffice_topics
      WHERE stanoffice_topics.id = stanoffice_comments.topic_id
      AND stanoffice_topics.status IN ('approved', 'test')
    ) AND
    body IS NOT NULL
  );

-- 確認用クエリ
SELECT 
  'Comment Policy Check' as check_type,
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check,
  qual
FROM pg_policies 
WHERE tablename = 'stanoffice_comments'
ORDER BY cmd, policyname;

COMMIT;