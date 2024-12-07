import { useEffect, useRef, useState } from 'react';
import PortkeyPasswordInput from '../PortkeyPasswordInput';
import { PASSWORD_LENGTH } from '../../constants/misc';
import BackHeader from '../BackHeader';
import { isMobileWidth, PinErrorMessage } from '../../utils';
import './index.less';
import { AddManagerType } from '../types';
import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import { useTranslation } from 'react-i18next';

enum STEP {
  enterPin = 'enterPin',
  confirmPin = 'confirmPin',
}

export default function SetPinMobileBase({
  type,
  className,
  onCancel,
  onFinish,
}: {
  type: AddManagerType;
  className?: string;
  onCancel?: () => void;
  onFinish?: (pin: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<STEP>(STEP.enterPin);
  const [pin, setPin] = useState<string>();
  const [confirmPin, setConfirmPin] = useState<string>();
  const [error, setError] = useState<string>();
  const isFinishRef = useRef<boolean>(false);
  const [isPad, setPad] = useState(!isMobileWidth());

  useEffect(() => {
    return () => {
      setPin('');
      setConfirmPin('');
      setError('');
      setStep(STEP.enterPin);
    };
  }, []);
  console.log('wfs==== step', step);
  return (
    <div className={clsx('portkey-ui-set-pin-mobile-wrapper', className)}>
      {!isPad ? (
        <>
          {(step !== STEP.enterPin || type !== 'recovery') && (
            <BackHeader
              leftElement={undefined}
              onBack={() => {
                if (step === STEP.confirmPin) {
                  setPin('');
                  setError('');
                  setConfirmPin('');
                  setStep(STEP.enterPin);
                } else {
                  onCancel?.();
                }
              }}
            />
          )}
          <div className="portkey-ui-set-pin-mobile-title">
            {t(step === STEP.confirmPin ? 'Confirm your PIN' : 'Create a PIN to protect your wallet')}
          </div>
        </>
      ) : (
        <>
          {onCancel && (
            <BackHeader
              leftElement={step === STEP.enterPin ? false : undefined}
              onBack={() => {
                if (step === STEP.confirmPin) {
                  setPin('');
                  setError('');
                  setConfirmPin('');
                  setStep(STEP.enterPin);
                } else {
                  onCancel?.();
                }
              }}
              title={
                step === STEP.enterPin ? (
                  <div className="set-pin-title">{t('Create a PIN to protect your wallet')}</div>
                ) : null
              }
              rightElement={
                <CustomSvg
                  type="X"
                  onClick={onCancel}
                  fillColor="black"
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />
              }
            />
          )}
          {step === STEP.confirmPin && (
            <div className="portkey-ui-set-pin-mobile-title">
              {t(step === STEP.confirmPin ? 'Confirm your PIN' : 'Create a PIN to protect your wallet')}
            </div>
          )}
        </>
      )}
      <div>
        {step === STEP.enterPin && (
          <PortkeyPasswordInput
            value={pin}
            length={PASSWORD_LENGTH}
            onChange={setPin}
            onFill={() => {
              setStep(STEP.confirmPin);
            }}
          />
        )}
        {step === STEP.confirmPin && (
          <PortkeyPasswordInput
            error={error}
            value={confirmPin}
            length={PASSWORD_LENGTH}
            onChange={(v) => {
              if (error) setError('');
              setConfirmPin(v);
            }}
            onFill={async (val) => {
              try {
                if (isFinishRef.current) return;
                isFinishRef.current = true;
                if (pin !== val) {
                  setConfirmPin('');
                  return setError(t('Pins do not match'));
                }
                if (!pin) return setError(t(PinErrorMessage.invalidPin));
                await onFinish?.(pin);
                isFinishRef.current = false;
              } finally {
                isFinishRef.current = false;
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
