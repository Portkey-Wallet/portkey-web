import { Button } from 'antd';
import { forwardRef, useCallback, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { CountryItem, ValidatorHandler } from '../../types';
import { handleErrorMessage, setLoading } from '../../utils';
import PhoneNumberInput from '../PhoneNumberInput';
import { IPhoneCountry } from '../types';
import './index.less';

interface PhoneTabProps {
  phoneCountry?: IPhoneCountry;
  countryList?: IPhoneCountry['countryList'];
  confirmText: string;
  validate?: ValidatorHandler;
  onFinish?: (phoneNumber: { code: string; phoneNumber: string }) => void;
}

const PhoneTab = forwardRef(({ phoneCountry, confirmText, validate, onFinish }: PhoneTabProps, ref) => {
  const [countryCode, setCountryCode] = useState<CountryItem | undefined>();
  const [error, setError] = useState<string>();
  const validateRef = useRef<PhoneTabProps['validate']>();
  const onFinishRef = useRef<PhoneTabProps['onFinish']>();

  useEffect(() => {
    validateRef.current = validate;
    onFinishRef.current = onFinish;
  });

  const validatePhone = useCallback((phone?: string) => validateRef.current?.(phone), []);

  useImperativeHandle(ref, () => ({ validatePhone }));

  const [phoneNumber, setPhoneNumber] = useState<string>('');

  return (
    <div className="phone-tab-wrapper">
      <PhoneNumberInput
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

      <Button
        disabled={!phoneNumber}
        className="login-btn"
        type="primary"
        onClick={async () => {
          try {
            if (!countryCode?.code) throw Error('Please select a country code');
            if (!phoneNumber) throw Error('Please enter a phone number');
            await validatePhone(`+${countryCode.code} ${phoneNumber}`);
            onFinishRef.current?.({
              code: countryCode.code,
              phoneNumber,
            });
          } catch (error) {
            setLoading(false);
            const msg = handleErrorMessage(error);
            setError(msg);
          }
        }}>
        {confirmText}
      </Button>
    </div>
  );
});

export default PhoneTab;
