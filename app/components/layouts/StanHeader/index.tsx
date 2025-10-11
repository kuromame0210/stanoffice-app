import Link from 'next/link';
import './style.css';

export const StanHeader = () => {
  return (
    <>
      <header className='stan-header'>
        <div className='stan-header-container'>
          <Link href='/' className='stan-header-logo'>
            Stan Office
          </Link>
          <Link href='/topics/new' className='stan-header-button'>
            投稿する
          </Link>
        </div>
      </header>
    </>
  );
};
