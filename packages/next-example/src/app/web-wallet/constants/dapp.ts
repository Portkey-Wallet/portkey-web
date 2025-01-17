export enum ApproveMethod {
  token = 'Approve',
  ca = 'ManagerApprove',
}

export const CA_METHOD_WHITELIST = ['ManagerForwardCall', 'ManagerTransfer', ApproveMethod.ca];
