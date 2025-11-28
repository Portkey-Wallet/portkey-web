import React from 'react';
import './index.less';
import CoinImage from '../CoinImage';

export interface IImgPair {
  imgSrc1: string;
  imgSrc2: string;
  imgSrc1Symbol: string;
  imgSrc2Symbol: string;
}

export const ImgPair: React.FC<IImgPair> = ({ imgSrc1, imgSrc2, imgSrc1Symbol, imgSrc2Symbol }) => {
  return (
    <div className="img-pair-wrap">
      <CoinImage symbol={imgSrc1Symbol} className="img1" src={imgSrc1} width={30} />
      <CoinImage symbol={imgSrc2Symbol} className="img2" src={imgSrc2} width={30} />
    </div>
  );
};

export default ImgPair;
