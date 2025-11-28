import * as IconContext from '@ant-design/icons/lib/components/Context';
import type { ValidateMessages } from 'rc-field-form/lib/interface';
import * as React from 'react';
import { merge } from '../utils/set';
import type { RequiredMark } from 'antd/lib/form/Form';
import type { Locale } from 'antd/lib/locale-provider';
import LocaleProvider from 'antd/lib/locale-provider';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from 'antd/lib/locale/default';
import message from '../message';
import notification from '../notification';
import type { Theme } from 'antd/lib/config-provider/context';
import { ConfigContext, ConfigConsumer, ConfigConsumerProps, CSPConfig, DirectionType } from './context';
import { registerTheme } from 'antd/lib/config-provider/cssVariables';
import { RenderEmptyHandler } from 'antd/lib/config-provider/defaultRenderEmpty';
import { DisabledContextProvider } from 'antd/lib/config-provider/DisabledContext';
import type { SizeType } from 'antd/lib/config-provider/SizeContext';
import SizeContext, { SizeContextProvider } from 'antd/lib/config-provider/SizeContext';
import { PORTKEY_ICON_PREFIX_CLS, PORTKEY_PREFIX_CLS } from '../../../constants';
import ValidateMessagesContext from './ValidateMessagesContext';
import useMemo from '../hooks/useMemo';

export { ConfigContext, ConfigConsumer };

export const configConsumerProps = [
  'getTargetContainer',
  'getPopupContainer',
  'rootPrefixCls',
  'getPrefixCls',
  'renderEmpty',
  'csp',
  'autoInsertSpaceInButton',
  'locale',
  'pageHeader',
];

// These props is used by `useContext` directly in sub component
const PASSED_PROPS: Exclude<keyof ConfigConsumerProps, 'rootPrefixCls' | 'getPrefixCls'>[] = [
  'getTargetContainer',
  'getPopupContainer',
  'renderEmpty',
  'pageHeader',
  'input',
  'pagination',
  'form',
];

export interface ConfigProviderProps {
  getTargetContainer?: () => HTMLElement | Window;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  prefixCls?: string;
  iconPrefixCls?: string;
  children?: React.ReactNode;
  renderEmpty?: RenderEmptyHandler;
  csp?: CSPConfig;
  autoInsertSpaceInButton?: boolean;
  form?: {
    validateMessages?: ValidateMessages;
    requiredMark?: RequiredMark;
    colon?: boolean;
  };
  input?: {
    autoComplete?: string;
  };
  pagination?: {
    showSizeChanger?: boolean;
  };
  locale?: Locale;
  pageHeader?: {
    ghost: boolean;
  };
  componentSize?: SizeType;
  componentDisabled?: boolean;
  direction?: DirectionType;
  space?: {
    size?: SizeType | number;
  };
  virtual?: boolean;
  dropdownMatchSelectWidth?: boolean;
}

interface ProviderChildrenProps extends ConfigProviderProps {
  parentContext: ConfigConsumerProps;
  legacyLocale: Locale;
}

export const defaultPrefixCls = PORTKEY_PREFIX_CLS;
export const defaultIconPrefixCls = PORTKEY_ICON_PREFIX_CLS;
let globalPrefixCls: string;
let globalIconPrefixCls: string;

function getGlobalPrefixCls() {
  return globalPrefixCls || defaultPrefixCls;
}

function getGlobalIconPrefixCls() {
  return globalIconPrefixCls || defaultIconPrefixCls;
}

const setGlobalConfig = ({
  prefixCls,
  iconPrefixCls,
  theme,
}: Pick<ConfigProviderProps, 'prefixCls' | 'iconPrefixCls'> & { theme?: Theme }) => {
  if (prefixCls !== undefined) {
    globalPrefixCls = prefixCls;
  }
  if (iconPrefixCls !== undefined) {
    globalIconPrefixCls = iconPrefixCls;
  }

  if (theme) {
    registerTheme(getGlobalPrefixCls(), theme);
  }
};

export const globalConfig = () => ({
  getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => {
    if (customizePrefixCls) return customizePrefixCls;
    return suffixCls ? `${getGlobalPrefixCls()}-${suffixCls}` : getGlobalPrefixCls();
  },
  getIconPrefixCls: getGlobalIconPrefixCls,
  getRootPrefixCls: (rootPrefixCls?: string, customizePrefixCls?: string) => {
    // Customize rootPrefixCls is first priority
    if (rootPrefixCls) {
      return rootPrefixCls;
    }

    // If Global prefixCls provided, use this
    if (globalPrefixCls) {
      return globalPrefixCls;
    }

    // [Legacy] If customize prefixCls provided, we cut it to get the prefixCls
    if (customizePrefixCls && customizePrefixCls.includes('-')) {
      return customizePrefixCls.replace(/^(.*)-[^-]*$/, '$1');
    }

    // Fallback to default prefixCls
    return getGlobalPrefixCls();
  },
});

