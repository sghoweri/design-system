import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import {
  createContext,
  useContext,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, MinusIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';
import type { RowSelection } from './useRowSelection';

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
  /**
   * `useRowSelection(ids)`. Turns on the selection column parts (`Table.SelectionHeader`, `Table.SelectionCell`),
   * modifier clicks on rows with a `selectionId`, and the keyboard: Cmd/Ctrl+A selects every row while focus
   * is inside the table, Escape clears.
   */
  selection?: RowSelection | undefined;
}

const SelectionContext = createContext<RowSelection | null>(null);
const RowIdContext = createContext<string | undefined>(undefined);

function useSelection(part: string): RowSelection {
  const selection = useContext(SelectionContext);
  if (!selection) throw new Error(`${part} needs Table.Root selection={useRowSelection(ids)}`);
  return selection;
}

/** Typing into a field inside the table keeps the browser's own Cmd/Ctrl+A and Escape. */
function isTextEntry(target: EventTarget): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (
    target.isContentEditable ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
    return true;
  return (
    target instanceof HTMLInputElement &&
    !['checkbox', 'radio', 'button', 'submit', 'reset', 'image', 'file', 'color', 'range'].includes(
      target.type,
    )
  );
}

const CONTROLS =
  'a[href], button, input, select, textarea, label, summary, [role="checkbox"], [role="button"], [role="link"], [contenteditable="true"]';

/** The event started on a link, button or field inside `row`, which keeps its own click behaviour. */
function fromControl(event: MouseEvent<HTMLElement>): boolean {
  const control = event.target instanceof Element ? event.target.closest(CONTROLS) : null;
  return control !== null && event.currentTarget.contains(control);
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
  selection,
  onKeyDown,
  ...rest
}: TableRootProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    onKeyDown?.(event);
    if (!selection || event.defaultPrevented) return;
    // Popups portalled out of a cell still bubble here through React; they are not "inside the table".
    if (!(event.target instanceof Node) || !event.currentTarget.contains(event.target)) return;
    if (isTextEntry(event.target)) return;
    if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      selection.selectAll();
    } else if (event.key === 'Escape' && selection.count > 0) {
      event.preventDefault();
      selection.clear();
    }
  };
  return (
    <div
      className={cx('sc-table-wrap', wrapperClassName)}
      data-sticky-header={stickyHeader || undefined}
      data-scroll={maxHeight ? '' : undefined}
      style={maxHeight ? { ...wrapperStyle, maxBlockSize: maxHeight } : wrapperStyle}
    >
      {/* Selection shortcuts are delegated from the focusable controls inside (checkboxes, links, sort buttons). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <table
        className={cx('sc-table', className)}
        data-density={density}
        data-divided={divided || undefined}
        data-layout={layout}
        style={style}
        onKeyDown={selection ? handleKeyDown : onKeyDown}
        {...rest}
      >
        <SelectionContext.Provider value={selection ?? null}>{children}</SelectionContext.Provider>
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
  /** Accent wash, for the current row. With `selectionId` it defaults to the row's selection. */
  selected?: boolean | undefined;
  /** Hover wash and pointer; make the primary cell a link or button for the real target. */
  interactive?: boolean | undefined;
  /**
   * The row's id in `Table.Root selection`. Shift+click extends the range to this row and Cmd/Ctrl+click
   * toggles it, unless the click is on a link, button or field inside the row; neither reaches `onClick`,
   * so a plain click can still open the row.
   */
  selectionId?: string | undefined;
}

function Row({
  selected,
  interactive = false,
  selectionId,
  className,
  onClick,
  onMouseDown,
  ...rest
}: TableRowProps) {
  const selection = useContext(SelectionContext);
  const selectable = selection !== null && selectionId !== undefined;
  const isSelected = selected ?? (selectable && selection.isSelected(selectionId));
  const row = (
    <tr
      className={cx('sc-table__row', className)}
      data-selected={isSelected || undefined}
      data-interactive={interactive || undefined}
      aria-selected={selectable ? isSelected : isSelected || undefined}
      onClick={
        selectable
          ? (event) => {
              if ((event.shiftKey || event.metaKey || event.ctrlKey) && !fromControl(event)) {
                event.preventDefault();
                if (event.shiftKey) selection.toggleRange(selectionId);
                else selection.toggle(selectionId);
                return;
              }
              onClick?.(event);
            }
          : onClick
      }
      onMouseDown={
        selectable
          ? (event) => {
              // Shift+click would otherwise select the text between the two clicks.
              if (event.shiftKey && !fromControl(event)) event.preventDefault();
              onMouseDown?.(event);
            }
          : onMouseDown
      }
      {...rest}
    />
  );
  return selectionId === undefined ? (
    row
  ) : (
    <RowIdContext.Provider value={selectionId}>{row}</RowIdContext.Provider>
  );
}

function SelectionBox({
  label,
  ...rest
}: { label: string } & Omit<BaseCheckbox.Root.Props, 'className' | 'render'>) {
  return (
    <BaseCheckbox.Root className="sc-checkbox" aria-label={label} {...rest}>
      <BaseCheckbox.Indicator className="sc-checkbox__indicator">
        <CheckIcon size="sm" className="sc-checkbox__check" />
        <MinusIcon size="sm" className="sc-checkbox__dash" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}

const onCheckbox = (event: MouseEvent<HTMLElement>) =>
  event.target instanceof Element && event.target.closest('[role="checkbox"]') !== null;

export interface TableSelectionHeaderProps extends Omit<ComponentPropsWithRef<'th'>, 'children'> {
  /** The checkbox's accessible name. Default "Select all rows". */
  label?: string | undefined;
}

/**
 * The selection column's header: a checkbox that is checked when every row is, mixed when some are, and
 * selects every row (or, when all are selected, none). The whole cell is the hit area.
 */
function SelectionHeader({
  label = 'Select all rows',
  className,
  onClick,
  ...rest
}: TableSelectionHeaderProps) {
  const selection = useSelection('Table.SelectionHeader');
  const disabled = selection.ids.length === 0;
  const toggleAll = () => (selection.headerState === 'all' ? selection.clear() : selection.selectAll());
  return (
    <th
      scope="col"
      className={cx('sc-table__header', 'sc-table__select', className)}
      data-disabled={disabled || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!disabled && !onCheckbox(event)) toggleAll();
      }}
      {...rest}
    >
      <SelectionBox
        label={label}
        checked={selection.headerState === 'all'}
        indeterminate={selection.headerState === 'some'}
        disabled={disabled}
        onCheckedChange={toggleAll}
      />
    </th>
  );
}

