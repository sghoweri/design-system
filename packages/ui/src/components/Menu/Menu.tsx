import { Menu as BaseMenu } from '@base-ui/react/menu';
import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { Button } from '../Button/Button';
import { CheckIcon, ChevronDownIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';
import { useSafeAreaPadding } from '../../utils/useSafeAreaPadding';

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

/** Lets a `Menu.Header` name the popup it sits in. */
const HeaderIdContext = createContext<((id: string | undefined) => void) | null>(null);

/**
 * Portal, positioner and the popup. Items go inside. A `Menu.Header` inside names the menu
 * (`aria-labelledby`) unless `aria-label` or `aria-labelledby` is passed here.
 */
function Content({
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  className,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: MenuContentProps) {
  const collisionPadding = useSafeAreaPadding();
  const [headerId, setHeaderId] = useState<string | undefined>(undefined);
  const labelledBy = ariaLabelledBy ?? (ariaLabel === undefined ? headerId : undefined);
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className="sc-menu__positioner"
      >
        <BaseMenu.Popup
          className={cx('sc-menu', className)}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          {...rest}
        >
          <HeaderIdContext.Provider value={setHeaderId}>{children}</HeaderIdContext.Provider>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

interface ItemSlots {
  /** A 16px icon before the label. Decorative: hidden from assistive tech. */
  icon?: ReactNode | undefined;
  /**
   * A muted second line under the label that says what the item does. It is the item's accessible
   * description (`aria-describedby`), not part of its name.
   */
  description?: ReactNode | undefined;
  /** Muted text at the end: a shortcut (`<Kbd>`) or a count. */
  trailing?: ReactNode | undefined;
  /** `danger` for destructive actions; put them last, after a separator. */
  tone?: MenuItemTone | undefined;
}

type AriaRefs = { 'aria-labelledby'?: string | undefined; 'aria-describedby'?: string | undefined };

/**
 * The item's body, and the ARIA that goes on the item. With a description, the name comes from the label
 * (and trailing text) through `aria-labelledby`, so the description line is not read twice; ids the caller
 * passes are kept in front.
 */
function useItemBody(
  {
    icon,
    description,
    trailing,
    children,
  }: Pick<ItemSlots, 'icon' | 'description' | 'trailing'> & {
    children?: ReactNode;
  },
  aria: AriaRefs,
): [ReactNode, AriaRefs] {
  const id = useId();
  const hasDescription = description !== undefined && description !== null && description !== false;
  const hasTrailing = trailing !== undefined;
  const join = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(' ') || undefined;
  const body = (
    <>
      <span className="sc-menu__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="sc-menu__label" id={hasDescription ? `${id}-label` : undefined}>
        {children}
      </span>
      {hasDescription ? (
        <span className="sc-menu__description" id={`${id}-description`}>
          {description}
        </span>
      ) : null}
      {hasTrailing ? (
        <span className="sc-menu__trailing" id={hasDescription ? `${id}-trailing` : undefined}>
          {trailing}
        </span>
      ) : null}
    </>
  );
  if (!hasDescription) return [body, aria];
  return [
    body,
    {
      'aria-labelledby': aria['aria-labelledby'] ?? join(`${id}-label`, hasTrailing && `${id}-trailing`),
      'aria-describedby': join(aria['aria-describedby'], `${id}-description`),
    },
  ];
}

export interface MenuItemProps extends Omit<BaseMenu.Item.Props, 'className'>, ItemSlots {
  className?: string | undefined;
}

/**
 * One action. Closes the menu when activated. To submit a form, render it as the form's submit button:
 * `<form action={signOut}><Menu.Item nativeButton render={<button type="submit" />}>Sign out</Menu.Item></form>`
 * (or `form="id"` on the button for a form outside the menu). The item drops the native button's chrome.
 */
function Item({
  icon,
  description,
  trailing,
  tone = 'default',
  className,
  children,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  ...rest
}: MenuItemProps) {
  const [body, aria] = useItemBody(
    { icon, description, trailing, children },
    { 'aria-labelledby': labelledBy, 'aria-describedby': describedBy },
  );
  return (
    <BaseMenu.Item className={cx('sc-menu__item', className)} data-tone={tone} {...aria} {...rest}>
      {body}
    </BaseMenu.Item>
  );
}

export interface MenuLinkItemProps extends Omit<BaseMenu.LinkItem.Props, 'className'>, ItemSlots {
  className?: string | undefined;
}

/**
 * An item that navigates: renders an `<a href>`. Closes the menu when chosen, like `Menu.Item`: with client-side
 * routing the page stays mounted, so an open menu would sit over the new page. Pass `closeOnClick={false}` to keep it.
 */
function LinkItem({
  icon,
  description,
  trailing,
  tone = 'default',
  className,
  closeOnClick = true,
  children,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  ...rest
}: MenuLinkItemProps) {
  const [body, aria] = useItemBody(
    { icon, description, trailing, children },
    { 'aria-labelledby': labelledBy, 'aria-describedby': describedBy },
  );
  return (
    <BaseMenu.LinkItem
      className={cx('sc-menu__item', className)}
      data-tone={tone}
      closeOnClick={closeOnClick}
      {...aria}
      {...rest}
    >
      {body}
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

export interface MenuHeaderProps extends ComponentPropsWithRef<'div'> {
  /** A muted line above the text: "Signed in as". Part of the menu's name. */
  caption?: ReactNode | undefined;
  /** The text: an email or a name. Wraps anywhere, so a long address never widens the menu. */
  children?: ReactNode | undefined;
}

/**
 * A non-interactive block at the top of `Menu.Content` that names the menu: "Signed in as" over an email.
 * Not an item: arrow keys and type-ahead skip it, and it is `role="none"`. Its text becomes the menu's
 * accessible name through `aria-labelledby`. Follow it with a `Menu.Separator`.
 */
function Header({ caption, className, children, id, ...rest }: MenuHeaderProps) {
  const autoId = useId();
  const headerId = id ?? autoId;
  const setHeaderId = useContext(HeaderIdContext);
  useLayoutEffect(() => {
    if (!setHeaderId) return;
    setHeaderId(headerId);
    return () => setHeaderId(undefined);
  }, [setHeaderId, headerId]);
  return (
    <div role="none" id={headerId} className={cx('sc-menu__header', className)} {...rest}>
      {caption !== undefined && caption !== null ? (
        <>
          <span className="sc-menu__header-caption">{caption}</span>{' '}
        </>
      ) : null}
      <span className="sc-menu__header-text">{children}</span>
    </div>
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
  Header,
  Separator,
};
