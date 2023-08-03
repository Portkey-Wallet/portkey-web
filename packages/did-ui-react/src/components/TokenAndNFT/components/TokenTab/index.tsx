import { TokenItemShowType } from '../../../types/assets';
import CustomSvg from '../../../CustomSvg';
import { ELF_SYMBOL } from '../../../../constants/assets';
import { divDecimals, formatAmountShow, transNetworkText } from '../../../../utils/converter';
import './index.less';
import BigNumber from 'bignumber.js';

export default function TokenTab({ isMainnet, tokenList }: { isMainnet?: boolean; tokenList?: TokenItemShowType[] }) {
  return (
    <>
      <ul className="portkey-ui-token-list">
        {tokenList?.map((item) => (
          <li className="token-list-item" key={`${item.chainId}_${item.symbol}`}>
            {item.symbol === ELF_SYMBOL ? (
              <CustomSvg className="token-logo" type={'AelfTestnet'} />
            ) : (
              <div className="token-logo custom-word-logo">{item.symbol?.slice(0, 1)}</div>
            )}
            <div className="desc">
              <div className="info">
                <span>{item.symbol}</span>
                <span>{formatAmountShow(divDecimals(item.balance, item.decimals))}</span>
              </div>
              <div className="amount">
                <p>{transNetworkText(item.chainId, isMainnet)}</p>
                {isMainnet && item.balanceInUsd && !BigNumber(item.balanceInUsd).isZero() && (
                  <p className="convert">{`$ ${formatAmountShow(item.balanceInUsd)}`}</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
