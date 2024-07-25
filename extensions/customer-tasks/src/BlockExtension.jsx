import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  InlineStack,
  Text,
  Button,
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState } from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.customer-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const {i18n, data} = useApi(TARGET);
  const [tasks, setTasks] = useState([]);

  const truncateString = (string, length, suffix = "...") => {
    if (!string) {
      return null;
    }
    if (string?.length <= length) {
      return string;
    } else {
      return `${string?.slice(0, length)}${suffix}`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const customerId = data.selected[0].id.replace('gid://shopify/Customer/', '');
      console.log(customerId)
      const response = await fetch(`https://notedesk-app--development.gadget.app/tasksByCustomerId?id=${ customerId }`);
      if(response.ok) {
        const result = await response.json();
        setTasks(result.tasks.map((task) => ({
          ...task,
          actionPending: false
        })))
      }
    }

    fetchData();

  }, [])

  const handleCompleteTask = async (id) => {
    const updatedTasks = tasks.map((task) => {
      if(task.id === id) {
        return {
          ...task,
          actionPending: true
        }
      } else {
        return task
      }
    })
    setTasks(updatedTasks);
    const response = await fetch(`https://notedesk-app--development.gadget.app/completeTask`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id
      })
    })

    const finalTasks = tasks.filter((task) => task.id != id);
    setTasks(finalTasks)
  }

  return (
    // The AdminBlock component provides an API for setting the title of the Block extension wrapper.
    <AdminBlock title="Tasks">
      <BlockStack>
        {
          tasks.length ? tasks.map((task, index) => (
            <InlineStack key={index} gap={200}>
              <BlockStack gap={100}>
                <Text>{ task.title }</Text>
                <Text>{ truncateString(task.description, 30, '...') }</Text>
              </BlockStack>
              <Button onClick={() => handleCompleteTask(task.id)}>{task.actionPending ? "Wait..." : "Complete"}</Button>
            </InlineStack>
          )) : <Text>No task for this customer.</Text>
        }
      </BlockStack>
    </AdminBlock>
  );
}