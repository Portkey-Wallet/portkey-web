import clsx from 'clsx';
import { useMemo } from 'react';
import { ChainId, SeedTypeEnum } from '@portkey/types';
import { formatAmountShow } from '../../../../utils/converter';
import { supplementAllAelfAddress, isAelfAddress } from '../../../../utils/aelf';
import { amountInUsdShow, chainShowText } from '../../../../utils/assets';
import { useDefaultToken } from '../../../../hooks/assets';
import { ZERO } from '../../../../constants/misc';
import { useTokenPrice } from '../../../context/PortkeyAssetProvider/hooks';
import { formatStr2EllipsisStr } from '../../../../utils';
import './index.less';
import NFTImage from '../../../NFTImage';

export interface SendPreviewProps {
  nickname?: string;
  isMainnet: boolean;
  amount: string;
  symbol: string;
  label?: string;
  alias: string;
  balanceInUsd?: string;
  imageUrl: string;
  decimals: string | number;
  isSeed: boolean;
  seedType: SeedTypeEnum;
  toAccount: { name?: string; address: string };
  transactionFee: string | number;
  type: 'nft' | 'token';
  chainId: ChainId;
  isCross: boolean;
  tokenId: string;
  crossChainFee: number;
  caAddress: string;
}

export default function SendPreview({
  nickname = '--',
  amount,
  symbol,
  label,
  alias,
  toAccount,
  transactionFee,
  type,
  imageUrl,
  decimals,
  isSeed,
  seedType,
  chainId,
  isCross,
  tokenId,
  isMainnet,
  crossChainFee,
  caAddress,
}: SendPreviewProps) {
  const defaultToken = useDefaultToken(chainId);
  const defaultTokenPrice = useTokenPrice(defaultToken.symbol);

  const symbolPrice = useTokenPrice(symbol);

  const toChain = useMemo(() => {
    const arr = toAccount.address.split('_');
    if (isAelfAddress(arr[arr.length - 1])) {
      return 'AELF';
    }
    return arr[arr.length - 1];
  }, [toAccount.address]);

  const entireFromAddressShow = useMemo(
    () => supplementAllAelfAddress(caAddress || '', undefined, chainId),
    [caAddress, chainId],
  );
  const renderEstimateAmount = useMemo(() => {
    if (ZERO.plus(amount).isLessThanOrEqualTo(crossChainFee)) {
      return (
        <>
          <span className="usd">{isMainnet && '$0 '}</span>
          {`0 ${defaultToken.symbol}`}
        </>
      );
    } else {
      return (
        <>
          <span className="usd">
            {isMainnet &&
              amountInUsdShow({
                balance: ZERO.plus(amount).minus(crossChainFee).toString(),
                decimal: 0,
                price: defaultTokenPrice,
              })}
            &nbsp;
          </span>
          {`${formatAmountShow(ZERO.plus(amount).minus(crossChainFee))} ${label || symbol}`}
        </>
      );
    }
  }, [amount, crossChainFee, defaultTokenPrice, isMainnet, label, symbol, defaultToken]);

  return (
    <div className="portkey-ui-send-preview">
      {type !== 'nft' ? (
        <div className="amount-preview">
          <p className="amount">
            -{formatAmountShow(amount)} {label || symbol}
          </p>
          <p className="convert">{isMainnet && amountInUsdShow({ balance: amount, decimal: 0, price: symbolPrice })}</p>
        </div>
      ) : (
        <div className="amount-preview nft">
          <NFTImage name={symbol} imageUrl={imageUrl} isSeed={isSeed} seedType={seedType} />
          <div className="info">
            <p className="portkey-ui-flex index">
              <p className="alias">{alias}</p>
              <p className="token-id">{`#${tokenId}`}</p>
            </p>
            <p className="quantity">
              Amount: <span>{formatAmountShow(amount, decimals)}</span>
            </p>
          </div>
        </div>
      )}
      <div className="address-preview">
        <div className="item">
          <span className="label">From</span>
          <div className="value">
            <p className="name">{nickname}</p>
            <p className="address">{formatStr2EllipsisStr(entireFromAddressShow)}</p>
          </div>
        </div>
        <div className={clsx('item', toAccount.name?.length || 'no-name')}>
          <span className="label">To</span>
          <div className="value">
            {!!toAccount.name?.length && <p className="name">{toAccount.name}</p>}
            <p className="address">
              {toAccount.address.includes('ELF_')
                ? formatStr2EllipsisStr(toAccount.address)
                : formatStr2EllipsisStr(toAccount.address, [6, 6])}
            </p>
          </div>
        </div>
        <div className="item network">
          <span>Network</span>
          <div>
            <p className="chain">
              {`aelf ${chainShowText(chainId as ChainId)}->aelf ${chainShowText(toChain as ChainId)}`}
            </p>
          </div>
        </div>
      </div>
      <div className="fee-preview">
        <span className="label">Transaction fee</span>
        <p className="value">
          <span className="symbol">
            <span className="usd">
              {isMainnet &&
                amountInUsdShow({
                  balance: transactionFee,
                  decimal: 0,
                  price: defaultTokenPrice,
                })}
            </span>
            {` ${formatAmountShow(transactionFee)} ${defaultToken.symbol}`}
          </span>
        </p>
      </div>
      {isCross && (
        <div className="fee-preview">
          <span className="label">Estimated CrossChain Transfer</span>
          <p className="value">
            <span className="symbol">
              <span className="usd">
                {isMainnet &&
                  amountInUsdShow({
                    balance: crossChainFee,
                    decimal: 0,
                    price: symbolPrice,
                  })}
              </span>
              {` ${formatAmountShow(crossChainFee)} ${defaultToken.symbol}`}
            </span>
          </p>
        </div>
      )}
      {isCross && symbol === defaultToken.symbol && (
        <div className="fee-preview">
          <span className="label">Estimated amount received</span>
          <p className="value">
            <span className="symbol">{renderEstimateAmount}</span>
          </p>
        </div>
      )}
    </div>
  );
}
