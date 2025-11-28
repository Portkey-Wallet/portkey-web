import clsx from 'clsx';
import './index.less';

const CircleLoading = ({ loading, className }: { loading?: boolean; className?: string }) => {
  return (
    <div
      className={clsx('circle-loading circle-loading-spinner', className)}
      style={{ display: loading ? 'block' : 'none' }}></div>
  );
};

export default CircleLoading;
