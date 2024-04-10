import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GuardianList from '../GuardianPageList';
import GuardianEdit from '../GuardianEdit';
import GuardianAdd from '../GuardianAdd';
import { GuardiansApproved } from '@portkey/services';
import GuardianView from '../GuardianView';
import {
  AuthServe,
  errorTip,
  getVerifierStatusMap,
  handleErrorMessage,
  setLoading,
  telegramLoginAuth,
} from '../../utils';
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
import { MaxVerifierNumber, guardiansExceedTip } from '../../constants/guardian';
import { formatSetUnsetLoginGuardianValue } from './utils/formatSetUnsetLoginGuardianValue';
import { getGuardianList } from '../SignStep/utils/getGuardians';
import './index.less';
import ThrottleButton from '../ThrottleButton';
import { getTelegramInitData, isTelegramPlatform } from '../../utils/telegram';
import { Open_Login_Guardian_Bridge } from '../../constants/telegram';
import OpenLogin from '../../utils/openlogin';
import {
  getServiceUrl,
  getCommunicationSocketUrl,
  getCustomNetworkType,
  getStorageInstance,
} from '../config-provider/utils';
import { CrossTabPushMessageType } from '@portkey/socket';
import { IOpenLoginGuardianResponse } from '../../types/openlogin';

export enum GuardianStep {
  guardianList = 'guardianList',
  guardianAdd = 'guardianAdd',
  guardianEdit = 'guardianEdit',
  guardianView = 'guardianView',
}

export interface IAddGuardianFinishCbParams {
  syncStatus: boolean;
}

export interface IStorageData {
  accessToken?: string;
  guardianStep?: GuardianStep;
  item?: UserGuardianStatus;
}

export interface GuardianProps {
  storageData?: IStorageData;
  caHash: string;
  className?: string;
  sandboxId?: string;
  originChainId: ChainId;
  accelerateChainId?: ChainId;
  chainType?: ChainType;
  isErrorTip?: boolean;
  networkType: NetworkType;
  onError?: OnErrorFunc;
  onBack?: () => void;
  onAddGuardianFinish?: (params: IAddGuardianFinishCbParams) => void;
}

