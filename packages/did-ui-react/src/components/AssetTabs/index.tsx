import { Tabs } from 'antd';
import { BalanceTab, TokenItemShowType } from '../types/assets';
import { useMemo, useRef, useState } from 'react';
import NFTTab, { NFTTabInstance, NFTTabProps } from './components/NFTTab';
import TokenTab from './components/TokenTab';
import { MAINNET } from '../../constants/network';
import { NetworkType } from '../../types';
import Activity from '../Activity';
import { ActivityItemType } from '@portkey/types';
import './index.less';

export interface AssetTabsProps extends NFTTabProps {
  networkType: NetworkType;
  tokenList?: TokenItemShowType[];
  isGetNFTCollectionPending?: boolean;
  onChange?: (activeKey: BalanceTab) => void;
  onDataInit?: () => void;
  onDataInitEnd?: () => void;

  onViewActivityItem?: (item: ActivityItemType) => void;
  onViewTokenItem?: (v: TokenItemShowType) => void;
}

export default function AssetTabs({
  networkType,
  tokenList,
  accountNFTList,
  isGetNFTCollectionPending,
  onChange,
  loadMoreNFT,
  onNFTView,
  onDataInit,
  onDataInitEnd,
  onViewActivityItem,
  onViewTokenItem,
}: AssetTabsProps) {
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [value, setValue] = useState<string>(BalanceTab.TOKEN);
  const nftTabRef = useRef<NFTTabInstance>();
  return (
    <Tabs
      className="portkey-ui-balance-tab"
      activeKey={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v as BalanceTab);
        if (v === BalanceTab.NFT) nftTabRef.current?.refreshState();
      }}
      items={[
        {
          label: 'Tokens',
          key: BalanceTab.TOKEN,
          children: <TokenTab isMainnet={isMainnet} tokenList={tokenList} onViewTokenItem={onViewTokenItem} />,
        },
        {
          label: 'NFTs',
          key: BalanceTab.NFT,
          children: (
            <NFTTab
              isGetNFTCollectionPending={isGetNFTCollectionPending}
              ref={nftTabRef}
              accountNFTList={accountNFTList}
              isMainnet={isMainnet}
              loadMoreNFT={loadMoreNFT}
              onNFTView={onNFTView}
            />
          ),
        },
        {
          label: 'Activity',
          key: BalanceTab.ACTIVITY,
          children: (
            <Activity onDataInit={onDataInit} onDataInitEnd={onDataInitEnd} onViewActivityItem={onViewActivityItem} />
          ),
        },
      ]}
    />
  );
}