const ProviderChildren: React.FC<ProviderChildrenProps> = (props) => {
  const {
    children,
    csp,
    autoInsertSpaceInButton,
    form,
    locale,
    componentSize,
    direction,
    space,
    virtual,
    dropdownMatchSelectWidth,
    legacyLocale,
    parentContext,
    iconPrefixCls,
    componentDisabled,
  } = props;

  const getPrefixCls = React.useCallback(
    (suffixCls: string, customizePrefixCls?: string) => {
      const { prefixCls } = props;

      if (customizePrefixCls) return customizePrefixCls;

      const mergedPrefixCls = prefixCls || parentContext.getPrefixCls('');

      return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parentContext.getPrefixCls, props.prefixCls],
  );
  const config = {
    ...parentContext,
    csp,
    autoInsertSpaceInButton,
    locale: locale || legacyLocale,
    direction,
    space,
    virtual,
    dropdownMatchSelectWidth,
    getPrefixCls,
  };

  // Pass the props used by `useContext` directly with child component.
  // These props should merged into `config`.
  PASSED_PROPS.forEach((propName) => {
    const propValue = props[propName];
    if (propValue) {
      (config as any)[propName] = propValue;
    }
  });

  // https://github.com/ant-design/ant-design/issues/27617
  const memoedConfig = useMemo(
    () => config,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    config,
    (prevConfig, currentConfig) => {
      const prevKeys = Object.keys(prevConfig) as Array<keyof typeof config>;
      const currentKeys = Object.keys(currentConfig) as Array<keyof typeof config>;
      return prevKeys.length !== currentKeys.length || prevKeys.some((key) => prevConfig[key] !== currentConfig[key]);
    },
  );

  const memoIconContextValue = React.useMemo(() => ({ prefixCls: iconPrefixCls, csp }), [iconPrefixCls, csp]);

  let childNode = children;

  const validateMessages = React.useMemo(
    () =>
      merge(
        defaultLocale.Form?.defaultValidateMessages || {},
        memoedConfig?.locale?.Form?.defaultValidateMessages || {},
        memoedConfig?.form?.validateMessages || {},
        form?.validateMessages || {},
      ),
    [memoedConfig, form?.validateMessages],
  );

  if (Object.keys(validateMessages).length > 0) {
    childNode = (
      <ValidateMessagesContext.Provider value={validateMessages}>{children}</ValidateMessagesContext.Provider>
    );
  }

  if (locale) {
    childNode = <LocaleProvider locale={locale}>{childNode}</LocaleProvider>;
  }
  if (iconPrefixCls || csp) {
    <IconContext.default.Provider value={memoIconContextValue}>{childNode}</IconContext.default.Provider>;
  }

  if (componentSize) {
    childNode = <SizeContextProvider size={componentSize}>{childNode}</SizeContextProvider>;
  }

  if (componentDisabled !== undefined) {
    childNode = <DisabledContextProvider disabled={componentDisabled}>{childNode}</DisabledContextProvider>;
  }

  return <ConfigContext.Provider value={memoedConfig as ConfigConsumerProps}>{childNode}</ConfigContext.Provider>;
};

const ConfigProvider: React.FC<ConfigProviderProps> & {
  ConfigContext: typeof ConfigContext;
  SizeContext: typeof SizeContext;
  config: typeof setGlobalConfig;
} = (props) => {
  React.useEffect(() => {
    if (props.direction) {
      message.config({
        rtl: props.direction === 'rtl',
      });
      notification.config({
        rtl: props.direction === 'rtl',
      });
    }
  }, [props.direction]);

  return (
    <LocaleReceiver>
      {(_, __, legacyLocale) => (
        <ConfigConsumer>
          {(context) => <ProviderChildren parentContext={context} legacyLocale={legacyLocale} {...props} />}
        </ConfigConsumer>
      )}
    </LocaleReceiver>
  );
};

// eslint-disable-next-line tsdoc/syntax
/** @private internal Usage. do not use in your production */
ConfigProvider.ConfigContext = ConfigContext;
ConfigProvider.SizeContext = SizeContext;
ConfigProvider.config = setGlobalConfig;

export default ConfigProvider;
