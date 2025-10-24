'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// トピックに投票する
export async function voteOnTopic(
  topicId: number,
  voteType: 'like' | 'dislike'
): Promise<{ success: boolean; newCount: number }> {
  const supabase = await createClient()

  try {
    // 現在のカウントを取得
    const { data: currentTopic, error: fetchError } = await supabase
      .from('stanoffice_topics')
      .select('like_count, dislike_count')
      .eq('id', topicId)
      .single()

    if (fetchError) {
      console.error('Error fetching current counts:', fetchError)
      throw fetchError
    }

    // カウントを1増やして更新
    const newCount = voteType === 'like' 
      ? (currentTopic.like_count || 0) + 1 
      : (currentTopic.dislike_count || 0) + 1

    const { error } = await supabase
      .from('stanoffice_topics')
      .update({
        [voteType === 'like' ? 'like_count' : 'dislike_count']: newCount
      })
      .eq('id', topicId)

    if (error) {
      console.error('Error updating vote count:', error)
      throw error
    }

    // 投票後のページ再読み込みを無効化（UI更新は楽観的更新で対応）
    // revalidatePath(`/topics/${topicId}`)

    return {
      success: true,
      newCount: newCount
    }
  } catch (error) {
    console.error('Vote error:', error)
    return { success: false, newCount: 0 }
  }
}

// トピックの現在の投票数を取得
export async function getTopicVoteCounts(topicId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stanoffice_topics')
    .select('like_count, dislike_count')
    .eq('id', topicId)
    .single()

  if (error) {
    console.error('Error fetching vote counts:', error)
    return { like_count: 0, dislike_count: 0 }
  }

  return data
}