import { Button, Input } from 'antd';
import { useState } from 'react';
import { ALLOWANCE_MAX_LIMIT } from '../../constants';
import { parseInputNumberChange } from '../../utils/input';
import BigNumber from 'bignumber.js';

export interface BaseSetAllowanceProps {
  symbol: string;
  amount: number | string;
  dappName: string;
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
export default function SetAllowanceMain({ amount, dappName, symbol, onCancel, onConfirm }: SetAllowanceProps) {
  const [allowance, setAllowance] = useState<string>(formatAllowanceInput(amount));

  const [error, setError] = useState<string>('');
  return (
    <div className="set-allowance-wrapper">
      <h1>{`${dappName} is requesting access to your ${symbol}`}</h1>
      <div className="set-allowance-description">set-allowance-description</div>
      <div className="set-allowance-input-wrapper">
        <div className="portkey-ui-flex-between-center">
          <span>{`Set Allowance (${symbol})`}</span>
          <span onClick={() => setAllowance(formatAllowanceInput(amount))}>Use Recommend Value</span>
        </div>
        <div className="input-wrapper">
          <Input
            value={allowance}
            onChange={(e) => {
              const value = e.target.value;
              const amount = formatAllowanceInput(value);
              setAllowance(amount);
            }}
            suffix={<span onClick={() => setAllowance(ALLOWANCE_MAX_LIMIT)}>Max</span>}
          />
          {error && <span className="error-text">{error}</span>}
        </div>
        <div className="set-allowance-notice">
          JUST Input
          {/* TODO */}
        </div>
      </div>
      <div className="btn-wrapper">
        <Button onClick={onCancel}>Reject</Button>
        <Button
          type="primary"
          disabled={BigNumber(allowance).isNaN()}
          onClick={() => {
            if (BigNumber(allowance).lte(0)) return setError('Please enter a nonzero value');
            onConfirm?.({ allowance });
          }}>
          Pre-authorize
        </Button>
      </div>
    </div>
  );
}
