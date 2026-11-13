// A hydrated island: Base UI's Tabs need client JS for selection and arrow-key focus, so the docs page renders
// this with `client:visible`. Static components (Button, Badge) render to HTML on the server with no JS.
import { Tabs, Text } from '@salemcobalt/ui';

export function TabsDemo() {
  return (
    <Tabs.Root defaultValue="inbox">
      <Tabs.List aria-label="Inbox sections">
        <Tabs.Tab value="inbox" count={12}>
          Inbox
        </Tabs.Tab>
        <Tabs.Tab value="applied" count={7}>
          Applied
        </Tabs.Tab>
        <Tabs.Tab value="archive">Archive</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="inbox">
        <Text>Twelve postings ranked by score.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="applied">
        <Text>Seven applications in flight.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="archive">
        <Text>Nothing archived yet.</Text>
      </Tabs.Panel>
    </Tabs.Root>
  );
}
