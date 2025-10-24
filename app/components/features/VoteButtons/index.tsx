'use client';

import { voteOnTopic } from '@/app/actions/votes';
import { useState, useEffect } from 'react';
import './style.css';

type VoteButtonsProps = {
  topicId: number;
  initialLikeCount: number;
  initialDislikeCount: number;
};

export const VoteButtons = ({ 
  topicId, 
  initialLikeCount, 
  initialDislikeCount 
}: VoteButtonsProps) => {
  const [voteState, setVoteState] = useState({
    likeCount: initialLikeCount,
    dislikeCount: initialDislikeCount,
    userVote: null as 'like' | 'dislike' | null,
    isLoading: false
  });

  // セッション管理関数
  const getSessionId = () => {
    let sessionId = localStorage.getItem('stanoffice_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('stanoffice_session_id', sessionId);
    }
    return sessionId;
  };

  const getVotedTopics = (): Record<number, 'like' | 'dislike'> => {
    const voted = localStorage.getItem('stanoffice_voted_topics');
    return voted ? JSON.parse(voted) : {};
  };

  const saveVote = (topicId: number, voteType: 'like' | 'dislike') => {
    const voted = getVotedTopics();
    voted[topicId] = voteType;
    localStorage.setItem('stanoffice_voted_topics', JSON.stringify(voted));
  };

  // 初期化時に投票履歴をチェック
  useEffect(() => {
    const votedTopics = getVotedTopics();
    const userVote = votedTopics[topicId] || null;
    setVoteState(prev => ({ ...prev, userVote }));
  }, [topicId]);

  const handleVote = async (voteType: 'like' | 'dislike') => {
    // 既に投票済みまたは処理中なら何もしない
    if (voteState.userVote || voteState.isLoading) return;
    
    setVoteState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await voteOnTopic(topicId, voteType);
      
      if (result.success) {
        // 楽観的更新
        setVoteState(prev => ({
          ...prev,
          userVote: voteType,
          likeCount: voteType === 'like' ? prev.likeCount + 1 : prev.likeCount,
          dislikeCount: voteType === 'dislike' ? prev.dislikeCount + 1 : prev.dislikeCount
        }));
        
        // 投票履歴を保存
        saveVote(topicId, voteType);
      } else {
        console.error('投票に失敗しました');
      }
    } catch (error) {
      console.error('投票エラー:', error);
    } finally {
      setVoteState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="vote-buttons">
      <button
        onClick={() => handleVote('like')}
        disabled={!!voteState.userVote || voteState.isLoading}
        className={`vote-btn like ${voteState.userVote === 'like' ? 'voted' : ''}`}
        title={voteState.userVote ? '投票済み' : 'ハート'}
      >
        {voteState.likeCount}
      </button>
      <button
        onClick={() => handleVote('dislike')}
        disabled={!!voteState.userVote || voteState.isLoading}
        className={`vote-btn dislike ${voteState.userVote === 'dislike' ? 'voted' : ''}`}
        title={voteState.userVote ? '投票済み' : 'バッド'}
      >
        {voteState.dislikeCount}
      </button>
    </div>
  );
};