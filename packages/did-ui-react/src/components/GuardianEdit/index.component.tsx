import { Button, Input, message } from 'antd';
import { AccountType, AccountTypeEnum, GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { useState, useMemo, useCallback, useEffect, memo, ReactNode, useRef } from 'react';
import CommonSelect from '../CommonSelect';
import { VerifierItem } from '@portkey/did';
import { ChainId, ChainType } from '@portkey/types';
import { errorTip, handleErrorMessage, handleVerificationDoc, setLoading, verification } from '../../utils';
import { ICountryItem, OnErrorFunc, UserGuardianStatus, VerifyStatus } from '../../types';
import CustomSvg from '../CustomSvg';
import { useTranslation } from 'react-i18next';
import PhoneNumberInput from '../PhoneNumberInput';
import { IPhoneCountry } from '../types';
import AccountShow from '../GuardianAccountShow';
import VerifierPage from '../GuardianApproval/components/VerifierPage';
import { TVerifyCodeInfo } from '../SignStep/types';
import GuardianApproval from '../GuardianApproval';
import useReCaptchaModal from '../../hooks/useReCaptchaModal';
import CustomModal from '../CustomModal';
import CustomPromptModal from '../CustomPromptModal';
import './index.less';

const guardianIconMap: any = {
  [AccountTypeEnum.Email]: 'Email',
  [AccountTypeEnum.Phone]: 'GuardianPhone',
  [AccountTypeEnum.Google]: 'GuardianGoogle',
  [AccountTypeEnum.Apple]: 'GuardianApple',
};

export interface GuardianEditProps {
  header?: ReactNode;
  chainId?: ChainId;
  originChainId?: ChainId;
  verifierList?: VerifierItem[];
  isErrorTip?: boolean;
  chainType?: ChainType;
  phoneCountry?: IPhoneCountry;
  guardianList?: UserGuardianStatus[];
  currentGuardian?: UserGuardianStatus;
  preGuardian?: UserGuardianStatus;
  verifierMap?: { [x: string]: VerifierItem };
  onError?: OnErrorFunc;
  socialVerify?: (item: UserGuardianStatus) => Promise<any>;
  handleEditGuardian?: (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => Promise<any>;
  handleRemoveGuardian?: (approvalInfo: GuardiansApproved[]) => Promise<any>;
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
  chainId = 'AELF',
  originChainId = 'AELF',
  isErrorTip = true,
  phoneCountry,
  verifierList,
  currentGuardian,
  preGuardian,
  guardianList,
  verifierMap = {},
  onError,
  socialVerify,
  handleEditGuardian,
  handleRemoveGuardian,
}: GuardianEditProps) {
  const { t } = useTranslation();
  const [emailValue, setEmailValue] = useState<string>('');
  const [countryCode, setCountryCode] = useState<ICountryItem | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [currentKey, setCurrentKey] = useState<string>('');
  const [isExist, setIsExist] = useState<boolean>(false);
  const reCaptchaHandler = useReCaptchaModal();
  const curGuardian = useRef<UserGuardianStatus | undefined>(currentGuardian);
  const [selectVerifierId, setSelectVerifierId] = useState<string | undefined>(currentGuardian?.verifier?.id);
  const [verifierVisible, setVerifierVisible] = useState<boolean>(false);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const [isRemove, setIsRemove] = useState<boolean>(false);
  const editBtnDisable = useMemo(
    () => isExist || selectVerifierId === preGuardian?.verifier?.id,
    [isExist, preGuardian?.verifier?.id, selectVerifierId],
  );
  const verifierSelectItems = useMemo(
    () =>
      verifierList?.map((item) => ({
        value: item?.id,
        iconUrl: item?.imageUrl ?? '',
        label: item?.name,
        icon: <img src={item?.imageUrl} />,
        id: item?.id,
      })),
    [verifierList],
  );
  const handleVerifierChange = useCallback((id: string) => {
    setSelectVerifierId(id);
    setIsExist(false);
  }, []);
  const checkValid = useCallback(() => {
    const _isExist = guardianList?.some((item) => item.key === currentKey);
    if (_isExist) {
      setIsExist(true);
      return false;
    }
    const verifier = verifierMap[selectVerifierId!];
    if (!verifier) {
      message.error('Can not get the current verifier message');
      return false;
    }
    const _guardian: UserGuardianStatus = {
      ...currentGuardian!,
      key: currentKey,
      verifier,
      verifierId: verifier.id,
    };
    curGuardian.current = _guardian;
    return true;
  }, [currentGuardian, currentKey, guardianList, selectVerifierId, verifierMap]);
  const renderSocialGuardianAccount = useCallback(
    () => (
      <div className="social input">
        <div className="portkey-ui-flex-column social-input">
          <span className="social-name">{currentGuardian?.firstName}</span>
          <span className="social-email">
            {currentGuardian?.isPrivate ? '******' : currentGuardian?.thirdPartyEmail}
          </span>
        </div>
      </div>
    ),
    [currentGuardian?.firstName, currentGuardian?.isPrivate, currentGuardian?.thirdPartyEmail],
  );
  const guardianAccountInput = useMemo(
    () => ({
      [AccountTypeEnum.Email]: {
        element: (
          <Input
            className="login-input"
            value={emailValue}
            placeholder={t('Enter email')}
            onChange={(e) => {
              setEmailValue(e.target.value);
              setIsExist(false);
            }}
          />
        ),
        label: t('Guardian Email'),
      },
      [AccountTypeEnum.Phone]: {
        element: (
          <PhoneNumberInput
            iso={countryCode?.iso ?? phoneCountry?.iso}
            countryList={phoneCountry?.countryList}
            phoneNumber={phoneNumber}
            onAreaChange={(v) => {
              setCountryCode(v);
              setIsExist(false);
            }}
            onPhoneNumberChange={(v) => {
              setPhoneNumber(v);
              setIsExist(false);
            }}
          />
        ),
        label: t('Guardian Phone'),
      },
      [AccountTypeEnum.Google]: {
        element: renderSocialGuardianAccount(),
        label: t('Guardian Google'),
      },
      [AccountTypeEnum.Apple]: {
        element: renderSocialGuardianAccount(),
        label: t('Guardian Apple'),
      },
    }),
    [
      countryCode?.iso,
      emailValue,
      setEmailValue,
      phoneCountry?.countryList,
      phoneCountry?.iso,
      phoneNumber,
      renderSocialGuardianAccount,
      t,
    ],
  );
  const verifySuccess = useCallback((res: { verificationDoc: string; signature: string; verifierId: string }) => {
    const { guardianIdentifier } = handleVerificationDoc(res.verificationDoc);

    curGuardian.current = {
      ...(curGuardian?.current as UserGuardianStatus),
      status: VerifyStatus.Verified,
      verificationDoc: res.verificationDoc,
      signature: res.signature,
      identifierHash: guardianIdentifier,
    };
    setApprovalVisible(true);
  }, []);
  const sendCode = useCallback(async () => {
    try {
      setLoading(true);
      const _guardian = curGuardian?.current;
      const result = await verification.sendVerificationCode(
        {
          params: {
            type: _guardian?.guardianType || 'Email',
            guardianIdentifier: _guardian?.guardianIdentifier || '',
            verifierId: _guardian?.verifier?.id || '',
            chainId,
            operationType: OperationTypeEnum.editGuardian,
          },
        },
        reCaptchaHandler,
      );

      if (result.verifierSessionId) {
        curGuardian.current = {
          ...(curGuardian?.current as UserGuardianStatus),
          verifierInfo: {
            sessionId: result.verifierSessionId,
          },
          status: VerifyStatus.Verifying,
          isInitStatus: true,
        };
        setVerifierVisible(true);
      }
    } catch (error: any) {
      errorTip(
        {
          errorFields: 'Handle Guardian',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [chainId, reCaptchaHandler, isErrorTip, onError]);
  const reSendCode = useCallback(({ verifierSessionId }: TVerifyCodeInfo) => {
    curGuardian.current = {
      ...(curGuardian?.current as UserGuardianStatus),
      verifierInfo: {
        sessionId: verifierSessionId,
      },
    };
  }, []);
  const approvalSuccess = useCallback(
    async (approvalInfo: GuardiansApproved[]) => {
      try {
        setLoading(true);
        if (isRemove) {
          await handleRemoveGuardian?.(approvalInfo);
        } else {
          await handleEditGuardian?.(curGuardian.current!, approvalInfo);
        }
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
    [handleEditGuardian, handleRemoveGuardian, isErrorTip, isRemove, onError],
  );
  const onConfirm = useCallback(async () => {
    if (checkValid()) {
      if (
        [AccountTypeEnum.Apple, AccountTypeEnum.Google].includes(
          AccountTypeEnum[currentGuardian?.guardianType as AccountType],
        )
      ) {
        try {
          const { guardianIdentifier, verifierInfo } = await socialVerify?.(curGuardian.current!);
          curGuardian.current = {
            ...(curGuardian?.current as UserGuardianStatus),
            identifierHash: guardianIdentifier,
            verifierInfo,
          };
          setApprovalVisible(true);
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
      } else {
        CustomModal({
          type: 'confirm',
          okText: 'Confirm',
          content: (
            <p>
              {`${curGuardian?.current?.verifier?.name ?? ''} will send a verification code to `}
              <strong>{curGuardian?.current?.guardianIdentifier}</strong>
              {` to verify your ${
                curGuardian?.current?.guardianType === AccountTypeEnum[AccountTypeEnum.Phone]
                  ? 'phone number'
                  : 'email address'
              }.`}
            </p>
          ),
          onOk: sendCode,
        });
      }
    }
  }, [checkValid, currentGuardian?.guardianType, isErrorTip, onError, sendCode, socialVerify]);
  const onClickRemove = useCallback(() => {
    return CustomModal({
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
        setIsRemove(true);
        setApprovalVisible(true);
      },
    });
  }, []);
  useEffect(() => {
    const _key = `${currentGuardian?.guardianIdentifier}&${selectVerifierId}`;
    setCurrentKey(_key);
  }, [currentGuardian?.guardianIdentifier, selectVerifierId]);
  return (
    <div className="portkey-ui-guardian-edit portkey-ui-flex-column">
      {header}
      <div className="guardian-edit-body portkey-ui-flex-column portkey-ui-flex-1">
        <div className="input-item">
          <p className="guardian-edit-input-item-label">
            {guardianAccountInput[AccountTypeEnum[currentGuardian?.guardianType as AccountType]].label}
          </p>
          <div className="guardian-account guardian-edit-input-item-value portkey-ui-flex">
            <CustomSvg type={guardianIconMap[currentGuardian?.guardianType || AccountTypeEnum.Email] || 'Email'} />
            <AccountShow guardian={currentGuardian} />
          </div>
        </div>
        <div className="input-item">
          <p className="guardian-edit-input-item-label">{t('Verifier')}</p>
          <CommonSelect
            placeholder="Select Guardians Verifier"
            className="verifier-select"
            value={selectVerifierId}
            onChange={handleVerifierChange}
            items={verifierSelectItems}
          />
          {isExist && <div className="guardian-edit-error-tip">{t('This guardian already exists')}</div>}
        </div>
      </div>
      <div className="guardian-edit-footer">
        <div className="portkey-ui-flex-between guardian-add-btn-wrap">
          <Button className="guardian-btn guardian-btn-remove" onClick={onClickRemove}>
            {t('Remove')}
          </Button>
          <Button type="primary" className="guardian-btn " onClick={onConfirm} disabled={editBtnDisable}>
            {t('Send Request')}
          </Button>
        </div>
      </div>
      <CustomPromptModal open={verifierVisible} onClose={() => setVerifierVisible(false)}>
        <VerifierPage
          chainId={chainId}
          operationType={OperationTypeEnum.editGuardian}
          onBack={() => setVerifierVisible(false)}
          guardianIdentifier={curGuardian?.current?.guardianIdentifier || ''}
          verifierSessionId={curGuardian?.current?.verifierInfo?.sessionId || ''}
          isLoginGuardian={curGuardian?.current?.isLoginGuardian}
          isCountdownNow={curGuardian?.current?.isInitStatus}
          accountType={curGuardian?.current?.guardianType}
          isErrorTip={isErrorTip}
          verifier={(curGuardian?.current?.verifier as VerifierItem) || verifierList?.[0]}
          onSuccess={verifySuccess}
          onError={onError}
          onReSend={reSendCode}
        />
      </CustomPromptModal>
      <CustomPromptModal
        className="portkey-ui-modal-approval"
        open={approvalVisible}
        onClose={() => setApprovalVisible(false)}>
        <GuardianApproval
          header={
            <div className="portkey-ui-flex portkey-ui-modal-approval-back" onClick={() => setApprovalVisible(false)}>
              <CustomSvg style={{ width: 12, height: 12 }} type="LeftArrow" /> Back
            </div>
          }
          chainId={originChainId}
          guardianList={guardianList?.filter((item) => item.key !== preGuardian?.key)}
          onConfirm={approvalSuccess}
          onError={onError}
          operationType={isRemove ? OperationTypeEnum.deleteGuardian : OperationTypeEnum.editGuardian}
        />
      </CustomPromptModal>
    </div>
  );
}

export default memo(GuardianEdit);
