import { useMemo, useState } from 'react';
import './index.less';

interface TokenChainImageDisplayProps {
  tokenSrc?: string;
  chainSrc?: string;
  chainCount?: number;
  symbol?: string;
}

export default function TokenImageDisplay({
  tokenSrc,
  chainSrc,
  chainCount,
  symbol = 'ELF',
}: TokenChainImageDisplayProps) {
  const [isError, setError] = useState<boolean>(false);
  const isShowDefault = useMemo(() => isError || !tokenSrc, [isError, tokenSrc]);
  return (
    <div className="portkey-ui-token-img-loading-wrapper portkey-ui-token-logo portkey-ui-flex-center">
      {isShowDefault ? (
        <div className="portkey-ui-show-name-index portkey-ui-flex-center token-image">{symbol?.slice(0, 1)}</div>
      ) : (
        <img
          key={tokenSrc}
          className="token-image"
          src={tokenSrc}
          onLoad={(e) => {
            setError(false);
            if (!(e.target as any).src.includes('brokenImg')) {
              (e.target as HTMLElement).className = 'portkey-ui-show-image';
            }
          }}
          onError={() => {
            setError(true);
          }}
        />
      )}
      {chainSrc ? (
        <img key={chainSrc} className="chain-image" src={chainSrc} />
      ) : (
        <div className="portkey-ui-flex-center chain-count">{chainCount}</div>
      )}
    </div>
  );
}
