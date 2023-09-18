import { Button, Input, message } from 'antd';
import { AccountType, AccountTypeEnum, GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { useState, useMemo, useCallback, useEffect, memo, ReactNode, useRef } from 'react';
import CommonSelect from '../CommonSelect';
import { VerifierItem } from '@portkey/did';
import { ChainId, ChainType } from '@portkey/types';
import {
  EmailError,
  EmailReg,
  did,
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
import VerifierPage from '../GuardianApproval/components/VerifierPage';
import { TVerifyCodeInfo } from '../SignStep/types';
import GuardianApproval from '../GuardianApproval';
import useReCaptchaModal from '../../hooks/useReCaptchaModal';
import CustomModal from '../CustomModal';
import CommonBaseModal from '../CommonBaseModal';
import './index.less';

export interface GuardianAddProps {
  header?: ReactNode;
  chainId?: ChainId;
  originChainId?: ChainId;
  chainType?: ChainType;
  phoneCountry?: IPhoneCountry;
  guardianList?: UserGuardianStatus[];
  verifierList?: VerifierItem[];
  verifierMap?: { [x: string]: VerifierItem };
  isErrorTip?: boolean;
  setCurrentGuardian?: (item: UserGuardianStatus) => void;
  onError?: OnErrorFunc;
  socialAuth?: (v: ISocialLogin) => Promise<any>;
  socialVerify?: (item: UserGuardianStatus) => Promise<any>;
  handleAddGuardian?: (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => Promise<any>;
}

export interface ISocialInput {
  id: string;
  firstName: string;
  thirdPartyEmail: string;
  accessToken: string;
  isPrivate?: boolean;
}

function GuardianAdd({
  header,
  chainId = 'AELF',
  originChainId = 'AELF',
  isErrorTip = true,
  phoneCountry: defaultPhoneCountry,
  verifierList,
  guardianList,
  verifierMap = {},
  onError,
  socialAuth,
  socialVerify,
  handleAddGuardian,
}: GuardianAddProps) {
  const { t } = useTranslation();
  const [selectGuardianType, setSelectGuardianType] = useState<AccountType | undefined>();
  const [selectVerifierId, setSelectVerifierId] = useState<string | undefined>();
  const [emailValue, setEmailValue] = useState<string>('');
  const [countryCode, setCountryCode] = useState<ICountryItem | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [socialValue, setSocialValue] = useState<ISocialInput | undefined>();
  const [currentKey, setCurrentKey] = useState<string>('');
  const [isExist, setIsExist] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>('');
  const reCaptchaHandler = useReCaptchaModal();
  const curGuardian = useRef<UserGuardianStatus | undefined>();
  const [verifierVisible, setVerifierVisible] = useState<boolean>(false);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const [phoneCountry, setPhoneCountry] = useState<IPhoneCountry | undefined>(defaultPhoneCountry);
  const guardianAccount = useMemo(
    () => emailValue || socialValue?.id || (countryCode && phoneNumber),
    [countryCode, emailValue, phoneNumber, socialValue?.id],
  );
  const addBtnDisable = useMemo(
    () => isExist || error || !selectVerifierId || !guardianAccount,
    [error, guardianAccount, isExist, selectVerifierId],
  );
  const guardianTypeSelectItems = useMemo(
    () => [
      {
        value: AccountTypeEnum[AccountTypeEnum.Email],
        label: AccountTypeEnum[AccountTypeEnum.Email],
        icon: <CustomSvg type="Email" />,
        id: AccountTypeEnum.Email,
      },
      {
        value: AccountTypeEnum[AccountTypeEnum.Phone],
        label: AccountTypeEnum[AccountTypeEnum.Phone],
        icon: <CustomSvg type="GuardianPhone" />,
        id: AccountTypeEnum.Phone,
      },
      {
        value: AccountTypeEnum[AccountTypeEnum.Google],
        label: AccountTypeEnum[AccountTypeEnum.Google],
        icon: <CustomSvg type="GuardianGoogle" />,
        id: AccountTypeEnum.Google,
      },
      {
        value: AccountTypeEnum[AccountTypeEnum.Apple],
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
  const handleGuardianTypeChange = useCallback((value: AccountType) => {
    setSelectGuardianType(value);
    setEmailValue('');
    setCountryCode(undefined);
    setPhoneNumber('');
    setSocialValue(undefined);
    setIsExist(false);
    setError('');
  }, []);
  const handleVerifierChange = useCallback((id: string) => {
    setSelectVerifierId(id);
    setIsExist(false);
  }, []);

  const getPhoneCountry = useCallback(async () => {
    try {
      const countryData = await did.services.getPhoneCountryCodeWithLocal();
      setPhoneCountry({ iso: countryData.locateData?.iso || '', countryList: countryData.data || [] });
    } catch (error) {
      errorTip(
        {
          errorFields: 'getPhoneCountry',
          error,
        },
        isErrorTip,
        onError,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkValid = useCallback(() => {
    if (selectGuardianType === AccountTypeEnum[AccountTypeEnum.Email]) {
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
      isLoginGuardian: false,
      key: currentKey,
      verifier,
      guardianType: selectGuardianType as AccountType,
      guardianIdentifier: currentKey.split('&')?.[0],
      identifier: currentKey.split('&')?.[0],
      verifierId: selectVerifierId,
      ...socialValue,
    };
    curGuardian.current = _guardian;
    return true;
  }, [currentKey, emailValue, guardianList, selectGuardianType, selectVerifierId, socialValue, verifierMap]);
  const handleSocialAuth = useCallback(
    async (v: ISocialLogin) => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
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
            <span className="social-click-text">{`Click Add ${v} Account`}</span>
          </div>
        )}
      </div>
    ),
    [handleSocialAuth, socialValue?.firstName, socialValue?.id, socialValue?.isPrivate, socialValue?.thirdPartyEmail],
  );
  const guardianAccountInput = useMemo(
    () => ({
      [AccountTypeEnum[AccountTypeEnum.Email]]: {
        element: (
          <Input
            className="login-input"
            value={emailValue}
            placeholder={t('Enter email')}
            onChange={(e) => {
              setEmailValue(e.target.value);
              setError('');
              setIsExist(false);
            }}
          />
        ),
        label: t('Guardian Email'),
      },
      [AccountTypeEnum[AccountTypeEnum.Phone]]: {
        element: (
          <PhoneNumberInput
            iso={countryCode?.iso ?? phoneCountry?.iso}
            countryList={phoneCountry?.countryList}
            phoneNumber={phoneNumber}
            onAreaChange={(v) => {
              setCountryCode(v);
              setError('');
              setIsExist(false);
            }}
            onPhoneNumberChange={(v) => {
              setPhoneNumber(v);
              setError('');
              setIsExist(false);
            }}
          />
        ),
        label: t('Guardian Phone'),
      },
      [AccountTypeEnum[AccountTypeEnum.Google]]: {
        element: renderSocialGuardianAccount('Google'),
        label: t('Guardian Google'),
      },
      [AccountTypeEnum[AccountTypeEnum.Apple]]: {
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
      setLoading(true);
      const _guardian = curGuardian?.current;
      const result = await verification.sendVerificationCode(
        {
          params: {
            type: _guardian?.guardianType || 'Email',
            guardianIdentifier: _guardian?.guardianIdentifier || '',
            verifierId: _guardian?.verifier?.id || '',
            chainId,
            operationType: OperationTypeEnum.addGuardian,
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
        handleAddGuardian?.(curGuardian.current!, approvalInfo);
      } catch (e) {
        errorTip(
          {
            errorFields: 'Handle Add Guardian',
            error: handleErrorMessage(e),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [handleAddGuardian, isErrorTip, onError],
  );
  const onConfirm = useCallback(async () => {
    if (checkValid()) {
      if (socialValue?.id) {
        try {
          console.log('===curGuardian.current,', curGuardian.current);
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
              errorFields: 'Social Verify',
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
  }, [checkValid, isErrorTip, onError, sendCode, socialValue, socialVerify]);
  useEffect(() => {
    let _key = '';
    switch (selectGuardianType) {
      case AccountTypeEnum[AccountTypeEnum.Email]: {
        _key = `${emailValue}&${selectVerifierId}`;
        break;
      }
      case AccountTypeEnum[AccountTypeEnum.Phone]: {
        _key = `+${countryCode?.code}${phoneNumber}&${selectVerifierId}`;
        break;
      }
      case AccountTypeEnum[AccountTypeEnum.Apple]:
      case AccountTypeEnum[AccountTypeEnum.Google]: {
        _key = `${socialValue?.id}&${selectVerifierId}`;
        break;
      }
    }
    setCurrentKey(_key);
  }, [currentKey, emailValue, countryCode?.code, phoneNumber, selectGuardianType, selectVerifierId, socialValue]);
  useEffect(() => {
    // Get phoneCountry by service, update phoneCountry
    getPhoneCountry();
  }, [getPhoneCountry]);
  return (
    <div className="portkey-ui-guardian-edit portkey-ui-flex-column">
      {header}
      <div className="guardian-add-body portkey-ui-flex-column portkey-ui-flex-1">
        <div className="input-item">
          <p className="guardian-add-input-item-label">{t('Guardian Type')}</p>
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
            <p className="guardian-add-input-item-label">{guardianAccountInput[selectGuardianType].label}</p>
            {guardianAccountInput[selectGuardianType].element}
            {error && <div className="guardian-error-tip">{error}</div>}
          </div>
        )}
        <div className="input-item">
          <p className="guardian-add-input-item-label">{t('Verifier')}</p>
          <CommonSelect
            placeholder="Select Guardians Verifier"
            className="verifier-select"
            value={selectVerifierId}
            onChange={handleVerifierChange}
            items={verifierSelectItems}
          />
          {isExist && <div className="guardian-error-tip">{t('This guardian already exists')}</div>}
        </div>
      </div>
      <div className="guardian-edit-footer">
        <Button type="primary" className="guardian-btn" onClick={onConfirm} disabled={!!addBtnDisable}>
          {t('Confirm')}
        </Button>
      </div>
      <CommonBaseModal open={verifierVisible} onClose={() => setVerifierVisible(false)}>
        <VerifierPage
          originChainId={chainId}
          operationType={OperationTypeEnum.addGuardian}
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
      </CommonBaseModal>
      <CommonBaseModal
        className="portkey-ui-modal-approval"
        open={approvalVisible}
        onClose={() => setApprovalVisible(false)}>
        <GuardianApproval
          header={
            <div className="portkey-ui-flex portkey-ui-modal-approval-back" onClick={() => setApprovalVisible(false)}>
              <CustomSvg style={{ width: 12, height: 12 }} type="LeftArrow" /> Back
            </div>
          }
          originChainId={originChainId}
          guardianList={guardianList}
          onConfirm={approvalSuccess}
          onError={onError}
          operationType={OperationTypeEnum.addGuardian}
        />
      </CommonBaseModal>
    </div>
  );
}

export default memo(GuardianAdd);
