# Stan Office 実装計画書

## データベース構造検証

### 現状のテーブル構造
現在のデータベース構造は全機能の実装に対応可能です。

#### stanoffice_topics テーブル
- ✅ トピック投稿に必要なフィールド完備
  - `title`, `body`, `image_url`
  - `author_name`, `is_anonymous`, `show_id`, `user_id_hash`
  - `status` (pending/approved/rejected) - 承認フロー対応
  - `view_count`, `comment_count` - 統計情報

#### stanoffice_comments テーブル
- ✅ コメント投稿に必要なフィールド完備
  - `body`, `topic_id`
  - `author_name`, `is_anonymous`, `user_id_hash`

#### RLS (Row Level Security)
- ✅ 承認済みトピックのみ閲覧可能
- ✅ 匿名投稿に対応

**結論: データベース構造の変更は不要**

---

## 実装手順（優先順位順）

### Phase 1: トピック詳細ページ（基礎）
**理由**: 他の機能の土台となるため最初に実装

#### 1.1 トピック詳細ページ作成
- **ファイル**: `app/topics/[id]/page.tsx`
- **機能**:
  - トピック情報表示
  - コメント一覧表示
  - 閲覧数カウント（view_count更新）
- **使用するServer Action**:
  - `getTopicById(id)` - 新規作成
  - `getComments(topicId)` - 既存
  - `incrementViewCount(id)` - 新規作成

#### 1.2 トピックカードにリンク追加
- **ファイル**:
  - `app/components/layouts/StanTopic/index.tsx`
  - `app/components/layouts/StanPopularTopic/index.tsx`
- **実装**: `<Link href={`/topics/${topic.id}`}>` でラップ

---

### Phase 2: コメント投稿機能
**理由**: トピック詳細ページができたら次に必要な機能

#### 2.1 コメント投稿フォーム作成
- **ファイル**: `app/components/features/CommentForm/index.tsx` (新規)
- **機能**:
  - コメント本文入力
  - 名前入力（匿名チェックボックス）
  - 送信ボタン
- **使用するServer Action**:
  - `createComment(topicId, formData)` - 既存

#### 2.2 トピック詳細ページに統合
- **ファイル**: `app/topics/[id]/page.tsx`
- **実装**: CommentFormコンポーネントを追加

---

### Phase 3: トピック投稿機能
**理由**: フォーム実装パターンがコメント投稿と類似

#### 3.1 トピック投稿ページ作成
- **ファイル**: `app/topics/new/page.tsx` (新規)
- **機能**:
  - タイトル入力
  - 本文入力
  - 画像アップロード（URL入力 or Supabase Storage）
  - 名前入力（匿名チェックボックス）
  - 送信ボタン
- **使用するServer Action**:
  - `createTopic(formData)` - 新規作成

#### 3.2 「＋トピックを投稿する」ボタンにリンク
- **ファイル**: `app/components/elements/StanNewButton/index.tsx`
- **実装**: `<Link href="/topics/new">` でボタンをラップ

---

### Phase 4: タブ切り替え機能
**理由**: UI/UX向上、既存データ取得ロジック流用可能

#### 4.1 タブ状態管理の追加
- **ファイル**: `app/page.tsx`
- **実装**:
  - Client Componentに変換（use client）
  - useState でタブ状態管理（'today' | 'new'）
  - タブに応じてトピック表示を切り替え

#### 4.2 タブボタンの動作実装
- **ファイル**: `app/components/elements/StanTabButton/index.tsx`
- **実装**: onClick で親コンポーネントの状態を更新

#### 4.3 データ取得ロジック
- **今日の人気**: `getPopularTopics('day', limit)`
- **新着人気**: `getTopics('created_at', limit)` + コメント数フィルタ

---

### Phase 5: 続きを見る機能
**理由**: ページネーション・無限スクロールの基礎

#### 5.1 人気トピック一覧ページ作成
- **ファイル**: `app/topics/popular/page.tsx` (新規)
- **機能**:
  - クエリパラメータで期間指定（week/day）
  - ページネーション対応

#### 5.2 「続きを見る」ボタンにリンク
- **ファイル**: `app/components/layouts/StanPopularTopic/index.tsx`
- **実装**:
  - kindTitleから期間を判定
  - `<Link href="/topics/popular?period=week">` 等

---

### Phase 6: 画像アップロード機能
**理由**: Supabase Storage設定が必要なため最後

#### 6.1 Supabase Storage バケット作成
- **バケット名**: `topic-images`
- **設定**:
  - Public access: true
  - File size limit: 5MB
  - Allowed MIME types: image/jpeg, image/png, image/gif

