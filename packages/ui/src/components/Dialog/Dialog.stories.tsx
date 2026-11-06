import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Inline } from '../Inline/Inline';
import { Input } from '../Input/Input';
import { Menu } from '../Menu/Menu';
import { Select } from '../Select/Select';
import { Stack } from '../Stack/Stack';
import { Textarea } from '../Textarea/Textarea';
import { RefreshIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/Dialog',
  component: Dialog.Root,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dialog.Root>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmation: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="secondary" />}>Archive 3 applications</Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Close />
        <Dialog.Title>Archive 3 applications?</Dialog.Title>
        <Dialog.Description>
          They move out of the inbox and stay searchable. You can restore them from Archive.
        </Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button />}>Archive</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="danger" />}>Delete application</Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Close />
        <Dialog.Title>Delete this application?</Dialog.Title>
        <Dialog.Description>This cannot be undone. Notes and replies go with it.</Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button variant="danger" />}>Delete</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

export const WithBody: Story = {
  name: 'With body (md)',
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Add job</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Close />
        <Dialog.Title>Add a job</Dialog.Title>
        <Dialog.Description>Paste a posting URL or fill in the details.</Dialog.Description>
        <Dialog.Body>
          <label style={{ display: 'grid', gap: 'var(--sc-spacing-2xs)' }}>
            Posting URL
            <input
              type="url"
              placeholder="https://"
              style={{
                font: 'inherit',
                padding: 'var(--sc-spacing-xs) var(--sc-spacing-sm)',
                border: '1px solid var(--sc-color-border-strong)',
                borderRadius: 'var(--sc-radius-md)',
                background: 'var(--sc-color-surface-default)',
                color: 'inherit',
              }}
            />
          </label>
        </Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button />}>Add</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen} dismissible={false}>
      <Dialog.Trigger render={<Button variant="secondary" />}>Not dismissible</Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Title>Finish setting up?</Dialog.Title>
        <Dialog.Description>
          Esc and the backdrop do nothing here; only the buttons close it.
        </Dialog.Description>
        <Dialog.Actions>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Later
          </Button>
          <Button onClick={() => setOpen(false)}>Finish</Button>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export const NotDismissible: Story = {
  name: 'Controlled, not dismissible',
  render: () => <Controlled />,
};

const phone = { viewport: { value: 'phone390', isRotated: false } };

