'use client';

import { createTopic } from '@/app/actions/topics';
import { uploadTopicImage } from '@/app/lib/supabase/storage';
import { StanHeader } from '@/app/components/layouts/StanHeader';
import { ImageUpload } from '@/app/components/features/ImageUpload';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './style.css';

export default function NewTopicPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageSelect = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      // 画像ファイルがある場合はアップロード
      if (imageFile) {
        const imageUrl = await uploadTopicImage(imageFile);
        formData.set('image_url', imageUrl);
      }

      const topic = await createTopic(formData);
      // 投稿成功後、トップページへリダイレクト
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'トピック投稿に失敗しました');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StanHeader />
      <div className='new-topic-container'>
        <div className='new-topic-main'>
          <h1 className='new-topic-title'>新しいトピックを投稿</h1>

          <form onSubmit={handleSubmit} className='new-topic-form'>
            {error && <div className='new-topic-error'>{error}</div>}

            <div className='form-group'>
              <label htmlFor='title' className='form-label'>
                タイトル <span className='required'>*</span>
              </label>
              <input
                id='title'
                name='title'
                type='text'
                className='form-input'
                placeholder='トピックのタイトルを入力してください'
                required
                disabled={isSubmitting}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='body' className='form-label'>
                本文 <span className='required'>*</span>
              </label>
              <textarea
                id='body'
                name='body'
                className='form-textarea'
                rows={10}
                placeholder='トピックの内容を入力してください'
                required
                disabled={isSubmitting}
              />
            </div>

            <div className='form-group'>
              <label className='form-label'>
                画像（任意）
              </label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                currentPreview={imagePreview}
                disabled={isSubmitting}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='author_name' className='form-label'>
                名前
              </label>
              <input
                id='author_name'
                name='author_name'
                type='text'
                className='form-input'
                placeholder='名前（任意）'
                disabled={isSubmitting}
              />
            </div>

            <div className='form-checkboxes'>
              <div className='form-checkbox'>
                <input
                  id='is_anonymous'
                  name='is_anonymous'
                  type='checkbox'
                  disabled={isSubmitting}
                />
                <label htmlFor='is_anonymous'>匿名で投稿</label>
              </div>

              <div className='form-checkbox'>
                <input
                  id='show_id'
                  name='show_id'
                  type='checkbox'
                  disabled={isSubmitting}
                />
                <label htmlFor='show_id'>IDを表示</label>
              </div>
            </div>

            <div className='form-notice'>
              <p>※投稿されたトピックは承認後に公開されます</p>
            </div>

            <div className='form-actions'>
              <button
                type='button'
                className='form-button form-button-cancel'
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                type='submit'
                className='form-button form-button-submit'
                disabled={isSubmitting}
              >
                {isSubmitting ? '投稿中...' : 'トピックを投稿'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
