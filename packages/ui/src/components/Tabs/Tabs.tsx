import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface TabsRootProps extends Omit<
  BaseTabs.Root.Props,
  'className' | 'value' | 'defaultValue' | 'onValueChange'
> {
  /** Controlled active tab. */
  value?: string | undefined;
  /** Initial active tab when uncontrolled. Defaults to the first enabled tab. */
  defaultValue?: string | undefined;
  /** Called with the value of the newly active tab. */
  onValueChange?: ((value: string) => void) | undefined;
  className?: string | undefined;
}

/** Owns the active tab. Wrap a `Tabs.List` and one `Tabs.Panel` per tab. */
function Root({ className, onValueChange, ...rest }: TabsRootProps) {
  return (
    <BaseTabs.Root
      className={cx('sc-tabs', className)}
      onValueChange={onValueChange ? (value) => onValueChange(String(value)) : undefined}
      {...rest}
    />
  );
}

export interface TabsListProps extends Omit<BaseTabs.List.Props, 'className'> {
  /** Names the set of tabs for assistive tech: "Inbox sections". */
  'aria-label': string;
  /** Tabs share the width equally instead of sizing to their labels. */
  fill?: boolean | undefined;
  className?: string | undefined;
}

/** The row of tabs with the sliding indicator. Arrow keys move between tabs; Enter or Space activates. */
function List({ fill = false, className, children, ...rest }: TabsListProps) {
  return (
    <BaseTabs.List className={cx('sc-tabs__list', className)} data-fill={fill || undefined} {...rest}>
      {children}
      <BaseTabs.Indicator className="sc-tabs__indicator" />
    </BaseTabs.List>
  );
}

export interface TabsTabProps extends Omit<BaseTabs.Tab.Props, 'className' | 'value'> {
  value: string;
  /** A 16px icon before the label. */
  icon?: ReactNode | undefined;
  /** A count after the label, muted: `12`. */
  count?: ReactNode | undefined;
  className?: string | undefined;
}

/** One tab. */
function Tab({ icon, count, className, children, ...rest }: TabsTabProps) {
  return (
    <BaseTabs.Tab className={cx('sc-tabs__tab', className)} {...rest}>
      {icon ? (
        <span className="sc-tabs__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="sc-tabs__label">{children}</span>
      {count != null ? (
        <>
          {' '}
          <span className="sc-tabs__count">{count}</span>
        </>
      ) : null}
    </BaseTabs.Tab>
  );
}

export interface TabsPanelProps extends Omit<BaseTabs.Panel.Props, 'className' | 'value'> {
  value: string;
  className?: string | undefined;
}

/** The content of one tab. Unmounted while hidden unless `keepMounted`. */
function Panel({ className, ...rest }: TabsPanelProps) {
  return <BaseTabs.Panel className={cx('sc-tabs__panel', className)} {...rest} />;
}

/** Switches between sections of one view. Built on Base UI's Tabs. */
export const Tabs = { Root, List, Tab, Panel };
