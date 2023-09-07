import clsx from 'clsx';
import { PortkeySendProvider } from '../context/PortkeySendProvider';
import { ReactNode, useMemo } from 'react';
import BackHeaderForPage from '../BackHeaderForPage';
import { Button, Form, FormProps, Input } from 'antd';
import { IPaymentSecurityItem } from '@portkey/services';
import { formatWithCommas } from '../../utils/converter';
import { AmountSign } from '../../types/activity';
import { NoLimit, SetLimitExplain } from '../../constants/security';
import './index.less';
import SwitchComponent from '../SwitchComponent';

export interface TransferSettingsProps extends FormProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  closeIcon?: ReactNode;
  initData?: IPaymentSecurityItem;
  onEdit: () => void;
  onClose?: () => void;
}

export interface ITransferSettingsFormInit {
  singleLimit: string;
  dailyLimit: string;
  restricted: boolean;
}

const { Item: FormItem } = Form;

function TransferSettingsContent({ className, wrapperStyle, initData, form, onClose, onEdit }: TransferSettingsProps) {
  const initValue: Partial<ITransferSettingsFormInit> = useMemo(() => {
    return {
      singleLimit:
        formatWithCommas({
          amount: initData?.singleLimit,
          decimals: initData?.decimals,
          digits: 0,
          sign: AmountSign.EMPTY,
        }) +
        ' ' +
        initData?.symbol,
      dailyLimit:
        formatWithCommas({
          amount: initData?.dailyLimit,
          decimals: initData?.decimals,
          digits: 0,
          sign: AmountSign.EMPTY,
        }) +
        ' ' +
        initData?.symbol,
      restricted: initData?.restricted,
    };
  }, [initData?.dailyLimit, initData?.decimals, initData?.restricted, initData?.singleLimit, initData?.symbol]);

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-transfer-settings-wrapper', className)}>
      <BackHeaderForPage title={`Transfer Settings`} leftCallBack={onClose} />
      <Form
        form={form}
        autoComplete="off"
        layout="vertical"
        className="portkey-ui-flex-column portkey-ui-transfer-settings-form"
        initialValues={initValue}
        requiredMark={false}>
        <div className="portkey-ui-form-content">
          {!initData?.restricted && (
            <>
              <FormItem name="restricted" label={'Transfer settings'}>
                <SwitchComponent checked={false} disabled={true} text={'Off'} />
              </FormItem>
              <div className="limit-tip">{NoLimit}</div>
            </>
          )}

          {initData?.restricted && (
            <>
              <FormItem name="singleLimit" label={'Limit per Transaction'}>
                <Input
                  placeholder={'Enter limit'}
                  disabled={true}
                  value={initData?.singleLimit + ' ' + initData?.symbol}
                  defaultValue={initData?.singleLimit + ' ' + initData?.symbol}
                />
              </FormItem>
              <FormItem name="dailyLimit" label={'Daily Limit'}>
                <Input placeholder={'Enter limit'} disabled={true} />
              </FormItem>
              <div className="limit-tip">{SetLimitExplain}</div>
            </>
          )}
        </div>

        <FormItem className="portkey-ui-footer-btn-wrap">
          <Button className="portkey-ui-footer-btn" type="primary" onClick={onEdit}>
            {'Edit'}
          </Button>
        </FormItem>
      </Form>
    </div>
  );
}

export default function TransferSettingsMain(props: TransferSettingsProps) {
  return (
    <PortkeySendProvider>
      <TransferSettingsContent {...props} />
    </PortkeySendProvider>
  );
}
