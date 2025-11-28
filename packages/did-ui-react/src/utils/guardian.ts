import BigNumber from 'bignumber.js';
import { ZERO } from '../constants/misc';
import {
  GuardianApprovedItem,
  UserGuardianItem,
  UserGuardianStatus,
  VerifyStatus,
  ZKLoginInfoInContract,
  ZKLoginInfoNoncePayload,
} from '../types';
import { VerifierItem } from '@portkey/did';
import { ZKLoginInfo } from '@portkey/services';
import { parseJWTToken, parseZKProof } from './authentication';
import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { zkGuardianType } from '../constants/guardian';

const APPROVAL_COUNT = ZERO.plus(3).div(5);

export function getApprovalCount(length: number) {
  if (length <= 3) return length;
  return APPROVAL_COUNT.times(length).dp(0, BigNumber.ROUND_DOWN).plus(1).toNumber();
}

export function getAlreadyApprovalLength(guardianList: UserGuardianStatus[]) {
  return (
    guardianList?.filter(
      (item) =>
        item?.status === VerifyStatus.Verified ||
        (item?.status === VerifyStatus.Verifying && item.asyncVerifyInfoParams),
    ).length ?? 0
  );
}

export function handleVerificationDoc(verificationDoc: string) {
  const [type, guardianIdentifier, verificationTime, verifierAddress, salt] = verificationDoc.split(',');
  return { type, guardianIdentifier, verificationTime, verifierAddress, salt };
}

export interface VerifierStatusItem extends VerifierItem {
  isUsed?: boolean;
}

export const getVerifierStatusMap = (
  verifierMap: { [x: string]: VerifierItem } = {},
  userGuardiansList: UserGuardianItem[] = [],
  opGuardian?: UserGuardianItem,
) => {
  const verifierStatusMap: { [x: string]: VerifierStatusItem } = {};
  const _userGuardiansList = userGuardiansList.filter((guardian) => guardian.key !== opGuardian?.key);
  Object.values(verifierMap).forEach((verifier) => {
    const isUsed = _userGuardiansList.some((guardian) => guardian.verifier?.id === verifier.id);
    verifierStatusMap[verifier.id] = {
      ...verifier,
      isUsed,
    };
  });
  return verifierStatusMap;
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

export const formatGuardianValue = (approvalInfo?: GuardiansApproved[]) => {
  const guardiansApproved: GuardianApprovedItem[] =
    approvalInfo?.map((item) => {
      if (zkGuardianType.includes(item.type as AccountType)) {
        return {
          type: AccountTypeEnum[item.type as AccountType],
          identifierHash: item?.zkLoginInfo?.identifierHash || item?.identifierHash,
          verificationInfo: {
            id: item.verifierId,
          },
          zkLoginInfo: handleZKLoginInfo(item?.zkLoginInfo),
        };
      }
      return {
        type: AccountTypeEnum[item.type as AccountType],
        identifierHash: item?.identifierHash,
        verificationInfo: {
          id: item.verifierId,
          signature: Object.values(Buffer.from(item?.signature as any, 'hex')) as any,
          verificationDoc: item.verificationDoc,
        },
      };
    }) || [];
  return guardiansApproved;
};
