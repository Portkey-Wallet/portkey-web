import CustomSvg from '../../../CustomSvg';
import './index.less';

export default function SupportedExchange() {
  return (
    <div className="support-exchange-wrap">
      <CustomSvg type={'Info1'} className="warning" />
      <div className="text">Supported exchanges</div>
      <CustomSvg type="ExchangesList" className="exchange-list" />
    </div>
  );
}
