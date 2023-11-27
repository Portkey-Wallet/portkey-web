import { useEffect, useState } from 'react';
import PortkeyPasswordInput from '../PortkeyPasswordInput';
import { PASSWORD_LENGTH } from '../../constants/misc';
import BackHeader from '../BackHeader';
import { PinErrorMessage } from '../../utils';
import './index.less';
import { AddManagerType } from '../types';

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
  onFinish?: (pin: string) => void;
}) {
  const [step, setStep] = useState<STEP>(STEP.enterPin);
  const [pin, setPin] = useState<string>();
  const [confirmPin, setConfirmPin] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    return () => {
      setPin('');
      setConfirmPin('');
      setError('');
      setStep(STEP.enterPin);
    };
  }, []);

  return (
    <div className={className}>
      <BackHeader
        leftElement={step === STEP.enterPin && type === 'recovery' ? false : undefined}
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

      <div className="portkey-ui-set-pin-mobile-title">
        {step === STEP.confirmPin ? 'Confirm Pin' : 'Enter Pin to protect your device'}
      </div>
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
            onFill={(val) => {
              if (pin !== val) {
                setConfirmPin('');
                return setError('Pins do not match');
              }
              if (!pin) return setError(PinErrorMessage.invalidPin);
              onFinish?.(pin);
            }}
          />
        )}
      </div>
    </div>
  );
}
