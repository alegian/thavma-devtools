import type {CSSProperties} from 'react';

const assetRoot = `${import.meta.env.BASE_URL}game-icons/`;

interface AspectIconProps {
  iconId: string;
  color: string;
  className?: string;
  label?: string;
}

export function AspectIcon({
  iconId,
  color,
  className = 'size-8',
  label,
}: AspectIconProps) {
  const url = `${assetRoot}${iconId.split('/').map(encodeURIComponent).join('/')}`;
  const style: CSSProperties = {
    backgroundColor: color,
    WebkitMaskImage: `url("${url}")`,
    maskImage: `url("${url}")`,
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
  };
  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
    />
  );
}
