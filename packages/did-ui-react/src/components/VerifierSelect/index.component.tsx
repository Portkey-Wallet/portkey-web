import { Button } from 'antd';
import CommonModal from '../CommonModal';
import { useCallback, useMemo, useState, useEffect, MouseEventHandler, useRef } from 'react';
import BaseVerifierIcon from '../BaseVerifierIcon';
import CommonSelect from '../CommonSelect';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { ISocialLoginConfig, OnErrorFunc } from '../../types';
import { ChainId, ChainType } from '@portkey/types';
import { AccountType, RecaptchaType } from '@portkey/services';
import { VerifierItem } from '@portkey/did';
import { verification, setLoading, errorTip, verifyErrorHandler, handleErrorMessage } from '../../utils';
import './index.less';
import { useVerifyToken } from '../../hooks/authentication';
import ConfigProvider from '../config-provider';
import { portkeyDidUIPrefix } from '../../constants';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { getChainInfo } from '../../hooks/useChainInfo';
import useReCaptchaModal from '../../hooks/useReCaptchaModal';

type SelectVerifierStorageInfo = {
  verifier: VerifierItem;
};
const SelectVerifierInfoStr = `${portkeyDidUIPrefix}SelectVerifierInfo`;
export interface VerifierSelectConfirmResult {
  verifier: VerifierItem;
  // accountType === 'Email' || accountType === 'Phone' is required;
  verifierSessionId?: string;
  // accountType === 'Google' || accountType === 'Apple' is required;
  verificationDoc?: string;
  signature?: string;
  //
}

export interface VerifierSelectProps {
  chainId?: ChainId;
  sandboxId?: string;
  verifierList?: VerifierItem[];
  defaultVerifier?: string;
  guardianIdentifier: string;
  className?: string;
  accountType?: AccountType;
  isErrorTip?: boolean;
  operationType?: RecaptchaType;
  chainType?: ChainType;
  // socialLogin porps
  appleIdToken?: string; // apple authorized
  googleAccessToken?: string; // google authorized
  //
  onError?: OnErrorFunc;
  onConfirm?: (result: VerifierSelectConfirmResult) => void;
}

