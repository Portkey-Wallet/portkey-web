import { useMemo, useState } from 'react';
import './index.less';
import { ELF_SYMBOL } from '../../constants/assets';
import CustomSvg from '../CustomSvg';

interface TokenImageDisplayProps {
  src?: string;
  width?: number;
  symbol?: string;
}

export default function TokenImageDisplay({ src, symbol = 'ELF', width = 32 }: TokenImageDisplayProps) {
  const [isError, setError] = useState<boolean>(false);

  const tokenSrc = useMemo(() => src, [src]);

  const isShowDefault = useMemo(() => isError || !tokenSrc, [isError, tokenSrc]);

  return symbol === ELF_SYMBOL ? (
    <CustomSvg
      className="portkey-ui-token-logo portkey-ui-token-logo-elf"
      type="ELF"
      style={{ width, height: width }}
    />
  ) : (
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
