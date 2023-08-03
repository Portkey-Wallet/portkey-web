import { Tabs } from 'antd';
import { BalanceTab, TokenItemShowType } from '../types/assets';
import { useMemo, useRef, useState } from 'react';
import NFTTab, { NFTTabInstance, NFTTabProps } from './components/NFTTab';
import TokenTab from './components/TokenTab';
import { MAINNET } from '../../constants/network';
import './index.less';
import { NetworkType } from '../../types';

export interface TokenAndNFTProps extends NFTTabProps {
  networkType: NetworkType;
  tokenList?: TokenItemShowType[];
  onChange?: (activeKey: BalanceTab) => void;
}

export default function TokenAndNFT({
  networkType,
  tokenList,
  accountNFTList,
  onChange,
  loadMoreNFT,
}: TokenAndNFTProps) {
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [value, setValue] = useState<string>(BalanceTab.TOKEN);
  const nftTabRef = useRef<NFTTabInstance>();
  return (
    <Tabs
      centered
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
          children: <TokenTab isMainnet={isMainnet} tokenList={tokenList} />,
        },
        {
          label: 'NFTs',
          key: BalanceTab.NFT,
          children: (
            <NFTTab ref={nftTabRef} accountNFTList={accountNFTList} isMainnet={isMainnet} loadMoreNFT={loadMoreNFT} />
          ),
        },
      ]}
      className="portkey-ui-balance-tab"
    />
  );
}
