import clsx from 'clsx';
import BackHeaderForPage from '../BackHeaderForPage';
import './index.less';
import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { divDecimals, timesDecimals } from '../../utils/converter';
import { AccountType, GuardiansApproved, ITransferLimitItem, OperationTypeEnum, VerifierItem } from '@portkey/services';
import { ITransferSettingsFormInit } from '../TransferSettings/index.components';
import { Form, FormProps, Input } from 'antd';
import SwitchComponent from '../SwitchComponent';
import { LimitFormatTip, NoLimit, SetLimitExplain, SingleExceedDaily } from '../../constants/security';
import { isValidInteger } from '../../utils/reg';
import { NetworkType, OnErrorFunc, UserGuardianStatus, ValidData } from '../../types';
import CommonBaseModal from '../CommonBaseModal';
import GuardianApproval from '../GuardianApproval';
import { did, errorTip, handleErrorMessage, parseTelegramToken, setLoading } from '../../utils';
import { setTransferLimit } from '../../utils/sandboxUtil/setTransferLimit';
import { ELF_SYMBOL } from '../../constants/assets';
import { getChainInfo } from '../../hooks';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { formatGuardianValue } from '../Guardian/utils/formatGuardianValue';
import { ChainId } from '@portkey/types';
import { sleep } from '@portkey/utils';
import { useEffectOnce } from 'react-use';
import BackHeader from '../BackHeader';
import ThrottleButton from '../ThrottleButton';
import { getOperationDetails } from '../utils/operation.util';
import {
  getDataFromOpenLogin,
  getTelegramUserId,
  hasCurrentTelegramGuardian,
  isTelegramPlatform,
  saveDataAndOpenPortkeyWebapp,
} from '../../utils/telegram';
import { getCustomNetworkType, getDappTelegramLink, getPortkeyBotWebappLink } from '../config-provider/utils';
import { TransferSettingBusinessKey } from '../../constants/storage';
import { useGetTelegramAccessToken } from '../../hooks/telegram';
import { Open_Login_Guardian_Approval_Bridge } from '../../constants/telegram';
import { CrossTabPushMessageType } from '@portkey/socket';
import { IOpenLoginGuardianApprovalResponse } from '../../types/openlogin';

export interface ITransferSettingsEditProps extends FormProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  caHash: string;
  originChainId: ChainId;
  initData: ITransferLimitItemWithRoute;
  isErrorTip?: boolean;
  sandboxId?: string;
  networkType: NetworkType;
  onBack?: (data: ITransferLimitItemWithRoute) => void;
  onSuccess?: (data: ITransferLimitItemWithRoute) => void;
  onGuardiansApproveError?: OnErrorFunc;
}

export interface ITransferLimitItemWithRoute extends ITransferLimitItem {
  businessFrom?: {
    module: IBusinessFrom;
    extraConfig?: any;
  };
}

export type IBusinessFrom = 'ramp-sell' | 'send';

const { Item: FormItem } = Form;

