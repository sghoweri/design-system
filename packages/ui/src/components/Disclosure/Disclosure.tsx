import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { ChevronDownIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export interface DisclosureProps extends Omit<ComponentPropsWithRef<'details'>, 'open' | 'onToggle'> {
  /** Required. The summary line, a verb phrase: "Show full description". */
  summary: ReactNode;
  /** Replaces `summary` while open: "Show less". */
  summaryOpen?: ReactNode | undefined;
  /** Controlled open state. */
  open?: boolean | undefined;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Called when the user toggles it. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * While closed, shows this many lines of the content fading out, so a long description still reads
   * as a teaser. Puts the summary line under the preview. Needs `::details-content` (2025 browsers);
   * older ones show the summary alone.
   */
  previewLines?: number | undefined;
  /** Puts the summary line above (default) or below the content. Defaults to `end` with `previewLines`. */
  summaryPosition?: 'start' | 'end' | undefined;
  children?: ReactNode | undefined;
}

/**
 * A native `<details>` collapse with a styled summary. Works without JavaScript, is announced as a
 * disclosure, and shares `name` with siblings for an exclusive group.
 */
export function Disclosure({
  summary,
  summaryOpen,
  open,
  defaultOpen = false,
  onOpenChange,
  previewLines,
  summaryPosition,
  className,
  style,
  children,
  ref,
  ...rest
}: DisclosureProps) {
  const controlled = open !== undefined;
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = controlled ? open : internal;
  const inner = useRef<HTMLDetailsElement | null>(null);
  // A native toggle flips the element itself; when controlled and the parent declines, put it back.
  useEffect(() => {
    if (controlled && inner.current && inner.current.open !== open) inner.current.open = open;
  });
  const onToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const next = event.currentTarget.open;
    if (next === isOpen) return;
    if (!controlled) setInternal(next);
    onOpenChange?.(next);
  };
  const position = summaryPosition ?? (previewLines ? 'end' : 'start');
  return (
    <details
      ref={(node) => {
        inner.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cx('sc-disclosure', className)}
      open={isOpen}
      onToggle={onToggle}
      data-summary-position={position}
      data-preview={previewLines ? '' : undefined}
      style={previewLines ? ({ ...style, '--_lines': previewLines } as CSSProperties) : style}
      {...rest}
    >
      <summary className="sc-disclosure__summary">
        <ChevronDownIcon className="sc-disclosure__chevron" />
        <span className="sc-disclosure__summary-text">
          {isOpen && summaryOpen != null ? summaryOpen : summary}
        </span>
      </summary>
      <div className="sc-disclosure__content">{children}</div>
    </details>
  );
}
