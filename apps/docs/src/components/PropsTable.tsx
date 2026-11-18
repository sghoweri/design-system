// A component's API reference, read from @protokit/ui's custom-elements.json and built from the system's own
// Table, Badge and Heading (guideline 13 rule 4). Rendered on the server with no client JS: use it in MDX without a
// `client:` directive. `of="Button"` renders one component; `of="Dialog"` renders every part under its own heading.
// Each table scrolls inside its own focusable region, so a phone never scrolls the page sideways.
import { Badge, Heading, Table, Text } from '@protokit/ui';
import type { ReactNode } from 'react';
import { inlineMarkdown } from '../data/inlineMarkdown';
import {
  component,
  declaration,
  membersOf,
  typeInfo,
  type ClassField,
  type CustomElementDeclaration,
} from '../data/manifest';
import '../styles/props-table.css';

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function Markdown({ text }: { text: string | undefined }) {
  if (!text) return <span className="props-none">—</span>;
  return <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(text) }} />;
}

function Code({ children }: { children: ReactNode }) {
  return <code className="props-code">{children}</code>;
}

function TypeCell({ text }: { text: string | undefined }) {
  const info = typeInfo(text);
  if (info.options) {
    return (
      <span className="props-options">
        {info.options.map((o) => (
          <Code key={o}>{o}</Code>
        ))}
      </span>
    );
  }
  return <Code>{info.text}</Code>;
}

function NameCell({
  name,
  required,
  deprecated,
}: {
  name: string;
  required?: boolean;
  deprecated?: unknown;
}) {
  return (
    <span className="props-name">
      <Code>{name}</Code>
      {required ? (
        <Badge size="sm" tone="accent" rounded={false}>
          required
        </Badge>
      ) : null}
      {deprecated ? (
        <Badge size="sm" tone="warning" rounded={false}>
          deprecated
        </Badge>
      ) : null}
    </span>
  );
}

const deprecationNote = (deprecated: unknown) =>
  typeof deprecated === 'string' && deprecated ? `**Deprecated:** ${deprecated} ` : '';

/** One captioned table in a scroll container that keyboard users can reach and scroll. */
function Section({
  id,
  caption,
  columns,
  children,
}: {
  id: string;
  caption: string;
  columns: string[];
  children: ReactNode;
}) {
  return (
    // A scrollable region must be focusable to be scrolled without a pointer (axe: scrollable-region-focusable).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className="props-scroll" role="region" aria-labelledby={id} tabIndex={0}>
      <Table.Root density="compact" className="props-table">
        <Table.Caption id={id}>{caption}</Table.Caption>
        <Table.Head>
          <Table.Row>
            {columns.map((c) => (
              <Table.Header key={c}>{c}</Table.Header>
            ))}
          </Table.Row>
        </Table.Head>
        <Table.Body>{children}</Table.Body>
      </Table.Root>
    </div>
  );
}

function FieldRows({ fields }: { fields: ClassField[] }) {
  return fields.map((m) => {
    const info = typeInfo(m.type?.text);
    return (
      <Table.Row key={m.name} data-deprecated={m.deprecated ? '' : undefined}>
        <Table.Cell>
          <NameCell name={m.name} required={info.required} deprecated={m.deprecated} />
        </Table.Cell>
        <Table.Cell>
          <TypeCell text={m.type?.text} />
        </Table.Cell>
        <Table.Cell>
          {m.default ? <Code>{m.default}</Code> : <span className="props-none">—</span>}
        </Table.Cell>
        <Table.Cell>
          <Markdown text={deprecationNote(m.deprecated) + (m.description ?? '')} />
        </Table.Cell>
      </Table.Row>
    );
  });
}

const PROP_COLUMNS = ['Prop', 'Type', 'Default', 'Description'];

