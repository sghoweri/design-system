import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from '../Button/Button';

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
