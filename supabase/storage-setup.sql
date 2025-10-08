-- ============================================
-- Supabase Storage バケット作成SQL
-- ============================================
-- このSQLファイルをSupabase SQL Editorで実行してください

-- ============================================
-- 1. topic-images バケット作成
-- ============================================

-- 既存のバケットを削除（必要な場合のみ）
DELETE FROM storage.buckets WHERE id = 'topic-images';

-- topic-images バケットを作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'topic-images',
  'topic-images',
  true, -- Public bucket
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================
-- 2. ストレージポリシー作成
-- ============================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete own images" ON storage.objects;

-- アップロードポリシー（誰でも画像をアップロード可能）
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'topic-images');

-- 閲覧ポリシー（誰でも画像を閲覧可能）
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'topic-images');

-- 削除ポリシー（誰でも削除可能 - 必要に応じて制限を追加）
CREATE POLICY "Anyone can delete own images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'topic-images');

-- ============================================
-- 完了
-- ============================================
-- バケット作成完了！
--
-- 確認コマンド:
-- SELECT * FROM storage.buckets WHERE id = 'topic-images';
--
-- ポリシー確認:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
