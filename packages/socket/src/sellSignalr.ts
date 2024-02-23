import { BaseSignalr } from './signalr';
import { AchTxAddressReceivedType, NFTOrderChangedData, RequestOrderTransferredType } from './types/sell';

export class SignalrSell extends BaseSignalr {
  public requestAchTxAddress(clientId: string, orderId: string) {
    console.log('invoke RequestAchTxAddress', clientId, orderId);
    return this.invoke('RequestAchTxAddress', {
      TargetClientId: clientId,
      OrderId: orderId,
    });
  }

  public onAchTxAddressReceived(
    { orderId }: { clientId: string; orderId: string },
    callback: (data: AchTxAddressReceivedType | null) => void,
  ) {
    return this.listen('onAchTxAddressReceived', (data: { body: AchTxAddressReceivedType }) => {
      if (data?.body?.orderId === orderId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }

  public requestOrderTransferred(clientId: string, orderId: string) {
    console.log('invoke RequestOrderTransferred', clientId, orderId);
    return this.invoke('RequestOrderTransferred', {
      TargetClientId: clientId,
      OrderId: orderId,
    });
  }

  public onRequestOrderTransferred(
    { orderId }: { clientId: string; orderId: string },
    callback: (data: RequestOrderTransferredType | null) => void,
  ) {
    return this.listen('onOrderTransferredReceived', (data: { body: RequestOrderTransferredType }) => {
      if (data?.body?.orderId === orderId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }

  public requestNFTOrderStatus(clientId: string, orderId: string) {
    console.log('invoke RequestNFTOrderStatus', clientId, orderId);

    return this.invoke('RequestNFTOrderStatus', {
      targetClientId: clientId,
      orderId: orderId,
    });
  }

  public OnNFTOrderChanged(
    { orderId }: { clientId: string; orderId: string },
    callback: (data: NFTOrderChangedData | null) => void,
  ) {
    return this.listen('OnNFTOrderChanged', (data: { body: NFTOrderChangedData }) => {
      console.log('OnNFTOrderChanged:', data, orderId);
      if (data?.body?.orderId === orderId) {
        callback(data.body);
      } else {
        callback(null);
      }
    });
  }
}

export const sellListenList = ['onAchTxAddressReceived', 'onOrderTransferredReceived', 'OnNFTOrderChanged'] as const;

export const signalrSell = new SignalrSell({
  listenList: sellListenList,
}) as BaseSignalr<typeof sellListenList> & SignalrSell;
