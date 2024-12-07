import clsx from 'clsx';
import { forwardRef, memo, useCallback, useEffect, useState } from 'react';
import GuardianApproval from '../GuardianApproval';
import { GuardianApprovalModalProps } from '.';
import { errorTip, handleErrorMessage, setLoading } from '../../utils';
import { UserGuardianStatus } from '../../types';
import { formatGuardianValue } from '../Guardian/utils/formatGuardianValue';
import { getGuardianList } from '../SignStep/utils/getGuardians';
import CommonModal from '../CommonModal';

const GuardianApprovalModalMain = forwardRef(
  (
    {
      className,
      open,
      caHash,
      originChainId,
      targetChainId,
      networkType,
      sandboxId,
      isErrorTip = true,
      guardianList: defaultGuardianList,
      onClose,
      onBack,
      onApprovalSuccess,
      onApprovalError,
      isAsyncVerify,
      operationType,
      operationDetails,
      officialWebsiteShow,
      onGuardianListChange,
    }: GuardianApprovalModalProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref,
  ) => {
    const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>(defaultGuardianList || []);

    const getData = useCallback(async () => {
      setLoading(true);
      try {
        const _guardianList = await getGuardianList({
          caHash,
          originChainId,
          sandboxId,
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
    }, [caHash, isErrorTip, onApprovalError, originChainId, sandboxId]);

    useEffect(() => {
      if (defaultGuardianList) return;
      getData();
    }, [defaultGuardianList, getData]);

    return (
      <CommonModal
        leftCallBack={onBack}
        className={clsx('portkey-ui-modal-approval', className)}
        open={open}
        onClose={onClose}>
        <GuardianApproval
          originChainId={originChainId}
          targetChainId={targetChainId}
          guardianList={guardianList}
          isAsyncVerify={isAsyncVerify}
          onGuardianListChange={onGuardianListChange}
          onConfirm={async (approvalInfo) => {
            if (isAsyncVerify) {
              return onApprovalSuccess(approvalInfo);
            }
            const guardiansApproved = formatGuardianValue(approvalInfo);
            await onApprovalSuccess(guardiansApproved);
          }}
          onError={onApprovalError}
          networkType={networkType}
          operationType={operationType}
          operationDetails={operationDetails}
          officialWebsiteShow={officialWebsiteShow}
          caHash={caHash}
        />
      </CommonModal>
    );
  },
);

export default memo(GuardianApprovalModalMain);
