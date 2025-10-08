'use client';
import Link from 'next/link';
import './style.css';

export const StanNewButton = () => {
  return (
    <>
      <Link href='/topics/new' className='new-button-link'>
        <button className='new-button'>
          ＋トピックを投稿する
        </button>
      </Link>
    </>
  );
};
