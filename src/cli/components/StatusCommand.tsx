import { render } from 'ink';

import { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import RedirectionStatusTable from './molecules/RedirectionStatusTable.jsx';

// Query
const StatusCommandQuery = graphql(/* GraphQL */ `
  query StatusCommand {
    redirections {
      ...RedirectionStatusItem
    }
  }
`);

// Component
export default async function StatusCommand(client: JanusClient) {
  const { data} = await client.send(StatusCommandQuery);

  render(<RedirectionStatusTable redirections={data!.redirections} />);
}
