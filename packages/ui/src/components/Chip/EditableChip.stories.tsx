import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { EditableChip } from './EditableChip';
import { DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof EditableChip> = {
  title: 'Components/EditableChip',
  component: EditableChip,
  args: {
    value: 'frontend architect',
    editLabel: 'Edit job title',
    onValueChange: () => {},
    tone: 'neutral',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    tone: { control: 'radio', options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'radio', options: ['sm', 'md'] },
    icon: { control: false },
    onValueChange: { control: false },
    onRemove: { control: false },
    validate: { control: false },
  },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <EditableChip {...args} value={value} onValueChange={setValue} />;
  },
};

// The list gives an open editor the full row; the chip itself can't reach its container's flex item.
const listCss = `
.story-chip-list { display: flex; flex-wrap: wrap; gap: var(--sc-spacing-xs); margin: 0; padding: 0; list-style: none; }
.story-chip-list > li { min-inline-size: 0; max-inline-size: 100%; }
.story-chip-list > li:has(> .sc-chip-editor) { flex-basis: 100%; }
`;

function JobTitles() {
  const [items, setItems] = useState([
    { id: 1, text: 'frontend architect' },
    { id: 2, text: 'design systems lead' },
    { id: 3, text: 'staff engineer' },
  ]);
  return (
    <>
      <style>{listCss}</style>
      <ul className="story-chip-list" aria-label="Job titles">
        {items.map((item) => (
          <li key={item.id}>
            <EditableChip
              value={item.text}
              editLabel="Edit job title"
              validate={(next) =>
                items.some((o) => o.id !== item.id && o.text.toLowerCase() === next.toLowerCase())
                  ? `“${next}” is already in this list.`
                  : null
              }
              onValueChange={(text) =>
                setItems((list) => list.map((o) => (o.id === item.id ? { ...o, text } : o)))
              }
              onRemove={() => setItems((list) => list.filter((o) => o.id !== item.id))}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Click a title, or focus it and press Enter or F2. Enter or clicking away saves, Escape cancels, an empty
 * save removes the chip. Renaming one to another's title is refused with an announced error. The list keys
 * chips by id, so focus comes back to the chip after a save even though its text changed.
 */
export const List: Story = {
  name: 'A list of editable chips',
  render: () => <JobTitles />,
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <JobTitles />
    </DarkTheme>
  ),
};
