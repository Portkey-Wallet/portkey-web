import { DotLoading, InfiniteScroll } from 'antd-mobile';

export interface ILoadingMoreProps {
  hasMore?: boolean;
  loadingText?: string;
  noDataText?: string;
  className?: string;
  loadMore: (isRetry?: boolean) => Promise<void>;
}

export default function LoadingMore({
  hasMore = false,
  loadingText = 'Loading',
  noDataText = '',
  className = '',
  loadMore,
}: ILoadingMoreProps) {
  return (
    <InfiniteScroll loadMore={loadMore} hasMore={hasMore} threshold={100}>
      {hasMore ? (
        <>
          <span className={className}>{loadingText}</span>
          <DotLoading />
        </>
      ) : (
        <span className={className}>{noDataText}</span>
      )}
    </InfiniteScroll>
  );
}
