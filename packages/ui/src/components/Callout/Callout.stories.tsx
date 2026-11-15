import type { Meta, StoryObj } from '@storybook/react-vite';
import { Callout } from './Callout';
import { Button } from '../Button/Button';
import { Stack } from '../Stack/Stack';
import { DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Callout> = {
  title: 'Components/Callout',
  component: Callout,
  args: { tone: 'accent', variant: 'solid', title: 'Move to Interview?' },
  argTypes: {
    tone: { control: 'radio', options: ['accent', 'neutral', 'info', 'success', 'warning', 'danger'] },
    variant: { control: 'radio', options: ['solid', 'dashed'] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

const actions = (
  <>
    <Button size="sm">Accept</Button>
    <Button size="sm" variant="ghost">
      Dismiss
    </Button>
  </>
);

export const Playground: Story = {
  render: (args) => (
    <Callout {...args} actions={actions}>
      From the recruiter&apos;s email on Nov 9: an interview on Nov 14 at 2pm.
    </Callout>
  ),
};

function AllTones() {
  return (
    <Stack gap="sm">
      {(['accent', 'neutral', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
        <Callout key={tone} tone={tone} title={`${tone[0]!.toUpperCase()}${tone.slice(1)}`} actions={actions}>
          A suggestion to look at; nothing has changed yet.
        </Callout>
      ))}
      <Callout variant="dashed" title="Dashed">
        Not real yet: a draft or a guess.
      </Callout>
    </Stack>
  );
}

export const Tones: Story = { render: () => <AllTones /> };

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <AllTones />
    </DarkTheme>
  ),
};
