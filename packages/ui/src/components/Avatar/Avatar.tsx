import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import { useRender } from '@base-ui/react/use-render';
import type { ComponentPropsWithRef } from 'react';
import { UserIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * One or two capital letters for a person: the first letters of the first and last words of a name, or, for an email
 * address, of its local part split on `.`, `_`, `+`, `-` and digits. Empty when there is nothing to take a letter from.
 */
export function avatarInitials(name: string | null | undefined): string {
  const value = name?.trim() ?? '';
  const words = (
    value.includes('@') ? (value.split('@')[0] ?? '').split(/[._+\-\d]+/) : value.split(/\s+/)
  ).filter(Boolean);
  const first = (w: string | undefined) => (w ? (Array.from(w)[0] ?? '') : '');
  const letters = words.length > 1 ? first(words[0]) + first(words[words.length - 1]) : first(words[0]);
  return letters.toUpperCase();
}

interface AvatarLookProps {
  /** The person's name, or their email address when there is no name. The initials come from it. (On AvatarButton it is not the form `name` attribute.) */
  name?: string | null | undefined;
  /** Overrides the initials taken from `name`. Shown as given, up to two characters. */
  initials?: string | undefined;
  /** A picture. The initials show until it loads, and stay if it fails. */
  src?: string | undefined;
  /** `xs` 24px (beside text), `sm` 32, `md` 40 (default) and `lg` 48 follow the control heights, compact density included. */
  size?: AvatarSize | undefined;
}

export interface AvatarProps extends AvatarLookProps, Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Gives the avatar an accessible name (`role="img"`), e.g. the person's name where it is not written next to it. Without it the avatar is decorative and hidden from assistive tech. */
  label?: string | undefined;
}

function Letters({ name, initials }: Pick<AvatarLookProps, 'name' | 'initials'>) {
  const letters = initials?.trim() ? Array.from(initials.trim()).slice(0, 2).join('') : avatarInitials(name);
  return letters ? (
    <span className="sc-avatar__initials">{letters}</span>
  ) : (
    <UserIcon className="sc-avatar__icon" size="em" />
  );
}

/**
 * A person: their picture, else their initials on a brand tint inside a 1px ring (the ring is what keeps the circle
 * visible on every surface). Decorative unless `label` is given. For a clickable avatar use `AvatarButton`.
 */
export function Avatar({ name, initials, src, size = 'md', label, className, ...rest }: AvatarProps) {
  return (
    <BaseAvatar.Root
      className={cx('sc-avatar', className)}
      data-size={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {src ? <BaseAvatar.Image className="sc-avatar__image" src={src} alt="" /> : null}
      <BaseAvatar.Fallback className="sc-avatar__fallback">
        <Letters name={name} initials={initials} />
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}

export interface AvatarButtonProps
  extends AvatarLookProps, Omit<useRender.ComponentProps<'button'>, 'children' | 'aria-label' | 'name'> {
  /** Required. The button's accessible name, e.g. `Account: Robin Test`; the avatar inside is decorative. */
  label: string;
}

/**
 * A round button that is an Avatar, for an account menu or a profile link. The ring thickens on hover and while its
 * popup is open; the focus ring is the system's; on touch the hit area is at least 44px. Compose it as a trigger:
 * `<Menu.Trigger render={<AvatarButton label="Account: Robin Test" name="Robin Test" size="sm" />} />`, or make it a
 * link with `render={<a href="/profile" />}`.
 */
export function AvatarButton({
  label,
  name,
  initials,
  src,
  size = 'md',
  type,
  className,
  render,
  ref,
  ...rest
}: AvatarButtonProps) {
  return useRender({
    render,
    ref,
    defaultTagName: 'button',
    props: {
      // `type` only means something on a real button; a rendered link keeps its own attributes.
      type: render ? type : (type ?? 'button'),
      className: cx('sc-avatar-button', className),
      'data-size': size,
      'aria-label': label,
      ...rest,
      children: <Avatar name={name} initials={initials} src={src} size={size} />,
    },
  });
}
