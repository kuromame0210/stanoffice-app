import { getPopularTopics } from '@/app/actions/topics';
import { StanHeader } from '@/app/components/layouts/StanHeader';
import { StanTopic } from '@/app/components/layouts/StanTopic';
import Link from 'next/link';
import './style.css';

type Props = {
  searchParams: Promise<{ period?: string }>;
};

export default async function PopularTopicsPage({ searchParams }: Props) {
  const params = await searchParams;
  const period = params.period === 'day' ? 'day' : 'week';

  const topics = await getPopularTopics(period, 50);

  const title = period === 'day' ? '前日の人気トピック' : '一週間の人気トピック';

  return (
    <>
      <StanHeader />
      <div className='popular-topics-container'>
        <div className='popular-topics-header'>
          <Link href='/' className='back-link'>← トップに戻る</Link>
          <h1 className='popular-topics-title'>{title}</h1>
        </div>
        <div className='popular-topics-main'>
          <StanTopic topics={topics} />
        </div>
      </div>
    </>
  );
}
