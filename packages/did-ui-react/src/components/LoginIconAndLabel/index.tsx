import './index.less';
import CustomSvg from '../CustomSvg';
import { useTranslation } from 'react-i18next';

const LoginIconAndLabel = () => {
  const { t } = useTranslation();
  return (
    <div className="font-medium social-login-title">
      <div className={'title'}>
        <CustomSvg type="Portkey" style={{ width: '48px', height: '48px' }} />
        <span>{t('Log in to Portkey')}</span>
      </div>
      {/* {isLogin && isShowScan && <CustomSvg type="QRCode" onClick={() => switchTypeRef?.current?.('LoginByScan')} />} */}
    </div>
  );
};

export default LoginIconAndLabel;
