import { AllowanceItem } from '@portkey/services';
import clsx from 'clsx';
import { useAllowanceList } from '../../hooks/allowance';
import { useEffect } from 'react';
import { List } from 'antd-mobile';
import '../PaymentSecurity/index.less';
import LoadingMore from '../LoadingMore';
import MenuItem from '../MenuItem';
import TokenImageDisplay from '../TokenImageDisplay';
import BackHeaderForPage from '../BackHeaderForPage';

export interface TokenAllowanceProps {
  onClickItem: (item: AllowanceItem) => void;
  className?: string;
  onBack: () => void;
  wrapperStyle?: React.CSSProperties;
}

export default function TokenAllowanceMain(props: TokenAllowanceProps) {
  const { onClickItem, className, onBack, wrapperStyle } = props;
  const { allowanceList, updateAllowanceList } = useAllowanceList({ step: 10 });
  console.log(allowanceList);

  useEffect(() => {
    updateAllowanceList();
  }, [updateAllowanceList]);

  const { totalRecordCount } = allowanceList;

  const list: AllowanceItem[] = [
    {
      icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_VTsTN947wxfPvR6azPju20BotT7BNvh_VZLnjduuNQ&s',
      name: 'meme',
      allowance: 100,
      chainId: 'AELF',
      contractAddress: '0x123',
      url: 'https://encrypted-tbn0.gstatic.com/',
    },
  ];

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
                  icon={<TokenImageDisplay src={item.icon} symbol={item.name} />}
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
          <LoadingMore hasMore={list?.length < totalRecordCount} loadMore={updateAllowanceList} className="load-more" />
        </>
      )}
      {list?.length === 0 && <div className="no-data-text">{`No allowance`}</div>}
    </div>
  );
}
