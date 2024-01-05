import { ChainId, ChainType } from '@portkey/types';
import { ITransferLimitItem } from '@portkey/services';
import { checkTransferLimit } from '../../../utils/sandboxUtil/checkTransferLimit';
import { modalMethod } from './modalMethod';
import { IBusinessFrom, ITransferLimitItemWithRoute } from '../../TransferSettingsEdit/index.components';
import type { ModalFuncProps } from 'antd';
import { ZERO } from '../../../constants/misc';
import {
  ApproveExceedDailyLimit,
  ApproveExceedSingleLimit,
  ExceedDailyLimit,
  ExceedSingleLimit,
  LimitType,
  MAX_TRANSACTION_FEE,
} from '../../../constants/security';
import { divDecimals } from '../../../utils/converter';
import CustomSvg from '../../CustomSvg';
import { getBalanceByContract } from '../../../utils/sandboxUtil/getBalance';
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
    extraConfig?: any;
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
        limitType: LimitType.Single,
        onOneTimeApproval,
        onModifyTransferLimit,
        ...props,
      });
    }
    return false;
  }
  return true;
};
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
        <div className="portkey-ui-common-modals-only-content">
          {limitType === LimitType.Daily ? ExceedDailyLimit : ExceedSingleLimit}
        </div>
      ),
      okText: 'Modify',
      cancelText: 'Cancel',
      onOk: () => {
        resolve(true);
        onOk?.(data);
        modal.destroy();
      },
      onCancel: () => {
        resolve(false);
        modal.destroy();
      },
    });
  });
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
        <div>
          <div
            className="flex-center close-icon"
            onClick={() => {
              resolve(false);
              modal.destroy();
            }}>
            <CustomSvg type="Close2" />
          </div>

          <span>{limitType === LimitType.Daily ? ApproveExceedDailyLimit : ApproveExceedSingleLimit}</span>
        </div>
      ),
      okText: 'Request One-Time Approval',
      cancelText: 'Modify Transfer Limit for All',
      onOk: () => {
        resolve(true);
        onOneTimeApproval?.(data);
        modal.destroy();
      },
      onCancel: () => {
        resolve(true);
        onModifyTransferLimit?.(data);
        modal.destroy();
      },
    });
  });
}

export default transferLimitCheck;
