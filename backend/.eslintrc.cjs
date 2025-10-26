/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { node: true, es2021: true, jest: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    // Se precisares de regras type-aware, ativa o project (torna mais lento):
    // project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint', 'import', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      // Permite ao eslint-plugin-import entender TypeScript (paths e types)
      typescript: {
        project: ['./tsconfig.json'],
        alwaysTryTypes: true
      },
      node: { extensions: ['.js', '.ts'] }
    }
  },
  rules: {
    // Ordenação automática de imports
    'import/order': 'off',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',

    // Sinalizar mas não bloquear
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',

    // Aceitar type ou interface (não bloquear por preferência)
    '@typescript-eslint/consistent-type-definitions': 'off'
  },
  overrides: [
    {
      files: ['test/**/*.{ts,tsx}', '**/*.spec.ts'],
      rules: {
        // Em testes é comum usar any nos mocks
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    'prisma/migrations/',
    '**/*.d.ts',
    // Se não estiveres a usar BullMQ/Redis, ignora a pasta opcional:
    'src/queue/**'
  ]
};


