-- ============================================
-- test ステータス追加とテストデータ挿入
-- ============================================
-- 既存データベースに対して実行するための追加SQL
-- 実行コマンド例: psql -d your_database < add_test_status.sql

-- CHECK制約を一時的に削除
ALTER TABLE stanoffice_topics DROP CONSTRAINT IF EXISTS stanoffice_topics_status_check;

-- 新しいCHECK制約を追加 (test ステータスを含む)
ALTER TABLE stanoffice_topics 
ADD CONSTRAINT stanoffice_topics_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'test'));

-- RLSポリシーを更新してtestステータスも表示可能にする
DROP POLICY IF EXISTS "Anyone can view approved topics" ON stanoffice_topics;

-- 承認済み + テストデータは全員が閲覧可能
CREATE POLICY "Anyone can view approved and test topics"
  ON stanoffice_topics FOR SELECT
  USING (status IN ('approved', 'test'));

-- 開発用テストデータを挿入
-- 既に同じデータが存在する場合は重複エラーを避けるため、事前にチェック
DO $$
BEGIN
  -- 【開発用】プレフィックスのトピックが存在しない場合のみ挿入
  IF NOT EXISTS (SELECT 1 FROM stanoffice_topics WHERE title LIKE '【開発用】%') THEN
    INSERT INTO stanoffice_topics (title, body, author_name, is_anonymous, status) VALUES
      ('【開発用】最新のK-POPについて', 'NewJeansの新曲どう思いますか？', 'K-POPファン', FALSE, 'test'),
      ('【開発用】今日のランチ', '渋谷で美味しいランチ食べました！', NULL, TRUE, 'test'),
      ('【開発用】週末の予定', 'みなさんの週末の過ごし方を教えてください', '週末族', FALSE, 'test'),
      ('【開発用】おすすめの映画', '最近見た映画でおすすめを教えて！', NULL, TRUE, 'test'),
      ('【開発用】勉強方法について', 'プログラミングの効率的な学習方法は？', 'エンジニア志望', FALSE, 'test'),
      ('【開発用】コーヒーの話', 'お気に入りのコーヒー豆を教えてください', 'カフェ好き', FALSE, 'test'),
      ('【開発用】読書について', '最近読んだ本で面白かったものは？', NULL, TRUE, 'test'),
      ('【開発用】旅行の思い出', '今年行って良かった場所を共有しませんか', '旅行好き', FALSE, 'test');
    
    RAISE NOTICE 'テストデータを8件挿入しました';
  ELSE
    RAISE NOTICE '【開発用】データは既に存在します';
  END IF;
END $$;

-- 確認用クエリ
SELECT 
  'テーブル確認' as check_type,
  COUNT(*) as total_topics,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_topics,
  COUNT(CASE WHEN status = 'test' THEN 1 END) as test_topics,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_topics
FROM stanoffice_topics;

-- 新しく追加されたテスト用トピックを表示
SELECT id, title, status, created_at 
FROM stanoffice_topics 
WHERE status = 'test' 
ORDER BY created_at DESC;

COMMIT;