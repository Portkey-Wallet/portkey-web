import { message } from 'antd';
import { GuardiansApproved, OperationTypeEnum, AccountTypeEnum } from '@portkey/services';
import { useState, useMemo, useCallback, memo, ReactNode, useRef, useEffect } from 'react';
import CommonSelect from '../CommonSelect';
import { VerifierItem } from '@portkey/did';
import { ChainId, ChainType } from '@portkey/types';
import {
  errorTip,
  handleErrorMessage,
  handleVerificationDoc,
  setLoading,
  socialLoginAuth,
  verification,
} from '../../utils';
import {
  ISocialLogin,
  ITelegramInfo,
  IVerificationInfo,
  NetworkType,
  OnErrorFunc,
  UserGuardianStatus,
  VerifyStatus,
} from '../../types';
import CustomSvg from '../CustomSvg';
import { useTranslation } from 'react-i18next';
import GuardianApproval from '../GuardianApproval';
import CustomModal from '../CustomModal';
import CommonBaseModal from '../CommonBaseModal';
import GuardianAccountShow from '../GuardianAccountShow';
import clsx from 'clsx';
import BackHeader from '../BackHeader';
import {
  AllSocialLoginList,
  guardianIconMap,
  verifierExistTip,
  zkGuardianType,
  zkLoginVerifierItem,
} from '../../constants/guardian';
import VerifierPage from '../GuardianApproval/components/VerifierPage';
import useReCaptchaModal from '../../hooks/useReCaptchaModal';
import { TVerifyCodeInfo } from '../SignStep/types';
import { useVerifyToken } from '../../hooks';
import { getGuardianList } from '../SignStep/utils/getGuardians';
import ThrottleButton from '../ThrottleButton';
import { getOperationDetails } from '../utils/operation.util';
import { getSocialConfig } from '../utils/social.utils';
import GuardianTypeIcon from '../GuardianTypeIcon';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import './index.less';

enum GuardianEditStatus {
  UnsetLoginGuardian = 'UnsetLoginGuardian',
  EditGuardian = 'EditGuardian',
  RemoveGuardian = 'RemoveGuardian',
}

