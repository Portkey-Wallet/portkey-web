import { Button, Input } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { parseInputNumberChange } from '../../utils/input';
import BigNumber from 'bignumber.js';
import './index.less';
import { isValidNumber } from '../../utils';
import clsx from 'clsx';
import { divDecimals } from '../../utils/converter';

const PrefixCls = 'set-allowance';
export interface BaseSetAllowanceProps {
  symbol: string;
  decimals?: number;
  amount: number | string;
  className?: string;
  max?: string | number;
  dappInfo?: { icon?: string; href?: string; name?: string };
}

export interface IAllowance {
  allowance: string;
}

export interface SetAllowanceHandlerProps {
  onCancel?: () => void;
  onConfirm?: (res: IAllowance) => void;
  onAllowanceChange?: (amount: string) => void;
}

export type SetAllowanceProps = BaseSetAllowanceProps & {
  recommendedAmount?: string | number;
} & SetAllowanceHandlerProps;

export default function SetAllowanceMain({
  max = Infinity,
  amount,
  decimals,
  dappInfo,
  symbol,
  className,
  recommendedAmount = 0,
  onCancel,
  onAllowanceChange,
  onConfirm,
}: SetAllowanceProps) {
  const formatAllowanceInput = useCallback(
    (value: number | string) =>
      parseInputNumberChange(value.toString(), max ? new BigNumber(max) : undefined, decimals),
    [decimals, max],
  );

  const allowance = useMemo(() => formatAllowanceInput(amount), [amount, formatAllowanceInput]);

  const [error, setError] = useState<string>('');

  const inputChange = useCallback(
    (amount: string | number) => {
      if (isValidNumber(`${amount}`)) {
        onAllowanceChange?.(formatAllowanceInput(amount));
      } else if (!amount) {
        onAllowanceChange?.('');
      }
      setError('');
    },
    [formatAllowanceInput, onAllowanceChange],
  );

  return (
    <div className={clsx(`${PrefixCls}-wrapper`, className)}>
      <div className={clsx('portkey-ui-flex-center', `${PrefixCls}-dapp-info`)}>
        {(dappInfo?.href || dappInfo?.icon) && (
          <div className={`${PrefixCls}-dapp-info-inner`}>
            {dappInfo.icon && <img className={`${PrefixCls}-dapp-icon`} src={dappInfo.icon} />}
            {dappInfo.href && <span className={`${PrefixCls}-dapp-href`}>{dappInfo.href}</span>}
          </div>
        )}
      </div>
      <div className={`${PrefixCls}-header`}>
        <h1 className={`portkey-ui-text-center ${PrefixCls}-title`}>{`Request for access to your ${symbol}`}</h1>
        <div className={`portkey-ui-text-center ${PrefixCls}-description`}>
          To ensure your assets&rsquo; security while interacting with the DApp, please set a token allowance for this
          DApp. The DApp will notify you when its allowance is used up and you can modify the settings again.
        </div>
      </div>

      <div className={`${PrefixCls}-body`}>
        <div className={`portkey-ui-flex-between-center ${PrefixCls}-body-title`}>
          <span className={`${PrefixCls}-set`}>{`Set Allowance (${symbol})`}</span>
          <span className={`${PrefixCls}-use-recommended`} onClick={() => inputChange(recommendedAmount)}>
            Use Recommended Value
          </span>
        </div>
        <div className={`${PrefixCls}-input-wrapper`}>
          <Input
            value={allowance}
            onChange={(e) => {
              inputChange(e.target.value);
            }}
            suffix={<span onClick={() => inputChange(max)}>Max</span>}
          />
          {typeof error !== 'undefined' && <div className="error-text">{error}</div>}
        </div>
        <div className={`${PrefixCls}-notice`}>Please set a reasonable value as the allowance for this DApp.</div>
      </div>
      <div className="portkey-ui-flex-1 portkey-ui-flex-column-reverse">
        <div className="btn-wrapper">
          <Button onClick={onCancel}>Reject</Button>
          <Button
            type="primary"
            disabled={BigNumber(allowance).isNaN()}
            onClick={() => {
              if (!isValidNumber(allowance)) return setError('Please enter a positive whole number');
              if (BigNumber(allowance).lte(0)) return setError('Please enter a non-zero value');
              onConfirm?.({ allowance });
            }}>
            Authorize
          </Button>
        </div>
      </div>
    </div>
  );
}
