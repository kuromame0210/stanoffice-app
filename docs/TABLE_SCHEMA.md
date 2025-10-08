# データベーステーブル構造

## テーブル一覧

1. **stanoffice_topics** - トピック情報
2. **stanoffice_comments** - コメント情報

---

## 1. stanoffice_topics テーブル

トピック（投稿）の情報を格納するテーブル

### テーブル定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| **id** | BIGINT | NO | AUTO | トピックID（主キー、自動採番） |
| **title** | TEXT | NO | - | トピックタイトル |
| **body** | TEXT | NO | - | トピック本文 |
| **image_url** | TEXT | YES | NULL | トップ画像URL（Supabase Storage） |
| **author_name** | TEXT | YES | NULL | 投稿者名（匿名時はNULL） |
| **is_anonymous** | BOOLEAN | NO | FALSE | 匿名投稿フラグ |
| **show_id** | BOOLEAN | NO | FALSE | ID表示フラグ（なりすまし防止） |
| **user_id_hash** | TEXT | YES | NULL | ユーザー識別用ハッシュ（IPベース等） |
| **view_count** | INTEGER | NO | 0 | 閲覧数 |
| **comment_count** | INTEGER | NO | 0 | コメント数（自動更新） |
| **status** | TEXT | NO | 'pending' | 承認ステータス（pending/approved/rejected） |
| **created_at** | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| **updated_at** | TIMESTAMPTZ | NO | NOW() | 更新日時（自動更新） |

### インデックス

```sql
-- ステータスでの検索用
CREATE INDEX idx_stanoffice_topics_status ON stanoffice_topics(status);

-- 作成日時降順での検索用（新着順）
CREATE INDEX idx_stanoffice_topics_created_at ON stanoffice_topics(created_at DESC);

-- コメント数降順での検索用（人気順）
CREATE INDEX idx_stanoffice_topics_comment_count ON stanoffice_topics(comment_count DESC);

-- ステータス + 作成日時での複合検索用
CREATE INDEX idx_stanoffice_topics_status_created ON stanoffice_topics(status, created_at DESC);

-- フルテキスト検索用
CREATE INDEX idx_stanoffice_topics_search ON stanoffice_topics USING GIN (to_tsvector('japanese', title || ' ' || body));
```

### 制約

```sql
-- ステータスの制約（pending, approved, rejected のみ）
CHECK (status IN ('pending', 'approved', 'rejected'))
```

### トリガー

**1. updated_at 自動更新**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stanoffice_topics_updated_at
  BEFORE UPDATE ON stanoffice_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 作成SQL

```sql
CREATE TABLE stanoffice_topics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  author_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  show_id BOOLEAN DEFAULT FALSE,
  user_id_hash TEXT,
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_stanoffice_topics_status ON stanoffice_topics(status);
CREATE INDEX idx_stanoffice_topics_created_at ON stanoffice_topics(created_at DESC);
CREATE INDEX idx_stanoffice_topics_comment_count ON stanoffice_topics(comment_count DESC);
CREATE INDEX idx_stanoffice_topics_status_created ON stanoffice_topics(status, created_at DESC);
CREATE INDEX idx_stanoffice_topics_search ON stanoffice_topics USING GIN (to_tsvector('japanese', title || ' ' || body));

-- 自動更新トリガー
CREATE TRIGGER update_stanoffice_topics_updated_at
  BEFORE UPDATE ON stanoffice_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 2. stanoffice_comments テーブル

トピックに対するコメントを格納するテーブル

### テーブル定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| **id** | BIGINT | NO | AUTO | コメントID（主キー、自動採番） |
| **topic_id** | BIGINT | NO | - | 所属トピックID（外部キー） |
| **body** | TEXT | NO | - | コメント本文 |
| **author_name** | TEXT | YES | NULL | 投稿者名（匿名時はNULL） |
| **is_anonymous** | BOOLEAN | NO | FALSE | 匿名投稿フラグ |
| **user_id_hash** | TEXT | YES | NULL | ユーザー識別用ハッシュ |
| **created_at** | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| **updated_at** | TIMESTAMPTZ | NO | NOW() | 更新日時（自動更新） |

### インデックス

```sql
-- トピックIDでの検索用
CREATE INDEX idx_stanoffice_comments_topic_id ON stanoffice_comments(topic_id);

-- 作成日時昇順での検索用（古い順）
CREATE INDEX idx_stanoffice_comments_created_at ON stanoffice_comments(created_at ASC);

-- トピックID + 作成日時での複合検索用
CREATE INDEX idx_stanoffice_comments_topic_created ON stanoffice_comments(topic_id, created_at ASC);
```

### 外部キー制約

```sql
-- topic_id は stanoffice_topics テーブルの id を参照
-- トピック削除時にコメントも自動削除（CASCADE）
FOREIGN KEY (topic_id) REFERENCES stanoffice_topics(id) ON DELETE CASCADE
```

### トリガー

**1. updated_at 自動更新**
```sql
CREATE TRIGGER update_stanoffice_comments_updated_at
  BEFORE UPDATE ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**2. コメント数自動更新（stanoffice_topics.comment_count）**
