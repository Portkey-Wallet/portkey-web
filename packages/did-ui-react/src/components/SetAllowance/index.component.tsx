import { Input } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { parseInputNumberChange } from '../../utils/input';
import BigNumber from 'bignumber.js';
import './index.less';
import { isValidNumber } from '../../utils';
import clsx from 'clsx';
import ThrottleButton from '../ThrottleButton';
import CustomSvg from '../CustomSvg';

const PrefixCls = 'set-allowance';
export interface BaseSetAllowanceProps {
  symbol: string;
  decimals?: number;
  amount: number | string;
  className?: string;
  max?: string | number;
  dappInfo?: { icon?: string; href?: string; name?: string };
  showBatchApproveToken?: boolean;
}

export interface IAllowance {
  allowance: string;
  batchApproveToken: boolean;
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
  showBatchApproveToken,
  symbol,
  className,
  recommendedAmount = 0,
  onCancel,
  onAllowanceChange,
  onConfirm,
}: SetAllowanceProps) {
  const [batchApproveToken, setBatchApproveToken] = useState<boolean>(false);
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

  const onAllowAllTokenChange = useCallback(() => {
    setBatchApproveToken((prev) => !prev);
  }, []);
  const noticeText = useMemo(() => {
    return showBatchApproveToken
      ? `The allowance you set will apply to all tokens, allowing the dApp to utilise them as long as the combined
      total doesn't exceed the limit. It's crucial to assess potential risks carefully and set a
      reasonable allowance value, taking into account both token price and quantity.`
      : 'Within this allowance limit, the Dapp does not require reconfirmation from you when a transaction occurs.';
  }, [showBatchApproveToken]);
  const titleText = useMemo(() => {
    return dappInfo?.name ? `${dappInfo?.name} is requesting access to your token` : `Request for access to your token`;
  }, [dappInfo?.name]);
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
        <h1 className={`portkey-ui-text-center ${PrefixCls}-title`}>{titleText}</h1>
        <div className={`portkey-ui-text-center ${PrefixCls}-description`}>
          To ensure asset security, please customise an allowance for this dApp. Until this allowance is exhausted, the
          dApp will not request your approval to utilise the specified token. You have the option to adjust these
          settings once the allowance is depleted.
        </div>
      </div>

      <div className={`${PrefixCls}-body`}>
        <div className={`portkey-ui-flex-between-center ${PrefixCls}-body-title`}>
          <span className={`${PrefixCls}-set`}>{`Set Allowance`}</span>
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
        {showBatchApproveToken && (
          <div className={`${PrefixCls}-confirm-line`}>
            <CustomSvg
              type={batchApproveToken ? 'Checked' : 'Unchecked'}
              style={{ width: 18, height: 18 }}
              onClick={onAllowAllTokenChange}
            />
            <div className={`${PrefixCls}-confirm-line-text`}>Approve multiple tokens at the same time</div>
          </div>
        )}
        <div className={`${PrefixCls}-notice`}>{noticeText}</div>
      </div>
      <div className="portkey-ui-flex-1 portkey-ui-flex-column-reverse">
        <div className="btn-wrapper">
          <ThrottleButton onClick={onCancel}>Reject</ThrottleButton>
          <ThrottleButton
            type="primary"
            disabled={BigNumber(allowance).isNaN()}
            onClick={() => {
              if (!isValidNumber(allowance)) return setError('Please enter a positive whole number');
              if (BigNumber(allowance).lte(0)) return setError('Please enter a non-zero value');
              onConfirm?.({
                allowance,
                batchApproveToken,
              });
            }}>
            Authorize
          </ThrottleButton>
        </div>
      </div>
    </div>
  );
}
