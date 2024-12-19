import React, { useState } from 'react';

import './index.less';

interface IChainTokenIconProps {
  imageUrl: string;
  symbol: string;
  chainImageUrl: string;
  showSymbol?: boolean;
}

const ChainTokenIcon = ({ showSymbol = false, symbol, imageUrl, chainImageUrl }: IChainTokenIconProps) => {
  const [isError, setError] = useState<boolean>(false);

  return (
    <div className="chain-icon-token">
      {isError ? (
        <>
          <div className="unknown-token">{symbol?.slice(0, 1).toUpperCase()}</div>
          {showSymbol && <span className="symbol">{symbol}</span>}
        </>
      ) : (
        <>
          <div className="token-image-wrapper">
            <img
              className="token-image"
              src={imageUrl}
              onLoad={() => {
                setError(false);
              }}
              onError={() => {
                setError(true);
              }}
            />
            <img className="chain-image" src={chainImageUrl} />
          </div>
          {showSymbol && <span className="symbol">{symbol}</span>}
        </>
      )}
    </div>
  );
};

export default ChainTokenIcon;
