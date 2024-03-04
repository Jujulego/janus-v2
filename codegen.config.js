/** @type {import('@graphql-codegen/cli').CodegenConfig} */
const config = {
  schema: './src/server/**/schema.graphql',
  documents: ['./src/client/**/*.ts'],
  ignoreNoDocuments: true,
  emitLegacyCommonJSImports: false,
  generates: {
    './src/client/gql/': {
      preset: 'client',
    }
  }
};

export default config;