import { Form, FormProps } from 'antd';
import ConfirmPassword from '../ConfirmPassword';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import './index.less';
import { useCallback, useRef } from 'react';
import ThrottleButton from '../ThrottleButton';

const { Item: FormItem } = Form;

export interface SetPinBaseProps {
  className?: string;
  onFinish?: (val: string) => Promise<void>;
  onFinishFailed?: FormProps['onFinishFailed'];
}

export default function SetPinBase({ className, onFinish, onFinishFailed }: SetPinBaseProps) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const isFinishRef = useRef<boolean>(false);
  const handleKeyDown = useCallback(
    async (event: { key: string; preventDefault: () => void }) => {
      if (event.key === 'Enter') {
        if (!form.isFieldsTouched(true) || !!form.getFieldsError().filter(({ errors }) => errors.length).length) {
          return;
        }
        event.preventDefault();
        const pin = form.getFieldValue('pin');
        try {
          if (isFinishRef.current) return;
          isFinishRef.current = true;
          await onFinish?.(pin);
          isFinishRef.current = false;
        } finally {
          isFinishRef.current = false;
        }
      }
    },
    [form, onFinish],
  );
  return (
    <div className={clsx('set-pin-wrapper', className)} id="set-pin-wrapper">
      <div className="set-pin-content">
        {/* <div className="set-pin-title">{t('Enter Pin to Protect Your Wallet')}</div> */}
        <Form
          onKeyDown={handleKeyDown}
          layout="vertical"
          className="set-pin-form"
          name="CreateWalletForm"
          form={form}
          requiredMark={false}
          onFinish={async ({ pin }) => {
            try {
              if (isFinishRef.current) return;
              isFinishRef.current = true;
              await onFinish?.(pin);
              isFinishRef.current = false;
            } finally {
              isFinishRef.current = false;
            }
          }}
          onFinishFailed={onFinishFailed}
          autoComplete="off">
          <FormItem name="pin" style={{ marginBottom: 16 }}>
            <ConfirmPassword validateFields={form.validateFields} isPasswordLengthTipShow={false} />
          </FormItem>

          <FormItem className="submit-btn-form-item" shouldUpdate>
            {() => (
              <ThrottleButton
                className="submit-btn"
                type="primary"
                htmlType="submit"
                disabled={
                  !form.isFieldsTouched(true) || !!form.getFieldsError().filter(({ errors }) => errors.length).length
                }>
                {t('Confirm')}
              </ThrottleButton>
            )}
          </FormItem>
        </Form>
      </div>
    </div>
  );
}
