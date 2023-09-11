import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import GuardianList from '../GuardianPageList';
import GuardianEdit from '../GuardianEdit';
import GuardianAdd from '../GuardianAdd';
import { AccountType, GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import GuardianView from '../GuardianView';
import {
  AuthServe,
  did,
  errorTip,
  getGoogleUserInfo,
  handleErrorMessage,
  handleVerificationDoc,
  parseAppleIdentityToken,
  setLoading,
  socialLoginAuth,
} from '../../utils';
import { ChainId, ChainType } from '@portkey/types';
import { ISocialLogin, IVerificationInfo, OnErrorFunc, UserGuardianStatus, VerifyStatus } from '../../types';
import { getChainInfo } from '../../hooks/useChainInfo';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { usePortkey } from '../context';
import { VerifierItem } from '@portkey/did';
import { useThrottleEffect } from '../../hooks/throttle';
import TitleWrapper from '../TitleWrapper';
import { Button } from 'antd';
import ConfigProvider from '../config-provider';
import { useVerifyToken } from '../../hooks/authentication';
import { formatAddGuardianValue } from './utils/formatAddGuardianValue';
import { formatEditGuardianValue } from './utils/formatEditGuardianValue';
import { formatDelGuardianValue } from './utils/formatDelGuardianValue';
import { GuardianMth, handleGuardianContract } from '../../utils/sandboxUtil/handleGuardianContract';
import './index.less';

export enum GuardianStep {
  guardianList = 'guardianList',
  guardianAdd = 'guardianAdd',
  guardianEdit = 'guardianEdit',
  guardianView = 'guardianView',
  guardianApproval = 'guardianApproval',
}

export interface GuardianProps {
  caHash: string;
  chainId?: ChainId;
  originChainId?: ChainId;
  chainType?: ChainType;
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
  onBack?: () => void;
}

function GuardianMain({
  caHash,
  chainId = 'AELF',
  originChainId = 'AELF',
  chainType = 'aelf',
  isErrorTip = true,
  onError,
  onBack,
}: GuardianProps) {
  const [{ sandboxId }] = usePortkey();
  const [step, setStep] = useState<GuardianStep>(GuardianStep.guardianList);
  const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>();
  const [currentGuardian, setCurrentGuardian] = useState<UserGuardianStatus>();
  const [preGuardian, setPreGuardian] = useState<UserGuardianStatus>();
  const [verifierList, setVerifierList] = useState<VerifierItem[] | undefined>();
  const verifierMap = useRef<{ [x: string]: VerifierItem }>();
  const [isAdd, setIsAdd] = useState<boolean>(true);
  useThrottleEffect(() => {
    AuthServe.addRequestAuthCheck(originChainId);
  }, []);
  const editable = useMemo(() => Number(guardianList?.length) > 1, [guardianList?.length]);
  const verifyToken = useVerifyToken();
  const getVerifierInfo = useCallback(async () => {
    try {
      const chainInfo = await getChainInfo(chainId);
      const list = await getVerifierList({
        sandboxId,
        chainId,
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
          error,
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [chainId, chainType, isErrorTip, onError, sandboxId]);

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
    setIsAdd(true);
    setStep(GuardianStep.guardianAdd);
  }, []);
  const onViewGuardian = useCallback((item: UserGuardianStatus) => {
    setCurrentGuardian(item);
    setStep(GuardianStep.guardianView);
  }, []);
  const onEditGuardian = useCallback(() => {
    setIsAdd(false);
    setPreGuardian(currentGuardian);
    setStep(GuardianStep.guardianEdit);
  }, [currentGuardian]);
  const onGoBackList = useCallback(() => {
    setStep(GuardianStep.guardianList);
    setCurrentGuardian(undefined);
  }, []);

  const socialBasic = useCallback(
    (v: ISocialLogin) => {
      try {
        const socialLogin = ConfigProvider.config.socialLogin;
        let clientId;
        let redirectURI;
        let customLoginHandler;
        switch (v) {
          case 'Apple':
            clientId = socialLogin?.Apple?.clientId;
            redirectURI = socialLogin?.Apple?.redirectURI;
            customLoginHandler = socialLogin?.Apple?.customLoginHandler;
            break;
          case 'Google':
            clientId = socialLogin?.Google?.clientId;
            customLoginHandler = socialLogin?.Google?.customLoginHandler;
            break;
          default:
            throw 'accountType is not supported';
        }
        return { clientId, redirectURI, customLoginHandler };
      } catch (error) {
        errorTip(
          {
            errorFields: 'socialBasic',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      }
    },
    [isErrorTip, onError],
  );
  const socialUserInfo = useCallback(async (v: ISocialLogin, accessToken: string) => {
    let info = {};
    if (v === 'Google') {
      const userInfo = await getGoogleUserInfo(accessToken);
      console.log('===google', userInfo);
      if (!userInfo?.id) throw userInfo;
      info = {
        id: userInfo.id,
        firstName: userInfo.firstName,
        thirdPartyEmail: userInfo.email,
        accessToken,
        isPrivate: false,
      };
    } else if (v === 'Apple') {
      const userInfo = parseAppleIdentityToken(accessToken);
      if (userInfo) {
        info = {
          ...userInfo,
        };
      }
    }
    return info;
  }, []);
  const socialAuth = useCallback(
    async (v: ISocialLogin) => {
      try {
        const { clientId, redirectURI } = socialBasic(v) || {};
        const response = await socialLoginAuth({
          type: v,
          clientId,
          redirectURI,
        });
        if (!response?.token) throw new Error('add guardian failed');
        const info = await socialUserInfo(v, response.token);
        return info;
      } catch (error) {
        errorTip(
          {
            errorFields: 'socialAuth',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      }
    },
    [isErrorTip, onError, socialBasic, socialUserInfo],
  );
  const socialVerify = useCallback(
    async (_guardian: UserGuardianStatus) => {
      try {
        const { clientId, redirectURI, customLoginHandler } =
          socialBasic(_guardian?.guardianType as ISocialLogin) || {};
        const info: any = await socialUserInfo(_guardian?.guardianType as ISocialLogin, _guardian?.accessToken || '');
        const rst = await verifyToken(_guardian?.guardianType as ISocialLogin, {
          accessToken: _guardian?.accessToken,
          id: info?.id,
          verifierId: _guardian?.verifierId || '',
          chainId,
          clientId,
          redirectURI,
          operationType: isAdd ? OperationTypeEnum.addGuardian : OperationTypeEnum.editGuardian,
          customLoginHandler,
        });
        if (!rst) return;
        const verifierInfo: IVerificationInfo = { ...rst, verifierId: _guardian?.verifierId };
        const { guardianIdentifier } = handleVerificationDoc(verifierInfo.verificationDoc as string);
        return { verifierInfo, guardianIdentifier };
      } catch (error) {
        return errorTip(
          {
            errorFields: 'GuardianApproval',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [chainId, isAdd, isErrorTip, onError, socialBasic, socialUserInfo, verifyToken],
  );

  const handleAddGuardian = useCallback(
    async (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => {
      const params = formatAddGuardianValue({ currentGuardian, approvalInfo });
      try {
        const res = await handleGuardianContract({
          type: GuardianMth.addGuardian,
          params,
          sandboxId,
          chainId,
          caHash,
        });
        console.log('===handleAddGuardian res', res);
        await getGuardianList();
        setStep(GuardianStep.guardianList);
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
    [caHash, chainId, getGuardianList, isErrorTip, onError, sandboxId],
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
          chainId,
          caHash,
        });
        getGuardianList();
        setStep(GuardianStep.guardianList);
      } catch (e) {
        return errorTip(
          {
            errorFields: 'HandldEditGuardian',
            error: handleErrorMessage(e),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [caHash, chainId, getGuardianList, isErrorTip, onError, preGuardian, sandboxId],
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
          chainId,
          caHash,
        });
        getGuardianList();
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
    [caHash, chainId, currentGuardian, getGuardianList, isErrorTip, onError, sandboxId],
  );
  const handleSetLoginGuardian = useCallback(async () => {
    const guardian = {
      type: currentGuardian?.guardianType,
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
        chainId,
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
          error: e,
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(true);
    }
  }, [
    caHash,
    chainId,
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

  return (
    <div className="portkey-ui-guardian-page">
      {step === GuardianStep.guardianList && (
        <GuardianList
          header={
            <TitleWrapper
              className="guardian-page-title"
              title="Guardians"
              leftCallBack={onBack}
              rightElement={
                <Button onClick={onAddGuardian} className="title-add-guardian-btn">
                  Add Guardians
                </Button>
              }
            />
          }
          guardianList={guardianList}
          onAddGuardian={onAddGuardian}
          onViewGuardian={onViewGuardian}
        />
      )}
      {step === GuardianStep.guardianView && (
        <GuardianView
          header={<TitleWrapper className="guardian-page-title" title="Guardians" leftCallBack={onGoBackList} />}
          currentGuardian={currentGuardian!}
          onEditGuardian={editable ? onEditGuardian : undefined}
          handleSetLoginGuardian={handleSetLoginGuardian}
          guardianList={guardianList}
          socialVerify={socialVerify}
        />
      )}
      {step === GuardianStep.guardianAdd && (
        <GuardianAdd
          header={<TitleWrapper className="guardian-page-title" title="Add Guardians" leftCallBack={onGoBackList} />}
          verifierList={verifierList}
          guardianList={guardianList}
          verifierMap={verifierMap.current}
          socialAuth={socialAuth}
          socialVerify={socialVerify}
          handleAddGuardian={handleAddGuardian}
        />
      )}
      {step === GuardianStep.guardianEdit && (
        <GuardianEdit
          header={<TitleWrapper className="guardian-page-title" title="Edit Guardians" leftCallBack={onGoBackList} />}
          verifierList={verifierList}
          currentGuardian={currentGuardian}
          guardianList={guardianList}
          preGuardian={preGuardian}
          verifierMap={verifierMap.current}
          socialVerify={socialVerify}
          handleEditGuardian={handleEditGuardian}
          handleRemoveGuardian={handleRemoveGuardian}
        />
      )}
    </div>
  );
}

export default GuardianMain;
