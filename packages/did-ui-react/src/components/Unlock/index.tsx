import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import CommonBaseModal from '../CommonBaseModal';
import CustomPassword from '../CustomPassword';
import CustomSvg from '../CustomSvg';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import { devices } from '@portkey-v1/utils';
import { PASSWORD_LENGTH } from '../../constants/misc';
import './index.less';
import PortkeyPasswordInput from '../PortkeyPasswordInput';

type UI_TYPE = 'Modal' | 'Full';

export interface UnlockProps {
  isWrongPassword?: boolean;

  // Login
  onUnlock: (password: string) => void;

  // UI config
  uiType?: UI_TYPE;
  /** When on mobile, use the numeric keypad  */
  keyboard?: boolean;

  // Modal config
  open?: boolean;
  className?: string;
  value: string;
  onCancel?: () => void;
  onChange: (value: string) => void;
}

export default function UnLock({
  isWrongPassword = false,
  uiType = 'Modal',
  open,
  value = '',
  className,
  keyboard: defaultKeyboard = false,
  onCancel,
  onUnlock,
  onChange,
}: UnlockProps) {
  const { t } = useTranslation();
  const disabled = useMemo(() => value.length < 6, [value?.length]);

  const isMobile = useMemo(() => devices.isMobileDevices(), []);

  const keyboard = useMemo(() => isMobile && defaultKeyboard, [defaultKeyboard, isMobile]);

  const mainContent = useCallback(() => {
    return (
      <div id="portkey-ui-unlock-body" className="unlock-body">
        <CustomSvg type="Portkey" style={{ width: '80px', height: '80px' }} />
        <h1 className="unlock-title">Welcome back!</h1>
        <div className="password-wrap">
          {keyboard ? (
            <PortkeyPasswordInput
              error={isWrongPassword ? 'Incorrect pin' : ''}
              value={value}
              length={PASSWORD_LENGTH}
              onChange={onChange}
              onFill={onUnlock}
            />
          ) : (
            <>
              <CustomPassword
                value={value}
                placeholder={t('Enter Pin')}
                className="portkey-ui-unlock-input"
                maxLength={16}
                onChange={(e) => {
                  onChange(e.target.value);
                }}
                onPressEnter={() => {
                  if (!disabled) onUnlock(value);
                }}
              />
              <div className="error-tips">{isWrongPassword ? 'Incorrect pin' : ''}</div>
            </>
          )}
        </div>
        {!keyboard && (
          <Button disabled={disabled} className="submit-btn" type="primary" onClick={() => onUnlock?.(value)}>
            Unlock
          </Button>
        )}
      </div>
    );
  }, [keyboard, value, onChange, onUnlock, t, disabled, isWrongPassword]);

  return (
    <PortkeyStyleProvider>
      {uiType === 'Full' ? (
        <div className="portkey-sign-full-wrapper">{mainContent()}</div>
      ) : (
        <CommonBaseModal destroyOnClose className={className} open={open} onClose={onCancel}>
          {mainContent()}
        </CommonBaseModal>
      )}
    </PortkeyStyleProvider>
  );
}
