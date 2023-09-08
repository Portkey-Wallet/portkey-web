import { ReactNode, useMemo } from 'react';
import BalanceCard from '../BalanceCard';
import TitleWrapper from '../TitleWrapper';
import './index.less';
import CustomSvg from '../CustomSvg';
import { SvgType } from '../../types';

interface AssetCardProps {
  backIcon?: ReactNode;
  networkType?: string;
  nickName?: string;
  accountBalanceUSD?: string;
  isShowRamp?: boolean;
  isShowFaucet?: boolean;
  walletAvatar?: SvgType;
  onAvatarClick?: () => void;
  onBuy?: () => void;
  onSend?: () => void;
  onBack?: () => void;
  onFaucet?: () => void;
  onReceive?: () => void;
}

export default function AssetCard({
  networkType,
  nickName,
  accountBalanceUSD,
  isShowRamp,
  isShowFaucet,
  backIcon,
  walletAvatar = 'master1',
  onAvatarClick,
  onBuy,
  onBack,
  onSend,
  onReceive,
  onFaucet,
}: AssetCardProps) {
  const isMainnet = useMemo(() => networkType === 'MAIN', [networkType]);
  return (
    <div className="portkey-ui-asset-card-wrapper">
      <TitleWrapper
        className="portkey-ui-wallet-name"
        leftElement={backIcon}
        leftCallBack={onBack}
        title={nickName || '--'}
        rightElement={<CustomSvg className="portkey-ui-custom-avatar" type={walletAvatar} onClick={onAvatarClick} />}
      />

      <div className="portkey-ui-text-center portkey-ui-balance-amount">
        {isMainnet ? (
          <span className="amount">{`$ ${accountBalanceUSD ?? '0.00'}`}</span>
        ) : (
          <span className="dev-mode amount">Dev Mode</span>
        )}
      </div>
      <BalanceCard
        isShowFaucet={isShowFaucet}
        isShowRamp={isShowRamp}
        isMainnet={isMainnet}
        onBuy={onBuy}
        onSend={onSend}
        onReceive={onReceive}
        onFaucet={onFaucet}
      />
    </div>
  );
}
