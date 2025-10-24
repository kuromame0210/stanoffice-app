'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Topic, TopicInsert } from '@/app/types/database.types'

// トピック一覧取得
export async function getTopics(
  sortBy: 'created_at' | 'comment_count' = 'created_at',
  limit: number = 50
): Promise<Topic[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stanoffice_topics')
    .select('*')
    // 開発時: approved + test を表示、本番時: approved のみ表示
    .in('status', process.env.NODE_ENV === 'development' ? ['approved', 'test'] : ['approved'])
    .order(sortBy, { ascending: false })
    .order('id', { ascending: false }) // 安定した並び順のためIDでも並び替え
    .limit(limit)

  if (error) {
    console.error('Error fetching topics:', error)
    throw error
  }

  return data || []
}

// トピック詳細取得（コメント付き）
export async function getTopicWithComments(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stanoffice_topics')
    .select(`
      *,
      stanoffice_comments (
        id,
        body,
        author_name,
        is_anonymous,
        created_at
      )
    `)
    .eq('id', id)
    // 開発時: approved + test を表示、本番時: approved のみ表示
    .in('status', process.env.NODE_ENV === 'development' ? ['approved', 'test'] : ['approved'])
    .single()

  if (error) {
    console.error('Error fetching topic with comments:', error)
    throw error
  }

  return data
}

// トピック投稿
export async function createTopic(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const authorName = formData.get('author_name') as string
  const isAnonymous = formData.get('is_anonymous') === 'on'
  const showId = formData.get('show_id') === 'on'
  const imageUrl = formData.get('image_url') as string | null

  if (!title || !body) {
    throw new Error('タイトルと本文は必須です')
  }

  const topicData: TopicInsert = {
    title,
    body,
    author_name: isAnonymous ? null : authorName || null,
    is_anonymous: isAnonymous,
    show_id: showId,
    image_url: imageUrl,
    // 開発時はtestステータス、本番時はpendingステータス
    status: process.env.NODE_ENV === 'development' ? 'test' : 'pending',
  }

  const { data, error } = await supabase
    .from('stanoffice_topics')
    .insert(topicData)
    .select()
    .single()

  if (error) {
    console.error('Error creating topic:', error)
    throw error
  }

  revalidatePath('/')
  return data
}

// 人気トピック取得（コメント数順）
export async function getPopularTopics(
  timeframe: 'day' | 'week' = 'week',
  limit: number = 10
): Promise<Topic[]> {
  const supabase = await createClient()

  // 時間範囲の計算
  const now = new Date()
  const timeframeDate = new Date()
  if (timeframe === 'day') {
    timeframeDate.setDate(now.getDate() - 1)
  } else {
    timeframeDate.setDate(now.getDate() - 7)
  }

  const { data, error } = await supabase
    .from('stanoffice_topics')
    .select('*')
    // 開発時: approved + test を表示、本番時: approved のみ表示
    .in('status', process.env.NODE_ENV === 'development' ? ['approved', 'test'] : ['approved'])
    .gte('created_at', timeframeDate.toISOString())
    .order('comment_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching popular topics:', error)
    throw error
  }

  return data || []
}

// トピック詳細取得（単体）
export async function getTopicById(id: number): Promise<Topic | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stanoffice_topics')
    .select('*')
    .eq('id', id)
    // 開発時: approved + test を表示、本番時: approved のみ表示
    .in('status', process.env.NODE_ENV === 'development' ? ['approved', 'test'] : ['approved'])
    .single()

  if (error) {
    console.error('Error fetching topic:', error)
    return null
  }

  return data
}

// 閲覧数を増やす
export async function incrementViewCount(topicId: number) {
  const supabase = await createClient()

  // 現在のview_countを取得
  const { data: topic } = await supabase
    .from('stanoffice_topics')
    .select('view_count')
    .eq('id', topicId)
    .single()

  if (topic) {
    // view_countを+1して更新
    const { error } = await supabase
      .from('stanoffice_topics')
      .update({ view_count: topic.view_count + 1 })
      .eq('id', topicId)

    if (error) {
      console.error('Error incrementing view count:', error)
    }
  }
}
