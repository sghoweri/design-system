import { render } from '@testing-library/react';
import { WordDiff, type WordDiffPart } from './WordDiff';
import { expectNoA11yViolations } from '../../../test/axe';

const parts: WordDiffPart[] = [
  { kind: 'same', text: 'I ' },
  { kind: 'removed', text: 'helped with ' },
  { kind: 'added', text: 'led ' },
  { kind: 'same', text: 'the move to React  ' },
  { kind: 'removed', text: 'and it went fine' },
  { kind: 'added', text: 'with zero downtime' },
  { kind: 'same', text: '.\n' },
];
const srText = (el: Element) =>
  [...el.querySelectorAll('.sc-visually-hidden')].map((n) => n.textContent).join('|');

describe('WordDiff', () => {
  it('renders del and ins with screen reader wrappers, whitespace kept exactly', async () => {
    const { container } = render(<WordDiff parts={parts} />);
    const root = container.querySelector('.sc-word-diff')!;
    expect(root.tagName).toBe('P');
    expect(root).toHaveAttribute('data-size', 'sm');
    const dels = root.querySelectorAll('del.sc-word-diff__removed');
    const inss = root.querySelectorAll('ins.sc-word-diff__added');
    expect(dels).toHaveLength(2);
    expect(inss).toHaveLength(2);
    expect(dels[0]).toHaveTextContent('[removed: helped with]', { normalizeWhitespace: false });
    expect(inss[0]).toHaveTextContent('[added: led]', { normalizeWhitespace: false });
    // The trailing space sits outside the mark, so the tint hugs the words.
    expect(dels[0]!.nextSibling?.textContent).toBe(' ');
    // Without the screen reader text, the visible string is exactly the parts joined.
    const visible = root.cloneNode(true) as Element;
    visible.querySelectorAll('.sc-visually-hidden').forEach((n) => n.remove());
    expect(visible.textContent).toBe(parts.map((p) => p.text).join(''));
    expect(srText(root)).toBe('[removed: |]|[added: |]|[removed: |]|[added: |]');
    await expectNoA11yViolations(container);
  });

  it('renders as another element with other labels and size', () => {
    const { container } = render(
      <WordDiff
        as="div"
        size="md"
        addedLabel="ajouté"
        removedLabel="supprimé"
        parts={[
          { kind: 'removed', text: 'ancien' },
          { kind: 'added', text: 'nouveau' },
        ]}
      />,
    );
    const root = container.querySelector('.sc-word-diff')!;
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(srText(root)).toBe('[supprimé: |]|[ajouté: |]');
  });

  it('keeps a whitespace-only change as plain text', () => {
    const { container } = render(<WordDiff parts={[{ kind: 'added', text: '  ' }]} />);
    expect(container.querySelector('ins')).toBeNull();
    expect(container.querySelector('.sc-word-diff')!.textContent).toBe('  ');
  });
});