function GuardianMain({
  storageData,
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
  const [currentStorageData, setCurrentStorageData] = useState<IStorageData>({});

  useEffect(() => {
    setCurrentStorageData(storageData || {});
  }, [storageData]);

  const telegramUserId = useMemo(() => {
    const telegramInitData = getTelegramInitData();
    const telegramUserInfo = telegramInitData?.user ? JSON.parse(telegramInitData.user) : {};
    return telegramUserInfo.id ? String(telegramUserInfo.id) : undefined;
  }, []);

  const editable = useMemo(() => Number(guardianList?.length) > 1, [guardianList?.length]);
  const hasTelegramGuardian = useMemo(
    () => guardianList?.some((item) => item?.guardianType === 'Telegram'),
    [guardianList],
  );
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
      } finally {
        setLoading(false);
      }
    },
    [sandboxId, originChainId, caHash, fetchGuardianList, getVerifierEnableNum, guardianList, isErrorTip, onError],
  );
  const handleWithinTelegram = useCallback(
    async ({
      guardianStep,
      socketMethod,
      item,
      telegramAccessToken,
    }: {
      guardianStep: GuardianStep;
      socketMethod: Array<CrossTabPushMessageType>;
      item?: UserGuardianStatus;
      telegramAccessToken?: string;
    }) => {
      console.log('++++++++++++ telegramAccessToken: ', telegramAccessToken);
      if (!telegramUserId) return;
      if (
        (guardianStep === GuardianStep.guardianAdd && !telegramAccessToken) ||
        (guardianStep === GuardianStep.guardianView && hasTelegramGuardian && !telegramAccessToken)
      ) {
        await telegramLoginAuth({
          network: networkType,
          extraStorageData: { guardianStep, item },
        });
        return;
      }
      const serviceURI = getServiceUrl();
      const socketURI = getCommunicationSocketUrl();
      const ctw = getCustomNetworkType();
      const openlogin = new OpenLogin({
        network: ctw,
        serviceURI: serviceURI,
        socketURI,
        currentStorage: getStorageInstance(),
        // sdkUrl: Open_Login_Bridge.local,
      });

      const params = {
        networkType,
        originChainId,
        chainType,
        caHash,
        guardianStep,
        isErrorTip,
        currentGuardian: item,
        telegramInfo: {
          accessToken: telegramAccessToken,
          userId: telegramUserId,
        },
      };
      const result = await openlogin.openloginHandler(Open_Login_Guardian_Bridge[ctw], params, socketMethod);
      if (!result) return null;
      const {
        currentGuardian: _currentGuardian,
        approvalInfo,
        preGuardian: _preGuardian,
      } = result.data as IOpenLoginGuardianResponse;
      // openLinkFromTelegram(Open_Login_Guardian_Bridge, params);
      switch (guardianStep) {
        case GuardianStep.guardianAdd:
          await handleAddGuardian(_currentGuardian, approvalInfo);
          break;

        case GuardianStep.guardianView:
          if (result.methodName === CrossTabPushMessageType.onSetLoginGuardianResult) {
            await handleSetLoginGuardian(_currentGuardian, approvalInfo);
          } else if (result.methodName === CrossTabPushMessageType.onEditGuardianResult) {
            await handleEditGuardian(_currentGuardian, approvalInfo, _preGuardian);
          } else if (result.methodName === CrossTabPushMessageType.onRemoveGuardianResult) {
            await handleRemoveGuardian(approvalInfo, _currentGuardian);
          }
          break;

        default:
          break;
      }

      return;
    },
    [
      caHash,
      chainType,
      handleAddGuardian,
      handleEditGuardian,
      handleRemoveGuardian,
      handleSetLoginGuardian,
      hasTelegramGuardian,
      isErrorTip,
      networkType,
      originChainId,
      telegramUserId,
    ],
  );
  const onAddGuardian = useCallback(
    async (telegramAccessToken?: string) => {
      if (isTelegramPlatform()) {
        await handleWithinTelegram({
          guardianStep: GuardianStep.guardianAdd,
          socketMethod: [CrossTabPushMessageType.onAddGuardianResult],
          telegramAccessToken,
        });
      } else {
        setStep(GuardianStep.guardianAdd);
      }
    },
    [handleWithinTelegram],
  );
  const onViewGuardian = useCallback(
    async (item: UserGuardianStatus, telegramAccessToken?: string) => {
      setCurrentGuardian(item);
      if (isTelegramPlatform()) {
        await handleWithinTelegram({
          guardianStep: GuardianStep.guardianView,
          socketMethod: [
            CrossTabPushMessageType.onSetLoginGuardianResult,
            CrossTabPushMessageType.onEditGuardianResult,
            CrossTabPushMessageType.onRemoveGuardianResult,
          ],
          item,
          telegramAccessToken,
        });
      } else {
        setStep(GuardianStep.guardianView);
      }
    },
    [handleWithinTelegram],
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

  const handleGuardianOperationAfterAuthWithInTelegram = useCallback(
    ({
      guardianStep,
      item,
      telegramAccessToken,
    }: {
      guardianStep: GuardianStep;
      item?: UserGuardianStatus;
      telegramAccessToken: string;
    }) => {
      if (guardianStep === GuardianStep.guardianAdd) {
        onAddGuardian(telegramAccessToken);
      } else if (guardianStep === GuardianStep.guardianView && item) {
        onViewGuardian(item, telegramAccessToken);
      }
    },
    [onAddGuardian, onViewGuardian],
  );

  useEffect(() => {
    if (currentStorageData?.accessToken && currentStorageData?.guardianStep && guardianList) {
      setCurrentStorageData({});
      handleGuardianOperationAfterAuthWithInTelegram({
        guardianStep: currentStorageData.guardianStep,
        item: currentStorageData.item,
        telegramAccessToken: currentStorageData.accessToken,
      });
    }
  }, [currentStorageData, handleGuardianOperationAfterAuthWithInTelegram, guardianList]);

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
                  <ThrottleButton onClick={() => onAddGuardian()} className="title-add-guardian-btn">
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
          networkType={networkType}
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
