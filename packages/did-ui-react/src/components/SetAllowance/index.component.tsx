import { Input } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseInputNumberChange } from '../../utils/input';
import BigNumber from 'bignumber.js';
import './index.less';
import { isValidNumber } from '../../utils';
import clsx from 'clsx';
import ThrottleButton from '../ThrottleButton';
import { isNFT } from '../../utils/assets';
import CustomSvg from '../CustomSvg';
import { useGetContractUpgradeTime } from '@portkey/graphql';
import { NetworkType } from '../../types';
import { getChain } from '../../hooks';
import { ChainId } from '@portkey/types';
import { checkTimeOver12, formatDateTime } from '@portkey/utils';

const PrefixCls = 'set-allowance';
export interface BaseSetAllowanceProps {
  symbol: string;
  decimals?: number;
  amount: number | string;
  className?: string;
  max?: string | number;
  dappInfo?: { icon?: string; href?: string; name?: string };
  batchApproveNFT?: boolean;
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
  networkType?: NetworkType;
  originChainId?: ChainId;
  targetChainId?: ChainId;
} & SetAllowanceHandlerProps;

export default function SetAllowanceMain({
  max = Infinity,
  symbol,
  amount,
  decimals,
  dappInfo,
  className,
  recommendedAmount = 0,
  networkType,
  originChainId,
  targetChainId,
  onCancel,
  onAllowanceChange,
  onConfirm,
}: SetAllowanceProps) {
  const formatAllowanceInput = useCallback(
    (value: number | string) =>
      parseInputNumberChange(value.toString(), max ? new BigNumber(max) : undefined, decimals),
    [decimals, max],
  );

  const approveSymbol = useMemo(() => (isNFT(symbol) ? symbol.split('-')[0] : symbol), [symbol]);

  const allowance = useMemo(() => formatAllowanceInput(amount), [amount, formatAllowanceInput]);

  const [error, setError] = useState<string>('');
  const getContractUpgradeTime = useGetContractUpgradeTime(networkType === 'MAINNET');
  const [contractUpgradeTimeResult, setContractUpgradeTimeResult] = useState<{
    isInit: boolean;
    isTimeOver12: boolean;
    formatTime: string;
  }>({
    isInit: true,
    isTimeOver12: true,
    formatTime: '',
  });
  useEffect(() => {
    (async () => {
      if (!originChainId || !targetChainId) {
        return;
      }
      const chainInfo = await getChain(originChainId);
      const result = await getContractUpgradeTime({
        input: {
          chainId: targetChainId,
          address: chainInfo.caContractAddress || '',
          skipCount: 0,
          maxResultCount: 10,
        },
      });
      console.log('wfs===result', result);
      const blockTime = result.data.contractList.items[0].metadata.block.blockTime;
      setContractUpgradeTimeResult({
        isInit: false,
        isTimeOver12: checkTimeOver12(blockTime),
        formatTime: formatDateTime(blockTime),
      });
      console.log('wfs===result2', {
        isInit: false,
        isTimeOver12: checkTimeOver12(blockTime),
        formatTime: formatDateTime(blockTime),
      });
    })();
  }, [getContractUpgradeTime, originChainId, targetChainId]);

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

  const noticeText = useMemo(() => {
    return `It's crucial to set a reasonable allowance value, taking into account both token price and quantity. You have the option to adjust the settings once the allowance is depleted.`;
  }, []);

  const titleText = useMemo(() => {
    return dappInfo?.name
      ? `${dappInfo?.name} is requesting access to your ${approveSymbol}`
      : `Request for access to your ${approveSymbol}`;
  }, [approveSymbol, dappInfo?.name]);

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
          dApp will not request your approval to utilise&nbsp;{approveSymbol}
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
            suffix={
              <span>
                <span className={`${PrefixCls}-approveSymbol`}>{approveSymbol}</span>
                <span onClick={() => inputChange(max)}>Max</span>
              </span>
            }
          />
          {typeof error !== 'undefined' && <div className="error-text">{error}</div>}
        </div>

        <div className={`${PrefixCls}-notice`}>{noticeText}</div>
      </div>
      {!contractUpgradeTimeResult.isInit && (
        <div
          className={`${PrefixCls}-warning ${!contractUpgradeTimeResult.isTimeOver12 && `${PrefixCls}-warning-hint`}`}>
          <CustomSvg
            type="WarningTriangle"
            className={`warning-icon`}
            fillColor={contractUpgradeTimeResult.isTimeOver12 ? '#5D42FF' : '#FF9417'}
          />
          <div>{`Contract update time: ${
            contractUpgradeTimeResult?.formatTime || ''
          }. The dApp's smart contract has been updated. Please proceed with caution.`}</div>
        </div>
      )}
      <div className="portkey-ui-flex-1 portkey-ui-flex-column-reverse">
        <div className="btn-wrapper">
          <ThrottleButton onClick={onCancel}>Cancel</ThrottleButton>
          <ThrottleButton
            type="primary"
            disabled={BigNumber(allowance).isNaN()}
            onClick={() => {
              if (!isValidNumber(allowance)) return setError('Please enter a positive whole number');
              if (BigNumber(allowance).lte(0)) return setError('Please enter a non-zero value');
              onConfirm?.({
                allowance,
              });
            }}>
            Pre-authorize
          </ThrottleButton>
        </div>
      </div>
    </div>
  );
}
