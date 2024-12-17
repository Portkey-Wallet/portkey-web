import clsx from 'clsx';
import './index.less';
import CommonBaseModal from '../CommonBaseModal';
import CodeVerifyUI from '../CodeVerifyUI';
import BackHeader from '../BackHeader';
import { useSecondaryMail } from './hooks';
import CustomSvg from '../CustomSvg';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import CommonButton from '../CommonButton';
import { did, setLoading } from '../../utils';

export interface ISetSecondaryMailboxProps {
  onBack: () => void;
}
export default function SetSecondaryMailboxMain({ onBack }: ISetSecondaryMailboxProps) {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isEditable, setIsEditable] = useState(false);
  const [codeVerifyVisible, setCodeVerifyVisible] = useState(false);

  const { uiRef, onCodeChange, onReSend, onCodeFinish, handleBackView, triggerVerifyCode, codeError, code, setCode } =
    useSecondaryMail(() => {
      setCodeVerifyVisible(false);
      setIsEditable(false);
    });

  const getSecondaryMail = useCallback(async () => {
    try {
      setLoading(true);
      const { secondaryEmail } = (await did.services.common.getSecondaryMail()) || {};
      setEmail(secondaryEmail);
      setIsEditable(secondaryEmail === '');
      return true;
    } catch (e) {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setEmailError(undefined);
  };

  const onEmailClick = async () => {
    if (isEditable) {
      const emailRegex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g);
      if (!email || !emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }

      await triggerVerifyCode(email);
      setCodeVerifyVisible(true);
    } else {
      setIsEditable(true);
    }
  };

  useEffect(() => {
    getSecondaryMail();
  }, [getSecondaryMail]);

  return (
    <div className="portkey-ui-set-secondary-mail-wrapper">
      <div className="secondary-mail-nav">
        <div className="left-icon" onClick={onBack}>
          <CustomSvg type="ArrowLeft" fillColor="var(--sds-color-icon-default-default)" />
        </div>
        <div className="secondary-mail-header">{isEditable ? 'Set up Backup Mailbox' : 'Details'}</div>
      </div>

      <div className="secondary-mail-content">
        <div className="secondary-mail-title">
          <span className="title">{isEditable ? 'Add a backup email address' : 'Backup email'}</span>
          {isEditable ? (
            <>
              <div
                className={clsx('input-container', {
                  error: emailError,
                })}>
                <input className="input" value={email || ''} onChange={onInputChange} />
                {email && (
                  <CustomSvg
                    onClick={() => {
                      setEmail('');
                      setEmailError(undefined);
                    }}
                    className="close-icon"
                    type="Close2"
                    fillColor="var(--portkey-ui-text-primary)"
                  />
                )}
              </div>
              {emailError && <span className="error">{emailError}</span>}
            </>
          ) : (
            <div className="secondary-mail-display">
              <div className="mail-icon-wrapper">
                <CustomSvg type="EmailIcon" fillColor="var(--sds-color-icon-brand-on-brand)" />
              </div>
              <span>{email}</span>
            </div>
          )}
        </div>
        <div className="secondary-mail-tip">
          <CustomSvg type="InfoFilled" className="info-icon" fillColor="var(--sds-color-border-brand-tertiary)" />
          <span>
            Notifications for authorizing or signing transactions will be sent to your guardian&apos;s email. If
            unavailable, they&apos;ll go to your backup email.
          </span>
        </div>
        <div className="secondary-mail-footer">
          <CommonButton className="item-button" type="primary" onClick={onEmailClick} disabled={email === ''}>
            {isEditable ? 'Verify email' : 'Edit'}
          </CommonButton>
        </div>
      </div>
      <CommonBaseModal
        open={codeVerifyVisible}
        onClose={handleBackView}
        destroyOnClose
        className="verifier-page-wrapper">
        <BackHeader
          onBack={() => {
            setCodeVerifyVisible(false);
            setCode('');
          }}
        />
        <CodeVerifyUI
          ref={uiRef}
          code={code}
          error={codeError}
          isCountdownNow={true}
          guardianIdentifier={email}
          onCodeChange={onCodeChange}
          onReSend={() => {
            onReSend(email);
          }}
          onCodeFinish={(code: string) => {
            onCodeFinish(code, email);
          }}
        />
      </CommonBaseModal>
    </div>
  );
}
