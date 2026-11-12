import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';
import { Stack } from '../Stack/Stack';
import { DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  args: { orientation: 'horizontal', 'aria-label': 'Application status' },
  argTypes: { orientation: { control: 'radio', options: ['horizontal', 'vertical'] } },
};
export default meta;
type Story = StoryObj<typeof meta>;

function Pipeline({ orientation }: { orientation?: 'horizontal' | 'vertical' | undefined }) {
  return (
    <Stepper aria-label="Application status" orientation={orientation}>
      <Stepper.Step state="done" meta="Oct 28">
        Materials ready
      </Stepper.Step>
      <Stepper.Step state="done" meta="Nov 3">
        Applied
      </Stepper.Step>
      <Stepper.Step state="current" meta="Nov 9">
        Screen
      </Stepper.Step>
      <Stepper.Step state="upcoming" meta="proposed · Nov 14, 2pm" proposed>
        Interview
      </Stepper.Step>
      <Stepper.Step state="upcoming">Offer</Stepper.Step>
    </Stepper>
  );
}

export const Playground: Story = { render: (args) => <Pipeline orientation={args.orientation} /> };

/** Both orientations: horizontal from a wide container, vertical below it (the app switches at its breakpoint). */
export const Orientations: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 760 }}>{Story()}</div>],
  render: () => (
    <Stack gap="xl">
      <Pipeline />
      <div style={{ maxWidth: 360 }}>
        <Pipeline orientation="vertical" />
      </div>
    </Stack>
  ),
};

/** Every state at the start, middle and end. */
export const States: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 520 }}>{Story()}</div>],
  render: () => (
    <Stack gap="xl">
      <Stepper aria-label="Nothing done">
        <Stepper.Step state="current">One</Stepper.Step>
        <Stepper.Step state="upcoming">Two</Stepper.Step>
        <Stepper.Step state="upcoming">Three</Stepper.Step>
      </Stepper>
      <Stepper aria-label="All done">
        <Stepper.Step state="done">One</Stepper.Step>
        <Stepper.Step state="done">Two</Stepper.Step>
        <Stepper.Step state="done">Three</Stepper.Step>
      </Stepper>
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="xl">
        <Pipeline />
        <div style={{ maxWidth: 360 }}>
          <Pipeline orientation="vertical" />
        </div>
      </Stack>
    </DarkTheme>
  ),
};
