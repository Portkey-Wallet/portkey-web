import { useMemo } from 'react';
import CustomSvg from '../CustomSvg';
import svgsList from '../../assets/svgs';
import './index.less';

export interface IImgWithCornerMark {
  mainImgTitle?: string;
  imgSrc?: string;
  cornerImgSrc: string | keyof typeof svgsList;
}

export const ImgWithCornerMark = ({ mainImgTitle, imgSrc, cornerImgSrc }: IImgWithCornerMark) => {
  const mainDom = useMemo(() => {
    if (!imgSrc) return <div className="main-img-title">{mainImgTitle?.[0]}</div>;

    return <img className="main-img" src={imgSrc || ''} />;
  }, [imgSrc, mainImgTitle]);

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
      <>{mainDom}</>
      <div className="corner-icon-wrap">{cornerDom}</div>
    </div>
  );
};

export default ImgWithCornerMark;
