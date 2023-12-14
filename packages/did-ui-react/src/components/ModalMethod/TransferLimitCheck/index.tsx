import { ChainId } from '@portkey/types';
import { ITransferLimitItem } from '@portkey/services';
import { checkTransferLimit } from '../../../utils/sandboxUtil/checkTransferLimit';
import { modalMethod } from './modalMethod';
import { IBusinessFrom, ITransferLimitItemWithRoute } from '../../TransferSettingsEdit/index.components';
import type { ModalFuncProps } from 'antd';

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
  businessFrom?: IBusinessFrom;
  onOk?: (data: ITransferLimitItemWithRoute) => void;
}

interface ITransferLimitModalProps extends ModalFuncProps {
  wrapClassName?: string;
  className?: string;
  data?: ITransferLimitItem;
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
  onOk,
  ...props
}: ITransferLimitCheckProps) => {
  const limitRes = await checkTransferLimit({
    rpcUrl,
    caContractAddress,
    sandboxId,
    caHash,
    params: { symbol, decimals, amount },
  });

  const settingParams: ITransferLimitItemWithRoute = {
    chainId: chainId,
    symbol,
    singleLimit: limitRes?.singleBalance.toString() || '',
    dailyLimit: limitRes?.dailyLimit.toString() || '',
    restricted: !limitRes?.dailyLimit.eq(-1),
    decimals,
    businessFrom,
  };

  if (limitRes?.isSingleLimited) {
    TransferSingleLimitModal({ wrapClassName, className, data: settingParams, onOk, ...props });
    return false;
  }

  if (limitRes?.isDailyLimited) {
    TransferDailyLimitModal({ wrapClassName, className, data: settingParams, onOk, ...props });
    return false;
  }

  return true;
};
function TransferSingleLimitModal({ wrapClassName, className, data, onOk, ...props }: ITransferLimitModalProps) {
  return new Promise((resolve) => {
    modalMethod({
      ...props,
      wrapClassName: 'portkey-ui-common-modals portkey-ui-transfer-limit-wrapper ' + wrapClassName,
      className: 'portkey-ui-h-335 portkey-ui-transfer-limit-modal ' + className,
      okText: 'Modify',
      cancelText: 'Cancel',
      content: (
        <div className="portkey-ui-common-modals-only-content">{`Maximum limit per transaction exceeded. To proceed, please modify the transfer limit first.`}</div>
      ),
      onCancel: () => {
        resolve(false);
      },
      onOk: () => {
        resolve(true);
        onOk?.(data);
      },
    });
  });
}

function TransferDailyLimitModal({ wrapClassName, className, data, onOk, ...props }: ITransferLimitModalProps) {
  return new Promise((resolve) => {
    modalMethod({
      ...props,
      wrapClassName: 'portkey-ui-common-modals portkey-ui-transfer-limit-wrapper ' + wrapClassName,
      className: 'portkey-ui-h-335 portkey-ui-transfer-limit-modal ' + className,
      okText: 'Modify',
      cancelText: 'Cancel',
      content: (
        <div className="portkey-ui-common-modals-only-content">{`Maximum daily limit exceeded. To proceed, please modify the transfer limit first.`}</div>
      ),
      onCancel: () => {
        resolve(false);
      },
      onOk: () => {
        resolve(true);
        onOk?.(data);
      },
    });
  });
}

export default transferLimitCheck;
