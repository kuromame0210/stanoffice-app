import { Topic } from '@/app/types/database.types';
import Link from 'next/link';
import { VoteButtons } from '@/app/components/features/VoteButtons';
import './style.css';

type StanTopicProps = {
  topics: Topic[];
};

export const StanTopic = ({ topics }: StanTopicProps) => {
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
      <div className='latest-topic'>最新のトピック</div>
      {topics.map((topic) => {
        return (
          <div key={topic.id} className='topic-card-wrapper'>
            <Link href={`/topics/${topic.id}`} className='topic-card-link'>
              <div className='topic-card-box'>
                <div className='topic-img-box'>
                  {topic.image_url ? (
                    <img src={topic.image_url} alt={topic.title} className='topic-img' />
                  ) : (
                    <p className='topic-img'>写真</p>
                  )}
                </div>
                <div className='topic-content'>
                  <div>
                    <p className='topic-title'>{topic.title}</p>
                  </div>
                  <div className='comment-box'>
                    <div className='comment-info'>
                      <p className='comment-sum'>{topic.comment_count}コメント</p>
                      <p className='seconds-ago'>{getTimeAgo(topic.created_at)}</p>
                    </div>
                    <div className='vote-section' onClick={(e) => e.preventDefault()}>
                      <VoteButtons 
                        topicId={topic.id}
                        initialLikeCount={topic.like_count || 0}
                        initialDislikeCount={topic.dislike_count || 0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </>
  );
};
