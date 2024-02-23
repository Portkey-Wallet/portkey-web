import type { ValidateMessages } from 'rc-field-form/lib/interface';
import * as React from 'react';
import type { LocaleContextProps } from './context';
import LocaleContext from './context';
import { changeConfirmLocale } from '../antd/modal/locale';

export const ANT_MARK = 'internalMark';

export interface Locale {
  locale: string;
  Pagination?: any;
  DatePicker?: any;
  TimePicker?: Record<string, any>;
  Calendar?: Record<string, any>;
  Table?: any;
  Modal?: any;
  Popconfirm?: any;
  Transfer?: any;
  Select?: Record<string, any>;
  Upload?: any;
  Empty?: any;
  global?: Record<string, any>;
  PageHeader?: { back: string };
  Icon?: Record<string, any>;
  Text?: {
    edit?: any;
    copy?: any;
    copied?: any;
    expand?: any;
  };
  Form?: {
    optional?: string;
    defaultValidateMessages: ValidateMessages;
  };
  Image?: {
    preview: string;
  };
}

export interface LocaleProviderProps {
  locale: Locale;
  children?: React.ReactNode;
}

const LocaleProvider: React.FC<LocaleProviderProps> = (props) => {
  const { locale = {} as Locale, children } = props;

  React.useEffect(() => {
    changeConfirmLocale(locale && locale.Modal);
    return () => {
      changeConfirmLocale();
    };
  }, [locale]);

  const getMemoizedContextValue = React.useMemo<LocaleContextProps>(() => ({ ...locale, exist: true }), [locale]);

  return <LocaleContext.Provider value={getMemoizedContextValue}>{children}</LocaleContext.Provider>;
};

export default LocaleProvider;
