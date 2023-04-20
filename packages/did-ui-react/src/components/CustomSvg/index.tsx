import clsx from 'clsx';
import { CSSProperties } from 'react';
import svgsList from '../../assets/svgs';

export interface CustomSvgProps {
  type: keyof typeof svgsList;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}
export default function CustomSvg({ type, className, ...props }: CustomSvgProps) {
  return (
    <div
      className={clsx('custom-svg', `${type.toLocaleLowerCase()}-icon`, className)}
      dangerouslySetInnerHTML={{ __html: svgsList[type] }}
      {...props}></div>
  );
}
