import clsx from 'clsx';
import BackHeaderForPage from '../BackHeaderForPage';
import './index.less';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { divDecimals } from '../../utils/converter';
import {
  AccountType,
  GuardiansApproved,
  IPaymentSecurityItem,
  OperationTypeEnum,
  VerifierItem,
} from '@portkey/services';
import { ITransferSettingsFormInit } from '../TransferSettings/index.components';
import { Button, Form, FormProps, Input } from 'antd';
import SwitchComponent from '../SwitchComponent';
import { LimitFormatTip, NoLimit, SetLimitExplain, SingleExceedDaily } from '../../constants/security';
import { isValidInteger } from '../../utils/reg';
import { OnErrorFunc, UserGuardianStatus, ValidData } from '../../types';
import CommonBaseModal from '../CommonBaseModal';
import GuardianApproval from '../GuardianApproval';
import CustomSvg from '../CustomSvg';
import { did, errorTip, handleErrorMessage, setLoading } from '../../utils';
import { setTransferLimit } from '../../utils/sandboxUtil/setTransferLimit';
import { ELF_SYMBOL } from '../../constants/assets';
import { getChainInfo } from '../../hooks';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { usePortkey } from '../context';
import { formatGuardianValue } from '../Guardian/utils/formatGuardianValue';
import { ChainId } from '@portkey/types';

export interface ITransferSettingsEditProps extends FormProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  caHash: string;
  originChainId: ChainId;
  initData?: IPaymentSecurityItem;
  isErrorTip?: boolean;
  onBack?: () => void;
  onSuccess?: (data: IPaymentSecurityItem) => void;
  onGuardiansApproveError?: OnErrorFunc;
}

const { Item: FormItem } = Form;

