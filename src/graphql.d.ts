declare module '*.module.graphql' {
  import { DocumentNode } from 'graphql';

  const queries: Record<'ListRedirections', DocumentNode>;
  export = queries;
}

declare module '*.graphql' {
  import { DocumentNode } from 'graphql';

  const node: DocumentNode;
  export default node;
}
