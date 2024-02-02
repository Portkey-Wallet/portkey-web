import { ISocialLogin, TotalAccountType, IWeb2Login } from '../types';
import svgsList from '../assets/svgs';
import { AccountType } from '@portkey/services';

export const PORTKEY_SOCIAL_LOGIN_URL = 'portkey.did://';

type IAccountItem = {
  type: TotalAccountType;
  name: string;
  icon: keyof typeof svgsList;
};

export const SocialAccountsInfo: Record<ISocialLogin, IAccountItem> = {
  Google: { type: 'Google', name: 'Google', icon: 'Google' },
  Apple: { type: 'Apple', name: 'Apple', icon: 'Apple' },
  Telegram: { type: 'Telegram', name: 'Telegram', icon: 'Telegram' },
  Facebook: { type: 'Facebook', name: 'Facebook', icon: 'Facebook' },
  Twitter: { type: 'Twitter', name: 'Twitter', icon: 'Twitter' },
};

export const Web2AccountsInfo: Record<IWeb2Login, IAccountItem> = {
  Email: { type: 'Email', name: 'Email', icon: 'Email' },
  Phone: { type: 'Phone', name: 'Phone', icon: 'Phone' },
};

export const AccountsInfo: Record<AccountType, IAccountItem> = {
  ...SocialAccountsInfo,
  ...Web2AccountsInfo,
};

export const TotalAccountsInfo: Record<TotalAccountType, IAccountItem> = {
  ...SocialAccountsInfo,
  ...Web2AccountsInfo,
  Scan: { type: 'Scan', name: 'Scan', icon: 'QRCodeIcon' },
};
