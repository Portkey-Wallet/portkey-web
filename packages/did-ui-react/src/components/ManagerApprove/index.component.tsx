import GuardianApprovalMain from '../GuardianApproval/index.component';
import { useCallback, useState } from 'react';
import { ChainId } from '@portkey/types';
import SetAllowanceMain, { BaseSetAllowanceProps, IAllowance } from '../SetAllowance/index.component';
import { did, handleErrorMessage, setLoading } from '../../utils';
import { getChain } from '../../hooks/useChainInfo';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { VerifierItem } from '@portkey/did';
import { BaseGuardianItem } from '../../types';
import { OperationTypeEnum, GuardiansApproved } from '@portkey/services';

export interface ManagerApproveInnerProps extends BaseSetAllowanceProps {
  originChainId: ChainId;
  caHash: string;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  onFinish?: (res: { amount: string; guardiansApproved: GuardiansApproved[] }) => void;
}

export enum ManagerApproveStep {
  SetAllowance = 'SetAllowance',
  GuardianApproval = 'GuardianApproval',
}

export default function ManagerApproveInner({
  originChainId,
  caHash,
  amount,
  dappName,
  symbol,
  onCancel,
  onFinish,
  onError,
}: ManagerApproveInnerProps) {
  const [step, setStep] = useState<ManagerApproveStep>(ManagerApproveStep.SetAllowance);
  const [allowance, setAllowance] = useState<string>(amount.toString());
  const [guardianList, setGuardianList] = useState<BaseGuardianItem[]>();

  const getVerifierListHandler = useCallback(async () => {
    const chainInfo = await getChain(originChainId);
    if (!chainInfo) throw Error('Missing verifier, please check params');
    const list = await getVerifierList({
      chainId: originChainId,
      rpcUrl: chainInfo.endPoint,
      chainType: 'aelf',
      address: chainInfo.caContractAddress,
    });
    return list;
  }, [originChainId]);

  const getGuardianList = useCallback(async () => {
    const verifierList = await getVerifierListHandler();
    const verifierMap: { [x: string]: VerifierItem } = {};
    verifierList.forEach((item) => {
      verifierMap[item.id] = item;
    });

    const payload = await did.getHolderInfo({
      chainId: originChainId,
      caHash,
    });

    const { guardians } = payload?.guardianList ?? { guardians: [] };
    return guardians.map((_guardianAccount) => {
      const key = `${_guardianAccount.guardianIdentifier}&${_guardianAccount.verifierId}`;

      const guardianAccount = _guardianAccount.guardianIdentifier || _guardianAccount.identifierHash;
      const verifier = verifierMap?.[_guardianAccount.verifierId];

      const baseGuardian: BaseGuardianItem = {
        ..._guardianAccount,
        key,
        verifier,
        identifier: guardianAccount,
        guardianType: _guardianAccount.type,
      };
      return baseGuardian;
    });
  }, [caHash, getVerifierListHandler, originChainId]);

  const allowanceConfirm = useCallback(
    async (allowanceInfo: IAllowance) => {
      try {
        setAllowance(allowanceInfo.allowance);
        setLoading(true);

        const guardianList = await getGuardianList();
        console.log(guardianList, 'guardianList==');
        setGuardianList(guardianList);
        setStep(ManagerApproveStep.GuardianApproval);
        setLoading(false);
      } catch (error) {
        onError?.(Error(handleErrorMessage(error)));
        setLoading(false);
      }
    },
    [getGuardianList, onError],
  );

  return (
    <div>
      {step === ManagerApproveStep.SetAllowance && (
        <SetAllowanceMain
          symbol={symbol}
          amount={amount}
          dappName={dappName}
          onCancel={onCancel}
          onConfirm={allowanceConfirm}
        />
      )}

      {step === ManagerApproveStep.GuardianApproval && guardianList && (
        <GuardianApprovalMain
          header={<div onClick={() => setStep(ManagerApproveStep.SetAllowance)}> Cancel</div>}
          chainId={originChainId}
          guardianList={guardianList}
          onConfirm={(approvalInfo) => {
            onFinish?.({
              amount: allowance,
              guardiansApproved: approvalInfo,
            });
          }}
          onError={(error) => onError?.(Error(handleErrorMessage(error.error)))}
          operationType={OperationTypeEnum.managerApprove}
        />
      )}
    </div>
  );
}
