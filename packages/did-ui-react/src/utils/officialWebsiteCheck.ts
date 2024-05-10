import { OfficialWebsite } from '../constants/guardian';
import { ChainId } from '@portkey/types';
import { getCustomNetworkType, getServiceUrl } from '../components/config-provider/utils';
import { OperationTypeEnum } from '@portkey/services';

export default async function officialWebsiteCheck(
  currentGuardians: any,
  originChainId: ChainId,
  operationType: OperationTypeEnum,
  targetChainId?: ChainId,
  symbol?: string,
  amount?: string | number,
  operationDetails?: string,
) {
  return new Promise(async (resolve, reject) => {
    let timer: any = null;
    const onMessage = (event: MessageEvent) => {
      const type = event.data.type;
      if (type === 'PortkeyGuardianApproveSuccess' || type === 'PortkeyGuardianApproveFailure') {
        timer && clearInterval(timer);
      }
      switch (type) {
        case 'PortkeyGuardianApproveSuccess':
          resolve(event.data.data);
          break;
        case 'PortkeyGuardianApproveFailure':
          reject(event.data.error);
          break;
        default:
          return;
      }
      window.removeEventListener('message', onMessage);
    };
    window.addEventListener('message', onMessage);

    const data = {
      currentGuardians,
      originChainId,
      targetChainId,
      symbol,
      amount,
      serviceUrl: getServiceUrl(),
      operationType,
      onlineType: getCustomNetworkType(),
      operationDetails,
    };
    const encodeData = Buffer.from(JSON.stringify(data), 'utf8').toString('base64');
    const windowOpener = window.open(`${OfficialWebsite}?data=${encodeData}`, '_blank');
    console.log('originData===', data);
    console.log('officialWebsite===', `${OfficialWebsite}?data=${encodeData}`);
    timer = setInterval(() => {
      if (windowOpener?.closed) {
        clearInterval(timer);
        reject('User close the prompt');
        timer = null;
      }
    }, 1600);
  });
}
