import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { XIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverRootProps {
  /** Controlled open state. */
  open?: boolean | undefined;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Called when the popover opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Default `true` (2026-11-11): the page doesn't scroll and focus stays in the popover until it closes, so an anchored
   * panel never drifts away from its trigger on a phone. `false` for a popover that opens on hover or must let the page
   * keep scrolling.
   */
  modal?: boolean | undefined;
  children?: ReactNode | undefined;
}

/** Owns the open state. Wrap a `Popover.Trigger` and a `Popover.Content`. */
function Root({ open, defaultOpen, onOpenChange, modal = true, children }: PopoverRootProps) {
  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
      modal={modal}
    >
      {children}
    </BasePopover.Root>
  );
}

export interface PopoverTriggerProps extends Omit<BasePopover.Trigger.Props, 'className'> {
  className?: string | undefined;
}

/**
 * Opens the popover. With no `render` it is a secondary Button; pass any Button or IconButton through
 * `render`: `<Popover.Trigger render={<IconButton label="Sweeps: running" dot="success" />}>`.
 */
function Trigger({ render, className, children, ...rest }: PopoverTriggerProps) {
  return (
    <BasePopover.Trigger
      render={render ?? <Button variant="secondary" className={className} />}
      className={render ? className : undefined}
      {...rest}
    >
      {children}
    </BasePopover.Trigger>
  );
}

export interface PopoverContentProps extends Omit<BasePopover.Popup.Props, 'className'> {
  /**
   * Side of the trigger it opens on. Default `bottom`. With no room it flips to the opposite side (`top` for `bottom`),
   * never to a perpendicular one; when neither side fits, it takes the roomier one and scrolls inside.
   */
  side?: PopoverSide | undefined;
  /** Alignment along that side. Default `center`. */
  align?: PopoverAlign | undefined;
  /** Distance from the trigger in px. Default 4, or 8 with `arrow`. */
  sideOffset?: number | undefined;
  /** Draws a tip pointing at the trigger. */
  arrow?: boolean | undefined;
  /**
   * What to position against instead of the `Popover.Trigger`: an element, a ref to one, a virtual element or a
   * function returning either. For a popover opened from elsewhere (a menu item, a row action) with a controlled
   * `Popover.Root open`. The panel is still portaled to `document.body`.
   */
  anchor?: BasePopover.Positioner.Props['anchor'];
  className?: string | undefined;
}

/**
 * Collisions stay on the axis asked for: flip to the opposite side, shift along it, then shrink to the room there
 * (`max-block-size: var(--available-height)`; the panel scrolls). Base UI's popover default instead falls back to the
 * perpendicular axis when neither side fits the whole panel, so on a short viewport a `bottom` popover anchored at the
 * end of a row opened to its left, over the row it is about. This is Base UI's own setting for Menu and Select.
 */
const COLLISION_AVOIDANCE = { fallbackAxisSide: 'none' } as const;

/** Portal, positioner and the panel. Any content goes inside; name it with `Popover.Title`. */
function Content({
  side = 'bottom',
  align = 'center',
  sideOffset,
  arrow = false,
  anchor,
  className,
  children,
  ...rest
}: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset ?? (arrow ? 8 : 4)}
        anchor={anchor}
        collisionAvoidance={COLLISION_AVOIDANCE}
        className="sc-popover__positioner"
      >
        <BasePopover.Popup className={cx('sc-popover', className)} {...rest}>
          {arrow ? <BasePopover.Arrow className="sc-popover__arrow" /> : null}
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export interface PopoverTitleProps extends Omit<BasePopover.Title.Props, 'className'> {
  className?: string | undefined;
}

/** Names the popover (`aria-labelledby`). A heading, `h2` by default. */
function Title({ className, ...rest }: PopoverTitleProps) {
  return <BasePopover.Title className={cx('sc-popover__title', className)} {...rest} />;
}

export interface PopoverDescriptionProps extends Omit<BasePopover.Description.Props, 'className'> {
  className?: string | undefined;
}

/** Describes the popover (`aria-describedby`). Muted text. */
function Description({ className, ...rest }: PopoverDescriptionProps) {
  return <BasePopover.Description className={cx('sc-popover__description', className)} {...rest} />;
}

export interface PopoverCloseProps extends Omit<BasePopover.Close.Props, 'className'> {
  className?: string | undefined;
}

/** With no children or `render`, the × in the corner. Otherwise wraps any Button: `<Popover.Close render={<Button variant="ghost" />}>Done</Popover.Close>`. */
function Close({ className, children, render, ...rest }: PopoverCloseProps) {
  if (children === undefined && render === undefined) {
    return (
      <BasePopover.Close className={cx('sc-popover__close', className)} aria-label="Close" {...rest}>
        <XIcon />
      </BasePopover.Close>
    );
  }
  return (
    <BasePopover.Close className={className} render={render} {...rest}>
      {children}
    </BasePopover.Close>
  );
}

/** A panel anchored to a trigger (modal by default: the page doesn't scroll while it's open), for a small form, a status summary or a legend. Built on Base UI's Popover. */
export const Popover = { Root, Trigger, Content, Title, Description, Close };
