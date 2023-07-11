import type { ConfigProviderProps } from 'antd/lib/config-provider';
import ScreenLoading from '../ScreenLoading';
import ReCaptchaModal from '../ReCaptchaModal';

export default function BaseConfigProvider({ children }: { children: ConfigProviderProps['children'] }) {
  return (
    <>
      <div>
        {children}
        <ScreenLoading />
        <ReCaptchaModal />
      </div>
    </>
  );
}
