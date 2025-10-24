-- ============================================
-- よりリアルなテスト画像URLを追加
-- ============================================
-- 各トピックのジャンルに合った画像を設定

-- K-POP関連の画像
UPDATE stanoffice_topics 
SET image_url = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop' 
WHERE title = '【開発用】最新のK-POPについて';

-- 食べ物関連の画像
UPDATE stanoffice_topics 
SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop' 
WHERE title = '【開発用】今日のランチ';

-- アウトドア/レジャー関連の画像
UPDATE stanoffice_topics 
SET image_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' 
WHERE title = '【開発用】週末の予定';

-- 映画関連の画像
UPDATE stanoffice_topics 
SET image_url = 'https://images.unsplash.com/photo-1489599217765-733fb5cc4267?w=400&h=300&fit=crop' 
WHERE title = '【開発用】おすすめの映画';

-- 勉強/プログラミング関連の画像
UPDATE stanoffice_topics 
SET image_url = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop' 
WHERE title = '【開発用】勉強方法について';

-- コーヒー関連の画像
UPDATE stanoffice_topics 
SET image_url = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop' 
WHERE title = '【開発用】コーヒーの話';

-- 読書関連の画像
UPDATE stanoffice_topics 
SET image_url = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop' 
WHERE title = '【開発用】読書について';

-- 旅行関連の画像
UPDATE stanoffice_topics 
SET image_url = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop' 
WHERE title = '【開発用】旅行の思い出';

-- 確認用クエリ
SELECT 
  title,
  '✅ 画像設定済み' as status,
  LEFT(image_url, 50) || '...' as image_preview
FROM stanoffice_topics 
WHERE status = 'test' AND image_url IS NOT NULL
ORDER BY id;

COMMIT;