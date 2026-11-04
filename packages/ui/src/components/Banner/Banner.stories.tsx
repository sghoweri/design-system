import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from './Banner';
import { Button } from '../Button/Button';
import { Stack } from '../Stack/Stack';
import { PauseIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  args: { tone: 'info', children: '3 new postings since you last looked.', dismissible: false },
  argTypes: { tone: { control: 'radio', options: ['info', 'success', 'warning', 'danger', 'neutral'] } },
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack gap="sm">
      <Banner tone="info">3 new postings since you last looked.</Banner>
      <Banner tone="success">Sweep finished: 96 processed in 26 s.</Banner>
      <Banner
        tone="warning"
        icon={<PauseIcon />}
        action={
          <Button variant="ghost" size="sm">
            Resume
          </Button>
        }
      >
        Your sweeps are paused.
      </Banner>
      <Banner tone="danger" dismissible>
        The last sweep failed: Built In returned 429 twice.
      </Banner>
      <Banner tone="neutral" icon={false} dismissible>
        You are offline. Changes save when you reconnect.
      </Banner>
    </Stack>
  ),
};

export const WithActionAndDismiss: Story = {
  name: 'Action and dismiss',
  render: () => (
    <Banner
      tone="info"
      dismissible
      action={
        <Button variant="ghost" size="sm">
          Show them
        </Button>
      }
    >
      3 new postings since you last looked.
    </Banner>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <Banner
        tone="warning"
        dismissible
        action={
          <Button variant="ghost" size="sm">
            Resume
          </Button>
        }
      >
        Your sweeps are paused.
      </Banner>
    </Compact>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="sm">
        <Banner tone="info">3 new postings since you last looked.</Banner>
        <Banner tone="success">Sweep finished.</Banner>
        <Banner
          tone="warning"
          dismissible
          action={
            <Button variant="ghost" size="sm">
              Resume
            </Button>
          }
        >
          Your sweeps are paused.
        </Banner>
        <Banner tone="danger">The last sweep failed.</Banner>
        <Banner tone="neutral" icon={false}>
          You are offline.
        </Banner>
      </Stack>
    </DarkTheme>
  ),
};
