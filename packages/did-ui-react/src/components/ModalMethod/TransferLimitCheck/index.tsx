import { ChainId, ChainType } from '@portkey/types';
import { ITransferLimitItem } from '@portkey/services';
import { checkTransferLimit } from '../../../utils/sandboxUtil/checkTransferLimit';
import { modalMethod } from './modalMethod';
import type { ModalFuncProps } from 'antd';
import { ZERO } from '../../../constants/misc';
import { LimitType, MAX_TRANSACTION_FEE } from '../../../constants/security';
import { divDecimals } from '../../../utils/converter';
import { getBalanceByContract } from '../../../utils/sandboxUtil/getBalance';
import { TRampPreviewInitState } from '../../../types';
import { SendExtraConfig } from '../../Send/index.components';
import { IBusinessFrom, ITransferLimitItemWithRoute } from '../../../types/transfer';
import { TipContent } from '../../Send/components/SendModalTip';
import ButtonGroup from '../../ButtonGroup';
import { CommonButtonType } from '../../CommonButton';
import './index.less';

interface ITransferLimitCheckProps {
  wrapClassName?: string;
  className?: string;
  rpcUrl: string;
  caContractAddress: string;
  caHash: string;
  chainId: ChainId;
  symbol: string;
  decimals: number | string;
  amount: string;
  sandboxId?: string;
  businessFrom?: {
    module: IBusinessFrom;
    extraConfig?: TRampPreviewInitState | SendExtraConfig;
  };
  balance?: string;
  chainType?: ChainType;
  tokenContractAddress?: string;
  ownerCaAddress?: string;
  onOneTimeApproval?: (data: ITransferLimitItemWithRoute) => void;
  onModifyTransferLimit?: (data: ITransferLimitItemWithRoute) => void;
}

interface ITransferLimitModalProps extends ModalFuncProps {
  wrapClassName?: string;
  className?: string;
  data?: ITransferLimitItem;
  limitType: LimitType;
}
interface ITransferLimitApprovalModalProps extends ModalFuncProps {
  wrapClassName?: string;
  className?: string;
  data: ITransferLimitItem;
  limitType: LimitType;
  onOneTimeApproval?: (data: ITransferLimitItemWithRoute) => void;
  onModifyTransferLimit?: (data: ITransferLimitItemWithRoute) => void;
}

const transferLimitCheck = async ({
  wrapClassName,
  className,
  rpcUrl,
  caContractAddress,
  caHash,
  chainId,
  symbol,
  decimals,
  amount,
  sandboxId,
  businessFrom,
  balance,
  chainType,
  tokenContractAddress,
  ownerCaAddress,
  onOneTimeApproval,
  onModifyTransferLimit,
  ...props
}: ITransferLimitCheckProps) => {
  const limitRes = await checkTransferLimit({
    rpcUrl,
    caContractAddress,
    sandboxId,
    caHash,
    params: { symbol, decimals, amount },
  });

  if (limitRes?.isSingleLimited || limitRes?.isDailyLimited) {
    // get balance
    if (!balance && (!chainType || !tokenContractAddress || !ownerCaAddress)) {
      throw Error('Invalid Params');
    }
    if (!balance && chainType && tokenContractAddress && ownerCaAddress) {
      const result = await getBalanceByContract({
        sandboxId,
        chainType,
        chainId: chainId,
        tokenContractAddress: tokenContractAddress,
        paramsOption: {
          owner: ownerCaAddress,
          symbol: symbol,
        },
      });
      balance = result.balance;
    }
    const settingParams: ITransferLimitItemWithRoute = {
      chainId: chainId,
      symbol,
      singleLimit: limitRes?.singleBalance.toString() || '',
      dailyLimit: limitRes?.dailyLimit.toString() || '',
      restricted: !limitRes?.dailyLimit.eq(-1),
      decimals,
      businessFrom,
      chainImageUrl: '',
      displayChainName: '',
    };

    // check limit type and show modal
    if (
      ZERO.plus(amount)
        .plus(MAX_TRANSACTION_FEE)
        .gte(ZERO.plus(divDecimals(balance, decimals)))
    ) {
      TransferLimitModal({
        wrapClassName,
        className,
        data: settingParams,
        limitType: limitRes?.isSingleLimited ? LimitType.Single : LimitType.Daily,
        onOk: onModifyTransferLimit,
        ...props,
      });
    } else {
      TransferLimitApprovalModal({
        wrapClassName,
        className,
        data: settingParams,
        limitType: limitRes?.isSingleLimited ? LimitType.Single : LimitType.Daily,
        onOneTimeApproval,
        onModifyTransferLimit,
        ...props,
      });
    }
    return false;
  }
  return true;
};

export function TransferLimitMain({ onOk, onCancel }: { onOk: () => void; onCancel: () => void }) {
  return (
    <div className="transfer-limit-content">
      <TipContent
        title={`Maximum transaction limit exceeded`}
        content={`Please modify the transfer limit to proceed.`}
        onClose={onCancel}
      />
      <ButtonGroup
        type="row"
        buttons={[
          {
            type: 'outline' as CommonButtonType,
            onClick: onCancel,
            content: 'Cancel',
          },
          {
            type: 'primary' as CommonButtonType,
            onClick: onOk,
            content: 'Modify',
          },
        ]}
      />
    </div>
  );
}

export function TransferLimitModal({
  wrapClassName,
  className,
  data,
  limitType,
  onOk,
  ...props
}: ITransferLimitModalProps) {
  return new Promise((resolve) => {
    const modal = modalMethod({
      ...props,
      wrapClassName: 'portkey-ui-common-modals portkey-ui-transfer-limit-wrapper ' + wrapClassName,
      className: 'portkey-ui-transfer-limit-modal ' + className,
      content: (
        <TransferLimitMain
          onOk={() => {
            resolve(true);
            onOk?.(data);
            modal.destroy();
          }}
          onCancel={() => {
            resolve(false);
            modal.destroy();
          }}
        />
      ),
    });
  });
}

export function TransferLimitApprovalMain({ onOk, onCancel }: { onOk: () => void; onCancel: () => void }) {
  return (
    <div className="transfer-limit-content">
      <TipContent
        title={`Maximum transaction limit exceeded`}
        content={`Request one-time guardian approval to proceed, or modify the limit to lift restrictions on future transactions.`}
        onClose={onCancel}
      />
      <ButtonGroup
        type="col"
        buttons={[
          {
            type: 'primary' as CommonButtonType,
            onClick: onOk,
            content: 'Request one-time approval',
          },
          {
            type: 'outline' as CommonButtonType,
            onClick: onCancel,
            content: 'Modify transfer limit for all',
          },
        ]}
      />
    </div>
  );
}

export function TransferLimitApprovalModal({
  wrapClassName,
  className,
  data,
  limitType,
  onOneTimeApproval,
  onModifyTransferLimit,
  ...props
}: ITransferLimitApprovalModalProps) {
  return new Promise((resolve) => {
    const modal = modalMethod({
      ...props,
      wrapClassName: 'portkey-ui-common-modals portkey-ui-transfer-limit-approval-wrapper ' + wrapClassName,
      className: 'portkey-ui-transfer-limit-approval-modal ' + className,
      content: (
        <TransferLimitApprovalMain
          onOk={() => {
            resolve(true);
            onOneTimeApproval?.(data);
            modal.destroy();
          }}
          onCancel={() => {
            resolve(true);
            onModifyTransferLimit?.(data);
            modal.destroy();
          }}
        />
      ),
    });
  });
}

export default transferLimitCheck;