function Api({ d }: { d: CustomElementDeclaration }) {
  const id = `props-${slug(d.name)}`;
  const { own, inherited } = membersOf(d);
  const events = d.events ?? [];
  const slots = d.slots ?? [];
  const css = d.cssProperties ?? [];
  const inheritedFrom = [...new Set(inherited.map((m) => m.inheritedFrom?.name))].join(', ');
  const empty = !own.length && !inherited.length && !events.length && !slots.length && !css.length;

  return (
    <>
      {own.length ? (
        <Section id={`${id}-props`} caption={`${d.name} props`} columns={PROP_COLUMNS}>
          <FieldRows fields={own} />
        </Section>
      ) : null}
      {events.length ? (
        <Section
          id={`${id}-events`}
          caption={`${d.name} events (callback props)`}
          columns={['Prop', 'Type', 'Description']}
        >
          {events.map((e) => {
            const info = typeInfo(e.type?.text);
            return (
              <Table.Row key={e.name} data-deprecated={e.deprecated ? '' : undefined}>
                <Table.Cell>
                  <NameCell name={e.name} required={info.required} deprecated={e.deprecated} />
                </Table.Cell>
                <Table.Cell>
                  <Code>{info.text}</Code>
                </Table.Cell>
                <Table.Cell>
                  <Markdown text={deprecationNote(e.deprecated) + (e.description ?? '')} />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Section>
      ) : null}
      {slots.length ? (
        <Section
          id={`${id}-slots`}
          caption={`${d.name} slots (ReactNode props)`}
          columns={['Prop', 'Description']}
        >
          {slots.map((s) => (
            <Table.Row key={s.name || 'children'} data-deprecated={s.deprecated ? '' : undefined}>
              <Table.Cell>
                <NameCell name={s.name || 'children'} deprecated={s.deprecated} />
              </Table.Cell>
              <Table.Cell>
                <Markdown text={deprecationNote(s.deprecated) + (s.description ?? '')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Section>
      ) : null}
      {css.length ? (
        <Section
          id={`${id}-css`}
          caption={`${d.name} CSS custom properties`}
          columns={['Property', 'Default', 'Description']}
        >
          {css.map((p) => (
            <Table.Row key={p.name}>
              <Table.Cell>
                <Code>{p.name}</Code>
              </Table.Cell>
              <Table.Cell>
                {p.default ? <Code>{p.default}</Code> : <span className="props-none">—</span>}
              </Table.Cell>
              <Table.Cell>
                <Markdown text={p.description} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Section>
      ) : null}
      {inherited.length ? (
        // Open when the part has nothing of its own, so its whole API is not hidden behind a click.
        <details className="props-inherited" open={own.length === 0 || undefined}>
          <summary>
            {inherited.length} {inherited.length === 1 ? 'prop' : 'props'} from Base UI (
            <Code>{inheritedFrom}</Code>)
          </summary>
          <Section id={`${id}-base-ui`} caption={`${d.name} props from Base UI`} columns={PROP_COLUMNS}>
            <FieldRows fields={inherited} />
          </Section>
        </details>
      ) : null}
      {empty ? (
        <Text as="p" size="sm" tone="muted" className="props-empty">
          No props of its own: it passes the element&rsquo;s attributes through.
        </Text>
      ) : null}
    </>
  );
}

export function PropsTable({ of }: { of: string }) {
  const parts = of.includes('.') ? [] : component(of).parts;
  const root = declaration(of);
  // A namespace (`Dialog = { Root, … }`) has no API of its own; `Kbd`, callable with a `Kbd.Group`, does.
  const rootHasApi = Boolean(
    root.members?.length || root.events?.length || root.slots?.length || root.cssProperties?.length,
  );
  return (
    <div className="not-content props">
      {rootHasApi || parts.length === 0 ? <Api d={root} /> : null}
      {parts.map((part) => (
        <section key={part.name} className="props-part" aria-labelledby={`part-${slug(part.name)}`}>
          <Heading level={3} size="md" id={`part-${slug(part.name)}`}>
            <Code>{part.name}</Code>
          </Heading>
          {part.description ? (
            <Text as="p" size="sm" tone="muted" className="props-description">
              <Markdown text={part.description} />
            </Text>
          ) : null}
          <Api d={part} />
        </section>
      ))}
    </div>
  );
}
