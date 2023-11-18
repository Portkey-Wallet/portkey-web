import { sleep } from '@portkey/utils';
import { did } from './did';
import { ChainId } from '@portkey/types';
import { getChain } from '../hooks';
import { message } from 'antd';
import { GuardianMth, handleGuardianContract } from './sandboxUtil/handleGuardianContract';
import { getAelfTxResult } from './aelf';
import { SecurityAccelerateErrorTip } from '../constants/security';

export interface IAccelerateGuardian {
  type: string;
  verifierId: string;
  identifierHash: string;
  salt: string;
  isLoginAccount: boolean;
  transactionId: string;
  chainId: ChainId;
}

export type CheckSecurityResult = {
  isTransferSafe: boolean;
  isSynchronizing: boolean;
  isOriginChainSafe: boolean;
  accelerateGuardians: IAccelerateGuardian[];
};

export interface IAccelerateProps {
  originChainId: ChainId;
  accelerateChainId: ChainId;
  caHash: string;
}

export interface IHandleAccelerateProps extends IAccelerateProps {
  accelerateGuardianTxId: string;
}

export interface ICheckAccelerateProps extends IAccelerateProps {
  accelerateGuardianTxId?: string;
}

export const checkSecurity = async (
  caHash: string,
  checkTransferSafeChainId: ChainId,
): Promise<CheckSecurityResult> => {
  return await did.services.security.getWalletBalanceCheck({
    caHash,
    checkTransferSafeChainId,
  });
};

export const getAccelerateGuardianTxId = async (caHash: string, accelerateChainId: ChainId, originChainId: ChainId) => {
  let isTimeout = false;
  let isSafe = false;
  const timer = setTimeout(() => {
    isTimeout = true;
  }, 10 * 1000);

  let accelerateGuardian: IAccelerateGuardian | undefined;
  let retryCount = 0;
  while (retryCount < 5 && !accelerateGuardian) {
    console.log('retryCount', retryCount);
    let accelerateGuardians: IAccelerateGuardian[] = [];
    try {
      const result = await checkSecurity(caHash, accelerateChainId);

      if (result.isTransferSafe) {
        isSafe = true;
        break;
      }
      accelerateGuardians = result.accelerateGuardians;
    } catch (error) {
      console.log('retry checkSecurity error', error);
    }

    if (Array.isArray(accelerateGuardians)) {
      const _accelerateGuardian = accelerateGuardians.find(
        (item) => item.transactionId && item.chainId === originChainId,
      );
      if (_accelerateGuardian) {
        accelerateGuardian = _accelerateGuardian;
        break;
      }
    }

    retryCount++;
    if (isTimeout) break;
    await sleep(2000);
    if (isTimeout) break;
  }

  clearTimeout(timer);
  return {
    isSafe,
    accelerateGuardian,
  };
};

export const handleAccelerate = async ({
  accelerateGuardianTxId,
  originChainId,
  accelerateChainId,
  caHash,
}: IHandleAccelerateProps) => {
  const originChainInfo = await getChain(originChainId);
  if (!originChainInfo?.endPoint) return message.error(SecurityAccelerateErrorTip);

  const result = await getAelfTxResult(originChainInfo?.endPoint, accelerateGuardianTxId);
  if (result.Status !== 'MINED' || !result.Transaction?.Params) return message.error(SecurityAccelerateErrorTip);
  const params = JSON.parse(result.Transaction.Params);

  try {
    await handleGuardianContract({
      type: GuardianMth.addGuardian,
      params: {
        guardianToAdd: params.guardianToAdd,
        guardiansApproved: params.guardiansApproved,
      },
      chainId: accelerateChainId,
      caHash,
    });
    message.success('Guardian added');
  } catch (error: any) {
    message.error(SecurityAccelerateErrorTip);
  }
};

export const checkAccelerate = async ({
  accelerateGuardianTxId,
  originChainId,
  accelerateChainId,
  caHash,
}: ICheckAccelerateProps) => {
  try {
    if (accelerateGuardianTxId) {
      await handleAccelerate({ accelerateGuardianTxId, originChainId, accelerateChainId, caHash });
    } else {
      const res = await getAccelerateGuardianTxId(caHash, accelerateChainId, originChainId);
      if (res.isSafe) {
        message.success('Guardian added');
      } else if (res.accelerateGuardian?.transactionId) {
        await handleAccelerate({
          accelerateGuardianTxId: res.accelerateGuardian.transactionId,
          originChainId,
          accelerateChainId,
          caHash,
        });
      } else {
        message.error(SecurityAccelerateErrorTip);
      }
    }
  } catch (error: any) {
    message.error(SecurityAccelerateErrorTip);
  }
};
