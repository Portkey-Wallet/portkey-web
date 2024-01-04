import clsx from 'clsx';
import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react';
import CommonBaseModal from '../CommonBaseModal';
import GuardianApproval from '../GuardianApproval';
import BackHeader from '../BackHeader';
import { GuardianApprovalModalProps } from '.';
import { did, errorTip, handleErrorMessage, setLoading } from '../../utils';
import { getChainInfo } from '../../hooks';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { AccountType, VerifierItem } from '@portkey/services';
import { UserGuardianStatus } from '../../types';
import { formatGuardianValue } from '../Guardian/utils/formatGuardianValue';

const GuardianApprovalModalMain = forwardRef(
  ({
    className,
    open,
    caHash,
    originChainId,
    targetChainId,
    networkType,
    sandboxId,
    isErrorTip = true,
    onClose,
    onBack,
    onApprovalSuccess,
    onApprovalError,
    operationType,
  }: GuardianApprovalModalProps) => {
    const verifierMap = useRef<{ [x: string]: VerifierItem }>();
    const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>();

    const getVerifierInfo = useCallback(async () => {
      try {
        const chainInfo = await getChainInfo(originChainId);
        const list = await getVerifierList({
          sandboxId,
          chainId: originChainId,
          rpcUrl: chainInfo?.endPoint,
          chainType: 'aelf',
          address: chainInfo?.caContractAddress,
        });
        const _verifierMap: { [x: string]: VerifierItem } = {};
        list.forEach((item: VerifierItem) => {
          _verifierMap[item.id] = item;
        }, []);
        verifierMap.current = _verifierMap;
      } catch (error) {
        errorTip(
          {
            errorFields: 'getVerifierServers',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onApprovalError,
        );
      } finally {
        setLoading(false);
      }
    }, [isErrorTip, onApprovalError, originChainId, sandboxId]);

    const getGuardianList = useCallback(async () => {
      try {
        if (!caHash) throw 'Please login';
        const payload = await did.getHolderInfo({
          caHash: caHash,
          chainId: originChainId,
        });
        const { guardians } = payload?.guardianList ?? { guardians: [] };
        const guardianAccounts = [...guardians];
        const _guardianList: UserGuardianStatus[] = guardianAccounts.map((item) => {
          const key = `${item.guardianIdentifier}&${item.verifierId}`;
          const _guardian = {
            ...item,
            identifier: item.guardianIdentifier,
            key,
            guardianType: item.type as AccountType,
            verifier: verifierMap.current?.[item.verifierId],
          };
          return _guardian;
        });
        _guardianList.reverse();
        setGuardianList(_guardianList);
        return _guardianList;
      } catch (error) {
        errorTip(
          {
            errorFields: 'GetGuardianList',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onApprovalError,
        );
      } finally {
        setLoading(false);
      }
    }, [caHash, isErrorTip, onApprovalError, originChainId]);

    const getData = useCallback(async () => {
      setLoading(true);
      await getVerifierInfo();
      await getGuardianList();
      setLoading(false);
    }, [getGuardianList, getVerifierInfo]);

    useEffect(() => {
      getData();
    }, [getData]);

    return (
      <CommonBaseModal className={clsx('portkey-ui-modal-approval', className)} open={open} onClose={onClose}>
        <GuardianApproval
          header={<BackHeader onBack={onBack} />}
          originChainId={originChainId}
          targetChainId={targetChainId}
          guardianList={guardianList}
          onConfirm={async (approvalInfo) => {
            const guardiansApproved = formatGuardianValue(approvalInfo);
            await onApprovalSuccess(guardiansApproved);
          }}
          onError={onApprovalError}
          networkType={networkType}
          operationType={operationType}
        />
      </CommonBaseModal>
    );
  },
);

export default memo(GuardianApprovalModalMain);
