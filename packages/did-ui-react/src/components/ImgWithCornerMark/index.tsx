import { useMemo, useState } from 'react';
import CustomSvg from '../CustomSvg';
import svgsList from '../../assets/svgs';
import './index.less';

export interface IImgWithCornerMark {
  mainImgSrc?: string;
  mainImgTitle?: string;
  cornerImgSrc: string | keyof typeof svgsList;
}

export const ImgWithCornerMark = ({ mainImgSrc, mainImgTitle, cornerImgSrc }: IImgWithCornerMark) => {
  const [mainImgErr, setMainImgErr] = useState(false);

  const MainDom = useMemo(() => {
    return !mainImgErr && mainImgSrc ? (
      <img src={cornerImgSrc || ''} className="inner-dom" onError={() => setMainImgErr(true)} />
    ) : (
      <div className="inner-dom">{mainImgTitle?.[0]}</div>
    );
  }, [cornerImgSrc, mainImgErr, mainImgSrc, mainImgTitle]);

  const CornerDom = useMemo(() => {
    const isOnlineResources = cornerImgSrc.includes('.');

    return isOnlineResources ? (
      <img src={cornerImgSrc || ''} />
    ) : (
      <CustomSvg type={cornerImgSrc as keyof typeof svgsList} className="custom-svg" />
    );
  }, [cornerImgSrc]);

  return (
    <div className="img-with-mask-wrap">
      <div className="main-icon-wrap">{MainDom}</div>
      <div className="corner-icon-wrap">{CornerDom}</div>
    </div>
  );
};

export default ImgWithCornerMark;
