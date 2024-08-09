import {useEffect, useState} from 'react';
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.customer-details.action.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const {i18n, close, data} = useApi(TARGET);
  console.log({data});
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerId, setCustomerId] = useState('');
  // Use direct API calls to fetch data from Shopify.
  // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
  useEffect(() => {
    (async function getCustomerInfo() {
      const getCustomerQuery = {
        query: `query Customer($id: ID!) {
          customer(id: $id) {
            id
            firstName
            lastName
            email
          }
        }`,
        variables: {id: data.selected[0].id},
      };

      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getCustomerQuery),
      });

      if (!res.ok) {
        console.error('Network error');
      }

      const customerData = await res.json();
      console.log("customerData",customerData);
      setCustomerId(customerData.data.customer.id);
      setCustomerFirstName(customerData.data.customer.firstName);
      setCustomerLastName(customerData.data.customer.lastName);
      setCustomerEmail(customerData.data.customer.email);
      // setProductTitle(productData.data.product.title);
    })();
  }, [data.selected]);
  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
    <AdminAction
      primaryAction={
        <Button
          onPress={() => {
            console.log('saving');
            close();
          }}
          to={`/apps/notedesk-2/newTask?customerId=${customerId ? customerId.replace('gid://shopify/Customer/', '') : null}&customerFirstName=${customerFirstName}&customerLastName=${customerLastName}&customerEmail=${customerEmail}`}
        >
          Create a Task
        </Button>
      }
      secondaryAction={
        <Button
          onPress={() => {
            console.log('closing');
            close();
          }}
        >
          Close
        </Button>
      }
    >
      <BlockStack>
        {/* Set the translation values for each supported language in the locales directory */}
        <Text fontWeight="bold">You can create a task on notedesk</Text>
      </BlockStack>
    </AdminAction>
  );
}