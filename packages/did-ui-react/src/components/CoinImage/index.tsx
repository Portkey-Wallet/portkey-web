import { useMemo, useState } from 'react';

interface CoinImageProps {
  src?: string;
  width?: number;
  symbol?: string;
}

export default function CoinImage({ src, symbol = 'ELF', width = 32 }: CoinImageProps) {
  const [isError, setError] = useState<boolean>(false);

  const tokenSrc = useMemo(() => src, [src]);

  const isShowDefault = useMemo(() => isError || !tokenSrc, [isError, tokenSrc]);
  return (
    <div
      className="portkey-ui-token-img-loading-wrapper portkey-ui-token-logo portkey-ui-flex-center"
      style={{ width, height: width }}>
      {isShowDefault ? (
        <div className="portkey-ui-show-name-index portkey-ui-flex-center" style={{ width, height: width }}>
          {symbol?.slice(0, 1)}
        </div>
      ) : (
        <img
          key={tokenSrc}
          className="show-image"
          src={tokenSrc}
          style={{ width, height: width }}
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
    </div>
  );
}
