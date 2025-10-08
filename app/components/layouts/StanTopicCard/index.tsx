import './style.css';

type StanTopicCardProps = {
  children: React.ReactNode;
  popularList?: boolean;
};

export const StanTopicCard = ({ children, popularList = false }: StanTopicCardProps) => {
  const className = popularList ? 'stan-popularlist-card' : 'stan-topic-card';
  return (
    <>
      <div className={className}>{children}</div>
    </>
  );
};