export default function TransferSettingsEditMain({
  className,
  wrapperStyle,
  caHash,
  originChainId,
  initData,
  isErrorTip = true,
  sandboxId = '',
  networkType,
  onBack,
  onSuccess,
  onGuardiansApproveError,
}: ITransferSettingsEditProps) {
  const [form] = Form.useForm();
  const initValue: Partial<ITransferSettingsFormInit> = useMemo(
    () => ({
      singleLimit: divDecimals(initData.singleLimit, initData.decimals).toString(),
      dailyLimit: divDecimals(initData.dailyLimit, initData.decimals).toString(),
      restricted: initData.restricted,
    }),
    [initData.dailyLimit, initData.decimals, initData.restricted, initData.singleLimit],
  );
  const [restrictedValue, setRestrictedValue] = useState(!!initData.restricted);
  const [disable, setDisable] = useState(true);
  const [validSingleLimit, setValidSingleLimit] = useState<ValidData>({ validateStatus: '', errorMsg: '' });
  const [validDailyLimit, setValidDailyLimit] = useState<ValidData>({ validateStatus: '', errorMsg: '' });
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const verifierMap = useRef<{ [x: string]: VerifierItem }>();
  const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>();

  const targetChainId = useMemo(() => initData.chainId || originChainId, [initData.chainId, originChainId]);
  const symbol = useMemo(() => initData.symbol || ELF_SYMBOL, [initData.symbol]);

  const getVerifierInfo = useCallback(async () => {
    try {
      const chainInfo = await getChainInfo(originChainId);
      const list = await getVerifierList({
        sandboxId,
        chainId: originChainId,
        rpcUrl: chainInfo?.endPoint,
        chainType: 'aelf',
        address: chainInfo?.caContractAddress,
      });
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
        onGuardiansApproveError,
      );
    } finally {
      setLoading(false);
    }
  }, [isErrorTip, onGuardiansApproveError, originChainId, sandboxId]);

  const getGuardianList = useCallback(async () => {
    try {
      const payload = await did.getHolderInfo({
        caHash: caHash,
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
        onGuardiansApproveError,
      );
    } finally {
      setLoading(false);
    }
  }, [caHash, isErrorTip, onGuardiansApproveError, originChainId]);

  const handleDisableCheck = useCallback(() => {
    const { restricted, singleLimit, dailyLimit } = form.getFieldsValue();

    if (restricted) {
      setDisable(!singleLimit || !dailyLimit);
    } else {
      setDisable(false);
    }
  }, [form]);

  const handleFormChange = useCallback(() => {
    const { restricted, singleLimit, dailyLimit } = form.getFieldsValue();

    let errorCount = 0;

    if (restricted) {
      // Transfers restricted
      // CHECK 1: singleLimit is a positive integer
      if (isValidInteger(singleLimit)) {
        setValidSingleLimit({ validateStatus: '', errorMsg: '' });
      } else {
        setValidSingleLimit({ validateStatus: 'error', errorMsg: LimitFormatTip });
        errorCount++;
      }
      // CHECK 2: dailyLimit is a positive integer
      if (isValidInteger(dailyLimit)) {
        setValidDailyLimit({ validateStatus: '', errorMsg: '' });
      } else {
        setValidDailyLimit({ validateStatus: 'error', errorMsg: LimitFormatTip });
        errorCount++;
      }
      // CHECK 3: dailyLimit >= singleLimit
      if (isValidInteger(singleLimit) && isValidInteger(dailyLimit)) {
        if (Number(dailyLimit) >= Number(singleLimit)) {
          setValidSingleLimit({ validateStatus: '', errorMsg: '' });
        } else {
          setValidSingleLimit({ validateStatus: 'error', errorMsg: SingleExceedDaily });
          errorCount++;
        }
      }
    }

    return errorCount;
  }, [form]);

  const handleRestrictedChange = useCallback(
    (checked: boolean) => {
      setRestrictedValue(checked);

      handleDisableCheck();
    },
    [handleDisableCheck],
  );

  const handleSingleLimitChange = useCallback(() => {
    handleDisableCheck();
    setValidSingleLimit({ validateStatus: '', errorMsg: '' });
  }, [handleDisableCheck]);

  const handleDailyLimitChange = useCallback(() => {
    handleDisableCheck();
    setValidDailyLimit({ validateStatus: '', errorMsg: '' });
  }, [handleDisableCheck]);

  const approvalSuccess = useCallback(
    async (approvalInfo: GuardiansApproved[]) => {
      try {
        setLoading(true);
        const guardiansApproved = formatGuardianValue(approvalInfo);
        const { restricted, singleLimit, dailyLimit } = form.getFieldsValue();
        const transDailyLimit = restricted ? String(timesDecimals(dailyLimit, initData.decimals)) : '-1';
        const transSingleLimit = restricted ? String(timesDecimals(singleLimit, initData.decimals)) : '-1';

        await setTransferLimit({
          params: {
            dailyLimit: transDailyLimit,
            singleLimit: transSingleLimit,
            symbol: symbol,
            guardiansApproved,
          },
          targetChainId: targetChainId,
          sandboxId,
          caHash: caHash || '',
        });

        // Guarantee that the contract can query the latest data
        await sleep(1000);

        const params: ITransferLimitItemWithRoute = {
          dailyLimit: transDailyLimit,
          singleLimit: transSingleLimit,
          chainId: targetChainId,
          symbol: symbol,
          decimals: initData.decimals || 8,
          restricted,
          businessFrom: initData.businessFrom,
        };

        onSuccess?.(params);
      } catch (e) {
        errorTip(
          {
            errorFields: 'Handle Add Guardian',
            error: handleErrorMessage(e),
          },
          isErrorTip,
          onGuardiansApproveError,
        );
      } finally {
        setLoading(false);
      }
    },
    [
      caHash,
      form,
      initData.businessFrom,
      initData.decimals,
      isErrorTip,
      onGuardiansApproveError,
      onSuccess,
      sandboxId,
      symbol,
      targetChainId,
    ],
  );

  const operationDetails = useMemo(() => getOperationDetails(OperationTypeEnum.modifyTransferLimit), []);

  const handleWithinTelegram = useCallback(
    async (data?: { accessToken?: string }) => {
      try {
        setLoading(true);

        const params = {
          networkType,
          originChainId,
          targetChainId,
          caHash,
          operationType: OperationTypeEnum.modifyTransferLimit,
          isErrorTip,
          telegramAuth: data?.accessToken,
          telegramUserId: getTelegramUserId(),
        };
        await getDataFromOpenLogin({
          params,
          socketMethod: [CrossTabPushMessageType.onTransferSettingApproval],
          openLoginBridgeURLMap: Open_Login_Guardian_Approval_Bridge,
          isRemoveLocalStorage: true,
          removeLocalStorageKey: TransferSettingBusinessKey,
          callback: (result) => approvalSuccess((result.data as IOpenLoginGuardianApprovalResponse).approvalInfo),
        });
      } catch (error) {
        throw new Error(handleErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [approvalSuccess, caHash, isErrorTip, networkType, originChainId, targetChainId],
  );
  useGetTelegramAccessToken({ callback: handleWithinTelegram });
  const hasTelegramGuardian = useMemo(() => hasCurrentTelegramGuardian(guardianList), [guardianList]);
  const onFinish = async () => {
    const errorCount = handleFormChange();
    if (errorCount > 0) return;
    console.log('====== initData.singleLimit', initData.singleLimit);

    // Check Platform
    if (isTelegramPlatform()) {
      // inside the telegram app
      // guardian list include current telegram account
      if (hasTelegramGuardian) {
        const ctw = getCustomNetworkType();
        const dappTelegramLink = getDappTelegramLink();
        const portkeyBotWebappLink = getPortkeyBotWebappLink(ctw, networkType);
        const { restricted, singleLimit, dailyLimit } = form.getFieldsValue();
        const storageValue = JSON.stringify({
          ...initData,
          singleLimit: timesDecimals(singleLimit, initData.decimals).toFixed(),
          dailyLimit: timesDecimals(dailyLimit, initData.decimals).toFixed(),
          restricted: restricted,
          needGoToOpenLoginApproval: true,
        });
        await did.config.storageMethod.setItem(TransferSettingBusinessKey, storageValue);
        await saveDataAndOpenPortkeyWebapp(dappTelegramLink, portkeyBotWebappLink);
      } else {
        // guardian list don not include current telegram account
        await handleWithinTelegram();
      }
      return;
    }

    // not inside telegram app
    setApprovalVisible(true);
  };

  const getData = useCallback(async () => {
    setLoading(true);
    await getVerifierInfo();
    await getGuardianList();
    setLoading(false);
  }, [getGuardianList, getVerifierInfo]);

  const recoverPageDataAfterTelegramAuth = useCallback(async () => {
    const storageValue = await did.config.storageMethod.getItem(TransferSettingBusinessKey);
    if (storageValue && typeof storageValue === 'string') {
      const storageValueParsed = JSON.parse(storageValue);
      if (storageValueParsed.needGoToOpenLoginApproval) {
        form.setFieldValue(
          'singleLimit',
          divDecimals(storageValueParsed.singleLimit, storageValueParsed.decimals).toFixed(),
        );
        form.setFieldValue(
          'dailyLimit',
          divDecimals(storageValueParsed.dailyLimit, storageValueParsed.decimals).toFixed(),
        );
        form.setFieldValue('restricted', storageValueParsed.restricted);
        setRestrictedValue(storageValueParsed.restricted);
      }
    }
  }, [form]);

  useEffectOnce(() => {
    getData();

    if (initData && !initData.restricted) {
      form.setFieldValue('singleLimit', divDecimals(initData.defaultSingleLimit, initData.decimals).toFixed());
      form.setFieldValue('dailyLimit', divDecimals(initData.defaultDailyLimit, initData.decimals).toFixed());
    }
    handleDisableCheck();

    if (isTelegramPlatform()) recoverPageDataAfterTelegramAuth();
  });

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-transfer-settings-edit-wrapper', className)}>
      <BackHeaderForPage
        title={`Transfer Settings`}
        leftCallBack={async () => {
          did.config.storageMethod.removeItem(TransferSettingBusinessKey);
          onBack?.(initData);
        }}
      />
      <Form
        form={form}
        autoComplete="off"
        layout="vertical"
        className="portkey-ui-flex-column portkey-ui-transfer-settings-edit-form"
        initialValues={initValue}
        requiredMark={false}
        onFinish={onFinish}>
        <div className="portkey-ui-form-content">
          <FormItem name="restricted" label={'Transfer Settings'}>
            <SwitchComponent
              onChange={handleRestrictedChange}
              checked={restrictedValue}
              text={restrictedValue ? 'ON' : 'OFF'}
            />
          </FormItem>

          <div className="portkey-ui-divide" />

          <div className={!restrictedValue ? 'portkey-ui-hidden-form' : ''}>
            <FormItem
              name="singleLimit"
              label={'Limit per Transaction'}
              validateStatus={validSingleLimit.validateStatus}
              help={validSingleLimit.errorMsg}>
              <Input
                placeholder={'Enter limit'}
                onChange={handleSingleLimitChange}
                maxLength={18 - Number(initData.decimals)}
                suffix={symbol}
              />
            </FormItem>
            <FormItem
              name="dailyLimit"
              label={'Daily Limit'}
              validateStatus={validDailyLimit.validateStatus}
              help={validDailyLimit.errorMsg}>
              <Input
                placeholder={'Enter limit'}
                onChange={handleDailyLimitChange}
                maxLength={18 - Number(initData.decimals)}
                suffix={symbol}
              />
            </FormItem>

            <div className="portkey-ui-limit-tip ">{SetLimitExplain}</div>
          </div>

          {!restrictedValue && <div className="portkey-ui-limit-tip">{NoLimit}</div>}
        </div>

        <FormItem className="portkey-ui-footer-btn-wrap">
          <ThrottleButton className="portkey-ui-footer-btn" type="primary" htmlType="submit" disabled={disable}>
            {'Send Request'}
          </ThrottleButton>
        </FormItem>
      </Form>
      <CommonBaseModal
        className="portkey-ui-modal-approval"
        open={approvalVisible}
        onClose={() => setApprovalVisible(false)}>
        <GuardianApproval
          header={<BackHeader onBack={() => setApprovalVisible(false)} />}
          originChainId={originChainId}
          networkType={networkType}
          targetChainId={targetChainId}
          guardianList={guardianList}
          onConfirm={approvalSuccess}
          onError={onGuardiansApproveError}
          operationType={OperationTypeEnum.modifyTransferLimit}
          operationDetails={operationDetails}
        />
      </CommonBaseModal>
    </div>
  );
}
