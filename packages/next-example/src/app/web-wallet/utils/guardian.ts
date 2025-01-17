import {
  handleVerificationDoc,
  parseJWTToken,
  parseZKProof,
  ZKLoginInfoInContract,
  ZKLoginInfoNoncePayload,
} from '@portkey/did-ui-react';
import { GuardiansApproved, ZKLoginInfo } from '@portkey/services';
import { getContract, getManager } from './wallet';
import { getChain } from './chainInfo';
import { ChainId } from '@portkey/provider-types';
import { formatAddGuardianValue } from '@portkey/did-ui-react/src/components/Guardian/utils/formatAddGuardianValue';

export interface VerifierInfo {
  verifierId: string;
  verificationDoc?: string;
  signature?: string;
  zkLoginInfo?: ZKLoginInfo;
}

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

export function handleVerifierInfo(verifierInfo?: VerifierInfo) {
  if (!verifierInfo) return { identifierHash: '' };
  if (verifierInfo.zkLoginInfo) {
    const identifierHash = verifierInfo.zkLoginInfo.identifierHash;
    return { identifierHash };
  } else if (verifierInfo.verificationDoc) {
    const { guardianIdentifier } = handleVerificationDoc(verifierInfo.verificationDoc);
    return { identifierHash: guardianIdentifier };
  } else {
    return { identifierHash: '' };
  }
}

export const addGuardian = async ({
  targetChainId,
  caHash,
  currentGuardian,
  guardiansApprovedList,
}: {
  targetChainId: ChainId;
  caHash: string;
  currentGuardian: any;
  guardiansApprovedList: any;
}) => {
  const chainInfo = await getChain(targetChainId);
  const manager = await getManager();
  const caContract = await getContract({
    manager,
    rpcUrl: chainInfo.endPoint,
    contractAddress: chainInfo.caContractAddress,
  });

  const { guardianToAdd, guardiansApproved } = formatAddGuardianValue({
    currentGuardian,
    approvalInfo: guardiansApprovedList,
  });

  const res = await caContract?.callSendMethod('AddGuardian', '', {
    caHash,
    guardianToAdd,
    guardiansApproved,
  });
  // TODO: accelerate
  console.log('addGuardian res', res);
  return res?.data?.Status === 'MINED';
};
