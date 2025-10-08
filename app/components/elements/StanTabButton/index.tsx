'use client';
import './style.css';

type StanTabButtonType = {
  title: string;
  onClick?: () => void;
  secoundTitle?: boolean;
};
export const StanTabButton = ({ title, onClick, secoundTitle = false }: StanTabButtonType) => {
  return (
    <>
      <button
        className={secoundTitle ? 'new-topic' : 'today-topic'}
        onClick={onClick}>
        {title}
      </button>
    </>
  );
};
