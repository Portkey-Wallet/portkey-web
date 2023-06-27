import { ChainId } from '@portkey/types';

export interface IConnectToken {
  access_token: string;
  token_type: string;
  expires_in: string;
}
export interface IConnectService {
  getConnectToken(config: RefreshTokenConfig): Promise<IConnectToken>;
}

export type RefreshTokenConfig = {
  grant_type: string;
  client_id: string;
  scope: string;
  signature: string;
  pubkey: string;
  timestamp: number;
  ca_hash: string;
  chain_id: ChainId;
};
