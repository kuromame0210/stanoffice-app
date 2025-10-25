'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 // 24時間

// ログイン処理
export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD環境変数が設定されていません')
  }

  if (password !== adminPassword) {
    throw new Error('パスワードが正しくありません')
  }

  // セッションCookieを設定
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
  })

  // ログイン成功後、管理画面にリダイレクト
  redirect('/admin')
}

// ログアウト処理
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)

  // ログアウト後、ログイン画面にリダイレクト
  redirect('/admin')
}

// 認証状態チェック
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)
  return !!session
}
