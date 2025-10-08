'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Comment, CommentInsert } from '@/app/types/database.types'

// コメント一覧取得
export async function getComments(topicId: number): Promise<Comment[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stanoffice_comments')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    throw error
  }

  return data || []
}

// コメント投稿
export async function createComment(topicId: number, formData: FormData) {
  const supabase = await createClient()

  const body = formData.get('body') as string
  const authorName = formData.get('author_name') as string
  const isAnonymous = formData.get('is_anonymous') === 'on'

  if (!body) {
    throw new Error('コメント本文は必須です')
  }

  const commentData: CommentInsert = {
    topic_id: topicId,
    body,
    author_name: isAnonymous ? null : authorName || null,
    is_anonymous: isAnonymous,
  }

  const { data, error } = await supabase
    .from('stanoffice_comments')
    .insert(commentData)
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    throw error
  }

  // トピック詳細ページをリフレッシュ
  revalidatePath(`/topics/${topicId}`)

  return data
}

// コメント削除
export async function deleteComment(commentId: number, topicId: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('stanoffice_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    throw error
  }

  // トピック詳細ページをリフレッシュ
  revalidatePath(`/topics/${topicId}`)
}
