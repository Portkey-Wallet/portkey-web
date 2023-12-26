import { ELF_SYMBOL } from '../../../../constants/assets';
import CustomSvg from '../../../CustomSvg';
import { divDecimals, formatAmountShow, transNetworkText } from '../../../../utils/converter';
import BigNumber from 'bignumber.js';
import { IAssetItemType } from '@portkey-v1/services';

export default function AssetsTokenItem({
  isMainnet,
  token,
  onSelect,
}: {
  isMainnet: boolean;
  token: IAssetItemType;
  onSelect?: (select: IAssetItemType, type: 'TOKEN') => void;
}) {
  return (
    <div className="item" key={`${token.symbol}_${token.chainId}`} onClick={onSelect?.bind(undefined, token, 'TOKEN')}>
      <div className="icon">
        <div className="custom">
          {token.symbol === ELF_SYMBOL ? <CustomSvg className="token-logo" type="ELF" /> : token?.symbol?.slice(0, 1)}
        </div>
      </div>
      <div className="info">
        <p className="symbol">{`${token.symbol}`}</p>
        <p className="network">{transNetworkText(token.chainId, isMainnet)}</p>
      </div>
      <div className="amount">
        <p className="quantity">{formatAmountShow(divDecimals(token.tokenInfo?.balance, token.tokenInfo?.decimals))}</p>
        {isMainnet && token.tokenInfo?.balanceInUsd && !BigNumber(token.tokenInfo.balanceInUsd).isZero() && (
          <p className="convert">{`$ ${formatAmountShow(token.tokenInfo.balanceInUsd)}`}</p>
        )}
      </div>
    </div>
  );
}