export default function VerifierSelect({
  chainId = 'AELF',
  className,
  sandboxId,
  isErrorTip = true,
  verifierList: defaultVerifierList,
  guardianIdentifier,
  chainType = 'aelf',
  accountType = 'Email',
  defaultVerifier,
  appleIdToken,
  googleAccessToken,
  operationType = RecaptchaType.register,
  onError,
  onConfirm,
}: VerifierSelectProps) {
  const [open, setOpen] = useState<boolean>();
  const { t } = useTranslation();
  const onConfirmRef = useRef<VerifierSelectProps['onConfirm']>(onConfirm);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
  });

  const [verifierList, setVerifierList] = useState<VerifierItem[] | undefined>(defaultVerifierList);

  const socialLogin = useMemo<ISocialLoginConfig | undefined>(() => ConfigProvider.getSocialLoginConfig(), []);

  const getVerifierInfo = useCallback(async () => {
    try {
      setLoading(true);
      const chainInfo = await getChainInfo(chainId);
      const list = await getVerifierList({
        sandboxId,
        chainId,
        rpcUrl: chainInfo?.endPoint,
        chainType,
        address: chainInfo?.caContractAddress,
      });
      setVerifierList(list);
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

  useEffect(() => {
    getVerifierInfo();
  }, [getVerifierInfo]);

  const selectItems = useMemo(
    () =>
      verifierList?.map((item) => ({
        value: item.id,
        iconUrl: item.imageUrl ?? '',
        label: item.name,
        url: item.endPoints[0],
        icon: <img src={item.imageUrl} />,
        id: item.id,
      })),
    [verifierList],
  );
  const _defaultVerifier = useMemo(() => defaultVerifier || selectItems?.[0]?.value, [defaultVerifier, selectItems]);

  const handleChange = useCallback((value: string) => {
    setSelectVal(value);
  }, []);

  const [selectVal, setSelectVal] = useState<string | undefined>(_defaultVerifier);

  useUpdateEffect(() => {
    setSelectVal((v) => {
      return v ? v : _defaultVerifier;
    });
  }, [_defaultVerifier]);

  const selectItem = useMemo(() => verifierList?.find((item) => item.id === selectVal), [selectVal, verifierList]);

  const verifyToken = useVerifyToken();

  const reCaptchaHandler = useReCaptchaModal();

  const verifyHandler: MouseEventHandler<HTMLElement> = useCallback(async () => {
    try {
      if (!selectItem)
        return errorTip(
          {
            errorFields: 'VerifierSelect',
            error: 'Can not get verification',
          },
          isErrorTip,
          onError,
        );
      const result = await verification.sendVerificationCode(
        {
          params: {
            type: accountType,
            guardianIdentifier: guardianIdentifier.replaceAll(/\s+/g, ''),
            verifierId: selectItem.id,
            chainId,
            operationType,
          },
        },
        reCaptchaHandler,
      );

      setOpen(false);
      if (result.verifierSessionId) {
        ConfigProvider.config.storageMethod?.removeItem(SelectVerifierInfoStr);
        onConfirmRef?.current?.({ verifier: selectItem, ...result });
      }
    } catch (error: any) {
      const _error = verifyErrorHandler(error);

      errorTip(
        {
          errorFields: 'VerifierSelect',
          error: _error,
        },
        isErrorTip,
        onError,
      );
    }
  }, [accountType, chainId, guardianIdentifier, isErrorTip, onError, operationType, reCaptchaHandler, selectItem]);

  const onConfirmAuth = useCallback(async () => {
    try {
      setLoading(true);
      let accessToken;
      let clientId;
      let redirectURI;
      let customLoginHandler;
      switch (accountType) {
        case 'Apple':
          accessToken = appleIdToken;
          clientId = socialLogin?.Apple?.clientId;
          redirectURI = socialLogin?.Apple?.redirectURI;
          customLoginHandler = socialLogin?.Apple?.customLoginHandler;
          break;
        case 'Google':
          accessToken = googleAccessToken;
          clientId = socialLogin?.Google?.clientId;
          customLoginHandler = socialLogin?.Google?.customLoginHandler;
          break;
        default:
          throw 'accountType is not supported';
      }
      if (!selectItem?.id) throw 'Verifier is not missing';
      const rst = await verifyToken(accountType, {
        accessToken,
        id: guardianIdentifier,
        verifierId: selectItem.id,
        chainId,
        clientId: clientId ?? '',
        redirectURI,
        customLoginHandler,
      });
      ConfigProvider.config.storageMethod?.removeItem(SelectVerifierInfoStr);
      onConfirmRef?.current?.({ verifier: selectItem, ...rst });
    } catch (error) {
      ConfigProvider.config.storageMethod?.removeItem(SelectVerifierInfoStr);

      const msg = handleErrorMessage(error);
      errorTip(
        {
          errorFields: 'VerifierSelect',
          error: msg,
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [
    accountType,
    appleIdToken,
    chainId,
    googleAccessToken,
    guardianIdentifier,
    isErrorTip,
    onError,
    selectItem,
    socialLogin?.Apple?.clientId,
    socialLogin?.Apple?.customLoginHandler,
    socialLogin?.Apple?.redirectURI,
    socialLogin?.Google?.clientId,
    socialLogin?.Google?.customLoginHandler,
    verifyToken,
  ]);

  const checkInit = useCallback(async () => {
    const infoStorage = await ConfigProvider.config.storageMethod?.getItem(SelectVerifierInfoStr);
    if (!infoStorage) return;
    const info: SelectVerifierStorageInfo = JSON.parse(infoStorage);
    setSelectVal(info.verifier.id);
    onConfirmAuth();
  }, [onConfirmAuth]);

  useEffectOnce(() => {
    checkInit();
  });

  const onButtonConfirm = useCallback(async () => {
    try {
      let info: SelectVerifierStorageInfo;
      if (!selectItem) throw 'Verifier is not missing';
      switch (accountType) {
        case 'Apple':
        case 'Google':
          info = {
            verifier: selectItem,
          };
          ConfigProvider.config.storageMethod?.setItem(SelectVerifierInfoStr, JSON.stringify(info));
          onConfirmAuth();
          break;
        default: {
          setOpen(true);
          break;
        }
      }
    } catch (error) {
      const msg = handleErrorMessage(error);
      errorTip(
        {
          errorFields: 'VerifierSelect',
          error: msg,
        },
        isErrorTip,
        onError,
      );
    }
  }, [accountType, isErrorTip, onConfirmAuth, onError, selectItem]);

  return (
    <div className={clsx('portkey-ui-select-verifier-wrapper', className)}>
      <div className="select-verifier-content" id="select-verifier-content">
        <div className="select-verifier-inner">
          <div className="select-verifier-title">{t('Select verifier')}</div>
          <p className="select-verifier-description">
            {t(
              'Verifiers protect your account and help you recover your assets when they are subject to risks. Please note: The more diversified your verifiers are, the higher security your assets enjoy.',
            )}
          </p>
          <div className="portkey-ui-verifier-selector">
            <CommonSelect className="verifier-select" value={selectVal} onChange={handleChange} items={selectItems} />
            <p className="popular-title">{t('Popular')}</p>
            <ul className="popular-content">
              {selectItems?.slice(0, 3)?.map((item) => (
                <li key={item.value} className="popular-item" onClick={() => handleChange(item.value)}>
                  <BaseVerifierIcon fallback={item.label[0]} src={item.iconUrl} rootClassName="popular-item-image" />
                  <p className="popular-item-name">{item.label}</p>
                </li>
              ))}
            </ul>
            <Button
              className="confirm-btn"
              type="primary"
              onClick={() => {
                if (!guardianIdentifier)
                  return errorTip(
                    {
                      errorFields: 'VerifierSelect',
                      error: 'Missing parameter guardianIdentifier',
                    },
                    isErrorTip,
                    onError,
                  );
                onButtonConfirm?.();
              }}>
              {t('Confirm')}
            </Button>
          </div>
        </div>
      </div>
      <CommonModal
        getContainer={'#select-verifier-content'}
        className="verify-confirm-modal"
        closable={false}
        open={open}
        width={320}
        onCancel={() => setOpen(false)}>
        <p className="modal-content">
          {`${selectItem?.name ?? ''} will send a verification code to `}
          <span className="bold">{guardianIdentifier}</span>
          {` to verify your ${accountType} address.`}
        </p>
        <div className="btn-wrapper">
          <Button onClick={() => setOpen(false)}>{t('Cancel')}</Button>
          <Button type="primary" onClick={verifyHandler}>
            {t('Confirm')}
          </Button>
        </div>
      </CommonModal>
    </div>
  );
}
