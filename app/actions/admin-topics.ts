'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAuthenticated } from './admin-auth'
import { Topic } from '@/app/types/database.types'

// すべてのトピックを取得（管理画面用）
export async function getAllTopics(): Promise<Topic[]> {
  // 認証チェック
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('認証されていません')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stanoffice_topics')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all topics:', error)
    throw error
  }

  return data || []
}

// トピックの表示/非表示を切り替え
export async function toggleTopicStatus(topicId: number) {
  // 認証チェック
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('認証されていません')
  }

  const supabase = await createClient()

  // 現在のstatusを取得
  const { data: topic, error: fetchError } = await supabase
    .from('stanoffice_topics')
    .select('status')
    .eq('id', topicId)
    .single()

  if (fetchError) {
    console.error('Error fetching topic:', fetchError)
    throw fetchError
  }

  // statusを切り替え: approved ↔ rejected
  const newStatus = topic.status === 'approved' ? 'rejected' : 'approved'

  const { error: updateError } = await supabase
    .from('stanoffice_topics')
    .update({ status: newStatus })
    .eq('id', topicId)

  if (updateError) {
    console.error('Error updating topic status:', updateError)
    throw updateError
  }

  // ページを再検証（最新データを表示）
  revalidatePath('/admin')
  revalidatePath('/')

  return { success: true, newStatus }
}
