import { useMemo } from 'react';
import clsx from 'clsx';
import CustomSvg, { CustomSvgProps } from '../CustomSvg';
import CommonButton from '../CommonButton';
import './index.less';

export interface BalanceCardProps {
  accountInfo?: any;
  isMainnet?: boolean;
  isShowRamp?: boolean;
  isShowSwap?: boolean;
  isShowFaucet?: boolean;
  onBuy?: () => void;
  onSend?: () => void;
  onReceive?: () => void;
  onSwap?: () => void;
  onFaucet?: () => void;
}

enum ItemType {
  Send = 'send',
  Receive = 'receive',
  Buy = 'buy',
  Swap = 'swap',
  Faucet = 'faucet',
}

export default function BalanceCard({
  isShowRamp = true,
  isShowSwap,
  isShowFaucet,
  isMainnet,
  onBuy,
  onSend,
  onReceive,
  onSwap,
  onFaucet,
}: BalanceCardProps) {
  const itemConfig: Record<
    ItemType,
    { isShow: boolean; icon: CustomSvgProps['type']; name: string; onClick?: () => void }
  > = useMemo(() => {
    return {
      [ItemType.Send]: {
        isShow: true,
        icon: 'TokenPaper',
        name: 'Send',
        onClick: onSend,
      },
      [ItemType.Receive]: {
        isShow: true,
        icon: 'TokenArrow',
        name: 'Receive',
        onClick: onReceive,
      },
      [ItemType.Buy]: {
        isShow: !!(isShowRamp && isMainnet),
        icon: 'TokenMoney',
        name: 'Buy',
        onClick: onBuy,
      },
      [ItemType.Swap]: {
        isShow: !!isShowSwap,
        icon: 'TokenTransfer',
        name: 'Swap',
        onClick: onSwap,
      },
      [ItemType.Faucet]: {
        isShow: !!(isShowFaucet && !isMainnet),
        icon: 'Faucet',
        name: 'Faucet',
        onClick: onFaucet,
      },
    };
  }, [isMainnet, isShowFaucet, isShowRamp, isShowSwap, onBuy, onFaucet, onReceive, onSend, onSwap]);

  const renderItem = (type: ItemType) => {
    const { isShow, icon, name, onClick } = itemConfig[type];
    if (!isShow) return null;
    return (
      <div className={clsx('item-wrapper', `item-wrapper-${type}`)}>
        <CommonButton className="item-button" type="primaryOutline" onClick={onClick}>
          <CustomSvg className="item-icon" type={icon} fillColor="var(--sds-color-background-default-default)" />
        </CommonButton>
        <span className="item-name">{name}</span>
      </div>
    );
  };

  return (
    <div className="portkey-ui-balance-card">
      {renderItem(ItemType.Send)}
      {renderItem(ItemType.Receive)}
      {renderItem(ItemType.Buy)}
      {renderItem(ItemType.Swap)}
      {renderItem(ItemType.Faucet)}
    </div>
  );
}
