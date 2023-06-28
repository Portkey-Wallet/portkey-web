import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import BaseModal from '../SignStep/components/BaseModal';
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
  value,
  className,
  onCancel,
  onUnlock,
  onChange,
}: UnlockProps) {
  const { t } = useTranslation();
  const mainContent = useCallback(() => {
    return (
      <div className="unlock-body">
        <CustomSvg type="Portkey" style={{ width: '80px', height: '80px' }} />
        <h1>Welcome back!</h1>
        <div className="password-wrap">
          <span className="password-label">Enter Pin</span>
          <CustomPassword
            value={value}
            placeholder={t('Enter Pin')}
            className="password-input"
            maxLength={16}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
          <div className="error-tips">{isWrongPassword ? 'Incorrect pin' : ''}</div>
        </div>

        <Button disabled={value?.length < 6} className="submit-btn" type="primary" onClick={onUnlock}>
          Unlock
        </Button>
      </div>
    );
  }, [value, t, isWrongPassword, onChange, onUnlock]);

  return (
    <PortkeyStyleProvider>
      {uiType === 'Full' ? (
        <div className="step-page-full-wrapper">{mainContent()}</div>
      ) : (
        <BaseModal destroyOnClose className={className} open={open} onCancel={onCancel}>
          {mainContent()}
        </BaseModal>
      )}
    </PortkeyStyleProvider>
  );
}
