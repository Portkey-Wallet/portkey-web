import clsx from 'clsx';
import { CSSProperties } from 'react';
import svgsList from '../../assets/svgs';
import './index.less';

export interface CustomSvgProps {
  type: keyof typeof svgsList;
  className?: string;
  fillColor?: string;
  style?: CSSProperties;
  onClick?: () => void;
}
export default function CustomSvg({ type, className, fillColor, ...props }: CustomSvgProps) {
  let svgContent = svgsList[type];
  if (fillColor && type !== 'Google') {
    // 使用正则表达式替换 fill 属性
    svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${fillColor}"`);
  }
  return (
    <div
      className={clsx('portkey-ui-custom-svg', `${type.toLocaleLowerCase()}-icon`, className)}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}></div>
  );
}
export type CustomSvgType = keyof typeof svgsList;
