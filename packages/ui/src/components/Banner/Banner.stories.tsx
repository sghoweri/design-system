import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from './Banner';
import { Button } from '../Button/Button';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
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

function LongActionBanners() {
  const cut = (
    <Button variant="ghost" size="sm">
      Choose what to cut
    </Button>
  );
  return (
    <Stack gap="lg">
      <Stack gap="2xs">
        <Text size="sm" tone="muted">
          Up to 720px wide: the action sits beside the text
        </Text>
        <div style={{ inlineSize: '100%', maxInlineSize: 720 }}>
          <Banner tone="warning" role="status" action={cut}>
            <strong>This version runs to 3 pages.</strong> The template allows 2 for this seat.
          </Banner>
        </div>
      </Stack>
      <Stack gap="2xs">
        <Text size="sm" tone="muted">
          In a 360px panel: the action drops under the text, at the end
        </Text>
        <Stack gap="sm" style={{ inlineSize: '100%', maxInlineSize: 360 }}>
          <Banner tone="warning" role="status" action={cut}>
            <strong>This version runs to 3 pages.</strong> The template allows 2 for this seat.
          </Banner>
          <Banner tone="info" dismissible action={cut}>
            Dismissible: the close button keeps the end of the first row.
          </Banner>
        </Stack>
      </Stack>
    </Stack>
  );
}

/**
 * The action sits beside the text while the banner is at least 560px wide, and drops under it, at the inline end,
 * when the banner is narrower. It is the banner's own width (a container query), not the viewport's, so a banner in
 * a narrow panel on a wide screen wraps too.
 */
export const LongAction: Story = {
  name: 'Long action, wide and narrow',
  render: () => <LongActionBanners />,
};

export const LongActionDark: Story = {
  name: 'Long action, dark',
  render: () => (
    <DarkTheme>
      <LongActionBanners />
    </DarkTheme>
  ),
};

/** `icon={false}`: no icon, e.g. under a button that already carries the warning sign. */
export const WithoutIcon: Story = {
  name: 'Without an icon',
  render: () => (
    <Stack gap="sm" style={{ maxInlineSize: 720 }}>
      <Banner
        tone="warning"
        role="status"
        icon={false}
        action={
          <Button variant="ghost" size="sm">
            Choose what to cut
          </Button>
        }
      >
        <strong>This version runs to 3 pages.</strong> The template allows 2 for this seat.
      </Banner>
      <Banner tone="info" icon={false}>
        3 new postings since you last looked.
      </Banner>
    </Stack>
  ),
};

/** `placement="page"`: the full-bleed notice above an app's header, e.g. a GitHub Actions outage. */
export const PagePlacement: Story = {
  name: 'Page placement',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <Stack gap="none">
      <Banner tone="info" placement="page" role="status">
        <strong>GitHub Actions is slow.</strong> Sweeps may start late.
      </Banner>
      <Banner
        tone="warning"
        placement="page"
        role="status"
        action={
          <Inline gap="2xs" wrap={false}>
            <Button variant="ghost" size="sm">
              Details
            </Button>
            <Button variant="ghost" size="sm">
              Hide
            </Button>
          </Inline>
        }
      >
        <strong>GitHub Actions is down.</strong> Sweeps wait and run when it's back.
      </Banner>
      <Banner tone="success" placement="page" role="status">
        <strong>GitHub Actions is back.</strong> Running 2 jobs that waited.
      </Banner>
    </Stack>
  ),
};

export const PagePlacementDark: Story = {
  name: 'Page placement, dark',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <DarkTheme>
      <Banner tone="warning" placement="page" role="status">
        <strong>GitHub Actions is down.</strong> Sweeps wait and run when it's back.
      </Banner>
    </DarkTheme>
  ),
};
