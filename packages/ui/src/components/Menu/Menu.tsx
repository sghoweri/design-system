import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { CheckIcon, ChevronDownIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export type MenuSide = 'top' | 'bottom' | 'left' | 'right';
export type MenuAlign = 'start' | 'center' | 'end';
export type MenuItemTone = 'default' | 'danger';

export interface MenuRootProps {
  /** Controlled open state. */
  open?: boolean | undefined;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Called when the menu opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Disables the trigger. */
  disabled?: boolean | undefined;
  /** Default `true`: the page behind the menu is inert until it closes. */
  modal?: boolean | undefined;
  children?: ReactNode | undefined;
}

/** Owns the open state. Wrap a `Menu.Trigger` and a `Menu.Content`. */
function Root({ open, defaultOpen, onOpenChange, disabled, modal = true, children }: MenuRootProps) {
  return (
    <BaseMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
      disabled={disabled}
      modal={modal}
    >
      {children}
    </BaseMenu.Root>
  );
}

export interface MenuTriggerProps extends Omit<BaseMenu.Trigger.Props, 'className'> {
  className?: string | undefined;
}

/**
 * Opens the menu. With no `render` it is a secondary Button with a chevron; pass any Button or
 * IconButton through `render`: `<Menu.Trigger render={<IconButton label="More" />}><MoreHorizontalIcon /></Menu.Trigger>`.
 */
function Trigger({ render, className, children, ...rest }: MenuTriggerProps) {
  return (
    <BaseMenu.Trigger
      render={render ?? <Button variant="secondary" iconEnd={<ChevronDownIcon />} className={className} />}
      className={render ? className : undefined}
      {...rest}
    >
      {children}
    </BaseMenu.Trigger>
  );
}

export interface MenuContentProps extends Omit<BaseMenu.Popup.Props, 'className'> {
  /** Side of the trigger the menu opens on; flips when there is no room. Default `bottom`. */
  side?: MenuSide | undefined;
  /** Alignment along that side. Default `start`. */
  align?: MenuAlign | undefined;
  /** Distance from the trigger in px. Default 4. */
  sideOffset?: number | undefined;
  className?: string | undefined;
}

/** Portal, positioner and the popup. Items go inside. */
function Content({
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  className,
  children,
  ...rest
}: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset} className="sc-menu__positioner">
        <BaseMenu.Popup className={cx('sc-menu', className)} {...rest}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

interface ItemSlots {
  /** A 16px icon before the label. */
  icon?: ReactNode | undefined;
  /** Muted text at the end: a shortcut (`<Kbd>`) or a count. */
  trailing?: ReactNode | undefined;
  /** `danger` for destructive actions; put them last, after a separator. */
  tone?: MenuItemTone | undefined;
}

function ItemBody({
  icon,
  trailing,
  children,
}: {
  icon?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <span className="sc-menu__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="sc-menu__label">{children}</span>
      {trailing !== undefined ? <span className="sc-menu__trailing">{trailing}</span> : null}
    </>
  );
}

export interface MenuItemProps extends Omit<BaseMenu.Item.Props, 'className'>, ItemSlots {
  className?: string | undefined;
}

/** One action. Closes the menu when activated. */
function Item({ icon, trailing, tone = 'default', className, children, ...rest }: MenuItemProps) {
  return (
    <BaseMenu.Item className={cx('sc-menu__item', className)} data-tone={tone} {...rest}>
      <ItemBody icon={icon} trailing={trailing}>
        {children}
      </ItemBody>
    </BaseMenu.Item>
  );
}

export interface MenuLinkItemProps extends Omit<BaseMenu.LinkItem.Props, 'className'>, ItemSlots {
  className?: string | undefined;
}

/** An item that navigates: renders an `<a href>`. */
function LinkItem({ icon, trailing, tone = 'default', className, children, ...rest }: MenuLinkItemProps) {
  return (
    <BaseMenu.LinkItem className={cx('sc-menu__item', className)} data-tone={tone} {...rest}>
      <ItemBody icon={icon} trailing={trailing}>
        {children}
      </ItemBody>
    </BaseMenu.LinkItem>
  );
}

export interface MenuCheckboxItemProps extends Omit<
  BaseMenu.CheckboxItem.Props,
  'className' | 'onCheckedChange'
> {
  /** Called with the next checked state. */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** Muted text at the end. */
  trailing?: ReactNode | undefined;
  className?: string | undefined;
}

/** A toggle. Stays open when activated so several can be flipped at once; pass `closeOnClick` to close. */
function CheckboxItem({ trailing, onCheckedChange, className, children, ...rest }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      className={cx('sc-menu__item', className)}
      onCheckedChange={onCheckedChange ? (checked) => onCheckedChange(checked) : undefined}
      {...rest}
    >
      <BaseMenu.CheckboxItemIndicator className="sc-menu__icon sc-menu__indicator">
        <CheckIcon size="sm" />
      </BaseMenu.CheckboxItemIndicator>
      <span className="sc-menu__label">{children}</span>
      {trailing !== undefined ? <span className="sc-menu__trailing">{trailing}</span> : null}
    </BaseMenu.CheckboxItem>
  );
}

