import React, { useState } from 'react';

import './index.less';

interface IAllowanceIconProps {
  imageUrl: string;
  symbol: string;
  chainImageUrl: string;
}

const AllowanceIcon = ({ symbol, imageUrl, chainImageUrl }: IAllowanceIconProps) => {
  const [isError, setError] = useState<boolean>(false);

  return (
    <div className="allowance-icon-token">
      {isError ? (
        <>
          <div className="unknown-token">{symbol?.slice(0, 1).toUpperCase()}</div>
          <span className="symbol">{symbol}</span>
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
          <span className="symbol">{symbol}</span>
        </>
      )}
    </div>
  );
};

export default AllowanceIcon;
