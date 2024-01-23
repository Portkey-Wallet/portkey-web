import { AccountType, AccountTypeEnum, AccountTypeKeyEnum } from '@portkey-v1/services';
import svgsList from '../assets/svgs';

export type TAccountType = AccountType;

export const SocialLoginList: string[] = ['Google', 'Apple'];

export const Web2LoginList: string[] = ['Email', 'Phone'];

export const AccountLoginList = [...SocialLoginList, ...Web2LoginList];

export const guardiansExceedTip =
  'The number of guardians has reached the maximum limit. Please delete some before trying to add new ones.';

export const verifierUsedTip = 'Used verifiers cannot be selected.';

export const guardianAccountExistTip = 'This account already exists. Please use others.';

export const verifierExistTip = 'This verifier has already been used. Please select from others.';

export const MaxVerifierNumber = 100;

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
    icon: 'GuardianPhone',
    id: AccountTypeEnum.Phone,
  },
  Google: {
    value: AccountTypeKeyEnum.Google,
    label: AccountTypeKeyEnum.Google,
    icon: 'GuardianGoogle',
    id: AccountTypeEnum.Google,
  },
  Apple: {
    value: AccountTypeKeyEnum.Apple,
    label: AccountTypeKeyEnum.Apple,
    icon: 'GuardianApple',
    id: AccountTypeEnum.Apple,
  },
  Telegram: {
    value: AccountTypeKeyEnum.Telegram,
    label: AccountTypeKeyEnum.Telegram,
    icon: 'GuardianTelegram',
    id: AccountTypeEnum.Telegram,
  },
};
