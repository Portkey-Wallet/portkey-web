import {
  handleVerificationDoc,
  parseJWTToken,
  parseZKProof,
  ZKLoginInfoInContract,
  ZKLoginInfoNoncePayload,
} from '@portkey/did-ui-react';
import { GuardiansApproved, ZKLoginInfo } from '@portkey/services';

export const getGuardiansApprovedByApprove = (guardiansApprove: GuardiansApproved[]) => {
  return guardiansApprove.map(item => {
    let identifierHash = '';
    if (item.zkLoginInfo) {
      identifierHash = item.zkLoginInfo.identifierHash;
    } else if (item.verificationDoc) {
      const { guardianIdentifier } = handleVerificationDoc(item.verificationDoc);
      identifierHash = guardianIdentifier;
    }
    const verificationDoc = item?.verificationDoc || '';
    const signature = item?.signature ? Object.values(Buffer.from(item?.signature as any, 'hex')) : [];
    if (identifierHash === '') {
      throw new Error('identifierHash is empty');
    }
    return {
      identifierHash,
      type: item.type,
      verificationInfo: {
        id: item.verifierId,
        signature,
        verificationDoc,
      },
      zkLoginInfo: handleZKLoginInfo(item?.zkLoginInfo),
    };
  });
};

export function handleZKLoginInfo(zkLoginInfo?: ZKLoginInfo) {
  if (zkLoginInfo) {
    const {
      identifierHash,
      salt,
      zkProof,
      jwt,
      nonce,
      circuitId,
      poseidonIdentifierHash,
      identifierHashType,
      timestamp,
      managerAddress,
    } = zkLoginInfo;
    const { kid, issuer } = parseJWTToken(jwt);
    const zkProofInfo = parseZKProof(zkProof);
    const noncePayload: ZKLoginInfoNoncePayload = {
      addManagerAddress: {
        timestamp: { seconds: timestamp },
        managerAddress,
      },
    };
    return {
      identifierHash,
      salt,
      zkProof,
      kid,
      issuer,
      nonce,
      circuitId,
      zkProofInfo,
      noncePayload,
      poseidonIdentifierHash,
      identifierHashType,
    } as ZKLoginInfoInContract;
  }
  return {} as ZKLoginInfoInContract;
}
