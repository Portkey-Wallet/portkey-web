import { AccountType, AccountTypeEnum, AccountTypeKeyEnum } from '@portkey/services';
import svgsList from '../assets/svgs';
import { TotalAccountType } from '../types';

export type TAccountType = AccountType;

// Hide Twitter and Facebook logins for now
// export const SocialLoginList: string[] = ['Google', 'Telegram', 'Apple', 'Twitter', 'Facebook'];
export const SocialLoginList: string[] = ['Google', 'Telegram', 'Apple'];

export const Web2LoginList: string[] = ['Email'];

export const AccountLoginList = [...SocialLoginList, ...Web2LoginList] as TotalAccountType[];

export const AccountGuardianList = [...Web2LoginList, ...SocialLoginList] as TotalAccountType[];

export const TotalAccountTypeList: Array<TotalAccountType> = [...AccountLoginList, 'Scan'];

export const guardiansExceedTip =
  'The number of guardians has reached the maximum limit. Please delete some before trying to add new ones.';

export const verifierUsedTip = 'Used verifiers cannot be selected.';

export const guardianAccountExistTip = 'This account already exists. Please use others.';

export const verifierExistTip = 'This verifier has already been used. Please select from others.';

export const MaxVerifierNumber = 100;

export const OfficialWebsite = 'https://portkey.finance/entry';
export const KEY_SHOW_WARNING = 'KEY_SHOW_WARNING';
export const SHOW_WARNING_DIALOG = '1';

type AddGuardiansType = {
  value: string;
  label: string;
  icon: keyof typeof svgsList;
  id: AccountTypeEnum;
};

export const AddGuardiansType: Record<AccountType, AddGuardiansType> = {
  Email: {
    value: AccountTypeKeyEnum.Email,
    label: AccountTypeKeyEnum.Email,
    icon: 'Email',
    id: AccountTypeEnum.Email,
  },
  Phone: {
    value: AccountTypeKeyEnum.Phone,
    label: AccountTypeKeyEnum.Phone,
    icon: 'Phone',
    id: AccountTypeEnum.Phone,
  },
  Google: {
    value: AccountTypeKeyEnum.Google,
    label: AccountTypeKeyEnum.Google,
    icon: 'Google',
    id: AccountTypeEnum.Google,
  },
  Apple: {
    value: AccountTypeKeyEnum.Apple,
    label: AccountTypeKeyEnum.Apple,
    icon: 'Apple',
    id: AccountTypeEnum.Apple,
  },
  Telegram: {
    value: AccountTypeKeyEnum.Telegram,
    label: AccountTypeKeyEnum.Telegram,
    icon: 'Telegram',
    id: AccountTypeEnum.Telegram,
  },
  Facebook: {
    value: AccountTypeKeyEnum.Facebook,
    label: AccountTypeKeyEnum.Facebook,
    icon: 'Facebook',
    id: AccountTypeEnum.Facebook,
  },
  Twitter: {
    value: AccountTypeKeyEnum.Twitter,
    label: AccountTypeKeyEnum.Twitter,
    icon: 'Twitter',
    id: AccountTypeEnum.Twitter,
  },
};

export const guardianIconMap: Record<AccountType, any> = {
  Email: 'Email',
  Phone: 'Phone',
  Google: 'Google',
  Apple: 'Apple',
  Telegram: 'Telegram',
  Facebook: 'Facebook',
  Twitter: 'Twitter',
};
