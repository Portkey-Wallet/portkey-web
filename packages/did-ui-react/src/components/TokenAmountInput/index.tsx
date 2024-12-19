import React, { memo, useCallback, useMemo, useState } from 'react';
import { ZERO } from '../../constants/misc';
import { useEffectOnce } from 'react-use';
import { parseInputNumberChange } from '../../utils/input';
import './index.less';
import { useTokenPrice } from '../context/PortkeyAssetProvider/hooks';
import CustomSvg from '../CustomSvg';

export interface ITokenAmountInput {
  value?: string;
  usdValue?: string;
  label?: string;
  symbol: string;
  decimals: string | number;
  warningTip?: string;
  disabledEdit?: boolean;
  showErrorInput?: boolean;
  setValue: (v: string) => void;
  setUsdValue: (v: string) => void;
}

export const TokenAmountInput: React.FC<ITokenAmountInput> = (props) => {
  const {
    value = '',
    usdValue = '',
    label,
    symbol,
    decimals,
    warningTip = '',
    disabledEdit = true,
    showErrorInput = false,
    setValue,
    setUsdValue,
  } = props;

  const price = useTokenPrice(symbol);

  const [isRevert, setIsRevert] = useState(false);
  const [tokenPriceObject, getTokenPrice] = [
    {},
    () => {
      console.log('aa');
    },
  ];

  useEffectOnce(() => {
    // getTokenPrice(symbol);
  });
  const onPressRevert = useCallback(() => setIsRevert((pre) => !pre), []);
  const onValueInputChange = useCallback(
    (v: string) => {
      setValue(v);

      return;
      const _v = parseInputNumberChange(v, Infinity, Number(decimals));
      const _usdV = ZERO.plus(_v || 0)
        .multipliedBy(10)
        .toFixed(2);
      setValue(_v);
      setUsdValue(_usdV);
    },
    [decimals, setUsdValue, setValue],
  );
  const onUsdValueInputChange = useCallback(
    (v: string) => {
      const _usdV = parseInputNumberChange(v, Infinity, 2);
      const _v = parseInputNumberChange(
        ZERO.plus(_usdV || 0)
          .div(10) // TODO: change it
          .valueOf(),
        Infinity,
        Number(decimals),
      );
      setUsdValue(_usdV);
      setValue(_v);
    },
    [decimals, setUsdValue, setValue],
  );

  const existTokenPrice = useMemo(() => {
    return '';
  }, []);

  return (
    <div className="portkey-sdk-token-amount-input-wrap">
      <div className="top-section">
        <>
          {isRevert ? (
            <>
              <div className="symbol">{'$ '}</div>
              <div className="amount-input-wrap">
                <input
                  className="amount-input"
                  disabled={disabledEdit}
                  value={usdValue}
                  onChange={(e) => onUsdValueInputChange(e.target.value)}
                  placeholder="0"
                />
                <span>{usdValue}</span>
              </div>
            </>
          ) : (
            <>
              <div className="amount-input-wrap">
                <input
                  className="amount-input"
                  disabled={disabledEdit}
                  value={value}
                  placeholder="0"
                  onChange={(e) => onValueInputChange(e.target.value)}
                />
                <span>{value}</span>
              </div>
              <div className="symbol">{` ${label || symbol}`}</div>
            </>
          )}
        </>
      </div>
      {!existTokenPrice && (
        <div className="bottom-section" onClick={onPressRevert}>
          {isRevert ? <div>{`${value || 0} ${label || symbol}`}</div> : <div>{`$${usdValue || 0}`}</div>}
          <CustomSvg type={'Switch'} className="switch" />
        </div>
      )}
      {warningTip && <div>{warningTip}</div>}
    </div>
  );
};

export default memo(TokenAmountInput);
