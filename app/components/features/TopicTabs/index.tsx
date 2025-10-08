'use client';

import { StanTabButton } from '@/app/components/elements/StanTabButton';
import { StanTopic } from '@/app/components/layouts/StanTopic';
import { Topic } from '@/app/types/database.types';
import { useState } from 'react';

type TopicTabsProps = {
  latestTopics: Topic[];
  popularTopics: Topic[];
};

export const TopicTabs = ({ latestTopics, popularTopics }: TopicTabsProps) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'latest'>('popular');

  return (
    <>
      <div className='topic-button'>
        <StanTabButton
          title='今日の人気トピック'
          onClick={() => setActiveTab('popular')}
        />
        <StanTabButton
          title='新着トピック'
          secoundTitle
          onClick={() => setActiveTab('latest')}
        />
      </div>
      <div className='topic-card'>
        <StanTopic topics={activeTab === 'popular' ? popularTopics : latestTopics} />
      </div>
    </>
  );
};
