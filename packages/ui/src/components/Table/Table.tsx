import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export type TableAlign = 'start' | 'center' | 'end';
export type TableDensity = 'comfortable' | 'compact';
export type TableSortDirection = 'ascending' | 'descending' | 'none';

export interface TableRootProps extends Omit<ComponentPropsWithRef<'table'>, 'style'> {
  /** Column headers stay visible while the table scrolls. Give `maxHeight` to scroll inside the table; otherwise they stick to the page. */
  stickyHeader?: boolean | undefined;
  /** Limits the height and scrolls rows inside; pairs with `stickyHeader`. A CSS length. */
  maxHeight?: string | undefined;
  /** `compact` tightens row height and padding; `data-density="compact"` on an ancestor does the same. */
  density?: TableDensity | undefined;
  /** Hairlines between rows (default) or none. */
  divided?: boolean | undefined;
  /** `fixed` column widths from the first row, for truncating cells. Default `auto`. */
  layout?: 'auto' | 'fixed' | undefined;
  /** Style and class for the scrolling wrapper; `className` goes on the `<table>`. */
  wrapperClassName?: string | undefined;
  wrapperStyle?: CSSProperties | undefined;
  style?: CSSProperties | undefined;
  children?: ReactNode | undefined;
}

/** A semantic `<table>` in a horizontally scrolling wrapper. Compose `Table.Head`, `Table.Body`, `Table.Row`, `Table.Header`, `Table.Cell`. */
function Root({
  stickyHeader = false,
  maxHeight,
  density,
  divided = true,
  layout = 'auto',
  wrapperClassName,
  wrapperStyle,
  className,
  style,
  children,
  ...rest
}: TableRootProps) {
  return (
    <div
      className={cx('sc-table-wrap', wrapperClassName)}
      data-sticky-header={stickyHeader || undefined}
      data-scroll={maxHeight ? '' : undefined}
      style={maxHeight ? { ...wrapperStyle, maxBlockSize: maxHeight } : wrapperStyle}
    >
      <table
        className={cx('sc-table', className)}
        data-density={density}
        data-divided={divided || undefined}
        data-layout={layout}
        style={style}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
}

export type TableCaptionProps = ComponentPropsWithRef<'caption'>;

/** Names the table for assistive tech; visually a muted line above it. */
function Caption({ className, ...rest }: TableCaptionProps) {
  return <caption className={cx('sc-table__caption', className)} {...rest} />;
}

export type TableHeadProps = ComponentPropsWithRef<'thead'>;
function Head({ className, ...rest }: TableHeadProps) {
  return <thead className={cx('sc-table__head', className)} {...rest} />;
}

export type TableBodyProps = ComponentPropsWithRef<'tbody'>;
function Body({ className, ...rest }: TableBodyProps) {
  return <tbody className={cx('sc-table__body', className)} {...rest} />;
}

export type TableFootProps = ComponentPropsWithRef<'tfoot'>;
function Foot({ className, ...rest }: TableFootProps) {
  return <tfoot className={cx('sc-table__foot', className)} {...rest} />;
}

export interface TableRowProps extends ComponentPropsWithRef<'tr'> {
  /** Accent wash, for the current row. */
  selected?: boolean | undefined;
  /** Hover wash and pointer; make the primary cell a link or button for the real target. */
  interactive?: boolean | undefined;
}

function Row({ selected = false, interactive = false, className, ...rest }: TableRowProps) {
  return (
    <tr
      className={cx('sc-table__row', className)}
      data-selected={selected || undefined}
      data-interactive={interactive || undefined}
      aria-selected={selected || undefined}
      {...rest}
    />
  );
}

interface CellSlots {
  /** Horizontal alignment. Default `start`; `end` for numbers. */
  align?: TableAlign | undefined;
  /** Tabular figures and end alignment. */
  numeric?: boolean | undefined;
  /** No wrapping. */
  nowrap?: boolean | undefined;
  /** One line with an ellipsis; needs `layout="fixed"` or a `width`. */
  truncate?: boolean | undefined;
  /** Column width as a CSS length, on headers. */
  width?: string | undefined;
}

export interface TableHeaderProps extends Omit<ComponentPropsWithRef<'th'>, 'align' | 'width'>, CellSlots {
  /** Renders the label as a button that sorts the column. The table stays controlled: sort the rows yourself in `onSort`. */
  sortable?: boolean | undefined;
  /** The column's current sort, reflected as `aria-sort`. `none` (default) for every column but the sorted one. */
  sortDirection?: TableSortDirection | undefined;
  /** Called with the direction to apply: `ascending` first, then it toggles. */
  onSort?: ((direction: Exclude<TableSortDirection, 'none'>) => void) | undefined;
}

/** A `<th>`; `scope` defaults to `col`, pass `row` for the first cell of a row. */
function Header({
  align,
  numeric = false,
  nowrap = false,
  truncate = false,
  width,
  sortable = false,
  sortDirection = 'none',
  onSort,
  scope = 'col',
  className,
  style,
  children,
  ...rest
}: TableHeaderProps) {
  const sorted = sortable && sortDirection !== 'none';
  return (
    <th
      scope={scope}
      className={cx('sc-table__header', className)}
      data-align={align ?? (numeric ? 'end' : undefined)}
      data-numeric={numeric || undefined}
      data-nowrap={nowrap || undefined}
      data-truncate={truncate || undefined}
      data-sortable={sortable || undefined}
      data-sorted={sorted ? sortDirection : undefined}
      aria-sort={sorted ? sortDirection : undefined}
      style={width ? { ...style, inlineSize: width } : style}
      {...rest}
    >
      {sortable ? (
        <button
          type="button"
          className="sc-table__sort"
          onClick={() => onSort?.(sortDirection === 'ascending' ? 'descending' : 'ascending')}
        >
          <span className="sc-table__sort-label">{children}</span>
          <span className="sc-table__sort-icon" aria-hidden="true">
            {sortDirection === 'descending' ? <ArrowDownIcon size="xs" /> : <ArrowUpIcon size="xs" />}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TableCellProps extends Omit<ComponentPropsWithRef<'td'>, 'align' | 'width'>, CellSlots {}

function Cell({
  align,
  numeric = false,
  nowrap = false,
  truncate = false,
  width,
  className,
  style,
  ...rest
}: TableCellProps) {
  return (
    <td
      className={cx('sc-table__cell', className)}
      data-align={align ?? (numeric ? 'end' : undefined)}
      data-numeric={numeric || undefined}
      data-nowrap={nowrap || undefined}
      data-truncate={truncate || undefined}
      style={width ? { ...style, inlineSize: width } : style}
      {...rest}
    />
  );
}

/** Rows of records with column headers. Native table elements, so screen readers get rows and columns. */
export const Table = { Root, Caption, Head, Body, Foot, Row, Header, Cell };
