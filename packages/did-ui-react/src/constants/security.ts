export const SetLimitExplain =
  'Transfers exceeding the limits cannot be conducted unless you modify the limit settings first, which needs guardian approval.';

export const NoLimit = 'No limit for transfer';

export const SingleExceedDaily = 'Cannot exceed the daily limit';

export const ExceedSingleLimit =
  'Maximum limit per transaction exceeded. To proceed with this specific transaction, you may request one-time approval from guardians. Alternatively, you have the option to modify the limit, lifting restrictions on all future transactions.';

export const ExceedDailyLimit =
  'Maximum daily limit exceeded. To proceed with this specific transaction, you may request one-time approval from guardians. Alternatively, you have the option to modify the limit, lifting restrictions on all future transactions.';

export const LimitFormatTip = 'Please enter a positive whole number';

export const SecurityVulnerabilityTitle = 'Upgrade Wallet Security Level';

export const SecurityVulnerabilityTip =
  'You have too few guardians to protect your wallet. Please add at least one more guardian before proceeding.';

export const SecurityAccelerateErrorTip = `Guardian failed to be added. Please wait a while for the addition to complete.`;

export const MAX_TRANSACTION_FEE = 0.1;

export enum LimitType {
  Single = 'Single',
  Daily = 'Daily',
}
