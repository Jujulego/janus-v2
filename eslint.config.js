// @ts-check
import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import graphql from '@graphql-eslint/eslint-plugin';
import vitest from '@vitest/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import ts from 'typescript-eslint';

// Config
export default ts.config(
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
    languageOptions: {
      globals: globals.node,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked.map((cfg) => ({ ...cfg, files: ['**/*.{ts,tsx}'] })),
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
  {
    files: ['**/*.{jsx,tsx}'],
    settings: {
      react: {
        version: 'detect',
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
    },
  },
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
      '@typescript-eslint/no-unused-vars': ['off'],
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
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['*.config.js', 'src/main.ts'],
    plugins: {
      '@graphql-eslint': graphql,
    },
    processor: graphql.processor
  },
  {
    files: ['src/server/schema/schema.graphql'],
    languageOptions: {
      parser: graphql.parser
    },
    plugins: {
      '@graphql-eslint': fixupPluginRules(graphql),
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