#### 6.2 画像アップロードユーティリティ作成
- **ファイル**: `app/lib/supabase/storage.ts` (新規)
- **関数**:
  - `uploadTopicImage(file: File): Promise<string>` - 画像アップロード
  - ファイル名: `{timestamp}-{uuid}.{ext}`
  - 戻り値: public URL

#### 6.3 トピック投稿フォームに統合
- **ファイル**: `app/topics/new/page.tsx`
- **実装**:
  - `<input type="file" accept="image/*">`
  - プレビュー表示
  - アップロード処理追加

---

## 技術的考慮事項

### Server Components vs Client Components
- **Server Components**: データ取得、トピック詳細ページ、一覧ページ
- **Client Components**: フォーム、インタラクティブUI（タブ、ボタン）

### Server Actions の役割
- データベース操作はすべてServer Actionsで実装
- クライアント側でSupabaseクライアントは使用しない
- セキュリティ: RLSポリシーで保護

### 画像アップロード戦略
**Option 1: URL入力方式（簡単）**
- ユーザーが画像URLを入力
- 実装が簡単、すぐ動作確認可能

**Option 2: Supabase Storage（推奨）**
- ファイルアップロード機能
- Supabase Storageバケット使用
- より本格的なUX

**推奨**: まずOption 1で実装し、後でOption 2に拡張

### エラーハンドリング
- フォーム送信エラー: useFormState（React 19）を使用
- データ取得エラー: error.tsx でハンドリング
- バリデーション: Zodスキーマ（オプション）

---

## 実装タスク一覧

### Phase 1: トピック詳細ページ（基礎）
- [ ] `app/actions/topics.ts` に `getTopicById()` 追加
- [ ] `app/actions/topics.ts` に `incrementViewCount()` 追加
- [ ] `app/topics/[id]/page.tsx` 作成
- [ ] `app/components/layouts/StanTopic/index.tsx` にリンク追加
- [ ] `app/components/layouts/StanPopularTopic/index.tsx` にリンク追加

### Phase 2: コメント投稿機能
- [ ] `app/components/features/CommentForm/index.tsx` 作成
- [ ] `app/topics/[id]/page.tsx` にフォーム統合
- [ ] コメント投稿後のリダイレクト処理

### Phase 3: トピック投稿機能
- [ ] `app/actions/topics.ts` に `createTopic()` 追加
- [ ] `app/topics/new/page.tsx` 作成
- [ ] `app/components/elements/StanNewButton/index.tsx` にリンク追加

### Phase 4: タブ切り替え機能
- [ ] `app/page.tsx` をClient Componentに変換
- [ ] useState でタブ状態管理
- [ ] `app/components/elements/StanTabButton/index.tsx` の onClick 実装
- [ ] タブに応じたデータ取得ロジック

### Phase 5: 続きを見る機能
- [ ] `app/topics/popular/page.tsx` 作成
- [ ] ページネーション実装
- [ ] `app/components/layouts/StanPopularTopic/index.tsx` にリンク追加

### Phase 6: 画像アップロード機能
- [ ] Supabase Storage バケット作成（topic-images）
- [ ] `app/lib/supabase/storage.ts` 作成
- [ ] `uploadTopicImage()` 関数実装
- [ ] `app/topics/new/page.tsx` にファイル入力追加
- [ ] 画像プレビュー実装

---

## 完成後の機能一覧

✅ トピック一覧表示（最新順・人気順）
✅ トピック詳細表示
✅ コメント一覧表示
✅ トピック投稿
✅ コメント投稿
✅ タブ切り替え
✅ 続きを見る（ページネーション）
✅ 画像アップロード
✅ 匿名投稿
✅ 閲覧数カウント
✅ コメント数カウント（自動）

---

## セキュリティチェックリスト

- [x] RLS (Row Level Security) 有効化済み
- [x] 承認済みトピックのみ閲覧可能
- [x] Server Actions でデータベース操作
- [ ] XSS対策: ユーザー入力のサニタイズ
- [ ] CSRF対策: Next.js 標準機能で対応済み
- [ ] ファイルアップロード: MIME type検証
- [ ] レート制限: Supabase RLS + アプリケーションレベル（将来実装）

---

## パフォーマンス最適化

- [x] データベースインデックス作成済み
- [x] Server Components でサーバーサイドレンダリング
- [ ] 画像最適化: Next.js Image コンポーネント使用
- [ ] キャッシング: Next.js 標準機能活用
- [ ] 遅延ロード: React.lazy（必要に応じて）

---

## 次のステップ

1. Phase 1から順番に実装開始
2. 各Phaseごとに動作確認
3. エラーハンドリング追加
4. UI/UX改善
5. 本番デプロイ（Vercel）

---

**作成日**: 2025-10-02
**最終更新**: 2025-10-02
