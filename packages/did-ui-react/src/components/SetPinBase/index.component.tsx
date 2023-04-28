import { Button, Form, FormProps } from 'antd';
import ConfirmPassword from '../ConfirmPassword';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import './index.less';

const { Item: FormItem } = Form;

export interface SetPinBaseProps {
  className?: string;
  onFinish?: (val: string) => void;
  onFinishFailed?: FormProps['onFinishFailed'];
}

export default function SetPinBase({ className, onFinish, onFinishFailed }: SetPinBaseProps) {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  return (
    <div className={clsx('set-pin-wrapper', className)} id="set-pin-wrapper">
      <div className="set-pin-content">
        <div className="set-pin-title">{t('Enter Pin to Protect Your Wallet')}</div>
        <Form
          layout="vertical"
          className="set-pin-form"
          name="CreateWalletForm"
          form={form}
          requiredMark={false}
          onFinish={({ pin }) => onFinish?.(pin)}
          onFinishFailed={onFinishFailed}
          autoComplete="off">
          <FormItem name="pin" style={{ marginBottom: 16 }}>
            <ConfirmPassword validateFields={form.validateFields} isPasswordLengthTipShow={false} />
          </FormItem>

          <FormItem className="submit-btn-form-item" shouldUpdate>
            {() => (
              <Button
                className="submit-btn"
                type="primary"
                htmlType="submit"
                disabled={
                  !form.isFieldsTouched(true) || !!form.getFieldsError().filter(({ errors }) => errors.length).length
                }>
                {t('Confirm')}
              </Button>
            )}
          </FormItem>
        </Form>
      </div>
    </div>
  );
}
