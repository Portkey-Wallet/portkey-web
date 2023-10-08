import { BaseModalFuncProps } from '../BaseModalMethod';
import { ChainId } from '@portkey/types';
import { IPaymentSecurityItem } from '@portkey/services';
import { checkTransferLimit } from '../../../utils/sandboxUtil/checkTransferLimit';
import { modalMethod } from './modalMethod';

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
  onOk?: (data: IPaymentSecurityItem) => void;
}

interface ITransferLimitModalProps extends BaseModalFuncProps {
  wrapClassName?: string;
  className?: string;
  data?: IPaymentSecurityItem;
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

  const settingParams: IPaymentSecurityItem = {
    chainId: chainId,
    symbol,
    singleLimit: limitRes?.singleBalance.toString() || '',
    dailyLimit: limitRes?.dailyLimit.toString() || '',
    restricted: !limitRes?.dailyLimit.eq(-1),
    decimals,
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
