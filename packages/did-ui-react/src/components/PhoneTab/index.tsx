import { forwardRef, useCallback, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { ICountryItem, ValidatorHandler } from '../../types';
import { handleErrorMessage, setLoading } from '../../utils';
import PhoneNumberInput from '../PhoneNumberInput';
import { IPhoneCountry } from '../types';
import './index.less';
import clsx from 'clsx';
import useMobile from '../../hooks/useMobile';
import ThrottleButton from '../ThrottleButton';

interface PhoneTabProps {
  className?: string;
  phoneCountry?: IPhoneCountry;
  countryList?: IPhoneCountry['countryList'];
  confirmText: string;
  validate?: ValidatorHandler;
  onFinish?: (phoneNumber: { code: string; phoneNumber: string }) => void;
}

const PhoneTab = forwardRef(({ className, phoneCountry, confirmText, validate, onFinish }: PhoneTabProps, ref) => {
  const [countryCode, setCountryCode] = useState<ICountryItem | undefined>();
  const [error, setError] = useState<string>();
  const validateRef = useRef<PhoneTabProps['validate']>();
  const onFinishRef = useRef<PhoneTabProps['onFinish']>();

  useEffect(() => {
    validateRef.current = validate;
    onFinishRef.current = onFinish;
  });
  const isMobile = useMobile();
  const validatePhone = useCallback((phone?: string) => validateRef.current?.(phone), []);
  console.log(isMobile, 'isMobile===');
  useImperativeHandle(ref, () => ({ validatePhone }));

  const [phoneNumber, setPhoneNumber] = useState<string>('');

  return (
    <div className={clsx('phone-tab-wrapper', className)}>
      <PhoneNumberInput
        areaCodeShowType={isMobile ? 'drawer' : 'modal'}
        iso={countryCode?.iso ?? phoneCountry?.iso}
        countryList={phoneCountry?.countryList}
        phoneNumber={phoneNumber}
        onAreaChange={(v) => {
          setCountryCode(v);
          setError(undefined);
        }}
        onPhoneNumberChange={(v) => {
          setPhoneNumber(v);
          setError(undefined);
        }}
      />
      {error && <span className="error-text">{error}</span>}

      <ThrottleButton
        disabled={!phoneNumber}
        className="login-btn"
        type="primary"
        onClick={async () => {
          try {
            const code = countryCode?.code || phoneCountry?.countryList?.find((v) => v.iso === phoneCountry.iso)?.code;
            if (!code) throw Error('Please select a country code');
            if (!phoneNumber) throw Error('Please enter a phone number');
            await validatePhone(`+${code} ${phoneNumber}`);
            onFinishRef.current?.({
              code,
              phoneNumber,
            });
          } catch (error) {
            setLoading(false);
            const msg = handleErrorMessage(error);
            setError(msg);
          }
        }}>
        {confirmText}
      </ThrottleButton>
    </div>
  );
});

export default PhoneTab;
