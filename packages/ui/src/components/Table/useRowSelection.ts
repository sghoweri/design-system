import { useMemo, useReducer } from 'react';
import {
  headerState,
  initRowSelection,
  rowSelectionReducer,
  sameIds,
  selectedIds,
  type RowSelectionHeaderState,
} from './rowSelection';

export interface RowSelection {
  /** The selectable ids, in the order passed in. */
  ids: readonly string[];
  /** The selected ids; a subset of the ids passed in. */
  selected: ReadonlySet<string>;
  /** The selected ids in visible order. */
  selectedIds: readonly string[];
  count: number;
  /** Where the next Shift range starts. */
  anchor: string | null;
  /** For the header checkbox. */
  headerState: RowSelectionHeaderState;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  /** Every row from the anchor to `id`, inclusive, in the current order, takes `id`'s new state. */
  toggleRange: (id: string) => void;
  selectAll: () => void;
  clear: () => void;
}

/**
 * Selection state for a list of rows, by id. Pass the selectable ids in visible order (after filtering and
 * sorting); when one disappears it leaves the selection and the rest stay. Hand the result to
 * `Table.Root selection` for the checkbox column and keyboard, or read it for a bulk-action bar.
 */
export function useRowSelection(ids: readonly string[]): RowSelection {
  const [stored, dispatch] = useReducer(rowSelectionReducer, ids, initRowSelection);
  // Rows changed since the last render: sync now (a render-phase update, so nothing paints a stale count),
  // and read the synced state this render.
  const state = sameIds(stored.ids, ids)
    ? stored
    : rowSelectionReducer(stored, { type: 'selection.sync', ids });
  if (state !== stored) dispatch({ type: 'selection.sync', ids });

  const actions = useMemo(
    () => ({
      toggle: (id: string) => dispatch({ type: 'selection.toggle', id }),
      toggleRange: (id: string) => dispatch({ type: 'selection.toggleRange', id }),
      selectAll: () => dispatch({ type: 'selection.selectAll' }),
      clear: () => dispatch({ type: 'selection.clear' }),
    }),
    [],
  );
  return useMemo(
    () => ({
      ids: state.ids,
      selected: state.selected,
      selectedIds: selectedIds(state),
      count: state.selected.size,
      anchor: state.anchor,
      headerState: headerState(state),
      isSelected: (id: string) => state.selected.has(id),
      ...actions,
    }),
    [state, actions],
  );
}
