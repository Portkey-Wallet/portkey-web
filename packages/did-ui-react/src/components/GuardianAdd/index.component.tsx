import { Input, message } from 'antd';
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
  getGoogleUserInfo,
  handleErrorMessage,
  handleVerificationDoc,
  hasCurrentTelegramGuardian,
  parseAppleIdentityToken,
  parseFacebookToken,
  parseTelegramToken,
  parseTwitterToken,
  setLoading,
  socialLoginAuth,
  verification,
} from '../../utils';
import {
  ICountryItem,
  ISocialLogin,
  IVerificationInfo,
  NetworkType,
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
import {
  AccountGuardianList,
  AddGuardiansType,
  guardianAccountExistTip,
  verifierExistTip,
  verifierUsedTip,
} from '../../constants/guardian';
import { getGuardianList } from '../SignStep/utils/getGuardians';
import './index.less';
import { ILoginConfig } from '../config-provider/types';
import ThrottleButton from '../ThrottleButton';
import { getOperationDetails } from '../utils/operation.util';
import { getSocialConfig } from '../utils/social.utils';
import GuardianTypeIcon from '../GuardianTypeIcon';

export interface GuardianAddProps {
  header?: ReactNode;
  className?: string;
  caHash: string;
  originChainId: ChainId;
  chainType?: ChainType;
  phoneCountry?: IPhoneCountry;
  guardianList?: UserGuardianStatus[];
  verifierList?: VerifierItem[];
  networkType: NetworkType;
  sandboxId?: string;
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
  caHash,
  chainType = 'aelf',
  isErrorTip = true,
  phoneCountry: customPhoneCountry,
  verifierList,
  guardianList,
  networkType,
  sandboxId,
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
  const [accountErr, setAccountErr] = useState<string>();
  const [verifierExist, setVerifierExist] = useState<boolean>(false);
  const reCaptchaHandler = useReCaptchaModal();
  const curGuardian = useRef<UserGuardianStatus | undefined>();
  const [verifierVisible, setVerifierVisible] = useState<boolean>(false);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const [phoneCountry, setPhoneCountry] = useState<IPhoneCountry | undefined>(customPhoneCountry);
  const verifyToken = useVerifyToken();
  const [addBtnLoading, setAddBtnLoading] = useState<boolean>(false);
  const guardianAccount = useMemo(
    () => emailValue || socialValue?.id || (countryCode && phoneNumber ? `+${countryCode.code}${phoneNumber}` : ''),
    [countryCode, emailValue, phoneNumber, socialValue?.id],
  );
  const addBtnDisable = useMemo(
    () => verifierExist || accountErr || !selectVerifierId || !guardianAccount,
    [accountErr, guardianAccount, selectVerifierId, verifierExist],
  );

  const loginConfig = ConfigProvider.getConfig('loginConfig') as ILoginConfig;
  const loginMethodsOrder = useMemo(
    () => (loginConfig?.loginMethodsOrder as AccountType[]) || AccountGuardianList,
    [loginConfig?.loginMethodsOrder],
  );

  const operationDetails = useMemo(() => getOperationDetails(OperationTypeEnum.addGuardian), []);

  const guardianTypeSelectItems = useMemo(() => {
    if (Array.isArray(loginMethodsOrder)) {
      const filterLoginMethodsOrder = loginMethodsOrder?.filter((item: AccountType) =>
        AccountGuardianList.includes(item),
      );
      return filterLoginMethodsOrder?.map((item: AccountType) => {
        return {
          value: AddGuardiansType[item]?.value,
          label: AddGuardiansType[item]?.label,
          icon: <GuardianTypeIcon type={AddGuardiansType[item]?.icon} />,
          id: AddGuardiansType[item]?.id,
        };
      });
    }
    return [];
  }, [loginMethodsOrder]);

  const customSelectOption = useMemo(
    () => [
      {
        value: 'tip',
        disabled: true,
        className: 'portkey-option-tip',
        label: (
          <div className="portkey-ui-flex label-item">
            <CustomSvg type="Warning" />
            <div className="tip">{verifierUsedTip}</div>
          </div>
        ),
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
        disabled: !!guardianList?.find((_guardian) => _guardian.verifierId === item.id),
      })),
    [guardianList, verifierList],
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
    setVerifierExist(false);
    setAccountErr('');
  }, []);
  const handleVerifierChange = useCallback((id: string) => {
    setSelectVerifierId(id);
    setVerifierExist(false);
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
        userId: userInfo?.userId || '',
      });
      if (!appleUserExtraInfo) return;

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
    } else if (v === 'Telegram') {
      const userInfo = parseTelegramToken(accessToken);
      if (!userInfo) return;
      const { firstName, isPrivate, userId } = userInfo;
      if (userInfo) {
        info = {
          id: userId,
          firstName,
          thirdPartyEmail: undefined,
          accessToken,
          isPrivate,
        };
      }
    } else if (v === 'Facebook') {
      const userInfo = await parseFacebookToken(accessToken);
      if (!userInfo) return;
      const { firstName, isPrivate, userId } = userInfo;
      if (userInfo) {
        info = {
          id: userId,
          firstName,
          thirdPartyEmail: undefined,
          accessToken,
          isPrivate,
        };
      }
    } else if (v === 'Twitter') {
      const userInfo = parseTwitterToken(accessToken);
      if (!userInfo) return;
      const { firstName, isPrivate, userId } = userInfo;
      if (userInfo) {
        info = {
          id: userId,
          firstName,
          thirdPartyEmail: undefined,
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
          network: networkType,
          useCurrentTelegramAuth: !hasCurrentTelegramGuardian(guardianList),
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
    [guardianList, isErrorTip, networkType, onError, socialBasic, socialUserInfo],
  );

  const socialVerify = useCallback(
    async (_guardian: UserGuardianStatus) => {
      try {
        const { clientId, redirectURI, customLoginHandler } =
          socialBasic(_guardian?.guardianType as ISocialLogin) || {};
        const info: any = await socialUserInfo(_guardian?.guardianType as ISocialLogin, _guardian?.accessToken || '');
        const operationType = OperationTypeEnum.addGuardian;

        const rst = await verifyToken(_guardian?.guardianType as ISocialLogin, {
          accessToken: _guardian?.accessToken,
          id: info?.id,
          verifierId: _guardian?.verifierId || '',
          chainId: originChainId,
          clientId,
          redirectURI,
          networkType,
          operationDetails,
          operationType,
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
    [socialBasic, socialUserInfo, verifyToken, originChainId, networkType, operationDetails, isErrorTip, onError],
  );

  const checkValid = useCallback(async () => {
    // 1. check email valid
    if (selectGuardianType === AccountTypeEnum[AccountTypeEnum.Email]) {
      if (!EmailReg.test(emailValue as string)) {
        setAccountErr(EmailError.invalidEmail);
        return false;
      }
    }
    // fetch latest guardianList
    const _guardianList = await getGuardianList({
      caHash,
      originChainId,
      chainType,
      sandboxId,
    });

    // 2. check guardian account exist
    const _guardianExist = _guardianList?.some((temp) => temp.guardianIdentifier === guardianAccount);
    if (_guardianExist) {
      setAccountErr(guardianAccountExistTip);
      return false;
    }
    // 3. check verifier valid
    const verifier = verifierMap.current?.[selectVerifierId!];
    if (!verifier) {
      message.error('Can not get the current verifier message');
      return false;
    }
    // 4. check verifier exist
    const _verifierExist = _guardianList?.some((temp) => temp.verifierId === verifier.id);
    if (_verifierExist) {
      setVerifierExist(true);
      return false;
    }

    const _key = `${guardianAccount}&${verifier.id}`;
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
  }, [
    caHash,
    chainType,
    emailValue,
    guardianAccount,
    originChainId,
    sandboxId,
    selectGuardianType,
    selectVerifierId,
    socialValue,
  ]);
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

  const handleClearSocialAccount = useCallback(() => {
    setSocialValue(undefined);
    setAccountErr('');
  }, []);

  const renderSocialGuardianAccount = useCallback(
    (v: ISocialLogin) => (
      <div className="social input">
        {socialValue?.id ? (
          <div className="portkey-ui-flex-column social-input detail">
            <span className="social-name">{socialValue?.firstName}</span>
            <span className="social-email">{socialValue?.isPrivate ? '******' : socialValue?.thirdPartyEmail}</span>
            <CustomSvg type="Close2" onClick={handleClearSocialAccount} />
          </div>
        ) : (
          <div className="portkey-ui-flex social-input click" onClick={() => handleSocialAuth(v)}>
            <span className="social-click-text">{`Click Add ${v} Account`}</span>
          </div>
        )}
      </div>
    ),
    [handleClearSocialAccount, handleSocialAuth, socialValue],
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
              setAccountErr('');
              setVerifierExist(false);
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
              setAccountErr('');
              setVerifierExist(false);
            }}
            onPhoneNumberChange={(v) => {
              setPhoneNumber(v);
              setAccountErr('');
              setVerifierExist(false);
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
      [AccountTypeEnum[AccountTypeEnum.Telegram]]: {
        element: renderSocialGuardianAccount('Telegram'),
        label: t('Guardian Telegram'),
      },
      [AccountTypeEnum[AccountTypeEnum.Facebook]]: {
        element: renderSocialGuardianAccount('Facebook'),
        label: t('Guardian Facebook'),
      },
      [AccountTypeEnum[AccountTypeEnum.Twitter]]: {
        element: renderSocialGuardianAccount('Twitter'),
        label: t('Guardian Twitter'),
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
    let _valid = true;
    try {
      setAddBtnLoading(true);
      _valid = await checkValid();
      setAddBtnLoading(false);
    } catch (error) {
      _valid = false;
      setAddBtnLoading(false);
    }
    if (_valid) {
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
    <div className={clsx('portkey-ui-guardian-add', 'portkey-ui-flex-column', className)}>
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
            {accountErr && <span className="guardian-error-tip">{accountErr}</span>}
          </div>
        )}
        <div className="input-item">
          <p className="guardian-add-input-item-label">{t('Verifier')}</p>
          <CommonSelect
            placeholder="Select Guardians Verifier"
            className="verifier-select, portkey-select-verifier-option-tip"
            value={selectVerifierId}
            onChange={handleVerifierChange}
            items={verifierSelectItems}
            customOptions={customSelectOption}
          />
          {verifierExist && <div className="guardian-error-tip">{verifierExistTip}</div>}
        </div>
      </div>
      <div className="guardian-add-footer">
        <ThrottleButton
          type="primary"
          className="guardian-btn"
          onClick={onConfirm}
          disabled={!!addBtnDisable}
          loading={addBtnLoading}>
          {t('Confirm')}
        </ThrottleButton>
      </div>
      <CommonBaseModal destroyOnClose open={verifierVisible} onClose={() => setVerifierVisible(false)}>
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
      <CommonBaseModal
        className="portkey-ui-modal-approval"
        open={approvalVisible}
        destroyOnClose
        onClose={onCloseApproval}>
        <GuardianApproval
          header={<BackHeader onBack={onCloseApproval} />}
          originChainId={originChainId}
          guardianList={guardianList}
          networkType={networkType}
          onConfirm={approvalSuccess}
          onError={onError}
          operationType={OperationTypeEnum.addGuardian}
          operationDetails={operationDetails}
        />
      </CommonBaseModal>
    </div>
  );
}

export default memo(GuardianAdd);
