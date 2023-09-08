import clsx from 'clsx';
import { PortkeySendProvider } from '../context/PortkeySendProvider';
import BackHeaderForPage from '../BackHeaderForPage';
import './index.less';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { divDecimals } from '../../utils/converter';
import { IPaymentSecurityItem } from '@portkey/services';
import { ITransferSettingsFormInit } from '../TransferSettings/index.components';
import { Button, Form, FormProps, Input } from 'antd';
import SwitchComponent from '../SwitchComponent';
import { LimitFormatTip, NoLimit, SetLimitExplain, SingleExceedDaily } from '../../constants/security';
import { isValidInteger } from '../../utils/reg';
import { ValidData } from '../../types';

export interface ITransferSettingsEditProps extends FormProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  initData?: IPaymentSecurityItem;
  onClose?: () => void;
}

const { Item: FormItem } = Form;

function TransferSettingsEditContent({ className, wrapperStyle, initData, onClose }: ITransferSettingsEditProps) {
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
      console.log('🌈 🌈 🌈 🌈 🌈 🌈 checked', checked);
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

  const handleSetLimit = useCallback(async () => {
    // ====== clear guardian cache ====== start
    // TODO
    // ====== clear guardian cache ====== end

    const { restricted, singleLimit, dailyLimit } = form.getFieldsValue();
    const params = {
      dailyLimit,
      singleLimit,
      symbol: initData?.symbol,
      decimals: initData?.decimals,
      restricted,
    };
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 params', params);
    // TODO GUARDIANS_APPROVAL
  }, [form, initData?.decimals, initData?.symbol]);

  const onFinish = useCallback(() => {
    handleSetLimit();
  }, [handleSetLimit]);

  useEffect(() => {
    handleFormChange();
  }, [handleFormChange]);

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-transfer-settings-edit-wrapper', className)}>
      <BackHeaderForPage title={`Transfer Settings`} leftCallBack={onClose} />
      <Form
        form={form}
        autoComplete="off"
        layout="vertical"
        className="portkey-ui-flex-column portkey-ui-transfer-settings-edit-form"
        initialValues={initValue}
        requiredMark={false}
        onFinish={onFinish}>
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
                suffix={initData?.symbol || ''}
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
                suffix={initData?.symbol || ''}
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
    </div>
  );
}

export default function TransferSettingsEditMain(props: ITransferSettingsEditProps) {
  return (
    <PortkeySendProvider>
      <TransferSettingsEditContent {...props} />
    </PortkeySendProvider>
  );
}
