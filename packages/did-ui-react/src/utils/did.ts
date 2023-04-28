import { DID } from '@portkey/did';

export let did = new DID();
export const getNewDid = () => {
  did = new DID();
};
