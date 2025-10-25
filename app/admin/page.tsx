import { isAuthenticated, login, logout } from '@/app/actions/admin-auth'
import { getAllTopics, toggleTopicStatus } from '@/app/actions/admin-topics'
import { redirect } from 'next/navigation'
import './style.css'

// ログインフォームコンポーネント
function LoginForm() {
  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1 className="admin-login-title">Stan Office 管理画面</h1>
        <form action={login} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoFocus
              className="form-input"
            />
          </div>
          <button type="submit" className="admin-login-button">
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}

// トピック切り替えボタンコンポーネント
function ToggleButton({ topicId, currentStatus }: { topicId: number; currentStatus: string }) {
  const toggleAction = async () => {
    'use server'
    await toggleTopicStatus(topicId)
  }

  return (
    <form action={toggleAction}>
      <button
        type="submit"
        className={`admin-toggle-button ${
          currentStatus === 'approved' ? 'approved' : 'rejected'
        }`}
      >
        {currentStatus === 'approved' ? '非表示にする' : '表示する'}
      </button>
    </form>
  )
}

// 管理画面メインコンポーネント
export default async function AdminPage() {
  const authenticated = await isAuthenticated()

  // 未認証の場合はログインフォームを表示
  if (!authenticated) {
    return <LoginForm />
  }

  // 認証済みの場合はトピック一覧を表示
  const topics = await getAllTopics()

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Stan Office 管理画面</h1>
        <form action={logout}>
          <button type="submit" className="admin-logout-button">
            ログアウト
          </button>
        </form>
      </header>

      <main className="admin-main">
        <h2>投稿一覧 ({topics.length}件)</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>タイトル</th>
                <th>作成日時</th>
                <th>コメント数</th>
                <th>閲覧数</th>
                <th>ステータス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id}>
                  <td>{topic.id}</td>
                  <td className="admin-title-cell">
                    <a href={`/topics/${topic.id}`} target="_blank" rel="noopener noreferrer">
                      {topic.title}
                    </a>
                  </td>
                  <td>{new Date(topic.created_at).toLocaleString('ja-JP')}</td>
                  <td>{topic.comment_count}</td>
                  <td>{topic.view_count}</td>
                  <td>
                    <span className={`admin-status-badge ${topic.status}`}>
                      {topic.status === 'approved' ? '表示中' : '非表示'}
                    </span>
                  </td>
                  <td>
                    <ToggleButton topicId={topic.id} currentStatus={topic.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
