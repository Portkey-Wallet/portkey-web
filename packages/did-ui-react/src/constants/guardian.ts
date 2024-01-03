import { AccountType } from '@portkey/services';
export type TAccountType = AccountType;

export const SocialLoginList = ['Google', 'Apple', 'Telegram'];

export const guardiansExceedTip =
  'The number of guardians has reached the maximum limit. Please delete some before trying to add new ones.';

export const verifierUsedTip = 'Used verifiers cannot be selected.';

export const guardianAccountExistTip = 'This account already exists. Please use others.';

export const verifierExistTip = 'This verifier has already been used. Please select from others.';

export const MaxVerifierNumber = 100;
