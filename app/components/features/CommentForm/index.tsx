'use client';

import { createComment } from '@/app/actions/comments';
import { useState } from 'react';
import './style.css';

type CommentFormProps = {
  topicId: number;
};

export const CommentForm = ({ topicId }: CommentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await createComment(topicId, formData);
      // フォームをリセット
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメント投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='comment-form-container'>
      <h3 className='comment-form-title'>コメントを投稿</h3>
      <form onSubmit={handleSubmit} className='comment-form'>
        {error && <div className='comment-form-error'>{error}</div>}

        <div className='comment-form-group'>
          <label htmlFor='body' className='comment-form-label'>
            コメント <span className='required'>*</span>
          </label>
          <textarea
            id='body'
            name='body'
            className='comment-form-textarea'
            rows={4}
            placeholder='コメントを入力してください'
            required
            disabled={isSubmitting}
          />
        </div>

        <div className='comment-form-group'>
          <label htmlFor='author_name' className='comment-form-label'>
            名前
          </label>
          <input
            id='author_name'
            name='author_name'
            type='text'
            className='comment-form-input'
            placeholder='名前（任意）'
            disabled={isSubmitting}
          />
        </div>

        <div className='comment-form-checkbox'>
          <input
            id='is_anonymous'
            name='is_anonymous'
            type='checkbox'
            disabled={isSubmitting}
          />
          <label htmlFor='is_anonymous'>匿名で投稿</label>
        </div>

        <button
          type='submit'
          className='comment-form-submit'
          disabled={isSubmitting}
        >
          {isSubmitting ? '投稿中...' : 'コメントを投稿'}
        </button>
      </form>
    </div>
  );
};
