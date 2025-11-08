import js from '@eslint/js';
import graphql from '@graphql-eslint/eslint-plugin';
import vitest from '@vitest/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

// Config
export default defineConfig(
  globalIgnores([
    '.pnp.*',
    '.yarn',
    'coverage',
    'dist',
    'src/gql/**',
    'src/server/schema/schema.types.ts'
  ]),
  {
    languageOptions: {
      globals: globals.node,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  // Javascript/Typescript rules
  js.configs.recommended,
  ts.configs.recommendedTypeChecked.map((cfg) => ({ ...cfg, files: ['**/*.{ts,tsx}'] })),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-console': ['error', {
        allow: ['warn', 'error'],
      }],
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
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
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': ['error', {
        checksVoidReturn: false
      }],
      '@typescript-eslint/no-unused-expressions': ['error', {
        allowTaggedTemplates: true
      }]
    }
  },
  // React rules
  {
    files: ['**/*.{jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      }
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    ...react.configs.flat.recommended,
  },
  {
    files: ['**/*.{jsx,tsx}'],
    ...react.configs.flat['jsx-runtime'],
  },
  {
    files: ['**/*.{jsx,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  // Vitest rules
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.test-d.{ts,tsx}'],
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
    }
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': ['off'],
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/prefer-promise-reject-errors': ['off'],
      '@typescript-eslint/require-await': ['off'],
      '@typescript-eslint/unbound-method': ['off'],
      'vitest/expect-expect': ['error', {
        assertFunctionNames: ['expect', 'request.**.expect']
      }],
    }
  },
  {
    files: ['**/*.test-d.{ts,tsx}'],
    rules: {
      'vitest/expect-expect': ['error', {
        assertFunctionNames: ['expectTypeOf', 'assertType']
      }],
    }
  },
  // GraphQL rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['*.config.js', 'src/main.ts'],
    plugins: {
      '@graphql-eslint': graphql,
    },
    processor: (graphql as unknown as { default: typeof graphql }).default.processor
  },
  {
    files: ['src/server/schema/schema.graphql'],
    languageOptions: {
      parser: graphql.parser
    },
    plugins: {
      '@graphql-eslint': graphql,
    },
    rules: {
      ...graphql.configs['flat/schema-recommended'].rules,
    }
  },
  {
    files: ['**/*.graphql'],
    ignores: ['src/server/schema/schema.graphql'],
    languageOptions: {
      parser: graphql.parser
    },
    plugins: {
      '@graphql-eslint': graphql,
    },
    rules: {
      ...graphql.configs['flat/operations-recommended'].rules,
    }
  }
);
