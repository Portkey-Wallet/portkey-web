import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import CommonBaseModal from '../CommonBaseModal';
import CustomPassword from '../CustomPassword';
import CustomSvg from '../CustomSvg';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import './index.less';

type UI_TYPE = 'Modal' | 'Full';

export interface UnlockProps {
  isWrongPassword?: boolean;

  // Login
  onUnlock: () => void;

  // UI config
  uiType?: UI_TYPE;

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
  onCancel,
  onUnlock,
  onChange,
}: UnlockProps) {
  const { t } = useTranslation();
  const disabled = useMemo(() => value.length < 6, [value?.length]);
  const mainContent = useCallback(() => {
    return (
      <div className="unlock-body">
        <CustomSvg type="Portkey" style={{ width: '80px', height: '80px' }} />
        <h1 className="unlock-title">Welcome back!</h1>
        <div className="password-wrap">
          {/* <span className="password-label">Enter Pin</span> */}
          <CustomPassword
            value={value}
            placeholder={t('Enter Pin')}
            className="portkey-ui-unlock-input"
            maxLength={16}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            onPressEnter={() => {
              if (!disabled) onUnlock();
            }}
          />
          <div className="error-tips">{isWrongPassword ? 'Incorrect pin' : ''}</div>
        </div>

        <Button disabled={disabled} className="submit-btn" type="primary" onClick={onUnlock}>
          Unlock
        </Button>
      </div>
    );
  }, [value, t, isWrongPassword, disabled, onUnlock, onChange]);

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
