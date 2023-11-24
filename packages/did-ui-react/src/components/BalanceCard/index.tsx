import { useCallback, useMemo } from 'react';
import CustomSvg from '../CustomSvg';
import './index.less';

export interface BalanceCardProps {
  accountInfo?: any;
  isMainnet?: boolean;
  isShowRamp?: boolean;
  isShowFaucet?: boolean;
  onBuy?: () => void;
  onSend?: () => void;
  onReceive?: () => void;
  onFaucet?: () => void;
}

export default function BalanceCard({
  isShowRamp = true,
  isShowFaucet,
  isMainnet,
  onBuy,
  onSend,
  onReceive,
  onFaucet,
}: BalanceCardProps) {
  const renderTem = useCallback(
    (type: 'Buy' | 'Faucet') => {
      return (
        <span className="buy btn" onClick={type === 'Buy' ? onBuy : onFaucet}>
          <CustomSvg type={type} />
          <span className="btn-name">{type}</span>
        </span>
      );
    },
    [onBuy, onFaucet],
  );

  const renderBuy = useMemo(() => isShowRamp && isMainnet && renderTem('Buy'), [isMainnet, isShowRamp, renderTem]);
  const renderFaucet = useMemo(
    () => isShowFaucet && !isMainnet && renderTem('Faucet'),
    [isMainnet, isShowFaucet, renderTem],
  );

  const renderSend = useMemo(
    () => (
      <span className="send btn" onClick={onSend}>
        <CustomSvg type="Receive" />
        <span className="btn-name">Send</span>
      </span>
    ),
    [onSend],
  );

  return (
    <div className="portkey-ui-flex-center  portkey-ui-balance-card">
      <div className="balance-btn">
        {renderFaucet}
        {renderBuy}
        {renderSend}
        <span className="receive btn" onClick={onReceive}>
          <CustomSvg type="Receive" />
          <span className="btn-name">Receive</span>
        </span>
      </div>
    </div>
  );
}
