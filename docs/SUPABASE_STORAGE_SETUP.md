# Supabase Storage セットアップガイド

## ⚠️ 重要：バケットが作成されていません

現在、画像アップロードで以下のエラーが発生しています：
```
Error [StorageApiError]: Bucket not found
```

このエラーは `topic-images` バケットが作成されていないために発生します。
**以下の手順に従って、必ずバケットを作成してください。**

## 手順

### 方法1：SQL実行（推奨・簡単）

1. https://supabase.com にアクセス
2. プロジェクト（ogtcktojdarzuigwrnkj）を開く
3. 左サイドバーから「SQL Editor」をクリック
4. 「New query」をクリック
5. `supabase/storage-setup.sql` の内容をコピー＆ペースト
6. 「Run」をクリック

これで完了です！

### 方法2：GUIで作成

1. https://supabase.com にアクセス
2. ログインして、プロジェクト（ogtcktojdarzuigwrnkj）を開く
3. 左サイドバーから「Storage」をクリック
4. 「New bucket」または「Create a new bucket」ボタンをクリック
5. 以下の設定でバケットを作成：
   - **Name**: `topic-images` （正確にこの名前で入力）
   - **Public bucket**: ✅ **必ずチェックを入れる**（重要！）
   - その他の設定はデフォルトでOK

### 3. バケットポリシーを設定
作成したバケット（topic-images）をクリックし、「Policies」タブで以下のポリシーを追加：

#### アップロードポリシー
```sql
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'topic-images');
```

#### 閲覧ポリシー（既にpublicバケットなので不要ですが、念のため）
```sql
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'topic-images');
```

### 4. 動作確認
1. アプリケーションを起動: `npm run dev`
2. 「＋トピックを投稿する」をクリック
3. 画像ファイルを選択してアップロード
4. 投稿後、トピック詳細ページで画像が表示されることを確認

## トラブルシューティング

### 画像がアップロードできない
- バケット名が `topic-images` であることを確認
- バケットが **Public** に設定されていることを確認
- ファイルサイズが5MB以下であることを確認
- 対応画像形式（JPEG, PNG, GIF, WebP）であることを確認

### 画像が表示されない
- ブラウザの開発者ツールでネットワークエラーを確認
- Supabase Storageの「Files」タブでファイルがアップロードされているか確認
- Public URLが正しく生成されているか確認

## 既存のURL入力方式との違い

### 現在の実装（Supabase Storage）
- ✅ ファイルアップロード機能
- ✅ 画像プレビュー表示
- ✅ 自動ファイル名生成
- ✅ MIME type検証
- ✅ ファイルサイズ制限

### 以前のURL入力方式
- 外部URLを直接入力
- プレビューなし
- バリデーションなし

## バケット容量について
- Supabase無料プランの場合、1GBまで
- 必要に応じてファイルサイズ制限や古い画像の削除を検討

---

**作成日**: 2025-10-02
