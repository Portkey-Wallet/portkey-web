import { useTranslation } from 'react-i18next';
import { RegisterType, ValidatorHandler } from '../../types';
import CustomSvg from '../CustomSvg';
import InputInfo, { InputInfoProps } from '../InputInfo';
import type { IPhoneCountry } from '../types';
import './index.less';

export default function InputLogin({
  type,
  phoneCountry,
  onBack,
  onFinish,
  validateEmail,
  validatePhone,
}: {
  type: RegisterType;
  phoneCountry?: IPhoneCountry;
  onBack?: () => void;
  onFinish?: InputInfoProps['onFinish'];
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
}) {
  const { t } = useTranslation();

  return (
    <div className="login-content">
      <h1 className="portkey-ui-flex-between-center login-title">
        <CustomSvg type="BackLeft" onClick={onBack} />
        <span>{t(type)}</span>
        <span className="empty"></span>
      </h1>
      <InputInfo
        phoneCountry={phoneCountry}
        validatePhone={validatePhone}
        validateEmail={validateEmail}
        confirmText={t(type)}
        onFinish={onFinish}
      />
    </div>
  );
}
