import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useSafeAreaPadding } from '../../utils/useSafeAreaPadding';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';

export interface TooltipProps {
  /** The hint. Short text; never anything the user cannot do without. */
  content: ReactNode;
  /** The trigger: one element that takes a ref and spreads props, such as `IconButton`, `Button` or `Badge`. */
  children: ReactElement;
  /** Which side of the trigger the hint opens on; flips when there is no room. Default `top`. */
  side?: TooltipSide | undefined;
  /** Alignment along that side. Default `center`. */
  align?: TooltipAlign | undefined;
  /** Hover delay in ms before opening. Default 300; inside `Tooltip.Provider` sibling tooltips open instantly once one is open. */
  delay?: number | undefined;
  /** Delay in ms before closing. Default 0. */
  closeDelay?: number | undefined;
  /** Controlled open state. */
  open?: boolean | undefined;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Called when the hint opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Never opens. */
  disabled?: boolean | undefined;
  className?: string | undefined;
}

/**
 * A hint that opens on hover and keyboard focus. Supplementary only: touch devices never see it and
 * screen readers hear the trigger's own name, so the trigger must already be labelled.
 */
function TooltipBase({
  content,
  children,
  side = 'top',
  align = 'center',
  delay = 300,
  closeDelay,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  className,
}: TooltipProps) {
  const collisionPadding = useSafeAreaPadding();
  return (
    <BaseTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
      disabled={disabled}
    >
      <BaseTooltip.Trigger render={children} delay={delay} closeDelay={closeDelay} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={collisionPadding}
          className="sc-tooltip__positioner"
        >
          <BaseTooltip.Popup role="tooltip" className={cx('sc-tooltip', className)}>
            <BaseTooltip.Arrow className="sc-tooltip__arrow" />
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

/** Wrap a toolbar or a row of icon buttons so moving between them skips the delay. */
const Provider = BaseTooltip.Provider;

export const Tooltip = Object.assign(TooltipBase, { Provider });
