import { DID } from '@portkey/did';
import { ChainId } from '@portkey/types';

export let did = new DID();
export const getNewDid = () => {
  did = new DID();
};

export const getConnectToken = async ({ caHash, originChainId }: { caHash: string; originChainId: ChainId }) => {
  if (!did.didWallet.managementAccount) throw 'ManagementAccount is not exist';
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

  const info = await did.connectServices.getConnectToken(config);
  return `Bearer ${info.access_token}`;
};