export interface GuardianEditProps {
  header?: ReactNode;
  className?: string;
  originChainId: ChainId;
  caHash: string;
  verifierList?: VerifierItem[];
  isErrorTip?: boolean;
  guardianList?: UserGuardianStatus[];
  currentGuardian?: UserGuardianStatus;
  preGuardian?: UserGuardianStatus;
  networkType: NetworkType;
  chainType?: ChainType;
  sandboxId?: string;
  telegramInfo?: ITelegramInfo;
  onError?: OnErrorFunc;
  handleEditGuardian?: (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => Promise<any>;
  handleRemoveGuardian?: (approvalInfo: GuardiansApproved[]) => Promise<any>;
  handleSetLoginGuardian: (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => Promise<any>;
}
export interface ISocialInput {
  id: string;
  firstName: string;
  thirdPartyEmail: string;
  accessToken: string;
  isPrivate?: boolean;
}

function GuardianEdit({
  header,
  className,
  originChainId,
  caHash,
  isErrorTip = true,
  verifierList,
  currentGuardian,
  preGuardian,
  guardianList,
  networkType,
  chainType = 'aelf',
  sandboxId,
  telegramInfo,
  onError,
  handleEditGuardian,
  handleRemoveGuardian,
  handleSetLoginGuardian,
}: GuardianEditProps) {
  const { t } = useTranslation();
  const [isExist, setIsExist] = useState<boolean>(false);
  const isZK = useMemo(
    () => preGuardian?.verifiedByZk || preGuardian?.manuallySupportForZk,
    [preGuardian?.manuallySupportForZk, preGuardian?.verifiedByZk],
  );
  const [{ managementAccount }] = usePortkeyAsset();
  const preGuardianRef = useRef<UserGuardianStatus | undefined>(preGuardian);
  const curGuardian = useRef<UserGuardianStatus | undefined>(currentGuardian);
  const [selectVerifierId, setSelectVerifierId] = useState<string | undefined>(
    isZK ? zkLoginVerifierItem.id : currentGuardian?.verifier?.id,
  );
  const [verifierVisible, setVerifierVisible] = useState<boolean>(false);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const verifyToken = useVerifyToken();
  const [step, setStep] = useState<GuardianEditStatus>(GuardianEditStatus.EditGuardian);
  const [editBtnLoading, setEditBtnLoading] = useState<boolean>(false);
  const operationType: OperationTypeEnum = useMemo(() => {
    if (step === GuardianEditStatus.EditGuardian) {
      return OperationTypeEnum.editGuardian;
    }
    if (step === GuardianEditStatus.RemoveGuardian) {
      return OperationTypeEnum.deleteGuardian;
    }
    if (step === GuardianEditStatus.UnsetLoginGuardian) {
      return OperationTypeEnum.unsetLoginAccount;
    }
    return OperationTypeEnum.editGuardian;
  }, [step]);
  const verifierMap = useRef<{ [x: string]: VerifierItem }>();
  const editBtnDisable = useMemo(
    () => isExist || selectVerifierId === preGuardian?.verifier?.id,
    [isExist, preGuardian?.verifier?.id, selectVerifierId],
  );
  const reCaptchaHandler = useReCaptchaModal();
  const customSelectOption = useMemo(
    () => [
      {
        value: 'tip',
        disabled: true,
        className: 'portkey-option-tip',
        label: (
          <div className="portkey-ui-flex label-item">
            <CustomSvg type="Warning" />
            <div className="tip">{`Except for zkLogin, used verifiers cannot be selected. To choose ZkLogin, the guardian type must be either a Google account or an Apple ID.`}</div>
          </div>
        ),
      },
    ],
    [],
  );
  const verifierSelectItems = useMemo(
    () =>
      verifierList?.map((item) => {
        let disabled = false;
        const isUsed = !!guardianList
          ?.filter((temp) => temp.key !== preGuardian?.key)
          .find((_guardian) => _guardian.verifierId === item.id);

        if (preGuardian?.guardianType && zkGuardianType.includes(preGuardian.guardianType)) {
          const abled = item.id === preGuardian?.verifier?.id || item.name === zkLoginVerifierItem.name;
          disabled = !abled;
        } else {
          disabled = (isUsed && item.id !== preGuardian?.verifier?.id) || item.name === zkLoginVerifierItem.name;
        }
        return {
          value: item?.id,
          iconUrl: item?.imageUrl ?? '',
          label: item?.name,
          icon: <img src={item?.imageUrl} />,
          id: item?.id,
          disabled,
        };
      }),
    [guardianList, preGuardian?.guardianType, preGuardian?.key, preGuardian?.verifier?.id, verifierList],
  );
  const approvalGuardianList = useMemo(
    () => guardianList?.filter((item) => item.key !== preGuardian?.key),
    [guardianList, preGuardian?.key],
  );
  useEffect(() => {
    const _verifierMap: { [x: string]: VerifierItem } = {};
    verifierList?.forEach((item: VerifierItem) => {
      _verifierMap[item.id] = item;
    }, []);
    verifierMap.current = _verifierMap;
  }, [verifierList]);
  const handleVerifierChange = useCallback((id: string) => {
    setSelectVerifierId(id);
    setIsExist(false);
  }, []);

  const checkValid = useCallback(async () => {
    // 1. check verifier valid
    const verifier = verifierMap.current?.[selectVerifierId!];
    if (!verifier) {
      message.error('Can not get the current verifier message');
      return false;
    }

    // fetch latest guardianList
    const _guardianList = await getGuardianList({
      caHash,
      originChainId,
      sandboxId,
      chainType,
    });

    if (curGuardian.current?.guardianType && zkGuardianType.includes(curGuardian.current?.guardianType)) {
      // zk
      const _key = `${currentGuardian?.guardianIdentifier}&${selectVerifierId}`;

      const _guardian: UserGuardianStatus = {
        ...currentGuardian!,
        key: _key,
      };
      curGuardian.current = _guardian;
      return true;
    } else {
      // 2. check verifier exist
      const _verifierExist = _guardianList?.some((temp) => temp.verifierId === verifier.id);
      if (_verifierExist) {
        setIsExist(true);
        return false;
      }
      const _key = `${currentGuardian?.guardianIdentifier}&${selectVerifierId}`;
      const _guardian: UserGuardianStatus = {
        ...currentGuardian!,
        key: _key,
        verifier,
        verifierId: verifier.id,
      };
      curGuardian.current = _guardian;
      return true;
    }
  }, [caHash, chainType, currentGuardian, originChainId, sandboxId, selectVerifierId]);
  const socialBasic = useCallback(
    (v: ISocialLogin) => {
      try {
        return getSocialConfig(v);
      } catch (error) {
        errorTip(
          {
            errorFields: 'get social account basic',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      }
    },
    [isErrorTip, onError],
  );

  const socialVerify = useCallback(
    async (_guardian: UserGuardianStatus) => {
      const { clientId, redirectURI, customLoginHandler } = socialBasic(_guardian?.guardianType as ISocialLogin) || {};
      let token = '';
      let idToken;
      let nonce;
      let timestamp;
      if (
        _guardian?.guardianType === 'Telegram' &&
        telegramInfo?.userId === _guardian?.guardianIdentifier &&
        telegramInfo?.accessToken
      ) {
        token = telegramInfo.accessToken;
      } else {
        const response = await socialLoginAuth({
          type: _guardian?.guardianType as ISocialLogin,
          clientId,
          redirectURI,
          network: networkType,
          guardianIdentifier: _guardian.guardianIdentifier,
          managerAddress: managementAccount?.address,
        });
        if (!response?.token) throw new Error('auth failed');
        token = response.token;
        if (!response?.idToken) throw new Error('invalid idToken');
        idToken = response.idToken;
        nonce = response.nonce;
        timestamp = response.timestamp;
      }
      const rst = await verifyToken(_guardian?.guardianType as ISocialLogin, {
        accessToken: token,
        nonce,
        timestamp,
        idToken,
        id: _guardian.guardianIdentifier || '',
        verifierId: _guardian?.verifier?.id || '',
        chainId: originChainId,
        clientId,
        redirectURI,
        networkType,
        caHash,
        operationDetails: getOperationDetails(operationType, {
          identifierHash: curGuardian.current?.identifierHash,
          guardianType: curGuardian.current?.guardianType,
          verifierId: curGuardian.current?.verifierId,
        }),
        operationType: OperationTypeEnum.unsetLoginAccount,
        customLoginHandler,
      });
      if (!rst) return;
      const verifierInfo: IVerificationInfo = { ...rst, verifierId: _guardian?.verifierId };
      let guardianIdentifier = '';
      if (rst.zkLoginInfo) {
        guardianIdentifier = rst.zkLoginInfo.identifierHash;
      } else {
        guardianIdentifier = handleVerificationDoc(verifierInfo.verificationDoc as string).guardianIdentifier;
      }
      return { verifierInfo, guardianIdentifier };
    },
    [
      socialBasic,
      telegramInfo?.userId,
      telegramInfo?.accessToken,
      verifyToken,
      caHash,
      originChainId,
      networkType,
      operationType,
      managementAccount?.address,
    ],
  );
  const sendCode = useCallback(async () => {
    try {
      setLoading(true);
      const _guardian = preGuardianRef.current;
      const result = await verification.sendVerificationCode(
        {
          params: {
            type: _guardian?.guardianType || 'Email',
            guardianIdentifier: _guardian?.guardianIdentifier || '',
            verifierId: _guardian?.verifier?.id || '',
            chainId: originChainId,
            operationType: OperationTypeEnum.unsetLoginAccount,
            operationDetails: getOperationDetails(operationType, {
              identifierHash: curGuardian.current?.identifierHash,
              guardianType: curGuardian.current?.guardianType,
              verifierId: curGuardian.current?.verifierId,
            }),
          },
        },
        reCaptchaHandler,
      );

      if (result.verifierSessionId) {
        preGuardianRef.current = {
          ...(preGuardianRef.current as UserGuardianStatus),
          verifierInfo: {
            sessionId: result.verifierSessionId,
          },
          status: VerifyStatus.Verifying,
          isInitStatus: true,
        };
        setVerifierVisible(true);
      }
    } catch (error) {
      return errorTip(
        {
          errorFields: 'Send Code',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [originChainId, operationType, reCaptchaHandler, isErrorTip, onError]);
  const reSendCode = useCallback(({ verifierSessionId }: TVerifyCodeInfo) => {
    preGuardianRef.current = {
      ...(preGuardianRef.current as UserGuardianStatus),
      verifierInfo: {
        sessionId: verifierSessionId,
      },
    };
  }, []);

  const verifySuccess = useCallback((res: { verificationDoc?: string; signature?: string; verifierId: string }) => {
    if (!res.verificationDoc || !res.signature) return;
    const { guardianIdentifier } = handleVerificationDoc(res.verificationDoc);

    preGuardianRef.current = {
      ...(preGuardianRef?.current as UserGuardianStatus),
      status: VerifyStatus.Verified,
      verificationDoc: res.verificationDoc,
      signature: res.signature,
      identifierHash: guardianIdentifier,
    };
    setStep(GuardianEditStatus.UnsetLoginGuardian);
    setVerifierVisible(false);
    setApprovalVisible(true);
  }, []);
  const approvalSuccess = useCallback(
    async (approvalInfo: GuardiansApproved[]) => {
      try {
        setLoading(true);
        if (step === GuardianEditStatus.EditGuardian) {
          let _cur = curGuardian.current;
          if (_cur?.guardianType && zkGuardianType.includes(_cur.guardianType)) {
            _cur = {
              ..._cur,
              verifier: preGuardian?.verifier,
              verifierId: preGuardian?.verifierId,
            };
          }

          await handleEditGuardian?.(_cur!, approvalInfo);
        }
        if (step === GuardianEditStatus.RemoveGuardian) {
          await handleRemoveGuardian?.(approvalInfo);
        }
        if (step === GuardianEditStatus.UnsetLoginGuardian) {
          await handleSetLoginGuardian(preGuardianRef.current!, approvalInfo);
        }
        setApprovalVisible(false);
      } catch (e) {
        errorTip(
          {
            errorFields: 'Handle Guardian',
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
      handleEditGuardian,
      handleRemoveGuardian,
      handleSetLoginGuardian,
      isErrorTip,
      onError,
      preGuardian?.verifier,
      preGuardian?.verifierId,
      step,
    ],
  );

  const handleCommonVerify = useCallback(() => {
    CustomModal({
      type: 'confirm',
      okText: 'Confirm',
      content: (
        <p>
          {`${preGuardian?.verifier?.name ?? ''} will send a verification code to `}
          <strong>{preGuardian?.guardianIdentifier}</strong>
          {` to verify your ${
            preGuardian?.guardianType === AccountTypeEnum[AccountTypeEnum.Phone] ? 'phone number' : 'email address'
          }.`}
        </p>
      ),
      onOk: sendCode,
    });
  }, [preGuardian?.guardianIdentifier, preGuardian?.guardianType, preGuardian?.verifier?.name, sendCode]);
  const handleSocialVerify = useCallback(async () => {
    try {
      setLoading(true);
      const res = await socialVerify?.(preGuardian!);

      preGuardianRef.current = {
        ...(preGuardianRef?.current as UserGuardianStatus),
        status: VerifyStatus.Verified,
        verificationDoc: res?.verifierInfo.verificationDoc,
        signature: res?.verifierInfo.signature,
        identifierHash: res?.guardianIdentifier,
        zkLoginInfo: res?.verifierInfo?.zkLoginInfo,
      };
      setStep(GuardianEditStatus.UnsetLoginGuardian);
      setApprovalVisible(true);
    } catch (error) {
      errorTip(
        {
          errorFields: 'Social Verify',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [isErrorTip, onError, preGuardian, socialVerify]);

  const handleUnsetLoginGuardian = useCallback(() => {
    if (AllSocialLoginList.includes(`${preGuardian?.guardianType}`)) {
      handleSocialVerify();
    } else {
      handleCommonVerify();
    }
  }, [handleCommonVerify, handleSocialVerify, preGuardian?.guardianType]);

  const onConfirm = useCallback(async () => {
    let _valid = true;
    try {
      setEditBtnLoading(true);
      _valid = await checkValid();
      setEditBtnLoading(false);
    } catch (error) {
      _valid = false;
      setEditBtnLoading(false);
    }
    if (_valid) {
      setStep(GuardianEditStatus.EditGuardian);
      setApprovalVisible(true);
    }
  }, [checkValid]);

  const onClickRemove = useCallback(() => {
    const isLoginAccountList = guardianList?.filter((item) => item.isLoginGuardian) || [];
    if (currentGuardian?.isLoginGuardian) {
      if (isLoginAccountList.length === 1) {
        CustomModal({
          type: 'info',
          content: <>{t('This guardian is the only login account and cannot be removed')}</>,
        });
      } else {
        CustomModal({
          type: 'confirm',
          okText: 'confirm',
          content: (
            <>
              {t(
                'This guardian is currently set as a login account. You need to unset its login account identity before removing it. Please click "Confirm" to proceed.',
              )}
            </>
          ),
          onOk: handleUnsetLoginGuardian,
        });
      }
    } else {
      CustomModal({
        type: 'confirm',
        okText: 'Yes',
        cancelText: 'No',
        content: (
          <div className="portkey-ui-flex-column portkey-ui-remove-guardian-modal">
            <div className="remove-guardian-title">Are you sure you want to remove this guardian?</div>
            <div>Removing a guardian requires guardian approval</div>
          </div>
        ),
        onOk: () => {
          setStep(GuardianEditStatus.RemoveGuardian);
          setApprovalVisible(true);
        },
      });
    }
  }, [currentGuardian?.isLoginGuardian, guardianList, handleUnsetLoginGuardian, t]);

  return (
    <div className={clsx('portkey-ui-guardian-edit', 'portkey-ui-flex-column', className)}>
      {header}
      <div className="guardian-edit-body portkey-ui-flex-column portkey-ui-flex-1">
        <div className="input-item">
          <div className="guardian-edit-input-item-label">{`Guardian ${currentGuardian?.guardianType}`}</div>
          <div className="guardian-account guardian-edit-input-item-value portkey-ui-flex">
            <GuardianTypeIcon type={guardianIconMap[currentGuardian?.guardianType || 'Email']} />
            <GuardianAccountShow guardian={currentGuardian} />
          </div>
        </div>
        <div className="input-item">
          <p className="guardian-edit-input-item-label">{t('Verifier')}</p>
          <CommonSelect
            placeholder="Select Guardians Verifier"
            className={clsx(
              'verifier-select',
              'portkey-select-verifier-option-tip',
              isZK && 'verifier-select-disabled',
            )}
            value={selectVerifierId}
            onChange={handleVerifierChange}
            items={verifierSelectItems}
            customOptions={customSelectOption}
          />
          {isExist && <div className="guardian-edit-error-tip">{verifierExistTip}</div>}
        </div>
      </div>
      <div className="guardian-edit-footer">
        <div className="portkey-ui-flex-between guardian-add-btn-wrap">
          <ThrottleButton className="guardian-btn guardian-btn-remove" onClick={onClickRemove}>
            {t('Remove')}
          </ThrottleButton>
          <ThrottleButton
            type="primary"
            className="guardian-btn "
            onClick={onConfirm}
            disabled={editBtnDisable || isZK}
            loading={editBtnLoading}>
            {t('Send Request')}
          </ThrottleButton>
        </div>
      </div>
      <CommonBaseModal open={verifierVisible} onClose={() => setVerifierVisible(false)} destroyOnClose>
        <VerifierPage
          originChainId={originChainId}
          operationType={OperationTypeEnum.unsetLoginAccount}
          operationDetails={getOperationDetails(operationType, {
            identifierHash: curGuardian.current?.identifierHash,
            guardianType: curGuardian.current?.guardianType,
            verifierId: curGuardian.current?.verifierId,
          })}
          onBack={() => setVerifierVisible(false)}
          guardianIdentifier={preGuardian?.guardianIdentifier || ''}
          verifierSessionId={preGuardianRef.current?.verifierInfo?.sessionId || ''}
          isLoginGuardian={preGuardian?.isLoginGuardian}
          isCountdownNow={preGuardianRef.current?.isInitStatus}
          accountType={preGuardian?.guardianType}
          isErrorTip={isErrorTip}
          verifier={preGuardian?.verifier as VerifierItem}
          caHash={caHash}
          onSuccess={verifySuccess}
          onError={onError}
          onReSend={reSendCode}
        />
      </CommonBaseModal>
      <CommonBaseModal
        className="portkey-ui-modal-approval"
        destroyOnClose
        open={approvalVisible}
        onClose={() => setApprovalVisible(false)}>
        <GuardianApproval
          header={<BackHeader onBack={() => setApprovalVisible(false)} />}
          originChainId={originChainId}
          guardianList={approvalGuardianList}
          networkType={networkType}
          telegramInfo={telegramInfo}
          onConfirm={approvalSuccess}
          onError={onError}
          operationType={operationType}
          caHash={caHash}
          operationDetails={getOperationDetails(operationType, {
            identifierHash: curGuardian.current?.identifierHash,
            guardianType: curGuardian.current?.guardianType,
            verifierId: curGuardian.current?.verifierId,
            preVerifierId: preGuardian?.verifierId,
            newVerifierId: curGuardian.current?.verifierId,
          })}
        />
      </CommonBaseModal>
    </div>
  );
}

export default memo(GuardianEdit);
