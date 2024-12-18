import { AllowanceItem } from '@portkey/services';
import clsx from 'clsx';
import { useAllowanceList } from '../../hooks/allowance';
import { useCallback, useRef } from 'react';
import { List } from 'antd-mobile';
import '../PaymentSecurity/index.less';
import LoadingMore from '../LoadingMore';
import MenuItem from '../MenuItem';
import TokenImageDisplay from '../TokenImageDisplay';
import { formatStr2EllipsisStr, setLoading } from '../../utils';
import { useEffectOnce } from 'react-use';
import CustomSvg from '../CustomSvg';

import './index.less';

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

  useEffectOnce(() => {
    loadMore();
  });

  const { data: list, totalRecordCount } = allowanceList;

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-token-allowance-wrapper', className)}>
      <div className="token-allowance-nav">
        <div className="left-icon" onClick={onBack}>
          <CustomSvg type="ArrowLeft" fillColor="var(--sds-color-icon-default-default)" />
        </div>
        <div className="token-allowance-header">
          <p className="symbol">Token Allowances</p>
        </div>
      </div>
      {list?.length > 0 && (
        <>
          <List className="portkey-ui-token-allowance-list">
            {list?.map((item: AllowanceItem, index: number) => (
              <List.Item
                key={`tokenAllowance_${item.chainId}_${index}`}
                className="portkey-ui-token-allowance-item-wrap">
                <MenuItem
                  key={item.chainId + index}
                  className="portkey-ui-token-allowance-item"
                  iconClassName="portkey-ui-token-allowance-item-icon"
                  icon={<TokenImageDisplay src={item.icon} width={42} symbol={item.name || 'Unknown'} />}
                  onClick={() => onClickItem?.(item)}>
                  <div className="token-info">
                    <div className="token-symbol-line">
                      <div className="token-symbol-text">{item.name || 'Unknown'}</div>
                    </div>
                    <div className="token-network">{`Contract Address: ${formatStr2EllipsisStr(
                      item.contractAddress,
                      [7, 8],
                    )}`}</div>
                  </div>
                </MenuItem>
              </List.Item>
            ))}
          </List>
          <LoadingMore hasMore={list?.length < totalRecordCount} loadMore={loadMore} className="load-more" />
        </>
      )}
      {list?.length === 0 && <div className="no-data-text">No assets yet</div>}
    </div>
  );
}
