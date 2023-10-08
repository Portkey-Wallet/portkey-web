import clsx from 'clsx';
import BackHeaderForPage from '../BackHeaderForPage';
import './index.less';
import MenuItem from '../MenuItem';
import { List } from 'antd-mobile';
import CustomSvg from '../CustomSvg';
import { ELF_SYMBOL } from '../../constants/assets';
import { transNetworkText } from '../../utils/converter';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import LoadingMore from '../LoadingMore';
import { did, handleErrorMessage, setLoading } from '../../utils';
import { message } from 'antd';
import { IPaymentSecurityItem } from '@portkey/services';

export interface IPaymentSecurityProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  networkType: string;
  caHash: string;
  onBack?: () => void;
  onClickItem: (data: IPaymentSecurityItem) => void;
}

export interface ISecurityListResponse {
  data: IPaymentSecurityItem[];
  totalRecordCount: number;
  code?: number;
  message?: string;
}

const MAX_RESULT_COUNT = 20;
const SKIP_COUNT = 0;

export default function PaymentSecurityMain({
  className,
  wrapperStyle,
  networkType,
  caHash,
  onBack,
  onClickItem,
}: IPaymentSecurityProps) {
  const isMainnet = useMemo(() => networkType === 'MAIN', [networkType]);

  const [securityList, setSecurityList] = useState<IPaymentSecurityItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const loadingFlag = useRef(false);

  const getSecurityList = useCallback(async () => {
    try {
      setLoading(true);
      loadingFlag.current = true;

      const res: ISecurityListResponse = await did.services.security.getPaymentSecurityList({
        caHash: caHash || '',
        skipCount: SKIP_COUNT,
        maxResultCount: MAX_RESULT_COUNT,
      });

      res?.data && setSecurityList(res.data);
      res?.totalRecordCount && setTotalCount(res.totalRecordCount);

      setLoading(false);
      loadingFlag.current = false;
    } catch (error) {
      const msg = handleErrorMessage(error, 'get security error');
      message.error(msg);

      setLoading(false);
      loadingFlag.current = false;
    }
  }, [caHash]);

  const loadMoreSecurity = useCallback(async () => {
    if (loadingFlag.current) return;

    loadingFlag.current = true;
    try {
      if (securityList?.length < totalCount) {
        const res: ISecurityListResponse = await did.services.security.getPaymentSecurityList({
          caHash: caHash || '',
          skipCount: securityList?.length,
          maxResultCount: MAX_RESULT_COUNT,
        });
        res?.data && setSecurityList(securityList.concat(res.data));
        res?.totalRecordCount && setTotalCount(res.totalRecordCount);

        loadingFlag.current = false;
      }
    } catch (error) {
      const msg = handleErrorMessage(error, 'get security error');
      message.error(msg);
      loadingFlag.current = false;
    }
  }, [caHash, securityList, totalCount]);

  useEffect(() => {
    getSecurityList();
  }, [getSecurityList]);

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-payment-security-wrapper', className)}>
      <BackHeaderForPage title={`Payment Security`} leftCallBack={onBack} />
      {securityList.length > 0 && (
        <>
          <List className="portkey-ui-payment-security-list">
            {securityList?.map((item, index) => (
              <List.Item
                key={`paymentSecurity_${item.chainId}_${index}`}
                className="portkey-ui-payment-security-item-wrap">
                <MenuItem
                  key={item.chainId + index}
                  icon={
                    <>
                      {item.symbol === ELF_SYMBOL ? (
                        <CustomSvg className="token-logo" type="AelfTestnet" />
                      ) : (
                        <div className="token-logo custom-word-logo">{item.symbol?.slice(0, 1)}</div>
                      )}
                    </>
                  }
                  height={92}
                  onClick={() => onClickItem(item)}>
                  <div className="token-info">
                    <div className="token-symbol">{item.symbol}</div>
                    <div className="token-network">{transNetworkText(item.chainId, isMainnet)}</div>
                  </div>
                </MenuItem>
              </List.Item>
            ))}
          </List>
          <LoadingMore hasMore={securityList?.length < totalCount} loadMore={loadMoreSecurity} className="load-more" />
        </>
      )}
      {!securityList || (securityList?.length === 0 && <div className="no-data-text">{`No asset`}</div>)}
    </div>
  );
}
