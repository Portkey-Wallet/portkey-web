import clsx from 'clsx';
import SeedBadge, { TSeedBadgeProps } from './components/SeedBadge';
import './index.less';

export type TNFTImageProps = TSeedBadgeProps & {
  className?: string;
  seedBadgeClassName?: string;
  name?: string;
  imageUrl?: string;
  objectFit?: React.CSSProperties['objectFit'];
  children?: React.ReactNode;
  onClick?: () => void;
};

export default function NFTImage({
  className,
  seedBadgeClassName,
  name,
  imageUrl,
  objectFit,
  isSeed,
  seedType,
  children,
  onClick,
}: TNFTImageProps) {
  return (
    <div className={clsx('portkey-ui-nft-image', className)} onClick={onClick}>
      {imageUrl ? (
        <div className="portkey-ui-relative portkey-ui-nft-image-self-wrapper">
          <img src={imageUrl} className="portkey-ui-nft-image-self" style={{ objectFit: objectFit }} />
          <SeedBadge className={seedBadgeClassName} isSeed={isSeed} seedType={seedType} />
        </div>
      ) : (
        name?.slice(0, 1)
      )}
      {children}
    </div>
  );
}