export interface MenuRadioGroupProps<Value extends string = string> extends Omit<
  BaseMenu.RadioGroup.Props,
  'className' | 'value' | 'defaultValue' | 'onValueChange'
> {
  /** Controlled selected value. */
  value?: Value | undefined;
  /** Initial value when uncontrolled. */
  defaultValue?: Value | undefined;
  /** Called with the next selected value. */
  onValueChange?: ((value: Value) => void) | undefined;
  /** A heading for the group, rendered above the items. */
  label?: ReactNode | undefined;
  className?: string | undefined;
}

/** A set of `Menu.RadioItem`s where exactly one is selected. */
function RadioGroup<Value extends string = string>({
  label,
  onValueChange,
  className,
  children,
  ...rest
}: MenuRadioGroupProps<Value>) {
  return (
    <BaseMenu.RadioGroup
      className={cx('sc-menu__group', className)}
      onValueChange={onValueChange ? (value: Value) => onValueChange(value) : undefined}
      {...rest}
    >
      {label !== undefined ? (
        <BaseMenu.GroupLabel className="sc-menu__group-label">{label}</BaseMenu.GroupLabel>
      ) : null}
      {children}
    </BaseMenu.RadioGroup>
  );
}

export interface MenuRadioItemProps extends Omit<BaseMenu.RadioItem.Props, 'className' | 'value'> {
  value: string;
  /** Muted text at the end. */
  trailing?: ReactNode | undefined;
  className?: string | undefined;
}

/** One choice in a `Menu.RadioGroup`. Stays open when chosen; pass `closeOnClick` to close. */
function RadioItem({ trailing, className, children, ...rest }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem className={cx('sc-menu__item', className)} {...rest}>
      <BaseMenu.RadioItemIndicator className="sc-menu__icon sc-menu__indicator">
        <span className="sc-menu__radio-dot" />
      </BaseMenu.RadioItemIndicator>
      <span className="sc-menu__label">{children}</span>
      {trailing !== undefined ? <span className="sc-menu__trailing">{trailing}</span> : null}
    </BaseMenu.RadioItem>
  );
}

export interface MenuGroupProps extends Omit<BaseMenu.Group.Props, 'className'> {
  /** A heading for the group, rendered above the items. */
  label?: ReactNode | undefined;
  className?: string | undefined;
}

/** Labels a run of items. */
function Group({ label, className, children, ...rest }: MenuGroupProps) {
  return (
    <BaseMenu.Group className={cx('sc-menu__group', className)} {...rest}>
      {label !== undefined ? (
        <BaseMenu.GroupLabel className="sc-menu__group-label">{label}</BaseMenu.GroupLabel>
      ) : null}
      {children}
    </BaseMenu.Group>
  );
}

export interface MenuSeparatorProps extends Omit<BaseMenu.Separator.Props, 'className'> {
  className?: string | undefined;
}

/** A hairline between runs of items. */
function Separator({ className, ...rest }: MenuSeparatorProps) {
  return <BaseMenu.Separator className={cx('sc-menu__separator', className)} {...rest} />;
}

/** A dropdown of actions on a trigger, with full keyboard support. Built on Base UI's Menu. */
export const Menu = {
  Root,
  Trigger,
  Content,
  Item,
  LinkItem,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  Group,
  Separator,
};
