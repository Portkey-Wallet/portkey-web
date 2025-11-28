export const PromptRouteTypes = {
  UNLOCK_WALLET: 'UNLOCK_WALLET',
  BLANK_PAGE: 'BLANK_PAGE',
  REGISTER_WALLET: 'REGISTER_WALLET',
  REGISTER_START_WALLET: 'REGISTER_START_WALLET',
  GET_SIGNATURE: 'GET_SIGNATURE',
  PERMISSION_CONTROLLER: 'PERMISSION_CONTROLLER',
  SWITCH_CHAIN: 'SWITCH_CHAIN',
  CONNECT_WALLET: 'CONNECT_WALLET',
  SEND_TRANSACTION: 'SEND_TRANSACTION',
  EXPAND_FULL_SCREEN: 'EXPAND_FULL_SCREEN',
  AUTO_EXECUTE_TX: 'AUTO_EXECUTE_TX',
  ALLOWANCE_APPROVE: 'ALLOWANCE_APPROVE',
  WALLET_SECURITY_APPROVE: 'WALLET_SECURITY_APPROVE',

  // my
  SETTING: 'SETTING',

  // guardians
  ADD_GUARDIANS: 'ADD_GUARDIANS',
  GUARDIANS_VIEW: 'GUARDIANS_VIEW',
  GUARDIANS_APPROVAL: 'GUARDIANS_APPROVAL',
  GUARDIANS_APPROVAL_PAYMENT_SECURITY: 'GUARDIANS_APPROVAL_PAYMENT_SECURITY',

  SEND: 'SEND',
  RAMP: 'RAMP',

  // crypto gift
  CRYPTO_GIFT: 'CRYPTO_GIFT',
} as const;

export const PageRoutMap: { [x in keyof typeof PromptRouteTypes]?: string } = {
  // SET_PERMISSION: '#/',
  // SET_CONTRACT_PERMISSION: '#/',
  // LOGIN: '#/loginkeypairs',
  // CALL_AELF_CONTRACT: '#/examine-approve',
  // CROSS_SEND: '#/confirmation-cross',
  // CROSS_RECEIVE: '#/confirmation-cross',
  // GET_SIGNATURE: '#/signature',
  [PromptRouteTypes.UNLOCK_WALLET]: '#/unlock',
  [PromptRouteTypes.REGISTER_WALLET]: '#/register',
  [PromptRouteTypes.REGISTER_START_WALLET]: '#/register',
  [PromptRouteTypes.PERMISSION_CONTROLLER]: '#/permission',
  [PromptRouteTypes.SWITCH_CHAIN]: '#/switch-chain',
  [PromptRouteTypes.BLANK_PAGE]: '#/query-page',
  [PromptRouteTypes.CONNECT_WALLET]: '#/connect-wallet',
  [PromptRouteTypes.SEND_TRANSACTION]: '#/send-transactions',
  [PromptRouteTypes.AUTO_EXECUTE_TX]: '#/auto-execute-tx',
  [PromptRouteTypes.GET_SIGNATURE]: '#/get-signature',
  [PromptRouteTypes.EXPAND_FULL_SCREEN]: '#/',
  [PromptRouteTypes.SETTING]: '#/setting',
  [PromptRouteTypes.ADD_GUARDIANS]: '#/setting/guardians/add',
  [PromptRouteTypes.GUARDIANS_VIEW]: '#/setting/guardians/view',
  [PromptRouteTypes.GUARDIANS_APPROVAL]: '#/setting/wallet-security/manage-devices/guardian-approval',
  [PromptRouteTypes.ALLOWANCE_APPROVE]: '#/allowance-approve',
  [PromptRouteTypes.WALLET_SECURITY_APPROVE]: '#/approve-wallet-security',
  [PromptRouteTypes.GUARDIANS_APPROVAL_PAYMENT_SECURITY]:
    '#/setting/wallet-security/payment-security/guardian-approval',
  [PromptRouteTypes.SEND]: '#/send',
  [PromptRouteTypes.RAMP]: '#/buy',
  [PromptRouteTypes.CRYPTO_GIFT]: '#/crypto-gifts/create',
};

export const MethodMessageTypes = {
  GET_WALLET_STATE: 'wallet_getState',
};

export const messageType = Object.assign({}, MethodMessageTypes);

export const PortkeyMessageTypes = {
  // SEED
  SET_SEED: 'SET_SEED',
  GET_SEED: 'GET_SEED',
  CLEAR_SEED: 'CLEAR_SEED',
  // Wallet
  LOCK_WALLET: 'LOCK_WALLET',
  REGISTER_WALLET: 'REGISTER_WALLET',
  REGISTER_START_WALLET: 'REGISTER_START_WALLET',
  LOGIN_WALLET: 'LOGIN_WALLET',
  ACTIVE_LOCK_STATUS: 'ACTIVE_LOCK_STATUS',

  PERMISSION_FINISH: 'PERMISSION_FINISH',

  OPEN_PROMPT: 'OPEN_PROMPT',
  CLOSE_PROMPT: 'CLOSE_PROMPT',

  CHECK_WALLET_STATUS: 'CHECK_WALLET_STATUS',
  EXPAND_FULL_SCREEN: 'EXPAND_FULL_SCREEN',

  OPEN_RECAPTCHA_PAGE: 'OPEN_RECAPTCHA_PAGE',
  SOCIAL_LOGIN: 'SOCIAL_LOGIN',

  SET_BADGE: 'SET_BADGE',

  // FCM
  UN_REGISTER_FCM: 'UN_REGISTER_FCM',
  INIT_FCM_MESSAGE: 'INIT_FCM_MESSAGE',

  // my
  SETTING: 'SETTING',

  // guardians
  ADD_GUARDIANS: 'ADD_GUARDIANS',
  GUARDIANS_VIEW: 'GUARDIANS_VIEW',
  GUARDIANS_APPROVAL: 'GUARDIANS_APPROVAL',
  GUARDIANS_APPROVAL_PAYMENT_SECURITY: 'GUARDIANS_APPROVAL_PAYMENT_SECURITY',

  SEND: 'SEND',
  RAMP: 'RAMP',

  // crypto gift
  CRYPTO_GIFT: 'CRYPTO_GIFT',
} as const;

/**
 * Custom messages to send and be received by the extension
 */
export const EXTENSION_MESSAGES = {
  CONNECTION_READY: 'CONNECTION_READY',
  READY: 'PORTKEY_DID_EXTENSION_READY',
} as const;

export default Object.assign(PortkeyMessageTypes, PromptRouteTypes);
