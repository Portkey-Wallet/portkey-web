import { localConfigProvider } from './LocalConfig';
import BaseConfigProvider from './BaseConfigProvider';

const ConfigProvider = localConfigProvider;

export const PortkeyProvider = BaseConfigProvider;
export default ConfigProvider;
