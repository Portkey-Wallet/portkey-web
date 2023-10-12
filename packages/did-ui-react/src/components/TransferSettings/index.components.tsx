import clsx from 'clsx';
import { useMemo } from 'react';
import BackHeaderForPage from '../BackHeaderForPage';
import { Button, Form, FormProps, Input } from 'antd';
import { ITransferLimitItem } from '@portkey/services';
import { formatWithCommas } from '../../utils/converter';
import { AmountSign } from '../../types/activity';
import { NoLimit, SetLimitExplain } from '../../constants/security';
import './index.less';
import SwitchComponent from '../SwitchComponent';

export interface TransferSettingsProps extends FormProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  initData: ITransferLimitItem;
  isShowEditButton?: boolean;
  onEdit?: () => void;
  onBack?: () => void;
}

export interface ITransferSettingsFormInit {
  singleLimit: string;
  dailyLimit: string;
  restricted: boolean;
}

const { Item: FormItem } = Form;

export default function TransferSettingsMain({
  className,
  wrapperStyle,
  initData,
  form,
  isShowEditButton = true,
  onBack,
  onEdit,
}: TransferSettingsProps) {
  const initValue: Partial<ITransferSettingsFormInit> = useMemo(() => {
    return {
      singleLimit:
        formatWithCommas({
          amount: initData.singleLimit,
          decimals: initData.decimals,
          digits: 0,
          sign: AmountSign.EMPTY,
        }) +
        ' ' +
        initData.symbol,
      dailyLimit:
        formatWithCommas({
          amount: initData.dailyLimit,
          decimals: initData.decimals,
          digits: 0,
          sign: AmountSign.EMPTY,
        }) +
        ' ' +
        initData.symbol,
      restricted: initData.restricted,
    };
  }, [initData.dailyLimit, initData.decimals, initData.restricted, initData.singleLimit, initData.symbol]);

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-transfer-settings-wrapper', className)}>
      <BackHeaderForPage title={`Transfer Settings`} leftCallBack={onBack} />
      <Form
        form={form}
        autoComplete="off"
        layout="vertical"
        className="portkey-ui-flex-column portkey-ui-transfer-settings-form"
        initialValues={initValue}
        requiredMark={false}>
        <div className="portkey-ui-form-content">
          {!initData.restricted && (
            <div className="section-one">
              <FormItem name="restricted" label={'Transfer Settings'}>
                <SwitchComponent checked={false} disabled={true} text={'OFF'} />
              </FormItem>
              <div className="portkey-ui-divide" />
              <div className="portkey-ui-limit-tip">{NoLimit}</div>
            </div>
          )}

          {initData.restricted && (
            <div className="section-two">
              <FormItem name="singleLimit" label={'Limit per Transaction'}>
                <Input
                  placeholder={'Enter limit'}
                  disabled={true}
                  value={initData.singleLimit + ' ' + initData.symbol}
                  defaultValue={initData.singleLimit + ' ' + initData.symbol}
                />
              </FormItem>
              <FormItem name="dailyLimit" label={'Daily Limit'}>
                <Input placeholder={'Enter limit'} disabled={true} />
              </FormItem>
              <div className="portkey-ui-limit-tip">{SetLimitExplain}</div>
            </div>
          )}
        </div>
        {isShowEditButton && (
          <FormItem className="portkey-ui-footer-btn-wrap">
            <Button className="portkey-ui-footer-btn" type="primary" onClick={onEdit}>
              {'Edit'}
            </Button>
          </FormItem>
        )}
      </Form>
    </div>
  );
}
