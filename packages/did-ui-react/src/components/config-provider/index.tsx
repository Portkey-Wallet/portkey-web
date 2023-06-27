import { localConfigProvider } from './LocalConfig';
import _BaseConfigProvider from './BaseConfigProvider';

const ConfigProvider = localConfigProvider;

export const PortkeyConfigProvider = _BaseConfigProvider;
export default ConfigProvider;
