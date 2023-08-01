import { useCallback, useMemo } from 'react';
import CustomSvg from '../CustomSvg';
import './index.less';

export interface BalanceCardProps {
  accountInfo?: any;
  isMainnet?: boolean;
  isShowBuy?: boolean;
  isShowFaucet?: boolean;
  onBuy?: () => void;
  onReceive?: () => void;
  onFaucet?: () => void;
}

export default function BalanceCard({
  isShowBuy = true,
  isShowFaucet,
  isMainnet,
  onBuy,
  onReceive,
  onFaucet,
}: BalanceCardProps) {
  const renderTem = useCallback(
    (type: 'Buy' | 'Faucet') => {
      return (
        <span className="send btn" onClick={type === 'Buy' ? onBuy : onFaucet}>
          <CustomSvg type={type} style={{ width: 36, height: 36 }} />
          <span className="btn-name">{type}</span>
        </span>
      );
    },
    [onBuy, onFaucet],
  );

  const renderBuy = useMemo(() => isShowBuy && isMainnet && renderTem('Buy'), [isMainnet, isShowBuy, renderTem]);
  const renderFaucet = useMemo(
    () => isShowFaucet && !isMainnet && renderTem('Faucet'),
    [isMainnet, isShowFaucet, renderTem],
  );

  return (
    <div className="portkey-ui-flex-center  portkey-ui-balance-card">
      <div className="balance-btn">
        {renderFaucet}
        {renderBuy}
        <span className="receive btn" onClick={onReceive}>
          <CustomSvg type="Receive" style={{ width: 36, height: 36 }} />
          <span className="btn-name">Receive</span>
        </span>
      </div>
    </div>
  );
}