export default function TransferSettingsEditMain({
  className,
  wrapperStyle,
  caHash,
  originChainId,
  initData,
  isErrorTip = true,
  onBack,
  onSuccess,
  onGuardiansApproveError,
}: ITransferSettingsEditProps) {
  const [form] = Form.useForm();
  const initValue: Partial<ITransferSettingsFormInit> = useMemo(
    () => ({
      singleLimit: divDecimals(initData?.singleLimit, initData?.decimals).toString(),
      dailyLimit: divDecimals(initData?.dailyLimit, initData?.decimals).toString(),
      restricted: initData?.restricted,
    }),
    [initData?.dailyLimit, initData?.decimals, initData?.restricted, initData?.singleLimit],
  );
  const [restrictedValue, setRestrictedValue] = useState(!!initData?.restricted);
  const [disable, setDisable] = useState(true);
  const [validSingleLimit, setValidSingleLimit] = useState<ValidData>({ validateStatus: '', errorMsg: '' });
  const [validDailyLimit, setValidDailyLimit] = useState<ValidData>({ validateStatus: '', errorMsg: '' });
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const verifierMap = useRef<{ [x: string]: VerifierItem }>();
  const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>();
  const [{ sandboxId }] = usePortkey();

  const chainId = useMemo(() => initData?.chainId || originChainId, [initData?.chainId, originChainId]);
  const symbol = useMemo(() => initData?.symbol || ELF_SYMBOL, [initData?.symbol]);

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
          error,
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

  const handleFormChange = useCallback(() => {
    const { restricted, singleLimit, dailyLimit } = form.getFieldsValue();

    if (restricted) {
      if (Number(singleLimit) > Number(dailyLimit)) {
        setDisable(true);
        return setValidSingleLimit({ validateStatus: 'error', errorMsg: SingleExceedDaily });
      } else {
        setValidSingleLimit({ validateStatus: '', errorMsg: '' });
      }
    }

    setDisable(!((restricted && singleLimit && dailyLimit) || !restricted));
  }, [form]);

  const handleRestrictedChange = useCallback(
    (checked: boolean) => {
      setRestrictedValue(checked);
      handleFormChange();
    },
    [handleFormChange],
  );

  const handleSingleLimitChange = useCallback(
    (v: string) => {
      if (isValidInteger(v)) {
        setValidSingleLimit({ validateStatus: '', errorMsg: '' });
        handleFormChange();
      } else {
        return setValidSingleLimit({ validateStatus: 'error', errorMsg: LimitFormatTip });
      }
    },
    [handleFormChange],
  );

  const handleDailyLimitChange = useCallback(
    (v: string) => {
      if (isValidInteger(v)) {
        setValidDailyLimit({ validateStatus: '', errorMsg: '' });
        handleFormChange();
      } else {
        return setValidDailyLimit({ validateStatus: 'error', errorMsg: LimitFormatTip });
      }
    },
    [handleFormChange],
  );

  const approvalSuccess = useCallback(
    async (approvalInfo: GuardiansApproved[]) => {
      try {
        setLoading(true);
        const guardiansApproved = formatGuardianValue(approvalInfo);
        const { restricted, singleLimit, dailyLimit } = form.getFieldsValue();

        await setTransferLimit({
          params: {
            dailyLimit,
            singleLimit,
            symbol: symbol,
            guardiansApproved,
          },
          chainId: chainId,
          sandboxId: '',
          caHash: caHash || '',
        });

        const params: IPaymentSecurityItem = {
          dailyLimit,
          singleLimit,
          chainId: chainId,
          symbol: symbol,
          decimals: initData?.decimals || 8,
          restricted,
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
    [caHash, chainId, form, initData?.decimals, isErrorTip, onGuardiansApproveError, onSuccess, symbol],
  );

  const getData = useCallback(async () => {
    setLoading(true);
    await getVerifierInfo();
    await getGuardianList();
    setLoading(false);
  }, [getGuardianList, getVerifierInfo]);

  useEffect(() => {
    getData();
    handleFormChange();
  }, [getData, handleFormChange]);

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-transfer-settings-edit-wrapper', className)}>
      <BackHeaderForPage title={`Transfer Settings`} leftCallBack={onBack} />
      <Form
        form={form}
        autoComplete="off"
        layout="vertical"
        className="portkey-ui-flex-column portkey-ui-transfer-settings-edit-form"
        initialValues={initValue}
        requiredMark={false}
        onFinish={() => setApprovalVisible(true)}>
        <div className="portkey-ui-form-content">
          <FormItem name="restricted" label={'Transfer settings'}>
            <SwitchComponent
              onChange={handleRestrictedChange}
              checked={restrictedValue}
              text={restrictedValue ? 'On' : 'Off'}
            />
          </FormItem>

          <div className={!restrictedValue ? 'portkey-ui-hidden-form' : ''}>
            <FormItem
              name="singleLimit"
              label={'Limit per Transaction'}
              validateStatus={validSingleLimit.validateStatus}
              help={validSingleLimit.errorMsg}>
              <Input
                placeholder={'Enter limit'}
                onChange={(e) => handleSingleLimitChange(e.target.value)}
                maxLength={16}
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
                onChange={(e) => handleDailyLimitChange(e.target.value)}
                maxLength={16}
                suffix={symbol}
              />
            </FormItem>

            <div className="portkey-ui-limit-tip ">{SetLimitExplain}</div>
          </div>

          {!restrictedValue && <div className="portkey-ui-limit-tip">{NoLimit}</div>}
        </div>

        <FormItem className="portkey-ui-footer-btn-wrap">
          <Button className="portkey-ui-footer-btn" type="primary" htmlType="submit" disabled={disable}>
            {'Send Request'}
          </Button>
        </FormItem>
      </Form>
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
          chainId={originChainId}
          guardianList={guardianList}
          onConfirm={approvalSuccess}
          onError={onGuardiansApproveError}
          operationType={OperationTypeEnum.modifyTransferLimit}
        />
      </CommonBaseModal>
    </div>
  );
}
