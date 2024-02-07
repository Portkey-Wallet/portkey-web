import CustomSvg from '../../../CustomSvg';

interface IExchangeRateProps {
  showRateText: string;
  rateUpdateTime: number;
}

export default function ExchangeRate({ showRateText, rateUpdateTime }: IExchangeRateProps) {
  return (
    <div className="portkey-ui-exchange-rate portkey-ui-flex-between-center">
      <div>{showRateText}</div>
      <div className="portkey-ui-exchange-rate-timer portkey-ui-flex-center">
        <CustomSvg type="Timer" />
        <div className="portkey-ui-exchange-rate-timestamp">{rateUpdateTime}s</div>
      </div>
    </div>
  );
}
