import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GuardianList from '../GuardianPageList';
import GuardianEdit from '../GuardianEdit';
import GuardianAdd from '../GuardianAdd';
import { GuardiansApproved } from '@portkey-v1/services';
import GuardianView from '../GuardianView';
import { AuthServe, errorTip, getVerifierStatusMap, handleErrorMessage, setLoading } from '../../utils';
import { ChainId, ChainType } from '@portkey-v1/types';
import { OnErrorFunc, UserGuardianStatus } from '../../types';
import { getChainInfo } from '../../hooks/useChainInfo';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { VerifierItem } from '@portkey-v1/did';
import { useThrottleFirstEffect } from '../../hooks/throttle';
import { formatAddGuardianValue } from './utils/formatAddGuardianValue';
import { formatEditGuardianValue } from './utils/formatEditGuardianValue';
import { formatDelGuardianValue } from './utils/formatDelGuardianValue';
import { GuardianMth, handleGuardianByContract } from '../../utils/sandboxUtil/handleGuardianByContract';
import BackHeaderForPage from '../BackHeaderForPage';
import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import { MaxVerifierNumber, guardiansExceedTip } from '../../constants/guardian';
import { formatSetUnsetLoginGuardianValue } from './utils/formatSetUnsetLoginGuardianValue';
import { getGuardianList } from '../SignStep/utils/getGuardians';
import './index.less';
import ThrottleButton from '../ThrottleButton';

export enum GuardianStep {
  guardianList = 'guardianList',
  guardianAdd = 'guardianAdd',
  guardianEdit = 'guardianEdit',
  guardianView = 'guardianView',
}

export interface IAddGuardianFinishCbParams {
  syncStatus: boolean;
}

export interface GuardianProps {
  caHash: string;
  className?: string;
  sandboxId?: string;
  originChainId: ChainId;
  accelerateChainId?: ChainId;
  chainType?: ChainType;
  isErrorTip?: boolean;
  networkType: string;
  onError?: OnErrorFunc;
  onBack?: () => void;
  onAddGuardianFinish?: (params: IAddGuardianFinishCbParams) => void;
}

