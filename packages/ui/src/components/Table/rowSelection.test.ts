import {
  headerState,
  initRowSelection,
  rowSelectionReducer,
  sameIds,
  selectedIds,
  type RowSelectionEvent,
  type RowSelectionState,
} from './rowSelection';

const IDS = ['a', 'b', 'c', 'd', 'e', 'f'];
const run = (events: RowSelectionEvent[], ids: readonly string[] = IDS): RowSelectionState =>
  events.reduce(rowSelectionReducer, initRowSelection(ids));
const sel = (s: RowSelectionState) => selectedIds(s).join('');
const toggle = (id: string): RowSelectionEvent => ({ type: 'selection.toggle', id });
const range = (id: string): RowSelectionEvent => ({ type: 'selection.toggleRange', id });
const sync = (ids: string[]): RowSelectionEvent => ({ type: 'selection.sync', ids });
const ALL: RowSelectionEvent = { type: 'selection.selectAll' };
const CLEAR: RowSelectionEvent = { type: 'selection.clear' };

describe('rowSelectionReducer', () => {
  it('starts empty with no anchor', () => {
    const s = initRowSelection(IDS);
    expect(s.selected.size).toBe(0);
    expect(s.anchor).toBeNull();
    expect(headerState(s)).toBe('none');
  });

  describe('selection.toggle', () => {
    it('adds and removes one row and moves the anchor to it', () => {
      const on = run([toggle('c')]);
      expect(sel(on)).toBe('c');
      expect(on.anchor).toBe('c');
      const off = run([toggle('c'), toggle('c')]);
      expect(sel(off)).toBe('');
      expect(off.anchor).toBe('c');
    });
    it('ignores an id that is not a row', () => {
      const s = initRowSelection(IDS);
      expect(rowSelectionReducer(s, toggle('zz'))).toBe(s);
    });
    it('does not mutate the previous state', () => {
      const before = run([toggle('a')]);
      const after = rowSelectionReducer(before, toggle('b'));
      expect(sel(before)).toBe('a');
      expect(sel(after)).toBe('ab');
    });
  });

  describe('selection.toggleRange', () => {
    it('selects from the anchor to the row, inclusive, downwards', () => {
      expect(sel(run([toggle('b'), range('e')]))).toBe('bcde');
    });
    it('selects upwards too', () => {
      expect(sel(run([toggle('e'), range('b')]))).toBe('bcde');
    });
    it('the range takes the clicked row’s new state: shift-clicking a selected row deselects the range', () => {
      const s = run([ALL, toggle('b'), range('e')]);
      // b was toggled off (anchor b); e is selected, so the range b..e turns off.
      expect(sel(s)).toBe('af');
    });
    it('adds to an existing selection without touching rows outside the range', () => {
      expect(sel(run([toggle('a'), toggle('d'), range('f')]))).toBe('adef');
    });
    it('moves the anchor to the clicked row, so the next range starts there', () => {
      const s = run([toggle('a'), range('c')]);
      expect(s.anchor).toBe('c');
      expect(sel(rowSelectionReducer(s, range('e')))).toBe('abcde');
    });
    it('acts as a toggle without an anchor', () => {
      const s = run([range('d')]);
      expect(sel(s)).toBe('d');
      expect(s.anchor).toBe('d');
    });
    it('acts as a toggle when the anchor is the row itself', () => {
      expect(sel(run([toggle('c'), range('c')]))).toBe('');
    });
    it('acts as a toggle when the anchor left the rows', () => {
      const s = run([toggle('a'), sync(['b', 'c', 'd']), range('d')]);
      expect(s.anchor).toBe('d');
      expect(sel(s)).toBe('d');
    });
    it('uses the current visible order, not the order rows were first seen in', () => {
      // Sorted descending after the anchor was set: f e d c b a.
      const s = run([toggle('e'), sync(['f', 'e', 'd', 'c', 'b', 'a']), range('c')]);
      expect(selectedIds(s)).toEqual(['e', 'd', 'c']);
    });
    it('ignores an id that is not a row', () => {
      const s = run([toggle('a')]);
      expect(rowSelectionReducer(s, range('zz'))).toBe(s);
    });
  });

  describe('selection.selectAll and selection.clear', () => {
    it('selectAll selects every row and keeps the anchor', () => {
      const s = run([toggle('b'), ALL]);
      expect(sel(s)).toBe('abcdef');
      expect(s.anchor).toBe('b');
      expect(headerState(s)).toBe('all');
    });
    it('clear empties the selection and drops the anchor', () => {
      const s = run([toggle('b'), range('d'), CLEAR]);
      expect(sel(s)).toBe('');
      expect(s.anchor).toBeNull();
    });
    it('returns the same state when nothing changes, so React can bail out', () => {
      const all = run([ALL]);
      expect(rowSelectionReducer(all, ALL)).toBe(all);
      const empty = initRowSelection(IDS);
      expect(rowSelectionReducer(empty, CLEAR)).toBe(empty);
      const none = initRowSelection([]);
      expect(rowSelectionReducer(none, ALL)).toBe(none);
    });
  });

  describe('selection.sync', () => {
    it('drops selected rows that disappeared and keeps the rest (filtering)', () => {
      const s = run([toggle('a'), toggle('c'), toggle('e'), sync(['a', 'b', 'e'])]);
      expect(sel(s)).toBe('ae');
      expect(s.ids).toEqual(['a', 'b', 'e']);
    });
    it('a row that disappears and comes back is not selected again', () => {
      const s = run([toggle('c'), sync(['a', 'b']), sync(IDS)]);
      expect(sel(s)).toBe('');
    });
    it('keeps every selection on a reorder (sorting) and reports it in the new order', () => {
      const s = run([toggle('a'), toggle('d'), sync(['f', 'e', 'd', 'c', 'b', 'a'])]);
      expect(selectedIds(s)).toEqual(['d', 'a']);
    });
    it('keeps the anchor while its row is there and drops it when it goes', () => {
      expect(run([toggle('b'), sync(['b', 'a'])]).anchor).toBe('b');
      expect(run([toggle('b'), sync(['a', 'c'])]).anchor).toBeNull();
    });
    it('keeps the selected set itself when nothing selected disappeared', () => {
      const before = run([toggle('a')]);
      const after = rowSelectionReducer(before, sync(['a', 'b']));
      expect(after.selected).toBe(before.selected);
    });
    it('returns the same state for the same ids in the same order', () => {
      const s = run([toggle('a')]);
      expect(rowSelectionReducer(s, sync([...IDS]))).toBe(s);
    });
    it('header state follows: all of the remaining rows', () => {
      const s = run([toggle('a'), toggle('b'), sync(['a', 'b'])]);
      expect(headerState(s)).toBe('all');
    });
    it('to no rows at all', () => {
      const s = run([ALL, sync([])]);
      expect(s.selected.size).toBe(0);
      expect(headerState(s)).toBe('none');
    });
  });

  it('headerState is none, some or all', () => {
    expect(headerState(run([]))).toBe('none');
    expect(headerState(run([toggle('a')]))).toBe('some');
    expect(headerState(run([ALL]))).toBe('all');
    expect(headerState(run([ALL, toggle('a')]))).toBe('some');
  });

  it('sameIds compares order and content', () => {
    expect(sameIds(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(sameIds(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(sameIds(['a'], ['a', 'b'])).toBe(false);
  });
});
