import { Tabs } from 'antd';
import { BalanceTab, TokenItemShowType } from '../types/assets';
import { useMemo } from 'react';
import NFTTab, { NFTTabProps } from './components/NFTTab';
import TokenTab from './components/TokenTab';
import { MAINNET } from '../../constants/network';
import './index.less';

export interface TokenAndNFTProps extends NFTTabProps {
  networkType: string;
  tokenList?: TokenItemShowType[];
}

export default function TokenAndNFT({ networkType, tokenList, accountNFTList, loadMoreNFT }: TokenAndNFTProps) {
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);

  return (
    <Tabs
      centered
      items={[
        {
          label: 'Tokens',
          key: BalanceTab.TOKEN,
          children: <TokenTab isMainnet={isMainnet} tokenList={tokenList} />,
        },
        {
          label: 'NFTs',
          key: BalanceTab.NFT,
          children: <NFTTab accountNFTList={accountNFTList} isMainnet={isMainnet} loadMoreNFT={loadMoreNFT} />,
        },
      ]}
      className="portkey-ui-balance-tab"
    />
  );
}
