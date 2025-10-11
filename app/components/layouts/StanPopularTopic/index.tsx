'use client';
import { Topic } from '@/app/types/database.types';
import Link from 'next/link';
import './style.css';

type StanPopularTopicType = {
  kindTitle: string;
  topics: Topic[];
};

export const StanPopularTopic = ({ kindTitle, topics }: StanPopularTopicType) => {
  return (
    <>
      <div className='stan-populartopic-box'>
        <p className='stan-populartopic-kind'>{kindTitle}</p>
        {topics.map((topic) => {
          return (
            <Link href={`/topics/${topic.id}`} key={topic.id} className='topic-card-link'>
              <div className='populartopic-item'>
                <div>
                  <p className='populartopic-title'>{topic.title}</p>
                </div>
                <div>
                  <p className='populartopic-comment-sum'>{topic.comment_count}コメント</p>
                </div>
              </div>
            </Link>
          );
        })}
        <Link
          href={`/topics/popular?period=${kindTitle.includes('一週間') ? 'week' : 'day'}`}
          className='populartopic-nextpage'>
          {'続きを見る >'}
        </Link>
      </div>
    </>
  );
};
