-- ============================================
-- Stan Office Database Setup
-- ============================================
-- このSQLファイルをSupabase SQL Editorで実行してください
-- 既存のデータベースに安全に追加されます

-- ============================================
-- 事前チェック: テーブルが既に存在する場合は削除
-- ============================================
-- 注意: 既存データがある場合は削除されます
-- 初回実行時のみ必要です

DROP TABLE IF EXISTS stanoffice_comments CASCADE;
DROP TABLE IF EXISTS stanoffice_topics CASCADE;

-- 既存の関数も削除（競合防止）
DROP FUNCTION IF EXISTS update_stanoffice_topic_comment_count() CASCADE;

-- ============================================
-- 1. 共通関数作成
-- ============================================

-- updated_at自動更新関数（既存の場合は上書き）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. stanoffice_topics テーブル作成
-- ============================================

CREATE TABLE IF NOT EXISTS stanoffice_topics (
  -- プライマリキー
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- トピック情報
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,

  -- 投稿者情報
  author_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  show_id BOOLEAN DEFAULT FALSE,
  user_id_hash TEXT,

  -- 統計情報
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- 承認ステータス
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. stanoffice_topics インデックス作成
-- ============================================

-- 既存のインデックスがある場合はスキップ
DO $$
BEGIN
  -- ステータスでの検索用
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stanoffice_topics_status'
  ) THEN
    CREATE INDEX idx_stanoffice_topics_status ON stanoffice_topics(status);
  END IF;

  -- 作成日時降順での検索用（新着順）
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stanoffice_topics_created_at'
  ) THEN
    CREATE INDEX idx_stanoffice_topics_created_at ON stanoffice_topics(created_at DESC);
  END IF;

  -- コメント数降順での検索用（人気順）
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stanoffice_topics_comment_count'
  ) THEN
    CREATE INDEX idx_stanoffice_topics_comment_count ON stanoffice_topics(comment_count DESC);
  END IF;

  -- ステータス + 作成日時での複合検索用
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stanoffice_topics_status_created'
  ) THEN
    CREATE INDEX idx_stanoffice_topics_status_created ON stanoffice_topics(status, created_at DESC);
  END IF;

  -- フルテキスト検索用（英語設定を使用）
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stanoffice_topics_search'
  ) THEN
    CREATE INDEX idx_stanoffice_topics_search ON stanoffice_topics
      USING GIN (to_tsvector('english', title || ' ' || body));
  END IF;
END
$$;

-- ============================================
-- 4. stanoffice_topics トリガー作成
-- ============================================

-- 既存のトリガーを削除してから作成
DROP TRIGGER IF EXISTS update_stanoffice_topics_updated_at ON stanoffice_topics;

-- updated_at自動更新トリガー
CREATE TRIGGER update_stanoffice_topics_updated_at
  BEFORE UPDATE ON stanoffice_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. stanoffice_comments テーブル作成
-- ============================================

CREATE TABLE IF NOT EXISTS stanoffice_comments (
  -- プライマリキー
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- 外部キー（トピックID）
  topic_id BIGINT NOT NULL REFERENCES stanoffice_topics(id) ON DELETE CASCADE,

  -- コメント情報
  body TEXT NOT NULL,

  -- 投稿者情報
  author_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  user_id_hash TEXT,

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. stanoffice_comments インデックス作成
-- ============================================

-- 既存のインデックスがある場合はスキップ
DO $$
BEGIN
  -- トピックIDでの検索用
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stanoffice_comments_topic_id'
  ) THEN
    CREATE INDEX idx_stanoffice_comments_topic_id ON stanoffice_comments(topic_id);
  END IF;

  -- 作成日時昇順での検索用（古い順）
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stanoffice_comments_created_at'
  ) THEN
    CREATE INDEX idx_stanoffice_comments_created_at ON stanoffice_comments(created_at ASC);
  END IF;

  -- トピックID + 作成日時での複合検索用
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stanoffice_comments_topic_created'
  ) THEN
    CREATE INDEX idx_stanoffice_comments_topic_created ON stanoffice_comments(topic_id, created_at ASC);
  END IF;
END
$$;

-- ============================================
-- 7. stanoffice_comments トリガー作成
-- ============================================

-- 既存のトリガーを削除してから作成
DROP TRIGGER IF EXISTS update_stanoffice_comments_updated_at ON stanoffice_comments;

-- updated_at自動更新トリガー
CREATE TRIGGER update_stanoffice_comments_updated_at
  BEFORE UPDATE ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. コメント数自動更新関数
-- ============================================

