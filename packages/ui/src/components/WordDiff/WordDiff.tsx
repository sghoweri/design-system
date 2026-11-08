import { createElement, Fragment, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type WordDiffKind = 'same' | 'added' | 'removed';
export interface WordDiffPart {
  kind: WordDiffKind;
  text: string;
}
export type WordDiffElement = 'p' | 'div' | 'span';
export type WordDiffSize = 'sm' | 'md';
export type WordDiffFamily = 'sans' | 'mono';

export interface WordDiffProps extends Omit<ComponentPropsWithRef<'p'>, 'children'> {
  /** Runs of unchanged, removed and added text, in reading order, whitespace included. Rendered exactly: joining every `text` gives the visible string. */
  parts: readonly WordDiffPart[];
  /** Element to render. Default `p`; `div` or `span` inside other text. */
  as?: WordDiffElement | undefined;
  /** `sm` 14px UI text (default) or `md` body copy. */
  size?: WordDiffSize | undefined;
  /**
   * `sans` prose (default), or `mono` for code and structured text (YAML, JSON, Markdown source): the mono face, no
   * reading-measure cap, and marks without side padding so columns stay aligned.
   */
  family?: WordDiffFamily | undefined;
  /** Screen reader word around added text: "[added: …]". Default "added". */
  addedLabel?: string | undefined;
  /** Screen reader word around removed text: "[removed: …]". Default "removed". */
  removedLabel?: string | undefined;
}

const edges = /^(\s*)([\s\S]*?)(\s*)$/;

function Change({ kind, text, label }: { kind: 'added' | 'removed'; text: string; label: string }) {
  // Leading and trailing whitespace stays outside the mark, so the tint and line hug the words.
  const [, lead = '', core = '', trail = ''] = edges.exec(text) ?? [];
  if (!core) return <>{text}</>;
  const Tag = kind === 'added' ? 'ins' : 'del';
  return (
    <>
      {lead}
      <Tag className={`sc-word-diff__${kind}`}>
        <span className="sc-visually-hidden">[{label}: </span>
        {core}
        <span className="sc-visually-hidden">]</span>
      </Tag>
      {trail}
    </>
  );
}

/**
 * A word-level diff as prose: removed text struck through and added text underlined, each on a tint, inside real
 * `<del>` and `<ins>` with "[removed: …]" / "[added: …]" for screen readers. The line, not the colour, carries the
 * meaning. Whitespace is preserved exactly (`white-space: pre-wrap`).
 */
export function WordDiff({
  parts,
  as = 'p',
  size = 'sm',
  family = 'sans',
  addedLabel = 'added',
  removedLabel = 'removed',
  className,
  ...rest
}: WordDiffProps) {
  const children: ReactNode = parts.map((part, i) =>
    part.kind === 'same' ? (
      <Fragment key={i}>{part.text}</Fragment>
    ) : (
      <Change
        key={i}
        kind={part.kind}
        text={part.text}
        label={part.kind === 'added' ? addedLabel : removedLabel}
      />
    ),
  );
  return createElement(
    as,
    {
      className: cx('sc-word-diff', className),
      'data-size': size,
      ...(family === 'mono' ? { 'data-family': 'mono' } : {}),
      ...rest,
    },
    children,
  );
}
