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
  Google: { type: 'Google', name: 'Google', icon: 'GoogleIcon' },
  Apple: { type: 'Apple', name: 'Apple', icon: 'AppleIcon' },
  Telegram: { type: 'Telegram', name: 'Telegram', icon: 'TelegramIcon' },
};

export const Web2AccountsInfo: Record<IWeb2Login, IAccountItem> = {
  Email: { type: 'Email', name: 'Email', icon: 'EmailIcon' },
  Phone: { type: 'Phone', name: 'Phone', icon: 'PhoneIcon' },
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

export const TotalAccountTypeList: Array<TotalAccountType> = ['Google', 'Apple', 'Telegram', 'Email', 'Phone', 'Scan'];
