import { useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { CircleCheckIcon, CircleXIcon, InfoIcon, WarningIcon, XIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface BannerProps extends ComponentPropsWithRef<'div'> {
  /** Colour and default icon. `warning` and `danger` are announced as alerts; the rest as status. */
  tone?: BannerTone | undefined;
  /** Replaces the tone's icon; `false` removes it. */
  icon?: ReactNode | false | undefined;
  /** One Button, usually `variant="ghost" size="sm"`, at the end of the strip. */
  action?: ReactNode | undefined;
  /** Shows a close button that hides the banner. */
  dismissible?: boolean | undefined;
  /** Called when the close button is pressed. */
  onDismiss?: (() => void) | undefined;
  /** Controlled visibility when dismissible. */
  open?: boolean | undefined;
  /** Accessible name of the close button. Default "Dismiss". */
  dismissLabel?: string | undefined;
}

const toneIcons: Record<BannerTone, ReactNode> = {
  info: <InfoIcon />,
  success: <CircleCheckIcon />,
  warning: <WarningIcon />,
  danger: <CircleXIcon />,
  neutral: null,
};

/** A single-line status strip across the top of a view: paused, offline, "3 new since you looked". */
export function Banner({
  tone = 'info',
  icon,
  action,
  dismissible = false,
  onDismiss,
  open,
  dismissLabel = 'Dismiss',
  role,
  className,
  children,
  ...rest
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const visible = open ?? !dismissed;
  if (!visible) return null;
  const glyph = icon === false ? null : (icon ?? toneIcons[tone]);
  return (
    <div
      role={role ?? (tone === 'warning' || tone === 'danger' ? 'alert' : 'status')}
      className={cx('sc-banner', className)}
      data-tone={tone}
      {...rest}
    >
      {glyph ? (
        <span className="sc-banner__icon" aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      <div className="sc-banner__body">{children}</div>
      {action ? <div className="sc-banner__action">{action}</div> : null}
      {dismissible ? (
        <IconButton
          label={dismissLabel}
          size="sm"
          className="sc-banner__dismiss"
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
        >
          <XIcon />
        </IconButton>
      ) : null}
    </div>
  );
}