```sql
CREATE OR REPLACE FUNCTION update_stanoffice_topic_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- コメント追加時、トピックのコメント数を +1
    UPDATE stanoffice_topics SET comment_count = comment_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- コメント削除時、トピックのコメント数を -1
    UPDATE stanoffice_topics SET comment_count = comment_count - 1 WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stanoffice_comment_count_on_insert
  AFTER INSERT ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_stanoffice_topic_comment_count();

CREATE TRIGGER update_stanoffice_comment_count_on_delete
  AFTER DELETE ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_stanoffice_topic_comment_count();
```

### 作成SQL

```sql
CREATE TABLE stanoffice_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  topic_id BIGINT NOT NULL REFERENCES stanoffice_topics(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  user_id_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_stanoffice_comments_topic_id ON stanoffice_comments(topic_id);
CREATE INDEX idx_stanoffice_comments_created_at ON stanoffice_comments(created_at ASC);
CREATE INDEX idx_stanoffice_comments_topic_created ON stanoffice_comments(topic_id, created_at ASC);

-- 自動更新トリガー
CREATE TRIGGER update_stanoffice_comments_updated_at
  BEFORE UPDATE ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメント数自動更新トリガー
CREATE TRIGGER update_stanoffice_comment_count_on_insert
  AFTER INSERT ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_stanoffice_topic_comment_count();

CREATE TRIGGER update_stanoffice_comment_count_on_delete
  AFTER DELETE ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_stanoffice_topic_comment_count();
```

---

## ER図

```
┌─────────────────────────────────────┐
│      stanoffice_topics              │
├─────────────────────────────────────┤
│ id (PK)                 BIGINT      │
│ title                   TEXT        │
│ body                    TEXT        │
│ image_url               TEXT?       │
│ author_name             TEXT?       │
│ is_anonymous            BOOLEAN     │
│ show_id                 BOOLEAN     │
│ user_id_hash            TEXT?       │
│ view_count              INTEGER     │
│ comment_count           INTEGER     │◄─┐
│ status                  TEXT        │  │ 自動更新
│ created_at              TIMESTAMPTZ │  │
│ updated_at              TIMESTAMPTZ │  │
└─────────────────────────────────────┘  │
              │                           │
              │ 1                         │
              │                           │
              │ N                         │
              ▼                           │
┌─────────────────────────────────────┐  │
│     stanoffice_comments             │  │
├─────────────────────────────────────┤  │
│ id (PK)                 BIGINT      │  │
│ topic_id (FK)           BIGINT      │──┘
│ body                    TEXT        │
│ author_name             TEXT?       │
│ is_anonymous            BOOLEAN     │
│ user_id_hash            TEXT?       │
│ created_at              TIMESTAMPTZ │
│ updated_at              TIMESTAMPTZ │
└─────────────────────────────────────┘
```

---

## データ例

### stanoffice_topics テーブル

```sql
INSERT INTO stanoffice_topics (title, body, author_name, is_anonymous, status) VALUES
  ('テストトピック1', 'これはテストトピックです。', '匿名', TRUE, 'approved'),
  ('韓国ドラマについて語ろう', '最近ハマっている韓国ドラマについて教えてください！', '花子', FALSE, 'approved'),
  ('おすすめのカフェ', '東京でおすすめのカフェを教えてください', NULL, TRUE, 'approved');
```

### stanoffice_comments テーブル

```sql
INSERT INTO stanoffice_comments (topic_id, body, author_name, is_anonymous) VALUES
  (1, '興味深いトピックですね！', '太郎', FALSE),
  (1, '私もそう思います', NULL, TRUE),
  (2, '「愛の不時着」が面白かったです', '次郎', FALSE),
  (2, 'Netflix で見れますよ', NULL, TRUE);
```

---

## Row Level Security (RLS) ポリシー

### stanoffice_topics テーブル

```sql
-- RLS有効化
ALTER TABLE stanoffice_topics ENABLE ROW LEVEL SECURITY;

-- 1. 承認済みトピックは全員が閲覧可能
CREATE POLICY "Anyone can view approved topics"
  ON stanoffice_topics FOR SELECT
  USING (status = 'approved');

-- 2. 誰でもトピックを投稿可能（承認待ちステータス）
CREATE POLICY "Anyone can insert topics"
  ON stanoffice_topics FOR INSERT
  WITH CHECK (status = 'pending');
```

### stanoffice_comments テーブル

