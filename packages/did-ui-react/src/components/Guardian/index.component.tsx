import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GuardianList from '../GuardianPageList';
import GuardianEdit from '../GuardianEdit';
import GuardianAdd from '../GuardianAdd';
import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import GuardianView from '../GuardianView';
import { AuthServe, did, errorTip, handleErrorMessage, setLoading } from '../../utils';
import { ChainId, ChainType } from '@portkey/types';
import { OnErrorFunc, UserGuardianStatus } from '../../types';
import { getChainInfo } from '../../hooks/useChainInfo';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { VerifierItem } from '@portkey/did';
import { useThrottleEffect } from '../../hooks/throttle';
import { Button } from 'antd';
import { formatAddGuardianValue } from './utils/formatAddGuardianValue';
import { formatEditGuardianValue } from './utils/formatEditGuardianValue';
import { formatDelGuardianValue } from './utils/formatDelGuardianValue';
import { GuardianMth, handleGuardianContract } from '../../utils/sandboxUtil/handleGuardianContract';
import BackHeaderForPage from '../BackHeaderForPage';
import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import './index.less';

export enum GuardianStep {
  guardianList = 'guardianList',
  guardianAdd = 'guardianAdd',
  guardianEdit = 'guardianEdit',
  guardianView = 'guardianView',
}

export interface GuardianProps {
  caHash: string;
  className?: string;
  sandboxId?: string;
  originChainId: ChainId;
  chainType?: ChainType;
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
  onBack?: () => void;
  onAddGuardianFinish?: () => void;
}

function GuardianMain({
  caHash,
  className,
  originChainId = 'AELF',
  chainType = 'aelf',
  isErrorTip = true,
  sandboxId,
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
  useThrottleEffect(() => {
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

  const getGuardianList = useCallback(async () => {
    try {
      const payload = await did.getHolderInfo({
        caHash,
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
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [caHash, isErrorTip, onError, originChainId, verifierMap]);

  const getData = useCallback(async () => {
    setLoading(true);
    await getVerifierInfo();
    await getGuardianList();
    setLoading(false);
  }, [getGuardianList, getVerifierInfo]);

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
  const handleAddGuardian = useCallback(
    async (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => {
      const params = formatAddGuardianValue({ currentGuardian, approvalInfo });
      try {
        await handleGuardianContract({
          type: GuardianMth.addGuardian,
          params,
          sandboxId,
          chainId: originChainId,
          caHash,
        });
        await getGuardianList();
        setStep(GuardianStep.guardianList);
        onAddGuardianFinish?.();
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
    [sandboxId, originChainId, caHash, getGuardianList, onAddGuardianFinish, isErrorTip, onError],
  );
  const handleEditGuardian = useCallback(
    async (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => {
      const params = formatEditGuardianValue({
        currentGuardian,
        preGuardian,
        approvalInfo,
      });
      try {
        await handleGuardianContract({
          type: GuardianMth.UpdateGuardian,
          params,
          sandboxId,
          chainId: originChainId,
          caHash,
        });
        await getGuardianList();
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
    [caHash, originChainId, getGuardianList, isErrorTip, onError, preGuardian, sandboxId],
  );
  const handleRemoveGuardian = useCallback(
    async (approvalInfo: GuardiansApproved[]) => {
      const params = formatDelGuardianValue({
        currentGuardian,
        approvalInfo,
      });
      try {
        await handleGuardianContract({
          type: GuardianMth.RemoveGuardian,
          params,
          sandboxId,
          chainId: originChainId,
          caHash,
        });
        await getGuardianList();
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
    [caHash, originChainId, currentGuardian, getGuardianList, isErrorTip, onError, sandboxId],
  );
  const handleSetLoginGuardian = useCallback(async () => {
    const guardian = {
      type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
      verifierId: currentGuardian?.verifier?.id,
      identifierHash: currentGuardian?.identifierHash,
    };
    try {
      await handleGuardianContract({
        type: currentGuardian?.isLoginGuardian
          ? GuardianMth.UnsetGuardianTypeForLogin
          : GuardianMth.SetGuardianTypeForLogin,
        params: { guardian },
        sandboxId,
        chainId: originChainId,
        caHash,
      });
      const _guardianList = await getGuardianList();
      const _guardian = _guardianList?.filter(
        (item) => item.guardianIdentifier === currentGuardian?.guardianIdentifier,
      );
      setCurrentGuardian(_guardian?.[0]);
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
  }, [
    caHash,
    originChainId,
    currentGuardian?.guardianIdentifier,
    currentGuardian?.guardianType,
    currentGuardian?.identifierHash,
    currentGuardian?.isLoginGuardian,
    currentGuardian?.verifier?.id,
    getGuardianList,
    isErrorTip,
    onError,
    sandboxId,
  ]);

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
                <Button onClick={onAddGuardian} className="title-add-guardian-btn">
                  Add Guardians
                </Button>
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
        />
      )}
      {step === GuardianStep.guardianAdd && (
        <GuardianAdd
          header={<BackHeaderForPage leftElement={renderBackHeaderLeftEle(onGoBackList)} />}
          originChainId={originChainId}
          verifierList={verifierList}
          guardianList={guardianList}
          handleAddGuardian={handleAddGuardian}
        />
      )}
      {step === GuardianStep.guardianEdit && (
        <GuardianEdit
          header={<BackHeaderForPage leftElement={renderBackHeaderLeftEle(onGoBackList)} />}
          originChainId={originChainId}
          verifierList={verifierList}
          currentGuardian={currentGuardian}
          guardianList={guardianList}
          preGuardian={preGuardian}
          handleEditGuardian={handleEditGuardian}
          handleRemoveGuardian={handleRemoveGuardian}
          handleSetLoginGuardian={handleSetLoginGuardian}
        />
      )}
    </div>
  );
}

export default GuardianMain;