-- コメント追加/削除時にトピックのコメント数を自動更新
CREATE OR REPLACE FUNCTION update_stanoffice_topic_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- コメント追加時、トピックのコメント数を +1
    UPDATE stanoffice_topics
    SET comment_count = comment_count + 1
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- コメント削除時、トピックのコメント数を -1
    UPDATE stanoffice_topics
    SET comment_count = comment_count - 1
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. コメント数自動更新トリガー
-- ============================================

-- 既存のトリガーを削除してから作成
DROP TRIGGER IF EXISTS update_stanoffice_comment_count_on_insert ON stanoffice_comments;
DROP TRIGGER IF EXISTS update_stanoffice_comment_count_on_delete ON stanoffice_comments;

-- コメント追加時のトリガー
CREATE TRIGGER update_stanoffice_comment_count_on_insert
  AFTER INSERT ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_stanoffice_topic_comment_count();

-- コメント削除時のトリガー
CREATE TRIGGER update_stanoffice_comment_count_on_delete
  AFTER DELETE ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_stanoffice_topic_comment_count();

-- ============================================
-- 10. Row Level Security (RLS) 設定
-- ============================================

-- RLS有効化
ALTER TABLE stanoffice_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stanoffice_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 11. RLSポリシー: stanoffice_topics
-- ============================================

-- 既存のポリシーを削除してから作成
DROP POLICY IF EXISTS "Anyone can view approved topics" ON stanoffice_topics;
DROP POLICY IF EXISTS "Anyone can insert topics" ON stanoffice_topics;

-- 承認済みトピックは全員が閲覧可能
CREATE POLICY "Anyone can view approved topics"
  ON stanoffice_topics FOR SELECT
  USING (status = 'approved');

-- 誰でもトピックを投稿可能（承認待ちステータス）
CREATE POLICY "Anyone can insert topics"
  ON stanoffice_topics FOR INSERT
  WITH CHECK (status = 'pending');

-- ============================================
-- 12. RLSポリシー: stanoffice_comments
-- ============================================

-- 既存のポリシーを削除してから作成
DROP POLICY IF EXISTS "Anyone can view comments on approved topics" ON stanoffice_comments;
DROP POLICY IF EXISTS "Anyone can insert comments on approved topics" ON stanoffice_comments;

-- 承認済みトピックのコメントは全員が閲覧可能
CREATE POLICY "Anyone can view comments on approved topics"
  ON stanoffice_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stanoffice_topics
      WHERE stanoffice_topics.id = stanoffice_comments.topic_id
      AND stanoffice_topics.status = 'approved'
    )
  );

-- 承認済みトピックには誰でもコメント可能
CREATE POLICY "Anyone can insert comments on approved topics"
  ON stanoffice_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stanoffice_topics
      WHERE stanoffice_topics.id = stanoffice_comments.topic_id
      AND stanoffice_topics.status = 'approved'
    )
  );

-- ============================================
-- 13. テストデータ投入（オプション）
-- ============================================
-- 注意: 既にデータがある場合は重複エラーになる可能性があります
-- 初回セットアップ時のみ実行してください

-- テスト用トピック
INSERT INTO stanoffice_topics (title, body, author_name, is_anonymous, status) VALUES
  ('テストトピック1', 'これはテストトピックです。コメントをお願いします！', '匿名', TRUE, 'approved'),
  ('テストトピック2', '皆さんはどう思いますか？', '太郎', FALSE, 'approved'),
  ('テストトピック3', 'この話題について語りましょう', NULL, TRUE, 'approved'),
  ('韓国ドラマについて語ろう', '最近ハマっている韓国ドラマについて教えてください！', '花子', FALSE, 'approved'),
  ('おすすめのカフェ', '東京でおすすめのカフェを教えてください', NULL, TRUE, 'approved')
ON CONFLICT DO NOTHING;

-- テスト用コメント
INSERT INTO stanoffice_comments (topic_id, body, author_name, is_anonymous) VALUES
  (1, '興味深いトピックですね！', '花子', FALSE),
  (1, '私もそう思います', NULL, TRUE),
  (2, 'とても参考になりました', '次郎', FALSE),
  (2, '同じ意見です', NULL, TRUE),
  (4, '「愛の不時着」が面白かったです', '次郎', FALSE),
  (4, 'Netflixで見れますよ', NULL, TRUE),
  (5, '渋谷のカフェがおすすめです', '三郎', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- セットアップ完了
-- ============================================
-- 以下のコマンドで動作確認してください:
--
-- テーブル確認:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_name LIKE 'stanoffice_%';
--
-- トピック一覧取得:
-- SELECT * FROM stanoffice_topics WHERE status = 'approved';
--
-- トピック詳細（コメント付き）:
-- SELECT
--   t.*,
--   json_agg(c.*) as comments
-- FROM stanoffice_topics t
-- LEFT JOIN stanoffice_comments c ON c.topic_id = t.id
-- WHERE t.id = 1
-- GROUP BY t.id;
