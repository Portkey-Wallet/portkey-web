export const PortkeyUIError = {
  sandboxIdRequired: "The current platform is chrome extension, 'sandboxId' is  required",
  noDid: "Please configure 'requestDefaults' with 'ConfigProvider.requestDefaults'",
  noChainInfo: "ChainInfo is not obtained, please check whether 'requestDefaults' is configured",
  getChainError: 'Unable to get chain information',
  missStorage: 'Please configure Storage',
  notSupport: 'Not support',
};

export enum WarningKey {
  INVALID_ADDRESS = 'invalid_address',
  STRANGE_ADDRESS = 'strange_address',
  CROSS_CHAIN = 'cross_chain',
  DAPP_CHAIN_TO_NO_AFFIX_ADDRESS_ELF = 'dapp_chain_to_no_affix_address_elf',
  MAIN_CHAIN_TO_NO_AFFIX_ADDRESS_ELF = 'main_chain_to_no_affix_address_elf',
  SAME_ADDRESS = 'same_address',
  MAKE_SURE_SUPPORT_PLATFORM = 'make_sure_support_platform',
}

// error style
export const Warning1Arr: WarningKey[] = [WarningKey.INVALID_ADDRESS, WarningKey.SAME_ADDRESS];