export interface TableSelectionCellProps extends Omit<ComponentPropsWithRef<'td'>, 'children'> {
  /** Required. Names the row's checkbox: "Select Tailscale, Front End Engineer". */
  label: string;
}

/**
 * The row's checkbox, inside a `Table.Row selectionId`. Click or Space toggles; Shift+click or Shift+Space
 * extends the range from the last toggled row. The whole cell is the hit area, and its clicks never reach the
 * row's `onClick`.
 */
function SelectionCell({ label, className, onClick, onClickCapture, ...rest }: TableSelectionCellProps) {
  const selection = useSelection('Table.SelectionCell');
  const id = useContext(RowIdContext);
  if (id === undefined) throw new Error('Table.SelectionCell goes inside a Table.Row with selectionId');
  return (
    <td
      className={cx('sc-table__cell', 'sc-table__select', className)}
      onClickCapture={(event) => {
        onClickCapture?.(event);
        // Shift+click, and Shift+Space (Base UI turns the keyup into a click that keeps the modifiers), take the
        // range before the checkbox would flip on its own.
        if (!event.shiftKey) return;
        event.preventDefault();
        event.stopPropagation();
        selection.toggleRange(id);
      }}
      onClick={(event) => {
        onClick?.(event);
        event.stopPropagation();
        if (!onCheckbox(event)) selection.toggle(id);
      }}
      {...rest}
    >
      <SelectionBox
        label={label}
        checked={selection.isSelected(id)}
        onCheckedChange={() => selection.toggle(id)}
      />
    </td>
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
export const Table = { Root, Caption, Head, Body, Foot, Row, Header, Cell, SelectionHeader, SelectionCell };
