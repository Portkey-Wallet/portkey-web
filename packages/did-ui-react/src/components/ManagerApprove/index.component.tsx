import GuardianApprovalMain from '../GuardianApproval/index.component';
import { useCallback, useEffect, useState } from 'react';
import { ChainId } from '@portkey/types';
import SetAllowanceMain, { BaseSetAllowanceProps, IAllowance } from '../SetAllowance/index.component';
import { AuthServe, CustomContractBasic, did, handleErrorMessage, setLoading } from '../../utils';
import { getChain } from '../../hooks/useChainInfo';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { VerifierItem } from '@portkey/did';
import { BaseGuardianItem, IGuardiansApproved } from '../../types';
import { OperationTypeEnum, AccountTypeEnum } from '@portkey/services';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import BackHeader from '../BackHeader';
import { divDecimals, timesDecimals } from '../../utils/converter';
import { ALLOWANCE_MAX_LIMIT, DEFAULT_DECIMAL } from '../../constants';
import './index.less';

export interface BaseManagerApproveInnerProps extends BaseSetAllowanceProps {
  originChainId: ChainId;
  caHash: string;
}

export interface IManagerApproveResult {
  amount: string;
  guardiansApproved: IGuardiansApproved[];
}

export interface ManagerApproveInnerProps extends BaseManagerApproveInnerProps {
  onCancel?: () => void;
  onError?: (error: Error) => void;
  onFinish?: (res: { amount: string; guardiansApproved: IGuardiansApproved[] }) => void;
}
export enum ManagerApproveStep {
  SetAllowance = 'SetAllowance',
  GuardianApproval = 'GuardianApproval',
}

const PrefixCls = 'manager-approval';

export default function ManagerApproveInner({
  max,
  originChainId,
  caHash,
  amount,
  dappInfo,
  symbol,
  onCancel,
  onFinish,
  onError,
}: ManagerApproveInnerProps) {
  const [step, setStep] = useState<ManagerApproveStep>(ManagerApproveStep.SetAllowance);

  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string;
    tokenName: string;
    supply: string;
    totalSupply: string;
    decimals: number;
    issuer: string;
    isBurnable: true;
    issueChainId: number;
    issued: string;
  }>();

  const [allowance, setAllowance] = useState<string>(
    divDecimals(amount, tokenInfo?.decimals || DEFAULT_DECIMAL).toFixed(),
  );
  const [guardianList, setGuardianList] = useState<BaseGuardianItem[]>();

  const getVerifierListHandler = useCallback(async () => {
    const chainInfo = await getChain(originChainId);
    if (!chainInfo) throw Error('Missing verifier, please check params');
    AuthServe.addRequestAuthCheck(originChainId);
    AuthServe.setRefreshTokenConfig(originChainId);
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

  const getTokenInfo = useCallback(async () => {
    try {
      const chainInfo = await getChain(originChainId);
      if (!chainInfo) throw Error('Missing verifier, please check params');
      const result = await CustomContractBasic.callViewMethod({
        contractOptions: {
          contractAddress: chainInfo.defaultToken.address,
          rpcUrl: chainInfo.endPoint,
        },
        functionName: 'GetTokenInfo',
        paramsOption: {
          symbol,
        },
      });
      setTokenInfo(result.data);
    } catch (error) {
      console.error(error);
      onError?.(Error('GetTokenInfo error'));
    }
  }, [onError, originChainId, symbol]);

  useEffect(() => {
    getTokenInfo();
  }, [getTokenInfo]);

  return (
    <PortkeyStyleProvider>
      <div className="portkey-ui-flex-column portkey-ui-manager-approval-wrapper">
        {step === ManagerApproveStep.SetAllowance && (
          <SetAllowanceMain
            className="portkey-ui-flex-column"
            symbol={symbol}
            amount={allowance}
            recommendedAmount={divDecimals(amount, tokenInfo?.decimals || DEFAULT_DECIMAL).toFixed()}
            max={divDecimals(max || ALLOWANCE_MAX_LIMIT, tokenInfo?.decimals || DEFAULT_DECIMAL).toFixed(0)}
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
              const approved: IGuardiansApproved[] = approvalInfo.map((guardian) => ({
                type: AccountTypeEnum[guardian.type || 'Google'],
                identifierHash: guardian.identifierHash || '',
                verificationInfo: {
                  id: guardian.verifierId,
                  signature: Object.values(Buffer.from(guardian.signature as any, 'hex')),
                  verificationDoc: guardian.verificationDoc,
                },
              }));

              onFinish?.({
                amount: timesDecimals(allowance, tokenInfo?.decimals || DEFAULT_DECIMAL).toFixed(0),
                guardiansApproved: approved,
              });
            }}
            // onError={(error) => onError?.(Error(handleErrorMessage(error.error)))}
            operationType={OperationTypeEnum.managerApprove}
          />
        )}
      </div>
    </PortkeyStyleProvider>
  );
}
