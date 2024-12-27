import clsx from 'clsx';
import BackHeaderForPage from '../BackHeaderForPage';
import { Radio, RadioChangeEvent } from 'antd';
import { useTranslation } from 'react-i18next';
import { IRampCryptoItem, RampType } from '@portkey/ramp';
import CommonInput from '../CommonInput';
import TokenImageDisplay from '../TokenImageDisplay';
import { useMemo, useState } from 'react';
import './index.less';

export interface IRampHomePureCompProps {
  className?: string;
  page: RampType;
  list: IRampCryptoItem[];
  handlePageChange: (e: RadioChangeEvent) => Promise<void>;
  onBack: () => void;
  onItemClick?: (item: IRampCryptoItem) => void;
}
export default function RampHomePureComponent(props: IRampHomePureCompProps) {
  const { className, page, list, handlePageChange, onBack, onItemClick } = props;
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState<string>('');
  const filterList = useMemo(
    () => list?.filter((item) => item.symbol.toLocaleUpperCase().includes(keyword?.toLocaleUpperCase())),
    [keyword, list],
  );
  return (
    <div className={clsx(['portkey-ui-ramp-frame portkey-ui-flex-column', className])} id="portkey-ui-ramp">
      <BackHeaderForPage
        title={
          <div className="portkey-ui-ramp-radio">
            <Radio.Group defaultValue={RampType.BUY} buttonStyle="solid" value={page} onChange={handlePageChange}>
              <Radio.Button value={RampType.BUY} style={{ cursor: 'pointer' }}>
                {t('Buy')}
              </Radio.Button>
              <Radio.Button value={RampType.SELL} style={{ cursor: 'pointer' }}>
                {t('Sell')}
              </Radio.Button>
            </Radio.Group>
          </div>
        }
        leftCallBack={onBack}
      />
      <div className="portkey-ui-ramp-content portkey-ui-flex-column-center">
        <CommonInput
          type="search"
          placeholder="Search"
          onChange={(e) => {
            const v = e.target.value.trim();
            setKeyword(v);
          }}
        />
        <ul style={{ width: '100%', marginTop: 16 }}>
          {filterList?.map((item, index) => (
            <li
              key={index + '_' + item.symbol}
              className="crypto-list-item"
              onClick={() => {
                onItemClick?.(item);
              }}>
              <TokenImageDisplay src={item.icon} symbol={item.symbol} />
              <span className="crypto-name">{item.symbol}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
