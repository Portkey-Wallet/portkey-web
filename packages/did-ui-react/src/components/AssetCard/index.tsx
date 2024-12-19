import { ReactNode, useMemo, useRef, useState } from 'react';
import { ChainId } from '@portkey/types';
import BalanceCard from '../BalanceCard';
import TitleWrapper from '../TitleWrapper';
import './index.less';
import CustomSvg from '../CustomSvg';
import { SvgType } from '../../types';
import { MAINNET } from '../../constants/network';
import AddressCopyModal, { IAddressCopyModalRef } from '../AddressCopyModal';

interface ICAAddressInfo {
  chainId: ChainId;
  caAddress: string;
}

interface AssetCardProps {
  backIcon?: ReactNode;
  networkType?: string;
  nickName?: string;
  accountBalanceUSD?: string;
  isShowRamp?: boolean;
  isShowFaucet?: boolean;
  walletAvatar?: SvgType;
  caAddressInfos?: ICAAddressInfo[];
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
  walletAvatar = 'master1',
  caAddressInfos,
  onAvatarClick,
  onBuy,
  onSend,
  onReceive,
  onFaucet,
}: AssetCardProps) {
  const addressCopyModalRef = useRef<IAddressCopyModalRef>(null);
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [isVisibleBalance, setIsVisibleBalance] = useState(true);

  const leftElement = useMemo(() => {
    return (
      <div className="portkey-ui-account-left-element" onClick={onAvatarClick}>
        <CustomSvg className="portkey-ui-account-avatar" type={walletAvatar} />
        <div className="portkey-ui-account-name">{nickName || '--'}</div>
        <CustomSvg className="portkey-ui-account-arrow" type="KeyboardArrowDown" />
      </div>
    );
  }, [walletAvatar, onAvatarClick, nickName]);

  const rightElement = useMemo(() => {
    return (
      <div className="portkey-ui-account-right-element">
        <CustomSvg
          className="portkey-ui-account-right-element-icon"
          type="Copy"
          fillColor="var(--sds-color-icon-default-secondary)"
          onClick={() => addressCopyModalRef.current?.open()}
        />
      </div>
    );
  }, []);

  return (
    <div className="portkey-ui-asset-card-wrapper">
      <AddressCopyModal ref={addressCopyModalRef} isMainnet={isMainnet} caAddressInfos={caAddressInfos} />
      <TitleWrapper
        className="portkey-ui-account-title-wrapper"
        leftElement={leftElement}
        rightElement={rightElement}
      />

      <div className="portkey-ui-content-wrapper">
        <div className="portkey-ui-balance-amount">
          {isMainnet ? (
            <>
              <span className="amount">{`$${!isVisibleBalance ? '******' : accountBalanceUSD ?? '0.00'}`}</span>
              <CustomSvg
                className="portkey-ui-balance-amount-icon"
                fillColor="var(--sds-color-icon-default-default)"
                type={!isVisibleBalance ? 'VisibilityOff' : 'Visibility'}
                onClick={() => setIsVisibleBalance((prev) => !prev)}
              />
            </>
          ) : (
            <span className="dev-mode amount">Dev Mode</span>
          )}
        </div>
        <BalanceCard
          isShowFaucet={isShowFaucet}
          isShowRamp={isShowRamp}
          isMainnet={isMainnet}
          isShowSwap
          onBuy={onBuy}
          onSend={onSend}
          onReceive={onReceive}
          onFaucet={onFaucet}
        />
      </div>
    </div>
  );
}
