import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GuardianList from '../GuardianPageList';
import GuardianEdit from '../GuardianEdit';
import GuardianAdd from '../GuardianAdd';
import { GuardiansApproved } from '@portkey/services';
import GuardianView from '../GuardianView';
import { AuthServe, errorTip, handleErrorMessage, setLoading } from '../../utils';
import { ChainId, ChainType } from '@portkey/types';
import { NetworkType, OnErrorFunc, UserGuardianStatus } from '../../types';
import { getChainInfo } from '../../hooks/useChainInfo';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { VerifierItem } from '@portkey/did';
import { useThrottleFirstEffect } from '../../hooks/throttle';
import { formatAddGuardianValue } from './utils/formatAddGuardianValue';
import { formatEditGuardianValue } from './utils/formatEditGuardianValue';
import { formatDelGuardianValue } from './utils/formatDelGuardianValue';
import { GuardianMth, handleGuardianByContract } from '../../utils/sandboxUtil/handleGuardianByContract';
import BackHeaderForPage from '../BackHeaderForPage';
import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import { zkLoginVerifierItem } from '../../constants/guardian';
import { formatSetUnsetLoginGuardianValue } from './utils/formatSetUnsetLoginGuardianValue';
import { getGuardianList } from '../SignStep/utils/getGuardians';
import './index.less';
import ThrottleButton from '../ThrottleButton';
import { singleMessage } from '../CustomAnt';
import { loginOptTip } from '../../constants';

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
  networkType: NetworkType;
  isLoginOnChain?: boolean;
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
  isLoginOnChain = true,
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
      const _verifyList = [...list, zkLoginVerifierItem];
      setVerifierList(_verifyList);
      const _verifierMap: { [x: string]: VerifierItem } = {};
      _verifyList.forEach((item: VerifierItem) => {
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
    }
  }, [caHash, chainType, isErrorTip, onError, originChainId, sandboxId]);

  const getData = useCallback(async () => {
    setLoading(true);
    await getVerifierInfo();
    await fetchGuardianList();
    setLoading(false);
  }, [fetchGuardianList, getVerifierInfo]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onAddGuardian = useCallback(() => {
    setStep(GuardianStep.guardianAdd);
  }, []);
  const onViewGuardian = useCallback(
    (item: UserGuardianStatus) => {
      if (!isLoginOnChain) {
        return singleMessage.warning(loginOptTip);
      }
      setCurrentGuardian(item);
      setStep(GuardianStep.guardianView);
    },
    [isLoginOnChain],
  );
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
        await fetchGuardianList();
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
    [sandboxId, originChainId, caHash, accelerateChainId, fetchGuardianList, onAddGuardianFinish, onError, isErrorTip],
  );
  const handleEditGuardian = useCallback(
    async (
      currentGuardian: UserGuardianStatus,
      approvalInfo: GuardiansApproved[],
      _preGuardian?: UserGuardianStatus,
    ) => {
      const params = formatEditGuardianValue({
        currentGuardian,
        preGuardian: _preGuardian || preGuardian,
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
        await fetchGuardianList();
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
    [preGuardian, sandboxId, originChainId, caHash, fetchGuardianList, isErrorTip, onError],
  );
  const handleRemoveGuardian = useCallback(
    async (approvalInfo: GuardiansApproved[], _currentGuardian?: UserGuardianStatus) => {
      const params = formatDelGuardianValue({
        currentGuardian: _currentGuardian || currentGuardian,
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
        await fetchGuardianList();
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
    [currentGuardian, sandboxId, originChainId, caHash, fetchGuardianList, isErrorTip, onError],
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
      } finally {
        setLoading(false);
      }
    },
    [sandboxId, originChainId, caHash, fetchGuardianList, isErrorTip, onError],
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

  return (
    <div className={clsx('portkey-ui-guardian-page', className)}>
      {step === GuardianStep.guardianList && (
        <GuardianList
          header={
            <BackHeaderForPage
              leftElement={renderBackHeaderLeftEle(onBack)}
              rightElement={
                <ThrottleButton
                  onClick={() => {
                    if (!isLoginOnChain) {
                      return singleMessage.warning(loginOptTip);
                    }
                    onAddGuardian();
                  }}
                  className="title-add-guardian-btn">
                  Add Guardians
                </ThrottleButton>
              }
            />
          }
          guardianList={guardianList}
          onViewGuardian={onViewGuardian}
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
          networkType={networkType}
          caHash={caHash}
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
          networkType={networkType}
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
