import React from 'react';
import './index.less';

export interface IImgPair {
  imgSrc1: string;
  imgSrc2: string;
}

export const ImgPair: React.FC<IImgPair> = ({ imgSrc1, imgSrc2 }) => {
  return (
    <div className="img-pair-wrap">
      <img className="img1" src={imgSrc1 || ''} />
      <img className="img2" src={imgSrc2 || ''} />
    </div>
  );
};

export default ImgPair;
