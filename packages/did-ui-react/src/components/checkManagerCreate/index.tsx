import { aelf } from '@portkey/accounts';
import { TipsLevelEnum, did, handlerErrorTipLevel, isEmpty } from '../../utils';

export function checkManagerCreate<T extends Function>(Func: T, tipsLevel: `${TipsLevelEnum}` = 'returnError') {
  if (!did.didWallet.managementAccount) {
    const tip = handlerErrorTipLevel(
      `Management information not detected, please "did.create" before using this component '${Func.name || ''}'`,
      tipsLevel,
    );
    if (tip) return tip;
  }
  return Func;
}

export function getManagementAccount() {
  if (!isEmpty(did.didWallet.caInfo))
    console.warn('Portkey wallet information already exists, please clear the cache and log in to register.');
  if (!did.didWallet.managementAccount) did.create();
  return did.didWallet.managementAccount as aelf.WalletAccount;
}
