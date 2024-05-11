import { AllowanceItem } from '@portkey/services';
import clsx from 'clsx';
import { useAllowanceList } from '../../hooks/allowance';
import { useCallback, useEffect, useRef } from 'react';
import { List } from 'antd-mobile';
import '../PaymentSecurity/index.less';
import LoadingMore from '../LoadingMore';
import MenuItem from '../MenuItem';
import TokenImageDisplay from '../TokenImageDisplay';
import BackHeaderForPage from '../BackHeaderForPage';
import { setLoading } from '../../utils';

export interface ITokenAllowanceProps {
  onClickItem: (item: AllowanceItem) => void;
  className?: string;
  onBack: () => void;
  wrapperStyle?: React.CSSProperties;
}

export default function TokenAllowanceMain(props: ITokenAllowanceProps) {
  const { onClickItem, className, onBack, wrapperStyle } = props;
  const { allowanceList, fetchMoreAllowanceList } = useAllowanceList({ step: 10 });
  const loadingRef = useRef<boolean>(false);
  console.log(allowanceList);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    setLoading(true);
    loadingRef.current = true;
    try {
      await fetchMoreAllowanceList();
    } catch (e) {
      console.error('fetchMoreAllowanceList fail', e);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchMoreAllowanceList]);

  useEffect(() => {
    loadMore();
  }, [fetchMoreAllowanceList, loadMore]);

  const { data: list, totalRecordCount } = allowanceList;

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-payment-security-wrapper', className)}>
      <BackHeaderForPage title={`Token Allowance`} leftCallBack={onBack} />
      {list?.length > 0 && (
        <>
          <List className="portkey-ui-payment-security-list">
            {list?.map((item, index) => (
              <List.Item
                key={`paymentSecurity_${item.chainId}_${index}`}
                className="portkey-ui-payment-security-item-wrap">
                <MenuItem
                  key={item.chainId + index}
                  icon={<TokenImageDisplay src={item.icon} symbol={item.name || 'Unknown'} />}
                  height={92}
                  onClick={() => onClickItem?.(item)}>
                  <div className="token-info">
                    <div className="token-symbol">{item.name}</div>
                    <div className="token-network">{`Contract Address:${item.contractAddress}`}</div>
                  </div>
                </MenuItem>
              </List.Item>
            ))}
          </List>
          <LoadingMore hasMore={list?.length < totalRecordCount} loadMore={loadMore} className="load-more" />
        </>
      )}
      {list?.length === 0 && <div className="no-data-text">{`No data`}</div>}
    </div>
  );
}
