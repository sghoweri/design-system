import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { Tooltip } from '../Tooltip/Tooltip';
import { cx } from '../../utils/cx';

export type StatusStripTone = 'success' | 'warning' | 'danger' | 'neutral' | 'running';

export interface StatusStripItem {
  /** React key. Default: the index. */
  id?: string | undefined;
  /** Colour and shape: success solid, warning solid with `!`, danger solid with `×`, neutral hollow, running hollow with a dot. */
  tone: StatusStripTone;
  /**
   * The cell's whole name, outcome first: "Failed · Tue 7:00 AM". Read by assistive tech and the only text on
   * touch (Tooltips don't open there), so say everything the Tooltip says.
   */
  label: string;
  /** Makes the cell a link (`#run-42`). Without it the cell is a plain list item. */
  href?: string | undefined;
  /** Hover and focus hint: "Tue 7:00 AM · 18 new roles, 2 scored". Supplementary; the label must already hold it. */
  tooltip?: ReactNode | undefined;
}

export interface StatusStripProps extends Omit<ComponentPropsWithRef<'ol'>, 'children'> {
  /** The cells in time order, oldest first: the newest sits at the end. */
  items: readonly StatusStripItem[];
  /** Names the list: "Last 30 sweeps, oldest first". */
  'aria-label': string;
}

/** 12px glyphs drawn in text.on-status (warning, danger) or the tone colour (running). */
const glyphs: Partial<Record<StatusStripTone, ReactNode>> = {
  warning: <path d="M6 2.5v4.25M6 9.25v.25" />,
  danger: <path d="M3 3l6 6M9 3l-6 6" />,
  running: <circle cx="6" cy="6" r="2.25" />,
};

/**
 * A compact row of status cells, e.g. the last 30 sweep runs, newest at the end. An `ol`; each cell is a link
 * when it has an `href`, otherwise a non-interactive item, and its label is always in the accessibility tree.
 * Tone is never colour alone: each tone has its own shape (WCAG 1.4.1). Cells are 20px on a 24px pitch, so a
 * linked cell meets the 24px target-size spacing (WCAG 2.5.8), and the row wraps on narrow screens.
 */
export function StatusStrip({ items, className, ...rest }: StatusStripProps) {
  return (
    <Tooltip.Provider>
      <ol className={cx('sc-status-strip', className)} {...rest}>
        {items.map((item, i) => (
          <li key={item.id ?? i} className="sc-status-strip__item">
            <Cell {...item} />
          </li>
        ))}
      </ol>
    </Tooltip.Provider>
  );
}

function Cell({ tone, label, href, tooltip }: StatusStripItem) {
  const body = (
    <>
      <span className="sc-visually-hidden">{label}</span>
      {glyphs[tone] ? (
        <svg className="sc-status-strip__glyph" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
          {glyphs[tone]}
        </svg>
      ) : null}
    </>
  );
  const cell: ReactElement =
    href != null ? (
      <a className="sc-status-strip__cell" data-tone={tone} href={href}>
        {body}
      </a>
    ) : (
      <span className="sc-status-strip__cell" data-tone={tone}>
        {body}
      </span>
    );
  return tooltip != null ? <Tooltip content={tooltip}>{cell}</Tooltip> : cell;
}
