import { StanHeader } from './components/layouts/StanHeader';
import { StanPopularTopic } from './components/layouts/StanPopularTopic';
import { StanTopicCard } from './components/layouts/StanTopicCard';
import { TopicTabs } from './components/features/TopicTabs';
import './style.css';
import { getTopics, getPopularTopics } from './actions/topics';

export default async function StanTopPage() {
  // Supabaseから最新のトピックを取得
  const latestTopics = await getTopics('created_at', 20);

  // 人気トピックを取得
  const dailyPopularTopics = await getPopularTopics('day', 20);
  const weeklyPopularTopics = await getPopularTopics('week', 10);

  return (
    <>
      <StanHeader />
      <div className='stan-background'>
        <main className='stan-main-content'>
          <StanTopicCard>
            <TopicTabs latestTopics={latestTopics} popularTopics={dailyPopularTopics} />
          </StanTopicCard>
        </main>
        <aside className='stan-side-box'>
          <div className='stan-popularlist-box'>
            <StanTopicCard popularList>
              <StanPopularTopic kindTitle='一週間の人気トピック' topics={weeklyPopularTopics} />
            </StanTopicCard>
          </div>
          <div className='stan-popularlist-box'>
            <StanTopicCard popularList>
              <StanPopularTopic kindTitle='前日の人気トピック' topics={dailyPopularTopics} />
            </StanTopicCard>
          </div>
        </aside>
      </div>
    </>
  );
}
