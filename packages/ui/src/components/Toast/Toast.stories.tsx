import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast, useToast } from './Toast';
import { Button } from '../Button/Button';
import { Inline } from '../Inline/Inline';

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