function GuardianMain({
  caHash,
  className,
  originChainId = 'AELF',
  accelerateChainId,
  chainType = 'aelf',
  isErrorTip = true,
  sandboxId,
  networkType,
  onError,
  onBack,
  onAddGuardianFinish,
}: GuardianProps) {
  const [step, setStep] = useState<GuardianStep>(GuardianStep.guardianList);
  const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>();
  const [currentGuardian, setCurrentGuardian] = useState<UserGuardianStatus>();
  const [preGuardian, setPreGuardian] = useState<UserGuardianStatus>();
  const [verifierList, setVerifierList] = useState<VerifierItem[] | undefined>();
  const verifierMap = useRef<{ [x: string]: VerifierItem }>();
  const [verifierEnableNum, setVerifierEnableNum] = useState(MaxVerifierNumber);
  useThrottleFirstEffect(() => {
    AuthServe.addRequestAuthCheck(originChainId);
  }, []);
  const editable = useMemo(() => Number(guardianList?.length) > 1, [guardianList?.length]);
  const getVerifierInfo = useCallback(async () => {
    try {
      const chainInfo = await getChainInfo(originChainId);
      const list = await getVerifierList({
        sandboxId,
        chainId: originChainId,
        rpcUrl: chainInfo?.endPoint,
        chainType,
        address: chainInfo?.caContractAddress,
      });
      setVerifierList(list);
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
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [originChainId, chainType, isErrorTip, onError, sandboxId]);

  const fetchGuardianList = useCallback(async () => {
    try {
      const _guardianList = await getGuardianList({
        caHash,
        originChainId,
        chainType,
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
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [caHash, chainType, isErrorTip, onError, originChainId, sandboxId]);

  const getVerifierEnableNum = useCallback(
    (verifierMap: { [x: string]: VerifierItem }, guardianList: UserGuardianStatus[]) => {
      const verifierStatusMap = getVerifierStatusMap(verifierMap, guardianList);
      const len = Object.values(verifierStatusMap).filter((verifier) => !verifier.isUsed).length;
      setVerifierEnableNum(len);
    },
    [],
  );

  const getData = useCallback(async () => {
    setLoading(true);
    await getVerifierInfo();
    const guardianList = await fetchGuardianList();
    getVerifierEnableNum(verifierMap.current as { [x: string]: VerifierItem }, guardianList as UserGuardianStatus[]);
    setLoading(false);
  }, [getVerifierEnableNum, fetchGuardianList, getVerifierInfo]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onAddGuardian = useCallback(() => {
    setStep(GuardianStep.guardianAdd);
  }, []);
  const onViewGuardian = useCallback((item: UserGuardianStatus) => {
    setCurrentGuardian(item);
    setStep(GuardianStep.guardianView);
  }, []);
  const onEditGuardian = useCallback(() => {
    setPreGuardian(currentGuardian);
    setStep(GuardianStep.guardianEdit);
  }, [currentGuardian]);
  const onGoBackList = useCallback(() => {
    setStep(GuardianStep.guardianList);
    setCurrentGuardian(undefined);
  }, []);
  const onGoView = useCallback(() => {
    setPreGuardian(currentGuardian);
    setCurrentGuardian(currentGuardian);
    setStep(GuardianStep.guardianView);
  }, [currentGuardian]);
  const handleAddGuardian = useCallback(
    async (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => {
      const params = formatAddGuardianValue({ currentGuardian, approvalInfo });
      let syncStatus = true;
      try {
        await handleGuardianByContract({
          type: GuardianMth.addGuardian,
          params,
          sandboxId,
          chainId: originChainId,
          caHash,
        });
        if (accelerateChainId && originChainId !== accelerateChainId) {
          try {
            await handleGuardianByContract({
              type: GuardianMth.addGuardian,
              params,
              sandboxId,
              chainId: accelerateChainId,
              caHash,
            });
          } catch (error: any) {
            syncStatus = false;
            errorTip(
              {
                errorFields: 'HandleAddGuardianAccelerate',
                error: handleErrorMessage(error),
              },
              false,
              onError,
            );
          }
        }
        const guardianList = await fetchGuardianList();
        getVerifierEnableNum(
          verifierMap.current as { [x: string]: VerifierItem },
          guardianList as UserGuardianStatus[],
        );
        setStep(GuardianStep.guardianList);
        onAddGuardianFinish?.({ syncStatus });
      } catch (e) {
        return errorTip(
          {
            errorFields: 'HandleAddGuardian',
            error: handleErrorMessage(e),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [
      sandboxId,
      originChainId,
      caHash,
      accelerateChainId,
      fetchGuardianList,
      getVerifierEnableNum,
      onAddGuardianFinish,
      onError,
      isErrorTip,
    ],
  );
  const handleEditGuardian = useCallback(
    async (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => {
      const params = formatEditGuardianValue({
        currentGuardian,
        preGuardian,
        approvalInfo,
      });
      try {
        await handleGuardianByContract({
          type: GuardianMth.UpdateGuardian,
          params,
          sandboxId,
          chainId: originChainId,
          caHash,
        });
        const guardianList = await fetchGuardianList();
        getVerifierEnableNum(
          verifierMap.current as { [x: string]: VerifierItem },
          guardianList as UserGuardianStatus[],
        );
        setStep(GuardianStep.guardianList);
      } catch (e) {
        return errorTip(
          {
            errorFields: 'HandleEditGuardian',
            error: handleErrorMessage(e),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [preGuardian, sandboxId, originChainId, caHash, fetchGuardianList, getVerifierEnableNum, isErrorTip, onError],
  );
  const handleRemoveGuardian = useCallback(
    async (approvalInfo: GuardiansApproved[]) => {
      const params = formatDelGuardianValue({
        currentGuardian,
        approvalInfo,
      });
      try {
        await handleGuardianByContract({
          type: GuardianMth.RemoveGuardian,
          params,
          sandboxId,
          chainId: originChainId,
          caHash,
        });
        const guardianList = await fetchGuardianList();
        getVerifierEnableNum(
          verifierMap.current as { [x: string]: VerifierItem },
          guardianList as UserGuardianStatus[],
        );
        setStep(GuardianStep.guardianList);
      } catch (e) {
        return errorTip(
          {
            errorFields: 'HandleRemoveGuardian',
            error: handleErrorMessage(e),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [currentGuardian, sandboxId, originChainId, caHash, fetchGuardianList, getVerifierEnableNum, isErrorTip, onError],
  );
  const handleSetLoginGuardian = useCallback(
    async (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => {
      const params = formatSetUnsetLoginGuardianValue({
        currentGuardian,
        approvalInfo,
      });
      try {
        await handleGuardianByContract({
          type: currentGuardian?.isLoginGuardian
            ? GuardianMth.UnsetGuardianTypeForLogin
            : GuardianMth.SetGuardianTypeForLogin,
          params,
          sandboxId,
          chainId: originChainId,
          caHash,
        });
        const _guardianList = await fetchGuardianList();
        getVerifierEnableNum(
          verifierMap.current as { [x: string]: VerifierItem },
          guardianList as UserGuardianStatus[],
        );
        const _guardian = _guardianList?.find(
          (item) => item.guardianIdentifier === currentGuardian?.guardianIdentifier,
        );
        setCurrentGuardian(_guardian);
        setPreGuardian(_guardian);
      } catch (e) {
        errorTip(
          {
            errorFields: 'SetLoginGuardian',
            error: handleErrorMessage(e),
          },
          isErrorTip,
          onError,
        );
      }
    },
    [sandboxId, originChainId, caHash, fetchGuardianList, getVerifierEnableNum, guardianList, isErrorTip, onError],
  );

  const renderBackHeaderLeftEle = useCallback(
    (goBack?: () => void) => (
      <div className="portkey-ui-guardian-left portkey-ui-flex-center">
        <CustomSvg type="LeftArrow" onClick={goBack} />
        Guardians
      </div>
    ),
    [],
  );

  const renderGuardianExceedTip = useMemo(() => {
    return verifierEnableNum === 0 ? (
      <div className="content-guardian-tip">
        <div className="guardian-exceed-tip portkey-ui-flex">
          <CustomSvg type="Warning" />
          <span className="exceed-tip-content">{guardiansExceedTip}</span>
        </div>
      </div>
    ) : null;
  }, [verifierEnableNum]);

  return (
    <div className={clsx('portkey-ui-guardian-page', className)}>
      {step === GuardianStep.guardianList && (
        <GuardianList
          header={
            <BackHeaderForPage
              leftElement={renderBackHeaderLeftEle(onBack)}
              rightElement={
                verifierEnableNum > 0 ? (
                  <ThrottleButton onClick={onAddGuardian} className="title-add-guardian-btn">
                    Add Guardians
                  </ThrottleButton>
                ) : null
              }
            />
          }
          guardianList={guardianList}
          onViewGuardian={onViewGuardian}
          tipContainer={renderGuardianExceedTip}
        />
      )}
      {step === GuardianStep.guardianView && (
        <GuardianView
          header={<BackHeaderForPage leftElement={renderBackHeaderLeftEle(onGoBackList)} />}
          originChainId={originChainId}
          currentGuardian={currentGuardian!}
          onEditGuardian={editable ? onEditGuardian : undefined}
          handleSetLoginGuardian={handleSetLoginGuardian}
          guardianList={guardianList}
        />
      )}
      {step === GuardianStep.guardianAdd && (
        <GuardianAdd
          header={<BackHeaderForPage leftElement={renderBackHeaderLeftEle(onGoBackList)} />}
          caHash={caHash}
          originChainId={originChainId}
          networkType={networkType}
          chainType={chainType}
          sandboxId={sandboxId}
          verifierList={verifierList}
          guardianList={guardianList}
          handleAddGuardian={handleAddGuardian}
        />
      )}
      {step === GuardianStep.guardianEdit && (
        <GuardianEdit
          header={<BackHeaderForPage leftElement={renderBackHeaderLeftEle(onGoView)} />}
          originChainId={originChainId}
          caHash={caHash}
          verifierList={verifierList}
          currentGuardian={currentGuardian}
          guardianList={guardianList}
          preGuardian={preGuardian}
          chainType={chainType}
          sandboxId={sandboxId}
          handleEditGuardian={handleEditGuardian}
          handleRemoveGuardian={handleRemoveGuardian}
          handleSetLoginGuardian={handleSetLoginGuardian}
        />
      )}
    </div>
  );
}

export default GuardianMain;
