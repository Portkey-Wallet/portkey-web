import { useMemo } from 'react';
import CustomSvg from '../CustomSvg';
import svgsList from '../../assets/svgs';
import './index.less';

export interface IImgWithCornerMark {
  imgSrc: string;
  cornerImgSrc: string | keyof typeof svgsList;
}

export const ImgWithCornerMark = ({ imgSrc, cornerImgSrc }: IImgWithCornerMark) => {
  const cornerDom = useMemo(() => {
    const isOnlineResources = cornerImgSrc.includes('.');

    return isOnlineResources ? (
      <img src={cornerImgSrc || ''} width={20} height={20} />
    ) : (
      <CustomSvg type={cornerImgSrc as keyof typeof svgsList} className="custom-svg" />
    );
  }, [cornerImgSrc]);

  return (
    <div className="img-with-mask-wrap">
      <img className="main-img" src={imgSrc || ''} />
      <div className="corner-icon-wrap">{cornerDom}</div>
    </div>
  );
};

export default ImgWithCornerMark;
