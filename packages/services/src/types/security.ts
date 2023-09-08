export interface IWalletBalanceCheckParams {
  caHash: string;
}
export interface IWalletBalanceCheckResponse {
  isSafe: boolean;
}

export interface ISecurityService {
  getWalletBalanceCheck(params: IWalletBalanceCheckParams): Promise<IWalletBalanceCheckResponse>;
}
