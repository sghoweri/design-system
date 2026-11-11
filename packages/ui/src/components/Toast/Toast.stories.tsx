import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Toast, useToast } from './Toast';
import { Button } from '../Button/Button';
import { Inline } from '../Inline/Inline';
import { SelectionBar } from '../SelectionBar/SelectionBar';
import { Text } from '../Text/Text';

function Buttons() {
  const toast = useToast();
  return (
    <Inline gap="xs">
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({ title: 'Closed 5 applications', action: { label: 'Undo', onClick: () => undefined } })
        }
      >
        With Undo
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            title: 'Closed 3 of 5 applications',
            description: '2 were already closed.',
            tone: 'success',
          })
        }
      >
        With a description
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            title: 'Could not close them',
            description: 'You are signed out.',
            tone: 'danger',
            priority: 'high',
          })
        }
      >
        Error
      </Button>
    </Inline>
  );
}

const meta = {
  title: 'Components/Toast',
  component: Toast.Provider,
} satisfies Meta<typeof Toast.Provider>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `Toast.Provider` once near the root, `useToast().add()` anywhere below it. Toasts stack bottom-end, close after
 * 6 s (paused while hovered or focused), and F6 moves focus to them. Use the toolbar's theme switch for dark.
 */
export const Playground: Story = {
  render: () => (
    <Toast.Provider>
      <Buttons />
    </Toast.Provider>
  ),
};

function Persistent() {
  const toast = useToast();
  const [count, setCount] = useState(0);
  const [log, setLog] = useState('');
  const show = () =>
    toast.add({
      id: 'app-updated',
      title: 'The app was updated',
      description: 'Reload to get the latest.',
      timeout: 0,
      action: { label: 'Reload', onClick: () => setLog('Reload'), keepOpen: true },
      dismissLabel: 'Later',
      onClose: () => setLog('Closed (Later)'),
    });
  return (
    <Inline gap="xs" align="center">
      <Button variant="secondary" onClick={show}>
        Show the update toast
      </Button>
      <Button variant="secondary" onClick={() => setCount((n) => (n ? 0 : 2))}>
        {count ? 'Clear the selection' : 'Select 2 rows'}
      </Button>
      <Text size="sm" tone="muted" role="status">
        {log}
      </Text>
      <SelectionBar count={count} onClear={() => setCount(0)}>
        <Button size="sm" variant="secondary">
          Close {count}
        </Button>
      </SelectionBar>
    </Inline>
  );
}

/**
 * A toast that stays until it is answered: `timeout: 0`, an action that keeps it open (`keepOpen`, for an action
 * that may ask first), a text dismiss (`dismissLabel: 'Later'`) and `onClose`. Adding it again with the same `id`
 * updates it in place. It sits above an open SelectionBar (or any bar with `anchor-name: --sc-bottom-bar`).
 */
export const Persistent_: Story = {
  name: 'Persistent, with a SelectionBar',
  render: () => (
    <Toast.Provider>
      <Persistent />
    </Toast.Provider>
  ),
};
