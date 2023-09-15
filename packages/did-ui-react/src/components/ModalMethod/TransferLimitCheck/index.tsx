import BaseModalFunc, { BaseModalFuncProps } from '../BaseModalMethod';
import { ChainId } from '@portkey/types';
import { ExceedDailyLimit, ExceedSingleLimit } from '../../../constants/security';
import { IPaymentSecurityItem } from '@portkey/services';
import { ExtensionContractBasic } from '../../../utils/sandboxUtil/ExtensionContractBasic';
import { checkTransferLimit } from '../../../utils/sandboxUtil/checkTransferLimit';
import { handleErrorMessage, setLoading } from '../../../utils';
import { message } from 'antd';

interface ITransferLimitCheckProps {
  wrapClassName?: string;
  className?: string;
  rpcUrl: string;
  caContractAddress: string;
  privateKey: string;
  caHash: string;
  chainId: ChainId;
  symbol: string;
  decimals: number | string;
  amount: string;
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
  privateKey,
  caHash,
  chainId,
  symbol,
  decimals,
  amount,
  ...props
}: ITransferLimitCheckProps) => {
  try {
    setLoading(true);
    const caContract = new ExtensionContractBasic({
      rpcUrl,
      contractAddress: caContractAddress,
      privateKey,
    });

    const limitRes = await checkTransferLimit({
      caHash,
      params: { caContract, symbol, decimals, amount },
    });

    setLoading(false);

    const settingParams: IPaymentSecurityItem = {
      chainId: chainId,
      symbol,
      singleLimit: limitRes?.singleBalance.toString() || '',
      dailyLimit: limitRes?.dailyLimit.toString() || '',
      restricted: !limitRes?.dailyLimit.eq(-1),
      decimals,
    };

    if (limitRes?.isSingleLimited) {
      return TransferSingleLimitModal({ wrapClassName, className, data: settingParams, ...props });
    }

    if (limitRes?.isDailyLimited) {
      return TransferDailyLimitModal({ wrapClassName, className, data: settingParams, ...props });
    }

    return true;
  } catch (error) {
    const msg = handleErrorMessage(error);
    message.error(msg);

    setLoading(false);
    // TODO error tip
  }
};

function TransferSingleLimitModal({ wrapClassName, className, data, onOk, ...props }: ITransferLimitModalProps) {
  return new Promise((resolve) => {
    const modal = BaseModalFunc({
      ...props,
      wrapClassName: 'portkey-ui-transfer-limit-wrapper ' + wrapClassName,
      className: 'portkey-ui-h-335 portkey-ui-transfer-limit-modal ' + className,
      okText: 'Modify',
      cancelText: 'Cancel',
      content: ExceedSingleLimit,
      onCancel: () => {
        resolve(false);
        modal.destroy();
      },
      onOk: () => {
        resolve(true);
        modal.destroy();
        onOk?.(data);
      },
    });
  });
}

function TransferDailyLimitModal({ wrapClassName, className, data, onOk, ...props }: ITransferLimitModalProps) {
  return new Promise((resolve) => {
    const modal = BaseModalFunc({
      ...props,
      wrapClassName: 'portkey-ui-transfer-limit-wrapper ' + wrapClassName,
      className: 'portkey-ui-h-335 portkey-ui-transfer-limit-modal ' + className,
      okText: 'Modify',
      cancelText: 'Cancel',
      content: ExceedDailyLimit,
      onCancel: () => {
        resolve(false);
        modal.destroy();
      },
      onOk: () => {
        resolve(true);
        modal.destroy();
        onOk?.(data);
      },
    });
  });
}

export default transferLimitCheck;
