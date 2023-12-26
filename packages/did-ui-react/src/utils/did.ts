import { did as _did } from '@portkey-v1/did';
import { RefreshTokenConfig } from '@portkey-v1/services';
import { ChainId } from '@portkey-v1/types';

export const did = _did;

export const queryAuthorization = async (config: RefreshTokenConfig) => {
  const { access_token } = await did.connectServices.getConnectToken(config);
  return `Bearer ${access_token}`;
};

export const getConnectToken = ({ originChainId }: { originChainId: ChainId }) => {
  if (!did.didWallet.managementAccount) throw 'ManagementAccount is not exist';
  const caHash = did.didWallet.caInfo['originChainId']['caHash'];
  const managementAccount = did.didWallet.managementAccount;
  const timestamp = Date.now();
  const message = Buffer.from(`${managementAccount.address}-${timestamp}`).toString('hex');
  const signature = managementAccount.sign(message).toString('hex');
  const pubkey = managementAccount.wallet.keyPair.getPublic('hex');
  const config = {
    grant_type: 'signature',
    client_id: 'CAServer_App',
    scope: 'CAServer',
    signature: signature,
    pubkey,
    timestamp,
    ca_hash: caHash,
    chain_id: originChainId,
  };

  return queryAuthorization(config);
};

const DAY = 24 * 60 * 60 * 1000;

export const isValidRefreshTokenConfig = (config: RefreshTokenConfig) => {
  const expireTime = config.timestamp + 1 * DAY;
  return expireTime >= Date.now();
};
