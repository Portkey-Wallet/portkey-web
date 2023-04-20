import { localConfigProvider } from './LocalConfig';
import _BaseConfigProvider from './BaseConfigProvider';

const ConfigProvider = localConfigProvider;

export const BaseConfigProvider = _BaseConfigProvider;
export default ConfigProvider;