```sql
-- RLS有効化
ALTER TABLE stanoffice_comments ENABLE ROW LEVEL SECURITY;

-- 1. 承認済みトピックのコメントは全員が閲覧可能
CREATE POLICY "Anyone can view comments on approved topics"
  ON stanoffice_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stanoffice_topics
      WHERE stanoffice_topics.id = stanoffice_comments.topic_id
      AND stanoffice_topics.status = 'approved'
    )
  );

-- 2. 承認済みトピックには誰でもコメント可能
CREATE POLICY "Anyone can insert comments on approved topics"
  ON stanoffice_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stanoffice_topics
      WHERE stanoffice_topics.id = stanoffice_comments.topic_id
      AND stanoffice_topics.status = 'approved'
    )
  );
```

---

## TypeScript型定義

```typescript
// app/types/database.types.ts

export interface Topic {
  id: number
  title: string
  body: string
  image_url: string | null
  author_name: string | null
  is_anonymous: boolean
  show_id: boolean
  user_id_hash: string | null
  view_count: number
  comment_count: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  topic_id: number
  body: string
  author_name: string | null
  is_anonymous: boolean
  user_id_hash: string | null
  created_at: string
  updated_at: string
}

export interface TopicInsert {
  title: string
  body: string
  image_url?: string | null
  author_name?: string | null
  is_anonymous?: boolean
  show_id?: boolean
  user_id_hash?: string | null
  status?: 'pending' | 'approved' | 'rejected'
}

export interface CommentInsert {
  topic_id: number
  body: string
  author_name?: string | null
  is_anonymous?: boolean
  user_id_hash?: string | null
}
```

---

## セットアップ手順

### 1. Supabase SQL Editorで実行

1. Supabaseダッシュボード > SQL Editor を開く
2. 以下のSQLを順番に実行:

```sql
-- 1. 共通関数作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. topics テーブル作成
CREATE TABLE topics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  author_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  show_id BOOLEAN DEFAULT FALSE,
  user_id_hash TEXT,
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. topics インデックス作成
CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_topics_created_at ON topics(created_at DESC);
CREATE INDEX idx_topics_comment_count ON topics(comment_count DESC);
CREATE INDEX idx_topics_status_created ON topics(status, created_at DESC);

-- 4. topics トリガー作成
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. comments テーブル作成
CREATE TABLE comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  topic_id BIGINT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  user_id_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. comments インデックス作成
CREATE INDEX idx_comments_topic_id ON comments(topic_id);
CREATE INDEX idx_comments_created_at ON comments(created_at ASC);
CREATE INDEX idx_comments_topic_created ON comments(topic_id, created_at ASC);

-- 7. comments トリガー作成
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. コメント数自動更新関数
CREATE OR REPLACE FUNCTION update_stanoffice_topic_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stanoffice_topics SET comment_count = comment_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stanoffice_topics SET comment_count = comment_count - 1 WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. コメント数自動更新トリガー
CREATE TRIGGER update_stanoffice_comment_count_on_insert
  AFTER INSERT ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_stanoffice_topic_comment_count();

CREATE TRIGGER update_stanoffice_comment_count_on_delete
  AFTER DELETE ON stanoffice_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_stanoffice_topic_comment_count();

-- 10. RLSポリシー設定
ALTER TABLE stanoffice_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stanoffice_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved topics"
  ON stanoffice_topics FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Anyone can insert topics"
  ON stanoffice_topics FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "Anyone can view comments on approved topics"
  ON stanoffice_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stanoffice_topics
      WHERE stanoffice_topics.id = stanoffice_comments.topic_id
      AND stanoffice_topics.status = 'approved'
    )
  );

CREATE POLICY "Anyone can insert comments on approved topics"
  ON stanoffice_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stanoffice_topics
      WHERE stanoffice_topics.id = stanoffice_comments.topic_id
      AND stanoffice_topics.status = 'approved'
    )
  );

-- 11. テストデータ投入
INSERT INTO stanoffice_topics (title, body, author_name, is_anonymous, status) VALUES
  ('テストトピック1', 'これはテストトピックです。コメントをお願いします！', '匿名', TRUE, 'approved'),
  ('テストトピック2', '皆さんはどう思いますか？', '太郎', FALSE, 'approved'),
  ('テストトピック3', 'この話題について語りましょう', NULL, TRUE, 'approved');

INSERT INTO stanoffice_comments (topic_id, body, author_name, is_anonymous) VALUES
  (1, '興味深いトピックですね！', '花子', FALSE),
  (1, '私もそう思います', NULL, TRUE),
  (2, 'とても参考になりました', '次郎', FALSE);
```

### 2. 動作確認

```sql
-- トピック一覧取得
SELECT * FROM stanoffice_topics WHERE status = 'approved';

-- トピック詳細（コメント付き）
SELECT
  t.*,
  json_agg(c.*) as comments
FROM stanoffice_topics t
LEFT JOIN stanoffice_comments c ON c.topic_id = t.id
WHERE t.id = 1
GROUP BY t.id;
```

---

## 参考

- Supabaseドキュメント: https://supabase.com/docs
- PostgreSQL日本語マニュアル: https://www.postgresql.jp/document/
