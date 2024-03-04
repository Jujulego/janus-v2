declare module '*.graphql' {
  import { DocumentNode } from 'graphql';

  const node: DocumentNode;
  export default node;
}
