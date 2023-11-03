import { Button, Input, message } from 'antd';
import { AccountType, AccountTypeEnum, GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { useState, useMemo, useCallback, useEffect, memo, ReactNode, useRef } from 'react';
import CommonSelect from '../CommonSelect';
import { VerifierItem } from '@portkey/did';
import { ChainId } from '@portkey/types';
import {
  EmailError,
  EmailReg,
  did,
  errorTip,
  getGoogleUserInfo,
  handleErrorMessage,
  handleVerificationDoc,
  parseAppleIdentityToken,
  setLoading,
  socialLoginAuth,
  verification,
} from '../../utils';
import {
  ICountryItem,
  ISocialLogin,
  IVerificationInfo,
  OnErrorFunc,
  UserGuardianStatus,
  VerifyStatus,
} from '../../types';
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
import ConfigProvider from '../config-provider';
import { useVerifyToken } from '../../hooks';
import { useEffectOnce } from 'react-use';
import clsx from 'clsx';
import BackHeader from '../BackHeader';
import './index.less';

export interface GuardianAddProps {
  header?: ReactNode;
  className?: string;
  originChainId: ChainId;
  phoneCountry?: IPhoneCountry;
  guardianList?: UserGuardianStatus[];
  verifierList?: VerifierItem[];
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
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
  className,
  originChainId,
  isErrorTip = true,
  phoneCountry: customPhoneCountry,
  verifierList,
  guardianList,
  onError,
  handleAddGuardian,
}: GuardianAddProps) {
  const { t } = useTranslation();
  const [selectGuardianType, setSelectGuardianType] = useState<AccountType | undefined>();
  const [selectVerifierId, setSelectVerifierId] = useState<string | undefined>();
  const [emailValue, setEmailValue] = useState<string>('');
  const [countryCode, setCountryCode] = useState<ICountryItem | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [socialValue, setSocialValue] = useState<ISocialInput | undefined>();
  const verifierMap = useRef<{ [x: string]: VerifierItem }>();
  const [isExist, setIsExist] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>('');
  const reCaptchaHandler = useReCaptchaModal();
  const curGuardian = useRef<UserGuardianStatus | undefined>();
  const [verifierVisible, setVerifierVisible] = useState<boolean>(false);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const [phoneCountry, setPhoneCountry] = useState<IPhoneCountry | undefined>(customPhoneCountry);
  const verifyToken = useVerifyToken();
  const guardianAccount = useMemo(
    () => emailValue || socialValue?.id || (countryCode && phoneNumber ? `+${countryCode.code}${phoneNumber}` : ''),
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
  useEffect(() => {
    const _verifierMap: { [x: string]: VerifierItem } = {};
    verifierList?.forEach((item: VerifierItem) => {
      _verifierMap[item.id] = item;
    }, []);
    verifierMap.current = _verifierMap;
  }, [verifierList]);
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
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const socialUserInfo = useCallback(async (v: ISocialLogin, accessToken: string) => {
    let info = {};
    if (v === 'Google') {
      const userInfo = await getGoogleUserInfo(accessToken);
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
      const appleUserExtraInfo = await did.services.getAppleUserExtraInfo({
        userId: userInfo?.userId,
      });
      const { firstName, isPrivate } = appleUserExtraInfo;
      if (userInfo) {
        info = {
          id: userInfo.userId,
          firstName,
          thirdPartyEmail: userInfo.email,
          accessToken,
          isPrivate,
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
            errorFields: 'Social Auth',
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
          chainId: originChainId,
          clientId,
          redirectURI,
          operationType: OperationTypeEnum.addGuardian,
          customLoginHandler,
        });
        if (!rst) return;
        const verifierInfo: IVerificationInfo = { ...rst, verifierId: _guardian?.verifierId };
        const { guardianIdentifier } = handleVerificationDoc(verifierInfo.verificationDoc as string);
        return { verifierInfo, guardianIdentifier };
      } catch (error) {
        errorTip(
          {
            errorFields: 'Guardian Social Verify',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [socialBasic, socialUserInfo, verifyToken, originChainId, isErrorTip, onError],
  );
  const checkValid = useCallback(() => {
    if (selectGuardianType === AccountTypeEnum[AccountTypeEnum.Email]) {
      if (!EmailReg.test(emailValue as string)) {
        setError(EmailError.invalidEmail);
        return false;
      }
    }
    const verifier = verifierMap.current?.[selectVerifierId!];
    if (!verifier) {
      message.error('Can not get the current verifier message');
      return false;
    }
    const _key = `${guardianAccount}&${verifier.id}`;
    const _isExist = guardianList?.some((item) => item.key === _key);
    if (_isExist) {
      setIsExist(true);
      return false;
    }
    const _guardian: UserGuardianStatus = {
      isLoginGuardian: false,
      key: _key,
      verifier,
      guardianType: selectGuardianType as AccountType,
      guardianIdentifier: guardianAccount,
      identifier: guardianAccount,
      verifierId: selectVerifierId,
      ...socialValue,
    };
    curGuardian.current = _guardian;
    return true;
  }, [emailValue, guardianAccount, guardianList, selectGuardianType, selectVerifierId, socialValue]);
  const handleSocialAuth = useCallback(
    async (v: ISocialLogin) => {
      try {
        setLoading(true);
        const info = await socialAuth(v);
        setSocialValue(info as ISocialInput);
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
            chainId: originChainId,
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
  }, [originChainId, reCaptchaHandler, isErrorTip, onError]);
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
        await handleAddGuardian?.(curGuardian.current!, approvalInfo);
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
          setLoading(true);
          const res = await socialVerify(curGuardian.current!);
          const { guardianIdentifier, verifierInfo } = res || {};
          if (guardianIdentifier && verifierInfo) {
            curGuardian.current = {
              ...(curGuardian?.current as UserGuardianStatus),
              identifierHash: guardianIdentifier,
              ...verifierInfo,
            };
            setApprovalVisible(true);
          }
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
  const onCloseApproval = useCallback(() => {
    setVerifierVisible(false);
    setApprovalVisible(false);
  }, []);
  useEffectOnce(() => {
    !customPhoneCountry && getPhoneCountry();
  });
  return (
    <div className={clsx('portkey-ui-guardian-edit', 'portkey-ui-flex-column', className)}>
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
          originChainId={originChainId}
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
      <CommonBaseModal className="portkey-ui-modal-approval" open={approvalVisible} onClose={onCloseApproval}>
        <GuardianApproval
          header={<BackHeader onBack={onCloseApproval} />}
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
