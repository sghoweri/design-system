// Row selection as a pure reducer: no React, no DOM. `useRowSelection` is the thin hook over it, and the Table's
// selection column and keyboard handling only send it events. Events are namespaced `selection.*` (guideline 07).

/** The header checkbox: nothing, some or every row selected. */
export type RowSelectionHeaderState = 'none' | 'some' | 'all';

export interface RowSelectionState {
  /** The selectable row ids in visible order (after the page's filter and sort). Unique. */
  readonly ids: readonly string[];
  /** The selected ids; always a subset of `ids`. */
  readonly selected: ReadonlySet<string>;
  /** Where the next range starts: the row toggled last, on its own or as the end of a range. */
  readonly anchor: string | null;
}

export type RowSelectionEvent =
  /** The visible rows changed (filter, sort, new data): keep the order, drop what disappeared. */
  | { type: 'selection.sync'; ids: readonly string[] }
  /** Flip one row; it becomes the anchor. */
  | { type: 'selection.toggle'; id: string }
  /** Shift: every row from the anchor to `id`, inclusive, in visible order, takes `id`'s new state; `id` becomes the anchor. */
  | { type: 'selection.toggleRange'; id: string }
  | { type: 'selection.selectAll' }
  | { type: 'selection.clear' };

export function initRowSelection(ids: readonly string[]): RowSelectionState {
  return { ids, selected: new Set(), anchor: null };
}

/** Same ids in the same order. */
export function sameIds(a: readonly string[], b: readonly string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}

function toggle(state: RowSelectionState, id: string): RowSelectionState {
  if (!state.ids.includes(id)) return state;
  const selected = new Set(state.selected);
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  return { ...state, selected, anchor: id };
}

function toggleRange(state: RowSelectionState, id: string): RowSelectionState {
  const to = state.ids.indexOf(id);
  if (to < 0) return state;
  const from = state.anchor === null ? -1 : state.ids.indexOf(state.anchor);
  if (from < 0 || from === to) return toggle(state, id);
  const on = !state.selected.has(id);
  const selected = new Set(state.selected);
  const [start, end] = from < to ? [from, to] : [to, from];
  for (let i = start; i <= end; i += 1) {
    const rowId = state.ids[i]!;
    if (on) selected.add(rowId);
    else selected.delete(rowId);
  }
  return { ...state, selected, anchor: id };
}

function sync(state: RowSelectionState, ids: readonly string[]): RowSelectionState {
  if (sameIds(state.ids, ids)) return state;
  const present = new Set(ids);
  let selected = state.selected;
  for (const id of state.selected) {
    if (present.has(id)) continue;
    selected = new Set([...state.selected].filter((x) => present.has(x)));
    break;
  }
  const anchor = state.anchor !== null && present.has(state.anchor) ? state.anchor : null;
  return { ids, selected, anchor };
}

/** Pure: returns `state` itself when an event changes nothing, so React can bail out. */
export function rowSelectionReducer(state: RowSelectionState, event: RowSelectionEvent): RowSelectionState {
  switch (event.type) {
    case 'selection.sync':
      return sync(state, event.ids);
    case 'selection.toggle':
      return toggle(state, event.id);
    case 'selection.toggleRange':
      return toggleRange(state, event.id);
    case 'selection.selectAll':
      return state.selected.size === state.ids.length ? state : { ...state, selected: new Set(state.ids) };
    case 'selection.clear':
      return state.selected.size === 0 && state.anchor === null
        ? state
        : { ...state, selected: new Set(), anchor: null };
  }
}

export function headerState(state: RowSelectionState): RowSelectionHeaderState {
  if (state.selected.size === 0) return 'none';
  return state.selected.size === state.ids.length ? 'all' : 'some';
}

/** The selected ids in visible order. */
export function selectedIds(state: RowSelectionState): string[] {
  return state.ids.filter((id) => state.selected.has(id));
}
