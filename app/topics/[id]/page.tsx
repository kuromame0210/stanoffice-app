import { getTopicById, incrementViewCount } from '@/app/actions/topics';
import { getComments } from '@/app/actions/comments';
import { StanHeader } from '@/app/components/layouts/StanHeader';
import { CommentForm } from '@/app/components/features/CommentForm';
import { notFound } from 'next/navigation';
import './style.css';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TopicDetailPage({ params }: Props) {
  const { id } = await params;
  const topicId = parseInt(id);

  if (isNaN(topicId)) {
    notFound();
  }

  const [topic, comments] = await Promise.all([
    getTopicById(topicId),
    getComments(topicId),
  ]);

  if (!topic) {
    notFound();
  }

  // 閲覧数を非同期で増やす（表示をブロックしない）
  incrementViewCount(topicId);

  // 経過時間を計算する関数
  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}日前`;
    if (diffHours > 0) return `${diffHours}時間前`;
    if (diffMinutes > 0) return `${diffMinutes}分前`;
    return `${diffSeconds}秒前`;
  };

  return (
    <>
      <StanHeader />
      <div className='topic-detail-container'>
        <div className='topic-detail-main'>
          {/* トピック情報 */}
          <div className='topic-detail-header'>
            <h1 className='topic-detail-title'>{topic.title}</h1>
            <div className='topic-detail-meta'>
              <span className='topic-detail-author'>
                {topic.is_anonymous ? '匿名' : topic.author_name || '名無し'}
              </span>
              <span className='topic-detail-time'>{getTimeAgo(topic.created_at)}</span>
              <span className='topic-detail-stats'>
                {topic.view_count}閲覧 · {topic.comment_count}コメント
              </span>
            </div>
          </div>

          {/* トピック本文 */}
          <div className='topic-detail-body'>
            {topic.image_url && (
              <div className='topic-detail-image'>
                <img src={topic.image_url} alt={topic.title} />
              </div>
            )}
            <p className='topic-detail-text'>{topic.body}</p>
          </div>

          {/* コメント一覧 */}
          <div className='topic-detail-comments'>
            <h2 className='comments-title'>コメント ({comments.length})</h2>
            {comments.length === 0 ? (
              <p className='no-comments'>まだコメントがありません</p>
            ) : (
              <div className='comments-list'>
                {comments.map((comment) => (
                  <div key={comment.id} className='comment-item'>
                    <div className='comment-header'>
                      <span className='comment-author'>
                        {comment.is_anonymous ? '匿名' : comment.author_name || '名無し'}
                      </span>
                      <span className='comment-time'>{getTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className='comment-body'>{comment.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* コメント投稿フォーム */}
          <CommentForm topicId={topicId} />
        </div>
      </div>
    </>
  );
}
