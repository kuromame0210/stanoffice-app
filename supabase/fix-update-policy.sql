-- ============================================
-- UPDATEポリシーの追加（いいね/バッドカウント更新用）
-- ============================================

-- いいね/バッドカウントの更新を許可するUPDATEポリシーを作成
CREATE POLICY "Anyone can update vote counts"
  ON stanoffice_topics FOR UPDATE
  TO public
  USING (status IN ('approved', 'test'))
  WITH CHECK (status IN ('approved', 'test'));

-- 確認用クエリ
SELECT 
  'UPDATE Policy Check' as check_type,
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check,
  qual
FROM pg_policies 
WHERE tablename = 'stanoffice_topics' 
  AND cmd = 'UPDATE'
ORDER BY policyname;

COMMIT;