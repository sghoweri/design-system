import { Toolbar as BaseToolbar } from '@base-ui/react/toolbar';
import type { SpacingSize } from '../../types';
import { cx } from '../../utils/cx';

export interface ToolbarRootProps extends Omit<BaseToolbar.Root.Props, 'className'> {
  /** Required. Names the toolbar for assistive tech: "Inbox actions". */
  'aria-label': string;
  /** Wraps onto new lines on narrow widths (default). `false` keeps one line that overflows. */
  wrap?: boolean | undefined;
  /** Gap between items and groups. Default `xs`. */
  gap?: SpacingSize | undefined;
  className?: string | undefined;
}

/**
 * A row of controls with one tab stop: Tab enters, arrow keys move between items, Tab leaves. Put every
 * control through `Toolbar.Button` (`render={<IconButton … />}`) so it joins the roving focus.
 */
function Root({ wrap = true, gap = 'xs', className, ...rest }: ToolbarRootProps) {
  return (
    <BaseToolbar.Root
      className={cx('sc-toolbar', className)}
      data-wrap={wrap || undefined}
      data-gap={gap}
      {...rest}
    />
  );
}

export interface ToolbarGroupProps extends Omit<BaseToolbar.Group.Props, 'className'> {
  /** Names the group: "Playback". */
  'aria-label'?: string | undefined;
  /** Gap inside the group. Default `2xs`. */
  gap?: SpacingSize | undefined;
  className?: string | undefined;
}

/** Keeps related controls together with a tighter gap. */
function Group({ gap = '2xs', className, ...rest }: ToolbarGroupProps) {
  return <BaseToolbar.Group className={cx('sc-toolbar__group', className)} data-gap={gap} {...rest} />;
}

export interface ToolbarSeparatorProps extends Omit<BaseToolbar.Separator.Props, 'className'> {
  className?: string | undefined;
}

/** A hairline between groups. */
function Separator({ className, ...rest }: ToolbarSeparatorProps) {
  return <BaseToolbar.Separator className={cx('sc-toolbar__separator', className)} {...rest} />;
}

export interface ToolbarButtonProps extends Omit<BaseToolbar.Button.Props, 'className'> {
  className?: string | undefined;
}

/**
 * Joins a control to the toolbar's keyboard navigation. Pass the real control through `render`:
 * `<Toolbar.Button render={<IconButton label="Pause" tooltip />}><PauseIcon /></Toolbar.Button>`.
 * For a Menu, nest: `<Toolbar.Button render={<Menu.Trigger render={<IconButton … />} />}>`.
 */
const Button = BaseToolbar.Button;

export interface ToolbarLinkProps extends Omit<BaseToolbar.Link.Props, 'className'> {
  className?: string | undefined;
}

/**
 * A link that joins the toolbar's keyboard navigation. With no `render` it is a plain `<a>`; for an
 * icon link pass an IconButton that itself renders the anchor (or a Next.js `Link`):
 * `<Toolbar.Link render={<IconButton label="Settings" tooltip render={<a href="/settings" />} />}><SettingsIcon /></Toolbar.Link>`.
 */
const Link = BaseToolbar.Link;

export interface ToolbarSpacerProps {
  className?: string | undefined;
}

/** Pushes what follows to the far end. */
function Spacer({ className }: ToolbarSpacerProps) {
  return <div className={cx('sc-toolbar__spacer', className)} aria-hidden="true" />;
}

/** A horizontal container of controls. Built on Base UI's Toolbar. */
export const Toolbar = { Root, Group, Separator, Button, Link, Spacer };
