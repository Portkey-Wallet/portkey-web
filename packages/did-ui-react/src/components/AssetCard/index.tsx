import { useMemo } from 'react';
import './index.less';

interface AssetCardProps {
  networkType?: string;
  nickName?: string;
  accountBalanceUSD?: string;
}

export default function AssetCard({ networkType, nickName, accountBalanceUSD }: AssetCardProps) {
  const isMainnet = useMemo(() => networkType === 'MAIN', [networkType]);
  return (
    <div className="portkey-ui-asset-card-wrapper">
      <div className="portkey-ui-text-center portkey-ui-wallet-name">{nickName || '--'}</div>
      <div className="portkey-ui-text-center portkey-ui-balance-amount">
        {isMainnet ? (
          <span className="amount">{`$ ${accountBalanceUSD ?? '0.00'}`}</span>
        ) : (
          <span className="dev-mode amount">Dev Mode</span>
        )}
      </div>
    </div>
  );
}
