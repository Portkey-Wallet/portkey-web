import { Button, Input } from 'antd';
import { useCallback, useState } from 'react';
import { ALLOWANCE_MAX_LIMIT } from '../../constants';
import { parseInputNumberChange } from '../../utils/input';
import BigNumber from 'bignumber.js';
import './index.less';
import { isValidNumber } from '../../utils';
import clsx from 'clsx';

const PrefixCls = 'set-allowance';
export interface BaseSetAllowanceProps {
  symbol: string;
  amount: number | string;
  className?: string;
  dappInfo?: { icon?: string; href?: string; name?: string };
}

export interface IAllowance {
  allowance: string;
}

export interface SetAllowanceHandlerProps {
  onCancel?: () => void;
  onConfirm?: (res: IAllowance) => void;
}

export type SetAllowanceProps = BaseSetAllowanceProps & SetAllowanceHandlerProps;

const formatAllowanceInput = (value: number | string) =>
  parseInputNumberChange(value.toString(), new BigNumber(ALLOWANCE_MAX_LIMIT), 0);
export default function SetAllowanceMain({
  amount,
  dappInfo,
  symbol,
  className,
  onCancel,
  onConfirm,
}: SetAllowanceProps) {
  const [allowance, setAllowance] = useState<string>(formatAllowanceInput(amount));

  const [error, setError] = useState<string>('');

  const inputChange = useCallback((amount: string | number) => {
    setAllowance(formatAllowanceInput(amount));
    setError('');
  }, []);
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
        <h1 className={`portkey-ui-text-center ${PrefixCls}-title`}>{`${
          dappInfo?.name || '--'
        } is requesting access to your ${symbol}`}</h1>
        <div className={`portkey-ui-text-center ${PrefixCls}-description`}>
          To ensure your assets&rsquo; security while interacting with the DApp, please set a token allowance for this
          DApp. The DApp will notify you when its allowance is used up and you can modify the settings again.
        </div>
      </div>

      <div className={`${PrefixCls}-body`}>
        <div className={`portkey-ui-flex-between-center ${PrefixCls}-body-title`}>
          <span className={`${PrefixCls}-set`}>{`Set Allowance (${symbol})`}</span>
          <span className={`${PrefixCls}-use-recommended`} onClick={() => inputChange(amount)}>
            Use Recommended Value
          </span>
        </div>
        <div className={`${PrefixCls}-input-wrapper`}>
          <Input
            value={allowance}
            onChange={(e) => {
              inputChange(e.target.value);
            }}
            suffix={<span onClick={() => inputChange(ALLOWANCE_MAX_LIMIT)}>Max</span>}
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
              if (BigNumber(allowance).lte(0)) return setError('Please enter a nonzero value');
              onConfirm?.({ allowance });
            }}>
            Pre-authorize
          </Button>
        </div>
      </div>
    </div>
  );
}