function SheetForm({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [stage, setStage] = useState<string | null>(null);
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Edit application</Dialog.Trigger>
      <Dialog.Content variant="sheet" size={size}>
        <Dialog.Close />
        <Dialog.Title>Edit application</Dialog.Title>
        <Dialog.Description>Stage and notes for Staff Frontend Engineer at Northwind.</Dialog.Description>
        <Dialog.Body>
          <Stack gap="md">
            <Select
              label="Stage"
              fullWidth
              value={stage}
              onValueChange={setStage}
              options={[
                { value: 'applied', label: 'Applied' },
                { value: 'screen', label: 'Recruiter screen' },
                { value: 'onsite', label: 'Onsite' },
                { value: 'offer', label: 'Offer' },
              ]}
            />
            <Input
              label="Posting URL"
              type="url"
              defaultValue="https://northwind.example/careers/staff-frontend-engineer-remote-us-2026"
            />
            <Textarea
              label="Notes"
              rows={6}
              defaultValue={Array.from(
                { length: 12 },
                (_, i) => `Note ${i + 1}: recruiter said the team is six people and ships weekly.`,
              ).join('\n')}
            />
          </Stack>
        </Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button />}>Save</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/** Below 640px `variant="sheet"` docks to the bottom edge: full width, rounded top, body scrolls, actions stack. */
export const Sheet: Story = {
  name: 'Sheet at 390px',
  globals: phone,
  render: () => <SheetForm />,
};

/** The same sheet on a wide viewport is an ordinary centred dialog with a scrolling body. */
export const SheetDesktop: Story = {
  name: 'Sheet on desktop',
  render: () => <SheetForm />,
};

/** `size="sm"` is 400px on desktop and clamps to the viewport minus 16px each side on a phone. Long URLs wrap. */
export const ClampedAt390: Story = {
  name: 'Clamp at 390px (sm)',
  globals: phone,
  render: () => (
    <Dialog.Root defaultOpen>
      <Dialog.Trigger render={<Button variant="secondary" />}>Archive posting</Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Close />
        <Dialog.Title>Archive this posting?</Dialog.Title>
        <Dialog.Description>
          https://northwind.example/careers/staff-frontend-engineer-remote-us-2026?source=linkedin&ref=weekly-sweep
          stays searchable.
        </Dialog.Description>
        <Dialog.Body>
          <Inline gap="xs">
            <Input label="Reason" hideLabel placeholder="Reason" />
            <Select
              label="Keep for"
              hideLabel
              options={[
                { value: '30', label: '30 days' },
                { value: '90', label: '90 days' },
              ]}
            />
          </Inline>
        </Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button />}>Archive</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

function PopupsInside() {
  const [sort, setSort] = useState<string | null>('score');
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="secondary" />}>Open filters</Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Close />
        <Dialog.Title>Filters</Dialog.Title>
        <Dialog.Description>Every popup opened in here renders above the dialog.</Dialog.Description>
        <Dialog.Body>
          <Stack gap="md">
            <Select
              label="Sort by"
              fullWidth
              value={sort}
              onValueChange={setSort}
              options={[
                { value: 'score', label: 'Score' },
                { value: 'date', label: 'Date posted' },
                { value: 'company', label: 'Company' },
              ]}
            />
            <Inline gap="xs">
              <Menu.Root>
                <Menu.Trigger>Columns</Menu.Trigger>
                <Menu.Content>
                  <Menu.CheckboxItem checked>Company</Menu.CheckboxItem>
                  <Menu.CheckboxItem checked>Stage</Menu.CheckboxItem>
                  <Menu.CheckboxItem>Salary</Menu.CheckboxItem>
                </Menu.Content>
              </Menu.Root>
              <IconButton label="Reset filters" tooltip variant="secondary">
                <RefreshIcon />
              </IconButton>
            </Inline>
          </Stack>
        </Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button />}>Apply</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/** A Select, a Menu and a Tooltip inside a Dialog: `--sc-z-dropdown` and `--sc-z-tooltip` sit above `--sc-z-dialog`. */
export const PopupsInsideDialog: Story = {
  name: 'Menu, Select and Tooltip inside',
  render: () => <PopupsInside />,
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <PopupsInside />
    </DarkTheme>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <SheetForm size="sm" />
    </Compact>
  ),
};

function FullScreenGuarded() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen} onRequestClose={() => setConfirming(true)}>
      <Dialog.Trigger render={<Button />}>Edit notes</Dialog.Trigger>
      <Dialog.Content variant="fullscreen">
        <Dialog.Close />
        <Dialog.Title>Notes for Staff Frontend Engineer at Northwind</Dialog.Title>
        <Dialog.Description>Esc, the × and Cancel ask first; Save closes.</Dialog.Description>
        <Dialog.Body>
          <Textarea
            label="Notes"
            rows={18}
            defaultValue="Recruiter said the team is six people and ships weekly."
          />
        </Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
          <Button onClick={() => setOpen(false)}>Save</Button>
        </Dialog.Actions>
        <Dialog.Root open={confirming} onOpenChange={setConfirming}>
          <Dialog.Content size="sm">
            <Dialog.Title>Discard your changes?</Dialog.Title>
            <Dialog.Actions>
              <Dialog.Close render={<Button variant="secondary" />}>Keep editing</Dialog.Close>
              <Button
                variant="danger"
                onClick={() => {
                  setConfirming(false);
                  setOpen(false);
                }}
              >
                Discard
              </Button>
            </Dialog.Actions>
          </Dialog.Content>
        </Dialog.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * `variant="fullscreen"` covers the viewport (inset 16px with a rounded edge from 900px) and slides in from
 * the inline end; the body scrolls between a pinned title and actions. With `onRequestClose` on the Root,
 * Esc, the × and every `Dialog.Close` ask the app instead of closing: here, a nested confirmation.
 * `FullScreenFlow` builds a multi-step flow on this surface.
 */
export const FullScreen: Story = {
  name: 'Full screen, asks before closing',
  render: () => <FullScreenGuarded />,
};
