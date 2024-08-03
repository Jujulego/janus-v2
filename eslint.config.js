import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import * as graphqlEslint from '@graphql-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import vitest from 'eslint-plugin-vitest';
import tsEslint from 'typescript-eslint';

// Config
export default tsEslint.config(
  {
    ignores: [
      '.pnp.*',
      '.yarn',
      'coverage',
      'dist',
      'src/gql/**',
      'src/server/schema/schema.types.ts'
    ]
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    extends: [
      eslint.configs.recommended,
    ],
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-console': ['error', {
        allow: ['warn', 'error'],
      }],
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      ...tsEslint.configs.recommendedTypeChecked
    ],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-misused-promises': ['error', {
        checksVoidReturn: false
      }],
      '@typescript-eslint/no-unused-expressions': ['error', {
        allowTaggedTemplates: true
      }]
    }
  },
  {
    files: ['**/*.jsx', '**/*.tsx'],
    settings: {
      react: {
        version: 'detect',
      }
    },
    plugins: {
      react,
      'react-hooks': fixupPluginRules(reactHooks),
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
    },
  },
  {
    files: [
      '**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx',
      '**/*.test-d.ts', '**/*.test-d.tsx',
    ],
    plugins: {
      vitest
    },
    settings: {
      vitest: {
        typecheck: true
      }
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/require-await': ['off'],
      '@typescript-eslint/unbound-method': ['off'],
      'vitest/expect-expect': ['error', {
        assertFunctionNames: ['expect', 'expectTypeOf', 'assertType', 'request.**.expect']
      }],
    }
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: ['*.config.js', 'src/main.ts'],
    plugins: {
      '@graphql-eslint': fixupPluginRules(graphqlEslint),
    },
    processor: '@graphql-eslint/graphql'
  },
  {
    files: ['src/server/schema/schema.graphql'],
    languageOptions: {
      parser: {
        ...graphqlEslint,
        meta: { name: '@graphql-eslint' }
      }
    },
    plugins: {
      '@graphql-eslint': fixupPluginRules(graphqlEslint),
    },
    rules: {
      ...graphqlEslint.flatConfigs['schema-recommended'].rules,
    }
  },
  {
    files: ['**/*.graphql'],
    ignores: ['src/server/schema/schema.graphql'],
    languageOptions: {
      parser: {
        ...graphqlEslint,
        meta: { name: '@graphql-eslint' }
      }
    },
    plugins: {
      '@graphql-eslint': fixupPluginRules(graphqlEslint),
    },
    rules: {
      ...graphqlEslint.flatConfigs['operations-recommended'].rules,
    }
  }
);
