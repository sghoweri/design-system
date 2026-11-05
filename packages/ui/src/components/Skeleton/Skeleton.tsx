import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cx } from '../../utils/cx';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps extends ComponentPropsWithRef<'span'> {
  /** `text` (default) is one line of the current font size; `rect` a block; `circle` an avatar. */
  variant?: SkeletonVariant | undefined;
  /** Any CSS length. Default: text `100%`, rect `100%`, circle `40px`. */
  width?: string | number | undefined;
  /** Any CSS length. Default: text `1em` (one line), rect `80px`, circle = `width`. */
  height?: string | number | undefined;
  /** For `text`: how many lines; the last is shorter. Default 1. */
  lines?: number | undefined;
  /** Hides the shimmer. Default `false`; reduced motion hides it anyway. */
  still?: boolean | undefined;
}

/**
 * A placeholder shape shown while real content loads. It is hidden from assistive tech: put
 * `aria-busy="true"` on the region being filled, or a `Spinner` with a label beside it, so the loading
 * state is announced once instead of per block.
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  still = false,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const size: CSSProperties = {
    ...style,
    ...(width !== undefined ? { inlineSize: width } : {}),
    ...(height !== undefined ? { blockSize: height } : {}),
  };
  if (variant === 'text' && lines > 1) {
    return (
      <span className={cx('sc-skeleton-lines', className)} aria-hidden="true" style={style} {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className="sc-skeleton"
            data-variant="text"
            data-still={still || undefined}
            data-last={i === lines - 1 || undefined}
            style={width !== undefined ? { inlineSize: width } : undefined}
          />
        ))}
      </span>
    );
  }
  return (
    <span
      className={cx('sc-skeleton', className)}
      data-variant={variant}
      data-still={still || undefined}
      aria-hidden="true"
      style={size}
      {...rest}
    />
  );
}
