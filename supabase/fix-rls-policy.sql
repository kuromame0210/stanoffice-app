-- ============================================
-- RLSポリシー修正（トピック投稿エラー対応）
-- ============================================
-- エラー: new row violates row-level security policy
-- 原因: INSERT時のポリシーが厳しすぎる
-- 対応: ポリシーを修正して、誰でも投稿可能にする

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can insert topics" ON stanoffice_topics;

-- 新しいポリシーを作成（statusチェックなし）
CREATE POLICY "Anyone can insert topics"
  ON stanoffice_topics FOR INSERT
  TO public
  WITH CHECK (true);

-- 確認
SELECT * FROM pg_policies WHERE tablename = 'stanoffice_topics';
