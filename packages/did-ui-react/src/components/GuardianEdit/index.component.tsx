import { Button, Input, message } from 'antd';
import { AccountType, AccountTypeEnum, GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { useState, useMemo, useCallback, useEffect, memo, ReactNode, useRef } from 'react';
import CommonSelect from '../CommonSelect';
import { VerifierItem } from '@portkey/did';
import { ChainId, ChainType } from '@portkey/types';
import {
  EmailError,
  EmailReg,
  errorTip,
  handleErrorMessage,
  handleVerificationDoc,
  setLoading,
  verification,
} from '../../utils';
import { ICountryItem, ISocialLogin, OnErrorFunc, UserGuardianStatus, VerifyStatus } from '../../types';
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
  isAdd?: boolean;
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
  setCurrentGuardian?: (item: UserGuardianStatus) => void;
  onError?: OnErrorFunc;
  socialAuth?: (v: ISocialLogin) => Promise<any>;
  socialVerify?: (item: UserGuardianStatus) => Promise<any>;
  handleAddGuardian?: (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => Promise<any>;
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
  isAdd = true,
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
  socialAuth,
  socialVerify,
  handleAddGuardian,
  handleEditGuardian,
  handleRemoveGuardian,
}: GuardianEditProps) {
  const { t } = useTranslation();
  const [selectGuardianType, setSelectGuardianType] = useState<AccountTypeEnum | undefined>();
  const [emailValue, setEmailValue] = useState<string>('');
  const [countryCode, setCountryCode] = useState<ICountryItem | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [socialValue, setSocialValue] = useState<ISocialInput | undefined>();
  const [currentKey, setCurrentKey] = useState<string>('');
  const [isExist, setIsExist] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>('');
  const reCaptchaHandler = useReCaptchaModal();
  const curGuardian = useRef<UserGuardianStatus | undefined>(currentGuardian);
  const [selectVerifierId, setSelectVerifierId] = useState<string | undefined>(currentGuardian?.verifier?.id);
  const [verifierVisible, setVerifierVisible] = useState<boolean>(true);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const [isRemove, setIsRemove] = useState<boolean>(false);
  const guardianAccount = useMemo(
    () => emailValue || socialValue?.id || (countryCode && phoneNumber),
    [countryCode, emailValue, phoneNumber, socialValue?.id],
  );
  const addBtnDisable = useMemo(
    () => isExist || error || !selectVerifierId || !guardianAccount,
    [error, guardianAccount, isExist, selectVerifierId],
  );
  const editBtnDisable = useMemo(
    () => isExist || selectVerifierId === preGuardian?.verifier?.id,
    [isExist, preGuardian?.verifier?.id, selectVerifierId],
  );
  const guardianTypeSelectItems = useMemo(
    () => [
      {
        value: AccountTypeEnum.Email,
        label: AccountTypeEnum[AccountTypeEnum.Email],
        icon: <CustomSvg type="Email" />,
        id: AccountTypeEnum.Email,
      },
      {
        value: AccountTypeEnum.Phone,
        label: AccountTypeEnum[AccountTypeEnum.Phone],
        icon: <CustomSvg type="GuardianPhone" />,
        id: AccountTypeEnum.Phone,
      },
      {
        value: AccountTypeEnum.Google,
        label: AccountTypeEnum[AccountTypeEnum.Google],
        icon: <CustomSvg type="GuardianGoogle" />,
        id: AccountTypeEnum.Google,
      },
      {
        value: AccountTypeEnum.Apple,
        label: AccountTypeEnum[AccountTypeEnum.Apple],
        icon: <CustomSvg type="GuardianApple" />,
        id: AccountTypeEnum.Apple,
      },
    ],
    [],
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
  const handleGuardianTypeChange = useCallback((value: AccountTypeEnum) => {
    setSelectGuardianType(value);
    setEmailValue('');
    setCountryCode(undefined);
    setPhoneNumber('');
    setSocialValue(undefined);
    setIsExist(false);
    setError('');
  }, []);
  const checkValid = useCallback(() => {
    if (selectGuardianType === AccountTypeEnum.Email) {
      if (!EmailReg.test(emailValue as string)) {
        setError(EmailError.invalidEmail);
        return false;
      }
    }
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
      isLoginGuardian: isAdd ? false : preGuardian?.isLoginGuardian,
      key: currentKey,
      verifier,
      guardianType: AccountTypeEnum[selectGuardianType!] as AccountType,
      guardianIdentifier: currentKey.split('&')?.[0],
      identifier: currentKey.split('&')?.[0],
      ...socialValue,
    };
    curGuardian.current = _guardian;
    return true;
  }, [
    currentKey,
    emailValue,
    guardianList,
    isAdd,
    preGuardian?.isLoginGuardian,
    selectGuardianType,
    selectVerifierId,
    socialValue,
    verifierMap,
  ]);
  const handleSocialAuth = useCallback(
    async (v: ISocialLogin) => {
      try {
        const info = await socialAuth?.(v);
        setSocialValue(info);
      } catch (error) {
        return errorTip(
          {
            errorFields: 'socialAuth',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      }
    },
    [isErrorTip, onError, socialAuth],
  );
  const renderSocialGuardianAccount = useCallback(
    (v: ISocialLogin) => (
      <div className="social input">
        {socialValue?.id ? (
          <div className="portkey-ui-flex-column social-input detail">
            <span className="social-name">{socialValue?.firstName}</span>
            <span className="social-email">{socialValue?.isPrivate ? '******' : socialValue?.thirdPartyEmail}</span>
          </div>
        ) : (
          <div className="portkey-ui-flex social-input click" onClick={() => handleSocialAuth(v)}>
            <span className="click-text">{`Click Add ${v} Account`}</span>
          </div>
        )}
      </div>
    ),
    [handleSocialAuth, socialValue?.firstName, socialValue?.id, socialValue?.isPrivate, socialValue?.thirdPartyEmail],
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
              setError(undefined);
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
              setError(undefined);
              setIsExist(false);
            }}
            onPhoneNumberChange={(v) => {
              setPhoneNumber(v);
              setError(undefined);
              setIsExist(false);
            }}
          />
        ),
        label: t('Guardian Phone'),
      },
      [AccountTypeEnum.Google]: {
        element: renderSocialGuardianAccount('Google'),
        label: t('Guardian Google'),
      },
      [AccountTypeEnum.Apple]: {
        element: renderSocialGuardianAccount('Apple'),
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
      const _guardian = curGuardian?.current;
      const result = await verification.sendVerificationCode(
        {
          params: {
            type: _guardian?.guardianType || 'Email',
            guardianIdentifier: _guardian?.guardianIdentifier || '',
            verifierId: _guardian?.verifier?.id || '',
            chainId,
            operationType: isAdd ? OperationTypeEnum.addGuardian : OperationTypeEnum.editGuardian,
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
    }
  }, [chainId, isAdd, reCaptchaHandler, isErrorTip, onError]);
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
        if (isRemove) {
          await handleRemoveGuardian?.(approvalInfo);
        } else if (isAdd) {
          await handleAddGuardian?.(curGuardian.current!, approvalInfo);
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
      }
    },
    [handleAddGuardian, handleEditGuardian, handleRemoveGuardian, isAdd, isErrorTip, isRemove, onError],
  );
  const onConfirm = useCallback(async () => {
    if (checkValid()) {
      if (socialValue) {
        const { guardianIdentifier, verifierInfo } = await socialVerify?.(curGuardian.current!);
        curGuardian.current = {
          ...(curGuardian?.current as UserGuardianStatus),
          identifierHash: guardianIdentifier,
          verifierInfo,
        };
        setApprovalVisible(true);
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
  }, [checkValid, sendCode, socialValue, socialVerify]);
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
  const approvalGuardianList = useMemo(() => {
    if (isRemove) {
      return guardianList?.filter((item) => item.guardianIdentifier !== currentGuardian?.guardianIdentifier);
    } else if (isAdd) {
      return guardianList;
    } else {
      return guardianList?.filter((item) => item.guardianIdentifier !== preGuardian?.guardianIdentifier);
    }
  }, [currentGuardian?.guardianIdentifier, guardianList, isAdd, isRemove, preGuardian?.guardianIdentifier]);
  useEffect(() => {
    let _key = '';
    switch (selectGuardianType) {
      case AccountTypeEnum.Email: {
        _key = `${emailValue}&${selectVerifierId}`;
        break;
      }
      case AccountTypeEnum.Phone: {
        _key = `+${phoneCountry}${phoneNumber}&${selectVerifierId}`;
        break;
      }
      case AccountTypeEnum.Apple:
      case AccountTypeEnum.Google: {
        _key = `${socialValue?.id}&${selectVerifierId}`;
        break;
      }
    }
    setCurrentKey(_key);
  }, [
    currentKey,
    emailValue,
    isAdd,
    phoneCountry,
    phoneNumber,
    preGuardian?.key,
    selectGuardianType,
    selectVerifierId,
    socialValue,
  ]);
  return (
    <div className="portkey-ui-guardian-edit portkey-ui-flex-column">
      {header}
      <div className="guardian-edit-body portkey-ui-flex-column portkey-ui-flex-1">
        {isAdd ? (
          <>
            <div className="input-item">
              <p className="input-item-label">{t('Guardian Type')}</p>
              <CommonSelect
                placeholder="Select Guardians Type"
                className="guardian-select"
                value={selectGuardianType}
                onChange={handleGuardianTypeChange}
                items={guardianTypeSelectItems as any}
              />
            </div>
            {selectGuardianType !== undefined && (
              <div className="input-item">
                <p className="input-item-label">{guardianAccountInput[selectGuardianType].label}</p>
                {guardianAccountInput[selectGuardianType].element}
                {error && <div className="error-tip">{error}</div>}
              </div>
            )}
          </>
        ) : (
          <div className="input-item">
            <p className="input-item-label">
              {guardianAccountInput[AccountTypeEnum[currentGuardian?.guardianType as AccountType]].label}
            </p>
            <div className="guardian-account input-item-value portkey-ui-flex">
              <CustomSvg type={guardianIconMap[currentGuardian?.guardianType || AccountTypeEnum.Email] || 'Email'} />
              <AccountShow guardian={currentGuardian} />
            </div>
          </div>
        )}
        <div className="input-item">
          <p className="input-item-label">{t('Verifier')}</p>
          <CommonSelect
            placeholder="Select Guardians Verifier"
            className="verifier-select"
            value={selectVerifierId}
            onChange={setSelectVerifierId}
            items={verifierSelectItems}
          />
          {isExist && <div className="error-tip">{t('This guardian already exists')}</div>}
        </div>
      </div>
      <div className="guardian-edit-footer">
        {isAdd ? (
          <Button type="primary" className="guardian-btn" onClick={onConfirm} disabled={!!addBtnDisable}>
            {t('Confirm')}
          </Button>
        ) : (
          <div className="portkey-ui-flex-between guardian-add-btn-wrap">
            <Button className="guardian-btn guardian-btn-remove" onClick={onClickRemove}>
              {t('Remove')}
            </Button>
            <Button type="primary" className="guardian-btn " onClick={onConfirm} disabled={editBtnDisable}>
              {t('Send Request')}
            </Button>
          </div>
        )}
      </div>
      <CustomPromptModal open={verifierVisible} onClose={() => setVerifierVisible(false)}>
        <VerifierPage
          chainId={chainId}
          operationType={isAdd ? OperationTypeEnum.addGuardian : OperationTypeEnum.editGuardian}
          onBack={() => setVerifierVisible(false)}
          guardianIdentifier={curGuardian?.current?.guardianIdentifier || ''}
          verifierSessionId={curGuardian?.current?.verifierInfo?.sessionId || ''}
          isLoginGuardian={curGuardian?.current?.isLoginGuardian}
          isCountdownNow={curGuardian?.current?.isInitStatus}
          accountType={curGuardian?.current?.guardianType}
          isErrorTip={isErrorTip}
          verifier={curGuardian?.current?.verifier as VerifierItem}
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
          guardianList={approvalGuardianList}
          onConfirm={approvalSuccess}
          onError={onError}
          operationType={
            isRemove
              ? OperationTypeEnum.deleteGuardian
              : isAdd
              ? OperationTypeEnum.addGuardian
              : OperationTypeEnum.editGuardian
          }
        />
      </CustomPromptModal>
    </div>
  );
}

export default memo(GuardianEdit);
