import { createClient } from './client'

const BUCKET_NAME = 'topic-images'

// 画像をSupabase Storageにアップロード（Client-side）
export async function uploadTopicImage(file: File): Promise<string> {
  const supabase = createClient()

  // ファイル名生成（タイムスタンプ + ランダム文字列）
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const fileExt = file.name.split('.').pop()
  const fileName = `${timestamp}-${randomStr}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading image:', error)
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`)
  }

  // Public URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName)

  return publicUrl
}
