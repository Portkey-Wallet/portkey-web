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
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import BackHeader from '../BackHeader';
import './index.less';

export interface BaseManagerApproveInnerProps extends BaseSetAllowanceProps {
  chainId: ChainId;
  caHash: string;
}

export interface IManagerApproveResult {
  amount: string;
  guardiansApproved: GuardiansApproved[];
}

export interface ManagerApproveInnerProps extends BaseManagerApproveInnerProps {
  onCancel?: () => void;
  onError?: (error: Error) => void;
  onFinish?: (res: { amount: string; guardiansApproved: GuardiansApproved[] }) => void;
}
export enum ManagerApproveStep {
  SetAllowance = 'SetAllowance',
  GuardianApproval = 'GuardianApproval',
}

const PrefixCls = 'manager-approval';

export default function ManagerApproveInner({
  chainId: originChainId,
  caHash,
  amount,
  dappInfo,
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
    <PortkeyStyleProvider>
      <div className="portkey-ui-flex-column portkey-ui-manager-approval-wrapper">
        {step === ManagerApproveStep.SetAllowance && (
          <SetAllowanceMain
            className="portkey-ui-flex-column"
            symbol={symbol}
            amount={allowance}
            dappInfo={dappInfo}
            onCancel={onCancel}
            onConfirm={allowanceConfirm}
          />
        )}

        {step === ManagerApproveStep.GuardianApproval && guardianList && (
          <GuardianApprovalMain
            className={`${PrefixCls}-guardian-approve`}
            header={<BackHeader onBack={() => setStep(ManagerApproveStep.SetAllowance)} />}
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
    </PortkeyStyleProvider>
  );
}
