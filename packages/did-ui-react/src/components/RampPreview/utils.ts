import { TransDirectEnum } from '../../constants/ramp';
import { did } from '../../utils';
import { AchTokenInfoType } from '@portkey/services';

export const getAchToken = async (params: { email: string }) => {
  const rst = await did.rampServices.getAchToken(params);

  if (rst.returnCode !== '0000') {
    throw new Error(rst.returnMsg);
  }
  return rst.data as AchTokenInfoType;
};

export const getAchSignature = async (params: { address: string }) => {
  const rst = await did.rampServices.getAchSignature(params);

  if (rst.returnCode !== '0000' || !rst?.signature) {
    throw new Error(rst.returnMsg);
  }

  return rst.signature as string;
};

export const getRampOrderNo = async (params: { transDirect: TransDirectEnum; merchantName: string }) => {
  const rst = await did.rampServices.getOrderNo(params);

  if (rst.success !== true || !rst?.id) {
    throw new Error(rst.returnMsg);
  }
  return rst.id as string;
};
