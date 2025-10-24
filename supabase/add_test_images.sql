-- ============================================
-- テスト用トピックに画像URLを追加
-- ============================================
-- 既存のテストデータに無料で使えるプレースホルダー画像を追加

-- テスト用トピックに画像URLを更新
UPDATE stanoffice_topics SET image_url = 'https://picsum.photos/400/300?random=1' WHERE title = '【開発用】最新のK-POPについて';
UPDATE stanoffice_topics SET image_url = 'https://picsum.photos/400/300?random=2' WHERE title = '【開発用】今日のランチ';
UPDATE stanoffice_topics SET image_url = 'https://picsum.photos/400/300?random=3' WHERE title = '【開発用】週末の予定';
UPDATE stanoffice_topics SET image_url = 'https://picsum.photos/400/300?random=4' WHERE title = '【開発用】おすすめの映画';
UPDATE stanoffice_topics SET image_url = 'https://picsum.photos/400/300?random=5' WHERE title = '【開発用】勉強方法について';
UPDATE stanoffice_topics SET image_url = 'https://picsum.photos/400/300?random=6' WHERE title = '【開発用】コーヒーの話';
UPDATE stanoffice_topics SET image_url = 'https://picsum.photos/400/300?random=7' WHERE title = '【開発用】読書について';
UPDATE stanoffice_topics SET image_url = 'https://picsum.photos/400/300?random=8' WHERE title = '【開発用】旅行の思い出';

-- 確認用クエリ
SELECT 
  title,
  CASE 
    WHEN image_url IS NOT NULL THEN '画像あり'
    ELSE '画像なし'
  END as image_status,
  image_url
FROM stanoffice_topics 
WHERE status = 'test' 
ORDER BY id;

-- 追加済み確認
SELECT 
  '画像付きテストトピック' as check_type,
  COUNT(*) as total_with_images
FROM stanoffice_topics 
WHERE status = 'test' AND image_url IS NOT NULL;

COMMIT;