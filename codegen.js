/** @type {import('@graphql-codegen/cli').CodegenConfig} */
const config = {
  schema: './src/server/**/*.graphql',
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